# Runner automatizado de k6 para Yanbal Prestige
param (
    [string]$BaseUrl = "http://localhost:5075",
    [string]$Suite = "all"
)

$k6Path = "C:\Program Files\k6\k6.exe"
if (-not (Test-Path $k6Path)) {
    $whereK6 = Get-Command k6 -ErrorAction SilentlyContinue
    if ($whereK6) { $k6Path = $whereK6.Source }
    else {
        Write-Error "No se encontró el ejecutable k6.exe."
        exit 1
    }
}

$env:BASE_URL = $BaseUrl
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " 🚀 YANBAL PRESTIGE - SUITE DE PRUEBAS DE CARGA K6" -ForegroundColor Cyan
Write-Host " Target API: $BaseUrl" -ForegroundColor Gray
Write-Host " k6 Binary:  $k6Path" -ForegroundColor Gray
Write-Host " Suite:      $Suite" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Cyan

if ($Suite -eq "all" -or $Suite -eq "catalog") {
    Write-Host "`n[1/3] Ejecutando prueba de carga de Catálogo y CMS..." -ForegroundColor Yellow
    & $k6Path run "$scriptDir\catalog-load.test.js"
}

if ($Suite -eq "all" -or $Suite -eq "orders") {
    Write-Host "`n[2/3] Ejecutando prueba de concurrencia, doble clic y anti-bots..." -ForegroundColor Yellow
    & $k6Path run "$scriptDir\order-race-condition.js"
}

if ($Suite -eq "lifecycle" -or $Suite -eq "all") {
    Write-Host "`n[*] Ejecutando Ciclo Completo con Mutaciones Reales y Auditoria..." -ForegroundColor Yellow
    & $k6Path run "$scriptDir\full-lifecycle-all-entities.test.js"
}

if ($Suite -eq "extreme" -or $Suite -eq "all-endpoints") {
    Write-Host "`n[3/3] Ejecutando prueba extrema de 1,000 VUs en TODOS los endpoints y roles..." -ForegroundColor Magenta
    & $k6Path run "$scriptDir\all-endpoints-extreme.test.js"
}

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " ✅ Suite k6 finalizada exitosamente" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
