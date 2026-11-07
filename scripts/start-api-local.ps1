# Arranca la API local leyendo las credenciales de MySQL desde
# C:/Users/<usuario>/.secrets/integraciones.env.
# Uso:  powershell -ExecutionPolicy Bypass -File scripts/start-api-local.ps1

$ErrorActionPreference = 'Stop'

$envFile = Join-Path $HOME '.secrets\integraciones.env'
if (-not (Test-Path $envFile)) {
  throw "No existe $envFile. Crea el archivo con MYSQL_LOCAL_USER, MYSQL_LOCAL_PASSWORD y MYSQL_LOCAL_DATABASE."
}

$vars = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z0-9_]+)\s*=(.*)$') {
    $vars[$matches[1]] = $matches[2].Trim()
  }
}

$user = $vars['MYSQL_LOCAL_USER']
$password = $vars['MYSQL_LOCAL_PASSWORD']
$database = if ($vars['MYSQL_LOCAL_DATABASE']) { $vars['MYSQL_LOCAL_DATABASE'] } else { 'yanbal_prestige' }

if (-not $user -or -not $password) {
  throw "Faltan MYSQL_LOCAL_USER o MYSQL_LOCAL_PASSWORD en $envFile."
}

$env:ConnectionStrings__DefaultConnection =
  "Server=127.0.0.1;Port=3306;Database=$database;User=$user;Password=$password;SslMode=None;AllowPublicKeyRetrieval=True;"
$env:JWT_KEY = if ($vars['JWT_KEY']) { $vars['JWT_KEY'] } else { 'yanbal-prestige-dev-jwt-key-2026-bscl-32chars' }
$env:ASPNETCORE_ENVIRONMENT = 'Development'

# Cuenta de soporte del equipo desarrollador (se siembra al arrancar).
if ($vars['SUPPORT_EMAIL']) { $env:SUPPORT_EMAIL = $vars['SUPPORT_EMAIL'] }
if ($vars['SUPPORT_PASSWORD']) { $env:SUPPORT_PASSWORD = $vars['SUPPORT_PASSWORD'] }

# Directorio temporal propio para el buffering de subidas grandes. Evita
# depender de los permisos del %TEMP% del sistema y se puede limpiar aparte.
$tempRoot = Join-Path $env:LOCALAPPDATA 'Temp\yanbal-prestige'
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
$env:TMP = $tempRoot
$env:TEMP = $tempRoot

$project = Join-Path $PSScriptRoot '..\backend\YanbalPrestige.Api'
Set-Location $project
dotnet run
