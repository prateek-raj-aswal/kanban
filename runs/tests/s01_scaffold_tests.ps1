# S-01: Initialize monorepo directory structure
# Scaffold verification tests -- PowerShell 5.1 compatible
# Usage: powershell.exe -File s01_scaffold_tests.ps1
#        Set env var SKIP_COMPILE_TEST=1 to skip the Gradle compile invocation.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ROOT = "D:\workspace\Claude-workspace\Kanaban"

# ------ minimal test harness ------
$script:passed  = 0
$script:failed  = 0
$script:results = @()

function Assert-True {
    param(
        [string]$TestId,
        [string]$Description,
        [bool]$Condition,
        [string]$FailDetail
    )
    if ($Condition) {
        $script:passed++
        $script:results += [PSCustomObject]@{ Id=$TestId; Status="PASS"; Description=$Description; Detail="" }
        Write-Host "  [PASS] $TestId : $Description"
    } else {
        $script:failed++
        $script:results += [PSCustomObject]@{ Id=$TestId; Status="FAIL"; Description=$Description; Detail=$FailDetail }
        Write-Host "  [FAIL] $TestId : $Description"
        Write-Host "         $FailDetail"
    }
}

# Helper: read package.json and collect all dep keys across the three dep sections
function Get-PackageJsonDepKeys {
    param([string]$Path)
    $keys = @{}
    if (-not (Test-Path $Path -PathType Leaf)) { return $keys }
    $pkg = Get-Content $Path -Raw | ConvertFrom-Json
    foreach ($section in @("dependencies","devDependencies","peerDependencies")) {
        if ($pkg.PSObject.Properties[$section]) {
            $pkg.$section.PSObject.Properties | ForEach-Object { $keys[$_.Name] = $true }
        }
    }
    return $keys
}

# ============================================================
# TC-001  AC-1 / contract: frontend/package.json exists
# ============================================================
Write-Host ""
Write-Host "[TC-001] frontend/package.json exists"
$pkgPath = Join-Path $ROOT "frontend\package.json"
Assert-True `
    -TestId "TC-001" `
    -Description "frontend/package.json exists on disk" `
    -Condition (Test-Path $pkgPath -PathType Leaf) `
    -FailDetail "Expected file: $pkgPath"

# ============================================================
# TC-002  AC-1: package.json contains 'next' dependency
# ============================================================
Write-Host ""
Write-Host "[TC-002] frontend/package.json declares 'next' dependency"
$depKeys = Get-PackageJsonDepKeys -Path $pkgPath
Assert-True `
    -TestId "TC-002" `
    -Description "frontend/package.json lists 'next' in dependencies" `
    -Condition ($depKeys.ContainsKey("next")) `
    -FailDetail "Key 'next' not found in any dependency section of $pkgPath"

# ============================================================
# TC-003  AC-1: package.json contains 'react' dependency
# ============================================================
Write-Host ""
Write-Host "[TC-003] frontend/package.json declares 'react' dependency"
Assert-True `
    -TestId "TC-003" `
    -Description "frontend/package.json lists 'react' in dependencies" `
    -Condition ($depKeys.ContainsKey("react")) `
    -FailDetail "Key 'react' not found in any dependency section of $pkgPath"

# ============================================================
# TC-004  AC-2 / contract: backend/build.gradle exists
# ============================================================
Write-Host ""
Write-Host "[TC-004] backend/build.gradle exists"
$buildGradlePath = Join-Path $ROOT "backend\build.gradle"
Assert-True `
    -TestId "TC-004" `
    -Description "backend/build.gradle exists on disk" `
    -Condition (Test-Path $buildGradlePath -PathType Leaf) `
    -FailDetail "Expected file: $buildGradlePath"

# ============================================================
# TC-005  AC-2: build.gradle references spring-boot
# ============================================================
Write-Host ""
Write-Host "[TC-005] backend/build.gradle references spring-boot plugin or dependency"
$gradleHasSpring = $false
if (Test-Path $buildGradlePath -PathType Leaf) {
    $gradleContent = Get-Content $buildGradlePath -Raw
    if ($gradleContent -match "spring.boot" -or $gradleContent -match "springframework\.boot") {
        $gradleHasSpring = $true
    }
}
Assert-True `
    -TestId "TC-005" `
    -Description "build.gradle contains a spring-boot reference" `
    -Condition $gradleHasSpring `
    -FailDetail "Pattern 'spring.boot' or 'springframework.boot' not found in $buildGradlePath"

