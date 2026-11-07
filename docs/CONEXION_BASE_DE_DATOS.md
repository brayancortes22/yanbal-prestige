# Conexión local: frontend ↔ API ↔ MySQL

> Estado: **CONECTADO**. El backend lee y escribe en MySQL 8.0 local y el
> frontend consume la API a través de `VITE_API_URL=http://localhost:5075`.
> El usuario de MySQL es `bscl`; la contraseña vive en
> `C:/Users/NITRO ACER/.secrets/integraciones.env` y **no** se escribe aquí.

## 1. Diagnóstico actual

| Componente | Estado | Evidencia |
| :--- | :--- | :--- |
| Frontend Vite | Funciona en `http://127.0.0.1:5173` | Login real y datos desde MySQL |
| API .NET | Funciona en `http://127.0.0.1:5075` | `/health` responde `healthy` |
| MySQL 8.0 | Activo en `127.0.0.1:3306` | Base `yanbal_prestige` creada |
| Conexión API → MySQL | **OK** | Login real emite JWT |
| Frontend → API | **OK** | Badge “MySQL · API” |

Conteo de la base al cierre: 7 usuarios (incluida la cuenta de soporte del
desarrollador), 4 clientas, 3 productos, 1 pedido y su pago registrado. Los
seeds de demostración siguen existiendo, pero ahora viven en MySQL y se
consultan por la API.

## 2. Esquema y credenciales

- Esquema canónico: `database/005_atomic_3nf_canonical.sql`.
- Base: `yanbal_prestige` (MySQL 8.0, utf8mb4).
- Usuario local: `bscl` (contraseña en `.secrets/integraciones.env`).
- La cadena se inyecta por variable de entorno, nunca en `appsettings.json`.
- Bases ya creadas: ejecutar también
  `database/006_support_developer_role.sql`, que amplía el `CHECK` de roles
  para admitir el rol 6 (`Developer`, soporte técnico).

```powershell
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
Get-Content -Raw "database\005_atomic_3nf_canonical.sql" |
  & $mysql -u bscl -p -h 127.0.0.1
```

## 3. Arranque local

### 3.1 Backend

La forma recomendada es el script, que lee la contraseña desde el archivo
seguro y no la escribe en el repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-api-local.ps1
```

El script espera estas claves en `C:/Users/NITRO ACER/.secrets/integraciones.env`:

```ini
MYSQL_LOCAL_USER=bscl
MYSQL_LOCAL_PASSWORD=...
MYSQL_LOCAL_DATABASE=yanbal_prestige
```

También se puede hacer manualmente:

```powershell
$env:ConnectionStrings__DefaultConnection = "Server=127.0.0.1;Port=3306;Database=yanbal_prestige;User=bscl;Password=...;SslMode=None;AllowPublicKeyRetrieval=True;"
$env:JWT_KEY = "yanbal-prestige-dev-jwt-key-2026-bscl-32chars"
$env:ASPNETCORE_ENVIRONMENT = "Development"

cd backend/YanbalPrestige.Api
dotnet run
```

### 3.2 Frontend

`frontend/.env.local` (ignorado por git):

```ini
VITE_API_URL=http://localhost:5075
```

Reiniciar Vite. El login usa `/api/Auth/login`; las cuentas demo de la UI se
ocultan y el panel muestra el badge **“MySQL · API”** (con un punto animado
mientras revalida en segundo plano).

Credenciales de los seeds (solo desarrollo):

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| Administradora | `yulieth.directora@yanbalprestige.com` | `yanbal2026` |
| Asistente | `laura.asistente@yanbalprestige.com` | `yanbal2026` |
| Líder de zona | `andrea.lider@yanbalprestige.com` | `yanbal2026` |
| Consultora | `carolina.mejia@yanbalprestige.com` | `yanbal2026` |

## 4. Flujo de datos (backend como fuente de verdad)

- **Lecturas**: el frontend pide productos, usuarios, clientas, pedidos y
  pagos a la API. El backend recorta la respuesta según el rol del JWT.
- **Escrituras**: usuarios, productos, clientas, pedidos y abonos se envían a
  la API. Si la API rechaza (400/401/403/500), el estado local no se actualiza
  y se muestra un aviso.
- **Roles**: el `role` se lee del claim firmado del JWT, no de un valor
  editable en localStorage. Las guardas de ruta son solo UX; la API valida
  cada operación.
- **Pedidos**: el backend ignora precios y nombres enviados por el navegador;
  toma el precio del catálogo y calcula el total.
- **Pagos**: `PUT /api/Orders/{id}/payments` reemplaza el historial y deriva
  `pendiente`/`abono`/`pagado` del dinero realmente recibido.
- **Caché**: `localStorage` guarda la última respuesta para pintar al instante.
  Al cargar se muestra esa copia y la API se consulta en silencio; al volver
  el foco o cada 120 s se revalida sin recargar ni vaciar la pantalla. La
  caché solo se limpia al cambiar de cuenta o cerrar sesión.
- **Medios**: las fotos y videos se suben al backend, que los optimiza y
  devuelve una URL absoluta; al borrar o reemplazar un producto se purgan los
  archivos del VPS (ver `docs/MEDIOS_FOTOS_Y_VIDEOS.md`).
- **Clientas y pedidos ampliados**: `clientes_consultora` guarda correo,
  cédula, ciudad, barrio, dirección y código postal; `pedidos` conserva una
  instantánea de esos datos para la factura. `GET /api/Leads` entrega los
  prospectos reales solo a directora y asistente, y el alta de integrantes
  puede precargarse desde allí.
- **Cancelaciones y reembolsos**: `PUT /api/Orders/{id}/payments` acepta
  movimientos negativos con método `reembolso`; una factura anulada conserva
  su historial para auditoría.

## 5. Pruebas ejecutadas

- Login real con los cuatro roles.
- Producto creado/eliminado por API y visible en `productos`.
- Clienta creada desde el CRM y confirmada en `clientes_consultora`.
- Venta desde la página nueva: `pedidos`, `pedido_items` y `pagos_pedido`.
- IDOR: una consultora recibe 404 al leer o mutar un pedido ajeno.
- Asistente: solo ve su perfil y la cartera consolidada; no gestiona usuarios.
- Anti-spoof: un pedido anónimo con `consultantId: HACK-999` y
  `unitPrice: 1` fue asignado a Carolina y valorizado en $168.000 con el
  precio del catálogo; el servidor ignoró ambos valores del navegador.
- Seguridad: 20 PASS, 0 FAIL (1 SKIP por el PIN visible en Development).

> `EnsureCreated()` no aplica migraciones sobre una base ya existente. Si la
> base fue creada por una versión anterior (con `categoria_label`), hay que
> migrarla según la sección 6 de `MER_MODELO_DATOS_3NF.md`.
