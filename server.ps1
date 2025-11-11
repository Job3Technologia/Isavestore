$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()
Write-Host "ISave dev server running at http://localhost:$port/" -ForegroundColor Green

function Get-MimeType($path){
  if($path.EndsWith('.html')){ return 'text/html' }
  if($path.EndsWith('.css')){ return 'text/css' }
  if($path.EndsWith('.js')){ return 'application/javascript' }
  if($path.EndsWith('.svg')){ return 'image/svg+xml' }
  if($path.EndsWith('.png')){ return 'image/png' }
  if($path.EndsWith('.jpg') -or $path.EndsWith('.jpeg')){ return 'image/jpeg' }
  return 'application/octet-stream'
}

while($listener.IsListening){
  $context = $listener.GetContext()
  $request = $context.Request
  $path = $request.Url.AbsolutePath.Trim('/')
  if([string]::IsNullOrEmpty($path)){ $path = 'index.html' }
  $file = Join-Path (Get-Location) $path
  try{
    if(Test-Path $file){
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $context.Response.ContentType = Get-MimeType($file)
      $context.Response.StatusCode = 200
      $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
    }else{
      $context.Response.StatusCode = 404
      $msg = [Text.Encoding]::UTF8.GetBytes("Not Found")
      $context.Response.OutputStream.Write($msg,0,$msg.Length)
    }
  }catch{
    $context.Response.StatusCode = 500
  }
  $context.Response.Close()
}