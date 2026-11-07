# Roles, pagos, búsqueda e importación de catálogo

> Cambios de la iteración de noviembre de 2026. Complementa
> `MER_MODELO_DATOS_3NF.md` y `SRS_REQUERIMIENTOS_CASOS_DE_USO_YANBAL_PRESTIGE.md`.

## 1. Jerarquía de roles

La red tiene cuatro roles y una regla simple: **el líder de zona vende igual
que una consultora y lo único adicional es que tiene trabajadoras a cargo.**

| Rol | Código UI | Código backend | Alcance |
| :--- | :--- | :--- | :--- |
| Administradora / Directora | `DIRECTORA` | `Director` (1) | Toda la red: catálogo, CMS, anuncios, prospectos, usuarios y ventas. |
| Asistente administrativa | `ASISTENTE` | `Assistant` (5) | Catálogo, CMS, anuncios, prospectos y ventas. No gestiona usuarios ni roles. |
| Líder de zona | `LIDER_ZONA` | `Leader` (4) | Su cartera, sus ventas y el equipo de consultoras que le reportan. |
| Consultora / Vendedora | `CONSULTORA` | `Consultant` (2) | Su cartera, sus pedidos y el catálogo. |
| Cliente | `CLIENTE` | `Client` (3) | Catálogo, carrito y sus propios datos. |

### 1.1 Asignación de equipo

- La administradora crea o edita una consultora en **Equipo & Roles**.
- El campo **Líder a cargo (equipo)** es un selector con búsqueda por nombre,
  zona o correo.
- Una consultora sin líder aparece como **“Sin líder asignado”** en la tabla y
  en el filtro **Todos los equipos → Sin líder asignado**.
- El líder ve el panel **Mi equipo** en `/consultora`: ventas, abonos, saldos y
  clientas de cada consultora, con contacto directo por WhatsApp.
- La líder también puede registrar sus propias ventas y clientas; no entra al
  panel administrativo ni al CMS.

### 1.2 Reglas de acceso

| Ruta | Administradora | Asistente | Líder | Consultora |
| :--- | :---: | :---: | :---: | :---: |
| `/admin` (métricas) | Sí | Sí | No | No |
| `/admin/ventas`, `/admin/catalogo` | Sí | Sí | No | No |
| `/admin/contenido`, `/admin/anuncios`, `/admin/prospectos` | Sí | Sí | No | No |
| `/admin/usuarios` (roles y equipos) | Sí | **No** | No | No |
| `/consultora/*` | Sí | Sí | Sí | Sí |
| Catálogo público, carrito y checkout | Sí | Sí | Sí | Sí |

En la API, `AuthRoles` incorpora `Leader` y los controladores de pedidos y CRM
permiten al líder leer y operar sobre los pedidos de su equipo, sin ampliar el
alcance por parámetros de la URL (se conserva la protección BOLA/IDOR).

## 2. Pagos y abonos editables

### 2.1 Modelo

Cada pedido guarda un historial `payments: PaymentRecord[]`:

```ts
interface PaymentRecord {
  id: string;
  amount: number;
  method: 'efectivo' | 'transferencia' | 'nequi' | 'daviplata' | 'tarjeta' | 'otro';
  note?: string;
  date: string;
}
```

El estado se **deriva** del dinero recibido:

| Suma de pagos | Estado |
| :--- | :--- |
| 0 | `pendiente` |
| Mayor que 0 y menor que el total | `abono` |
| Igual o mayor que el total | `pagado` |

Los pedidos antiguos sin historial se interpretan con reglas de
compatibilidad: si el pedido estaba `pagado`, se asume cubierto por el total,
pero se ofrece **“Registrar detalle del pago”** para dejar el movimiento real.

### 2.2 Operaciones disponibles

En **Ventas & Facturas** (administradora) y **Mis Ventas** (consultora/líder):

- **Registrar abono**: monto, método y nota; botón rápido para el saldo
  completo o el 50%.
- **Editar pagos**: cada movimiento tiene lápiz para corregir monto, método o
  nota, y papelera para eliminarlo.
- El estado y el saldo se recalculan automáticamente al editar o eliminar.
- La factura muestra el historial de pagos y el saldo, y el mensaje de WhatsApp
  incluye “Abonado” y “Saldo pendiente”.

### 2.3 Confirmaciones y avisos

