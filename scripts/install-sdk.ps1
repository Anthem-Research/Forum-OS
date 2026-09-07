$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskTools = Join-Path $taskRoot '.tools'
$env:JAVA_HOME = (Get-ChildItem -LiteralPath $taskTools -Directory -Filter 'jdk-*' | Select-Object -First 1).FullName
$env:ANDROID_HOME = Join-Path $taskTools 'android-sdk'
$env:ANDROID_USER_HOME = Join-Path $taskTools 'android-user'
$sdkmanager = Join-Path $env:ANDROID_HOME 'cmdline-tools/latest/bin/sdkmanager.bat'
1..20 | ForEach-Object { 'y' } | & $sdkmanager --sdk_root=$env:ANDROID_HOME --licenses
& $sdkmanager --sdk_root=$env:ANDROID_HOME 'platforms;android-36' 'build-tools;36.0.0' 'platform-tools'
if ($LASTEXITCODE -ne 0) { throw "SDK installation failed with exit code $LASTEXITCODE" }
