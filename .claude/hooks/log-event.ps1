#Requires -Version 5.1
# Claude Code PostToolUse hook — appends a tool-level JSONL event to events.jsonl.
# Fires on every Write|Edit|NotebookEdit|Bash tool call.
# Companion: log-usage.ps1 (Stop hook) captures per-job token usage.
# Hook input on stdin: { tool_name, tool_input, ... }
# Agent identification: $env:CLAUDE_AGENT set by command files before invoking sub-agents.

$ErrorActionPreference = 'Stop'

$raw = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }

try {
    $payload = $raw | ConvertFrom-Json
} catch {
    # Malformed input — do not block the tool call.
    exit 0
}

$tool = $payload.tool_name
if (-not $tool) { exit 0 }

# Build the path/command field based on tool type.
$path = $null
$command = $null
switch ($tool) {
    'Write'        { $path = $payload.tool_input.file_path }
    'Edit'         { $path = $payload.tool_input.file_path }
    'NotebookEdit' { $path = $payload.tool_input.notebook_path }
    'Bash'         { $command = $payload.tool_input.command }
    default        { exit 0 }   # silent ignore — hook matcher should prevent this
}

# Trim very long Bash commands so the log line stays readable.
if ($command -and $command.Length -gt 500) {
    $command = $command.Substring(0, 497) + '...'
}

$entry = [ordered]@{
    ts        = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    agent     = if ($env:CLAUDE_AGENT)    { $env:CLAUDE_AGENT }    else { 'UNKNOWN' }
    story_id  = if ($env:CLAUDE_STORY_ID) { $env:CLAUDE_STORY_ID } else { $null }
    tool      = $tool
    ok        = $true
}
if ($path)    { $entry['path']    = $path }
if ($command) { $entry['command'] = $command }

$line = $entry | ConvertTo-Json -Compress -Depth 5

# Resolve log path relative to this hook script's repo (.claude/memory/events.jsonl)
$logDir  = Join-Path $PSScriptRoot '..\memory'
$logPath = Join-Path $logDir 'events.jsonl'

# Ensure directory exists (cheap idempotent op)
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Append atomically. UTF-8 without BOM so jq + downstream tools read it cleanly.
[System.IO.File]::AppendAllText($logPath, $line + "`n", [System.Text.UTF8Encoding]::new($false))

exit 0
