#Requires -Version 5.1
# Claude Code Stop hook — appends a job_complete entry with token usage to events.jsonl.
# Fires at the end of every agent turn (including subagents).
#
# Hook input on stdin (JSON):
#   { session_id, transcript_path, hook_event_name, usage?: { ... } }
#
# Usage fields (all optional — graceful fallback if absent):
#   input_tokens                  — new (uncached) input tokens
#   cache_creation_input_tokens   — tokens written into a new cache entry (5-min TTL)
#   cache_read_input_tokens       — tokens served from an existing cache entry
#   output_tokens                 — tokens the model generated
#
# "Context" = everything sent IN to the model (input + cache_creation + cache_read).
# "Output"  = everything the model generated.
# context_pct = context / (context + output) * 100
#
# Agent identification comes from $env:CLAUDE_AGENT (set by command files).

$ErrorActionPreference = 'Stop'

# ── helpers ────────────────────────────────────────────────────────────────────
function IntOrZero($v) { if ($null -ne $v -and $v -ne '') { [int]$v } else { 0 } }

# ── read stdin ─────────────────────────────────────────────────────────────────
$raw = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }

try { $payload = $raw | ConvertFrom-Json } catch { exit 0 }

# ── locate usage ───────────────────────────────────────────────────────────────
# Strategy 1: usage field directly in hook input (newer Claude Code builds)
$usage = $payload.usage

# Strategy 2: parse the transcript file for the last assistant message with usage
if (-not $usage -and $payload.transcript_path -and (Test-Path $payload.transcript_path)) {
    try {
        $lines = Get-Content $payload.transcript_path -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($lines) {
            for ($i = $lines.Count - 1; $i -ge [Math]::Max(0, $lines.Count - 20); $i--) {
                try {
                    $entry = $lines[$i] | ConvertFrom-Json -ErrorAction SilentlyContinue
                    if (-not $entry) { continue }
                    # Handle multiple transcript shapes
                    $candidate = $null
                    if ($entry.usage)                          { $candidate = $entry.usage }
                    elseif ($entry.message -and $entry.message.usage) { $candidate = $entry.message.usage }
                    if ($candidate -and ($candidate.input_tokens -or $candidate.output_tokens)) {
                        $usage = $candidate
                        break
                    }
                } catch { continue }
            }
        }
    } catch { <# transcript unreadable — skip #> }
}

if (-not $usage) { exit 0 }

# ── compute token breakdown ────────────────────────────────────────────────────
$inputNew   = IntOrZero $usage.input_tokens
$cacheNew   = IntOrZero $usage.cache_creation_input_tokens
$cacheRead  = IntOrZero $usage.cache_read_input_tokens
$outputTok  = IntOrZero $usage.output_tokens

$contextTok = $inputNew + $cacheNew + $cacheRead
$totalTok   = $contextTok + $outputTok
if ($totalTok -eq 0) { exit 0 }

$contextPct = [Math]::Round(($contextTok / $totalTok) * 100, 1)

# ── build log entry ────────────────────────────────────────────────────────────
$entry = [ordered]@{
    ts       = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    event    = 'job_complete'
    agent    = if ($env:CLAUDE_AGENT)    { $env:CLAUDE_AGENT }    else { 'UNKNOWN' }
    story_id = if ($env:CLAUDE_STORY_ID) { $env:CLAUDE_STORY_ID } else { $null }
    tokens   = [ordered]@{
        context      = $contextTok   # total sent IN  (input_new + cache_new + cache_read)
        output       = $outputTok    # total generated OUT
        total        = $totalTok
        input_new    = $inputNew     # uncached input  (full price)
        cache_new    = $cacheNew     # written to cache (1.25x price, amortised)
        cache_read   = $cacheRead    # served from cache (~0.1x price)
        context_pct  = $contextPct   # context / total  (typically 90–97 % for large agents)
    }
}

$line = $entry | ConvertTo-Json -Compress -Depth 5

# ── append to events.jsonl ─────────────────────────────────────────────────────
$logDir  = Join-Path $PSScriptRoot '..\memory'
$logPath = Join-Path $logDir 'events.jsonl'
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
[System.IO.File]::AppendAllText($logPath, $line + "`n", [System.Text.UTF8Encoding]::new($false))

exit 0