- Antes de registrar una venta, un pago, una edición o una eliminación se
  muestra un diálogo de confirmación con el monto y la acción exacta.
- Cada acción exitosa lanza un **toast** (esquina inferior derecha):
  “Pago de $50.000 registrado en FAC-2026-704”, “Venta FAC-2026-705 registrada”,
  “Los datos de Carolina se actualizaron”, etc.
- Los errores también se notifican y nunca se simula un éxito falso.

## 3. Búsqueda inteligente

- **Clientas del CRM**: selector con búsqueda por nombre, teléfono, tipo de piel,
  categoría favorita o notas. Reemplaza el `<select>` nativo.
- **Productos del pedido**: búsqueda por nombre, código SKU, categoría o
  descripción.
- **Líder a cargo**: búsqueda por nombre, zona o correo.
- Todos los selectores permiten teclado (↑, ↓, Enter, Esc) y muestran
  “Sin resultados” con una guía para crear el registro.

## 3.1 Registro de venta como página completa

La venta directa dejó de ser un modal estrecho. Ahora vive en
`/consultora/ventas/nueva`:

- **Paso 1 – Clienta**: búsqueda en el CRM o registro de una nueva.
- **Paso 2 – Catálogo**: tabla con **foto**, SKU, nombre, categoría, precio,
  cantidad y botón Agregar. Tiene buscador y filtros por categoría.
- **Paso 3 – Pedido**: carrito en tabla con foto, cantidad editable, subtotal
  y eliminación; bloque de pago (pendiente/abono/pagado) y resumen fijo al
  costado en escritorio.
- La consultora o líder puede registrar su propia venta; la administradora y
  la asistente también pueden entrar al portal.

## 3.2 Factura limpia para PDF

El botón **Factura PDF** de la factura abre una **ventana independiente** con
un documento A4:

- Sin barra de navegación, botones ni estilos del panel: no es una captura de
  pantalla.
- Encabezado de marca, número de factura, fecha, clienta, consultora, tabla de
  productos con SKU/cantidad/unitario/subtotal, totales, pagos registrados y
  nota legal.
- Regla `@page { size: A4; margin: 14mm; }` para que el diálogo de impresión
  permita **Guardar como PDF** con márgenes correctos.
- Los datos se escapan antes de insertarse en el HTML.

## 4. Importación de catálogo (Excel / CSV)

### 4.1 Plantilla Excel (.xlsx real)

El botón **Descargar Excel (.xlsx)** usa ExcelJS y genera un libro con dos hojas:

1. **Catálogo**: encabezados en color terracota, fila congelada, anchos de
   columna, autofiltro, validación de categorías y dos productos de ejemplo.
2. **Instrucciones**: qué escribir en cada campo, categorías válidas y reglas
   de formato.

Columnas (en orden): `Código SKU`, `Nombre del producto`, **`Imagen (URL o
pegada)`**, `Categoría`, `Precio venta (COP)`, `Precio anterior (COP)`,
`Descripción`, `Etiqueta / badge`, `Tip para la consultora`, `Pasos de uso`.

La imagen se detecta automáticamente con esta prioridad:

1. **URL escrita en la celda** (`https://...`, `data:image/...`, `/uploads/...`).
2. **Imagen pegada sobre la fila** con `Insertar → Imagen`. Se extrae del
   `.xlsx`, se comprime a máximo 900 px y se guarda como data URL.
3. **Imagen genérica** si no hay ninguna de las anteriores.

La vista previa muestra una miniatura por fila para confirmar qué imagen se
usará antes de importar. Solo se procesan las primeras 60 imágenes y se
ignoran archivos mayores a 6 MB para no agotar el almacenamiento local.

### 4.2 Parser CSV / XLSX

- **CSV**: detecta coma o punto y coma, comillas dobles escapadas, comas y
  saltos de línea dentro de celdas.
- **XLSX**: lee la primera hoja con ExcelJS y asocia las imágenes ancladas a su
  fila.
- Acepta encabezados en español o inglés, con o sin tildes, mayúsculas,
  paréntesis y asteriscos.
- Interpreta precios como `145000`, `145.000`, `145,000` y `145,50`.
- Valida fila por fila: SKU obligatorio y único, nombre obligatorio y precio
  mayor a cero. Muestra una tabla de vista previa con el error exacto y solo
  importa las filas válidas.

