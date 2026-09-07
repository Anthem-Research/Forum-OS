param([string[]]$Tasks = @(':app:assembleDebug', ':app:lintDebug', ':app:testDebugUnitTest'))
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskTools = Join-Path $taskRoot '.tools'
$jdk = Get-ChildItem -LiteralPath $taskTools -Directory -Filter 'jdk-*' | Select-Object -First 1
if (-not $jdk) { throw 'Run scripts/prepare-build.ps1 first.' }
$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_HOME = Join-Path $taskTools 'android-sdk'
$env:ANDROID_USER_HOME = Join-Path $taskTools 'android-user'
$env:GRADLE_USER_HOME = Join-Path $taskTools 'gradle-cache'
& (Join-Path $taskTools 'gradle-9.6.0/bin/gradle.bat') -p $taskRoot --no-daemon @Tasks
if ($LASTEXITCODE -ne 0) { throw "Gradle failed with exit code $LASTEXITCODE" }
