# Crop browser screenshots only; never change the chosen design or app rendering.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = Split-Path $PSScriptRoot -Parent
$qa = Join-Path $taskRoot 'docs/design/qa'
foreach ($item in @(@('full-browser.png', 'home-tablet.png'), @('parent-browser.png', 'parent-tablet.png'))) {
    $inputImage = [System.Drawing.Bitmap]::FromFile((Join-Path $qa $item[0]))
    try {
        if ($inputImage.Width -lt 1499 -or $inputImage.Width -gt 1500 -or $inputImage.Height -ne 1050) { throw 'Unexpected browser capture dimensions.' }
        $crop = $inputImage.Clone([System.Drawing.Rectangle]::new(110, 125, 1280, 800), $inputImage.PixelFormat)
        try { $crop.Save((Join-Path $qa $item[1]), [System.Drawing.Imaging.ImageFormat]::Png) }
        finally { $crop.Dispose() }
    } finally { $inputImage.Dispose() }
}
