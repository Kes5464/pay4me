# Create simple PNG icons using PowerShell and .NET
Add-Type -AssemblyName System.Drawing

$outputDir = "C:\Users\KES\Desktop\utility bill\images"
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Enable anti-aliasing
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Create gradient background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(102, 126, 234), [System.Drawing.Color]::FromArgb(118, 75, 162), [System.Drawing.Drawing2D.LinearGradientMode]::BackwardDiagonal)
    
    # Draw rounded rectangle background
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = $size * 0.2
    $path.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
    $path.AddArc($size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
    $path.AddArc($size - $radius * 2, $size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $path.AddArc(0, $size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $path.CloseFigure()
    
    $graphics.FillPath($brush, $path)
    
    # Draw white elements (simplified utility symbols)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
    
    # Draw circles (representing connection points)
    $circleSize = $size * 0.15
    $graphics.FillEllipse($whiteBrush, $size * 0.2, $size * 0.25, $circleSize, $circleSize)
    $graphics.FillEllipse($whiteBrush, $size * 0.65, $size * 0.25, $circleSize, $circleSize)
    
    # Draw connection line
    $pen = New-Object System.Drawing.Pen($whiteBrush, $size * 0.06)
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawArc($pen, $size * 0.25, $size * 0.35, $size * 0.5, $size * 0.3, 0, 180)
    
    # Draw utility bars
    $barBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 255, 255, 255))
    $graphics.FillRectangle($barBrush, $size * 0.2, $size * 0.7, $size * 0.6, $size * 0.08)
    $graphics.FillRectangle($barBrush, $size * 0.25, $size * 0.82, $size * 0.5, $size * 0.06)
    
    # Save the image
    $filename = "icon-${size}x${size}.png"
    $filepath = Join-Path $outputDir $filename
    $bitmap.Save($filepath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $whiteBrush.Dispose()
    $barBrush.Dispose()
    $pen.Dispose()
    $path.Dispose()
    
    Write-Host "Created: $filename"
}

Write-Host "All icon sizes created successfully!"