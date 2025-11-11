$port = 8000
$root = Get-Location
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$port/"
while ($listener.IsListening) {
  $context = $listener.GetContext()
  $path = $context.Request.Url.AbsolutePath.TrimStart('/')
  if ($path -eq '') { $path = 'index.html' }
  $file = Join-Path $root $path
  if (Test-Path $file) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $ct = 'text/html'
    if ($file.EndsWith('.css')) { $ct = 'text/css' }
    elseif ($file.EndsWith('.js')) { $ct = 'application/javascript' }
    elseif ($file.EndsWith('.png')) { $ct = 'image/png' }
    elseif ($file.EndsWith('.jpg') -or $file.EndsWith('.jpeg')) { $ct = 'image/jpeg' }
    elseif ($file.EndsWith('.svg')) { $ct = 'image/svg+xml' }
    $context.Response.ContentType = $ct
    $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
    $context.Response.Close()
  } else {
    $context.Response.StatusCode = 404
    $writer = New-Object System.IO.StreamWriter($context.Response.OutputStream)
    $writer.Write("Not Found")
    $writer.Dispose()
    $context.Response.Close()
  }
}