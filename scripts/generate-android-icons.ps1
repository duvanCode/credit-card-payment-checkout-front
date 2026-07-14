Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

function New-AppIcon {
  param(
    [int]$Size,
    [string]$Path,
    [bool]$Round
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $canvas = New-Object System.Drawing.RectangleF 0, 0, ($Size - 1), ($Size - 1)

  if ($Round) {
    $backgroundBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $graphics.FillEllipse($backgroundBrush, $canvas)
    $backgroundBrush.Dispose()
  }
  else {
    $radius = [Math]::Max([int]($Size * 0.22), 8)
    $diameter = $radius * 2
    $backgroundPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $backgroundPath.AddArc(0, 0, $diameter, $diameter, 180, 90)
    $backgroundPath.AddArc($Size - $diameter - 1, 0, $diameter, $diameter, 270, 90)
    $backgroundPath.AddArc($Size - $diameter - 1, $Size - $diameter - 1, $diameter, $diameter, 0, 90)
    $backgroundPath.AddArc(0, $Size - $diameter - 1, $diameter, $diameter, 90, 90)
    $backgroundPath.CloseFigure()

    $gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
      $canvas,
      [System.Drawing.Color]::FromArgb(255, 30, 64, 175),
      [System.Drawing.Color]::FromArgb(255, 14, 165, 233),
      45
    )

    $graphics.FillPath($gradientBrush, $backgroundPath)
    $gradientBrush.Dispose()
    $backgroundPath.Dispose()
  }

  $cardWidth = $Size * 0.62
  $cardHeight = $Size * 0.4
  $cardX = ($Size - $cardWidth) / 2
  $cardY = $Size * 0.24
  $cardRadius = [Math]::Max([int]($Size * 0.06), 3)
  $cardDiameter = $cardRadius * 2
  $cardPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $cardPath.AddArc($cardX, $cardY, $cardDiameter, $cardDiameter, 180, 90)
  $cardPath.AddArc($cardX + $cardWidth - $cardDiameter, $cardY, $cardDiameter, $cardDiameter, 270, 90)
  $cardPath.AddArc($cardX + $cardWidth - $cardDiameter, $cardY + $cardHeight - $cardDiameter, $cardDiameter, $cardDiameter, 0, 90)
  $cardPath.AddArc($cardX, $cardY + $cardHeight - $cardDiameter, $cardDiameter, $cardDiameter, 90, 90)
  $cardPath.CloseFigure()

  $cardBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 248, 250, 252))
  $graphics.FillPath($cardBrush, $cardPath)
  $cardBrush.Dispose()
  $cardPath.Dispose()

  $stripeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 59, 130, 246))
  $graphics.FillRectangle($stripeBrush, $cardX + $Size * 0.04, $cardY + $Size * 0.08, $cardWidth - $Size * 0.08, $Size * 0.06)
  $stripeBrush.Dispose()

  $chipBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 251, 191, 36))
  $graphics.FillRectangle($chipBrush, $cardX + $Size * 0.08, $cardY + $Size * 0.18, $Size * 0.12, $Size * 0.09)
  $chipBrush.Dispose()

  $checkPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 34, 197, 94)), ([Math]::Max($Size * 0.065, 3))
  $checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawLines(
    $checkPen,
    @(
      [System.Drawing.PointF]::new($Size * 0.3, $Size * 0.67),
      [System.Drawing.PointF]::new($Size * 0.45, $Size * 0.8),
      [System.Drawing.PointF]::new($Size * 0.73, $Size * 0.52)
    )
  )
  $checkPen.Dispose()

  if ($Round) {
    $ringPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(80, 255, 255, 255)), ([Math]::Max($Size * 0.02, 1))
    $graphics.DrawEllipse($ringPen, $Size * 0.08, $Size * 0.08, $Size * 0.84, $Size * 0.84)
    $ringPen.Dispose()
  }

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$targets = @(
  @{ Size = 48; Folder = 'mipmap-mdpi' },
  @{ Size = 72; Folder = 'mipmap-hdpi' },
  @{ Size = 96; Folder = 'mipmap-xhdpi' },
  @{ Size = 144; Folder = 'mipmap-xxhdpi' },
  @{ Size = 192; Folder = 'mipmap-xxxhdpi' }
)

foreach ($target in $targets) {
  $directory = Join-Path 'android\app\src\main\res' $target.Folder
  New-AppIcon -Size $target.Size -Path (Join-Path $directory 'ic_launcher.png') -Round:$false
  New-AppIcon -Size $target.Size -Path (Join-Path $directory 'ic_launcher_round.png') -Round:$true
}

Write-Output 'Android icons generated successfully.'