## 5. Backend como fuente de verdad

Con `VITE_API_URL` configurada, el frontend **no usa los seeds** para los
datos críticos:

| Dato | Lectura | Escritura |
| :--- | :--- | :--- |
| Usuarios/roles | `GET /api/Auth/users` (recortado por rol) y `GET /api/Auth/me` | `POST /api/Auth/users`, `PATCH .../toggle`, `DELETE` |
| Productos | `GET /api/Catalog/products` | `POST`, `PATCH .../toggle`, `DELETE` |
| Clientas | `GET /api/Crm/clients/all` (recortado por rol) | `POST /api/Crm/clients`, `DELETE` |
| Pedidos | `GET /api/Orders` (propio/equipo/toda la red) | `POST /api/Orders`, `PATCH .../status`, `PATCH .../assign` |
| Abonos | incluidos en el pedido | `PUT /api/Orders/{id}/payments` |

- El rol se toma del **claim firmado del JWT**; cambiar `yanbal_auth_role` en
  localStorage no amplía permisos.
- El pedido se calcula con precios del catálogo del servidor, no con los del
  navegador.
- El estado de pago se deriva de `pagos_pedido`; no se puede marcar “pagado”
  sin un movimiento que lo respalde.
- Las guardas de ruta del frontend son UX; cada endpoint valida el rol y el
  alcance (BOLA/IDOR) en el backend.
- `localStorage` queda solo como caché de pintado y se limpia al cambiar de
  sesión.

## 6. Archivos principales

| Función | Archivo |
| :--- | :--- |
| Jerarquía y formulario de usuarios | `frontend/src/components/admin/users/UserForm.tsx` |
| Tabla y asignación de equipo | `frontend/src/components/admin/users/UserTable.tsx` |
| Panel del líder | `frontend/src/components/consultant/LeaderTeamPanel.tsx` |
| Pagos editables | `frontend/src/components/sales/RegisterPaymentModal.tsx` |
| Utilidades de pago | `frontend/src/utils/payments.ts` |
| Búsqueda | `frontend/src/components/common/SearchableSelect.tsx` |
| Plantilla Excel .xlsx | `frontend/src/utils/catalogXlsx.ts` |
| Plantilla CSV | `frontend/src/utils/catalogTemplate.ts` |
| Parser CSV / XLSX | `frontend/src/utils/catalogCsv.ts` |
| Página de venta | `frontend/src/views/consultant/NewSaleView.tsx` |
| Tabla de productos | `frontend/src/components/consultant/SaleProductTable.tsx` |
| Carrito con fotos | `frontend/src/components/consultant/SaleCartTable.tsx` |
| Factura A4 / PDF | `frontend/src/utils/invoiceDocument.ts` |
| Avisos | `frontend/src/components/ui/ToastProvider.tsx` |
| Confirmaciones | `frontend/src/components/ui/ConfirmProvider.tsx` |
| Esquema 3FN | `database/005_atomic_3nf_canonical.sql` |

## 6. Verificación realizada

- `npm run build`: compilación limpia de TypeScript y Vite. Se reparó el
  binario nativo de `@tailwindcss/oxide` (estaba corrupto y generaba un CSS de
  6 KB sin utilidades) y el frontend ahora importa `index.css` directamente;
  el CSS de producción volvió a ~79 KB.
- `dotnet build -c Release`: 0 errores y 0 advertencias.
- Navegador integrado: login de administradora, consultora y líder; guard
  de rutas; registro de venta con abono; edición y eliminación de abono;
  búsqueda de clientas, productos y líderes; descarga de plantilla Excel y
  vista previa de importación.
- Pruebas de seguridad de la API: **20 PASS, 0 FAIL, 1 SKIP** (el PIN se
  muestra en Development para pruebas locales). Incluye IDOR, alcance por rol,
  asistente sin listado completo de usuarios y rate limit.
- Anti-spoof: un pedido anónimo con consultora falsa y precio 1 fue asignado
  a la consultora real y valorizado con el precio del catálogo.
- Prueba de carga: 1.000 sesiones y 4.000 peticiones al frontend compilado,
  0 errores. Última corrida: 219 req/s, p50 131 ms y p95 1534 ms (la varianza
  del `vite preview` local movió el p95 entre 872 y 1534 ms en dos corridas).
  Reporte: `docs/evidencias/load-test-report.json`.
