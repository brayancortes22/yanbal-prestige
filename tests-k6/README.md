# 🚀 Suite de Pruebas de Carga y Concurrencia k6 (Grafana Labs)

Suite oficial de ingeniería de rendimiento, estrés y concurrencia para **Yanbal Prestige**.

## 📦 Herramientas y Requisitos
* **k6 Runtime:** v2.3.0+ instalado en el sistema (`C:\Program Files\k6\k6.exe` o en PATH).
* **Backend:** Kestrel .NET 10 activo en `http://localhost:5075`.
* **Base de Datos:** MySQL / MariaDB (`yanbal_prestige`).

---

## 🎯 Suites de Prueba Disponibles

### 1. `catalog-load.test.js` (Carga de Catálogo y CMS)
Simula navegación de usuarios revisando el catálogo público, detalle de producto con zoom, slides del hero y videos.
* **Métrica objetivo:** `p(95) < 100 ms` mediante OutputCache en RAM.

### 2. `order-race-condition.js` (Concurrencia, Facturación y Doble Clic)
Simula compras masivas simultáneas para auditar:
* Candado de facturación serializada (`InvoiceLock`): Cero colisiones en `numero_factura`.
* Idempotencia (`X-Idempotency-Key`): Detección y descarte de doble clic en botones de pago.
* Trampas Honeypot (`trap_field`): Bloqueo instantáneo con HTTP 400.
* Cumplimiento Legal Ley 1581: Rechazo de pedidos sin consentimiento de Habeas Data.

### 3. `all-endpoints-extreme.test.js` (Prueba Extrema 1,000 VUs)
Prueba de estrés masivo a escala de producción simulando simultáneamente todos los roles de la web:
* 600 Clientes públicos (catálogo, tips, CMS, leads y checkout).
* 200 Consultoras autenticadas (JWT, cartera CRM, pedidos propios).
* 100 Directoras (JWT, auditoría, dashboard, ventas de red).
* 100 Bots (ataques honeypot y fuerza bruta).

---

## 💻 Comandos de Ejecución

Desde el directorio `frontend/`:
```bash
# Ejecutar suite estándar (Catálogo + Concurrencia de Pedidos)
npm run test:k6

# Ejecutar prueba extrema de 1,000 VUs en todos los endpoints
npm run test:k6:extreme
```

O directamente desde PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File tests-k6/run-k6.ps1 -Suite extreme
```