# ============================================================
# TC-006  AC-3 / contract: docker-compose.yml exists
# ============================================================
Write-Host ""
Write-Host "[TC-006] docker-compose.yml exists at root"
$composePath = Join-Path $ROOT "docker-compose.yml"
Assert-True `
    -TestId "TC-006" `
    -Description "docker-compose.yml exists at project root" `
    -Condition (Test-Path $composePath -PathType Leaf) `
    -FailDetail "Expected file: $composePath"

# ============================================================
# TC-007  AC-3: docker-compose.yml is non-empty (stub check)
# ============================================================
Write-Host ""
Write-Host "[TC-007] docker-compose.yml is non-empty"
$composeNonEmpty = $false
if (Test-Path $composePath -PathType Leaf) {
    $raw = Get-Content $composePath -Raw
    if ($null -ne $raw -and $raw.Trim().Length -gt 0) {
        $composeNonEmpty = $true
    }
}
Assert-True `
    -TestId "TC-007" `
    -Description "docker-compose.yml has at least one non-whitespace character (stub present)" `
    -Condition $composeNonEmpty `
    -FailDetail "docker-compose.yml is empty or whitespace-only"

# ============================================================
# TC-008  AC-2 / contract: backend/gradlew (or gradlew.bat) exists
# ============================================================
Write-Host ""
Write-Host "[TC-008] backend/gradlew or gradlew.bat exists"
$gradlewPath    = Join-Path $ROOT "backend\gradlew"
$gradlewBatPath = Join-Path $ROOT "backend\gradlew.bat"
$gradlewExists  = ((Test-Path $gradlewPath -PathType Leaf) -or (Test-Path $gradlewBatPath -PathType Leaf))
Assert-True `
    -TestId "TC-008" `
    -Description "Gradle wrapper script exists in backend/" `
    -Condition $gradlewExists `
    -FailDetail "Neither gradlew nor gradlew.bat found under $ROOT\backend"

# ============================================================
# TC-009  contract: backend/settings.gradle exists
# ============================================================
Write-Host ""
Write-Host "[TC-009] backend/settings.gradle exists"
$settingsPath = Join-Path $ROOT "backend\settings.gradle"
Assert-True `
    -TestId "TC-009" `
    -Description "backend/settings.gradle exists on disk" `
    -Condition (Test-Path $settingsPath -PathType Leaf) `
    -FailDetail "Expected file: $settingsPath"

# ============================================================
# TC-010  contract: frontend/tsconfig.json exists
# ============================================================
Write-Host ""
Write-Host "[TC-010] frontend/tsconfig.json exists"
$tsconfigPath = Join-Path $ROOT "frontend\tsconfig.json"
Assert-True `
    -TestId "TC-010" `
    -Description "frontend/tsconfig.json exists on disk" `
    -Condition (Test-Path $tsconfigPath -PathType Leaf) `
    -FailDetail "Expected file: $tsconfigPath"

# ============================================================
# TC-011  contract: frontend/next.config.ts exists
# ============================================================
Write-Host ""
Write-Host "[TC-011] frontend/next.config.ts exists"
$nextConfigPath = Join-Path $ROOT "frontend\next.config.ts"
Assert-True `
    -TestId "TC-011" `
    -Description "frontend/next.config.ts exists on disk" `
    -Condition (Test-Path $nextConfigPath -PathType Leaf) `
    -FailDetail "Expected file: $nextConfigPath"

# ============================================================
# TC-012  contract: frontend/.env.local.example exists
# ============================================================
Write-Host ""
Write-Host "[TC-012] frontend/.env.local.example exists"
$envLocalPath = Join-Path $ROOT "frontend\.env.local.example"
Assert-True `
    -TestId "TC-012" `
    -Description "frontend/.env.local.example exists on disk" `
    -Condition (Test-Path $envLocalPath -PathType Leaf) `
    -FailDetail "Expected file: $envLocalPath"

