$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskTools = Join-Path $taskRoot '.tools'
New-Item -ItemType Directory -Force -Path $taskTools | Out-Null
function Get-Archive($url, $name, $sha) {
    $path = Join-Path $taskTools $name
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Host "Downloading $name"
        Invoke-WebRequest -Uri $url -OutFile $path
    }
    if ($sha -and (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ne $sha) { throw "Checksum mismatch: $name" }
    return $path
}
$jdk = Get-ChildItem -LiteralPath $taskTools -Directory -Filter 'jdk-*' | Select-Object -First 1
if (-not $jdk) {
    $asset = (Invoke-RestMethod 'https://api.adoptium.net/v3/assets/latest/17/hotspot?architecture=x64&image_type=jdk&os=windows&vendor=eclipse')[0]
    $zip = Get-Archive $asset.binary.package.link 'temurin-17.zip' $asset.binary.package.checksum
    Expand-Archive -LiteralPath $zip -DestinationPath $taskTools -Force
}
if (-not (Test-Path -LiteralPath (Join-Path $taskTools 'gradle-9.6.0'))) {
    $sha = (Invoke-RestMethod 'https://services.gradle.org/distributions/gradle-9.6.0-bin.zip.sha256').Trim()
    $zip = Get-Archive 'https://services.gradle.org/distributions/gradle-9.6.0-bin.zip' 'gradle-9.6.0-bin.zip' $sha
    Expand-Archive -LiteralPath $zip -DestinationPath $taskTools -Force
}
$sdk = Join-Path $taskTools 'android-sdk'
if (-not (Test-Path -LiteralPath (Join-Path $sdk 'cmdline-tools/latest/bin/sdkmanager.bat'))) {
    $zip = Get-Archive 'https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip' 'android-commandline.zip' '90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a'
    $unpacked = Join-Path $taskTools 'android-commandline'
    Expand-Archive -LiteralPath $zip -DestinationPath $unpacked -Force
    New-Item -ItemType Directory -Force -Path (Join-Path $sdk 'cmdline-tools/latest') | Out-Null
    Copy-Item -Path (Join-Path $unpacked 'cmdline-tools/*') -Destination (Join-Path $sdk 'cmdline-tools/latest') -Recurse -Force
}
Write-Output 'Portable Android toolchain downloaded. No system settings changed.'