# ============================================================
# TC-013  contract: .env.example exists at root
# ============================================================
Write-Host ""
Write-Host "[TC-013] .env.example exists at root"
$envExamplePath = Join-Path $ROOT ".env.example"
Assert-True `
    -TestId "TC-013" `
    -Description ".env.example exists at project root" `
    -Condition (Test-Path $envExamplePath -PathType Leaf) `
    -FailDetail "Expected file: $envExamplePath"

# ============================================================
# TC-014  contract: .gitignore exists at root
# ============================================================
Write-Host ""
Write-Host "[TC-014] .gitignore exists at root"
$gitignorePath = Join-Path $ROOT ".gitignore"
Assert-True `
    -TestId "TC-014" `
    -Description ".gitignore exists at project root" `
    -Condition (Test-Path $gitignorePath -PathType Leaf) `
    -FailDetail "Expected file: $gitignorePath"

# ============================================================
# TC-015  contract: README.md exists at root
# ============================================================
Write-Host ""
Write-Host "[TC-015] README.md exists at root"
$readmePath = Join-Path $ROOT "README.md"
Assert-True `
    -TestId "TC-015" `
    -Description "README.md exists at project root" `
    -Condition (Test-Path $readmePath -PathType Leaf) `
    -FailDetail "Expected file: $readmePath"

# ============================================================
# TC-016  AC-2 (compile gate): gradlew compileJava exits 0
# Set SKIP_COMPILE_TEST=1 to skip (e.g. before implementation exists).
# ============================================================
Write-Host ""
Write-Host "[TC-016] Gradle compileJava succeeds with exit code 0"
$skipCompile = ($env:SKIP_COMPILE_TEST -eq "1")
if ($skipCompile) {
    Write-Host "  [SKIP] TC-016 : SKIP_COMPILE_TEST=1 -- skipping Gradle compile invocation"
}

if (-not $skipCompile) {
    $gradleExe = $null
    if (Test-Path $gradlewBatPath -PathType Leaf) {
        $gradleExe = $gradlewBatPath
    } elseif (Test-Path $gradlewPath -PathType Leaf) {
        $gradleExe = $gradlewPath
    }

    $compileOk     = $false
    $compileDetail = ""

    if ($null -eq $gradleExe) {
        $compileDetail = "gradlew / gradlew.bat not found -- cannot invoke Gradle"
    } else {
        $backendDir = Join-Path $ROOT "backend"
        $stdoutFile = [System.IO.Path]::Combine($env:TEMP, "gradle_stdout.txt")
        $stderrFile = [System.IO.Path]::Combine($env:TEMP, "gradle_stderr.txt")
        try {
            $startArgs = @{
                FilePath               = $gradleExe
                ArgumentList           = "compileJava"
                WorkingDirectory       = $backendDir
                Wait                   = $true
                PassThru               = $true
                NoNewWindow            = $true
                RedirectStandardOutput = $stdoutFile
                RedirectStandardError  = $stderrFile
            }
            $proc = Start-Process @startArgs
            $compileOk = ($proc.ExitCode -eq 0)
            if (-not $compileOk) {
                $stderrText    = Get-Content $stderrFile -Raw -ErrorAction SilentlyContinue
                $compileDetail = "Exit code $($proc.ExitCode). stderr: $stderrText"
            }
        } catch {
            $compileDetail = "Exception launching Gradle: $($_.Exception.Message)"
        }
    }

    Assert-True `
        -TestId "TC-016" `
        -Description "gradlew compileJava exits with code 0 (zero compile errors)" `
        -Condition $compileOk `
        -FailDetail $compileDetail
}

# ============================================================
# Summary
# ============================================================
$total = $script:passed + $script:failed
Write-Host ""
Write-Host "============================================================"
Write-Host "S-01 Scaffold Test Results"
Write-Host "============================================================"
Write-Host "  Total  : $total"
Write-Host "  Passed : $script:passed"
Write-Host "  Failed : $script:failed"

if ($script:failed -gt 0) {
    Write-Host ""
    Write-Host "  FAILING TESTS:"
    $script:results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "    $($_.Id) : $($_.Description)"
        Write-Host "             $($_.Detail)"
    }
    Write-Host ""
    Write-Host "has_critical_bugs: true"
    exit 1
} else {
    Write-Host ""
    Write-Host "has_critical_bugs: false"
    exit 0
}
