# Plan — Multimedia en Productos & Eventos + Módulo Tips

**Estado:** implementado para la demo visual del 2026-10-27.
**Alcance acordado:** entrega **solo visual** (la reunión con Yuli define qué se ajusta).
**Fuera de alcance por ahora:** persistencia real de archivos y consumo de la API desde el frontend.

---

## 1. Qué se entregó

### 1.1 Multimedia reutilizable (fotos **y** videos)

| Pieza | Archivo | Rol |
|---|---|---|
| Utilidades | `frontend/src/components/media/mediaUtils.ts` | Detección de tipo, límites, blob URLs, embeds de YouTube/Vimeo, portada |
| Hook de galería | `frontend/src/hooks/useMediaLibrary.ts` | Añadir archivos, añadir enlace, borrar, reordenar, fijar portada |
| Zona de arrastre | `frontend/src/components/media/MediaDropzone.tsx` | Drag & drop accesible (teclado incluido) |
| Miniatura editable | `frontend/src/components/media/MediaThumb.tsx` | Orden, portada, borrado, texto alternativo, etiqueta «Sesión» |
| Panel de carga | `frontend/src/components/media/MediaUploader.tsx` | Compone dropzone + enlace + galería + avisos |
| Marco de render | `frontend/src/components/media/MediaFrame.tsx` | Foto, `<video>` o `<iframe>` de YouTube/Vimeo |
| Visor | `frontend/src/components/media/MediaViewer.tsx` | Pantalla completa, teclado (Esc / ← / →), bloqueo de scroll |
| Galería pública | `frontend/src/components/media/MediaGallery.tsx` | Variante `detail` (principal + miniaturas) y `compact` (tarjetas) |

Límites aplicados en el cliente: **8 MB por imagen**, **150 MB por video**, **10 archivos por elemento**. Formatos: JPG, PNG, WebP, AVIF, BMP · MP4, MOV, WebM, M4V.

### 1.2 Dónde se integró

- **Producto (público):** `ProductGalleryZoom.tsx` — galería real, video y zoom óptico solo sobre fotos.
- **Producto (admin):** `ProductForm.tsx` + `ProductTable.tsx` extraídos de `AdminCatalogView.tsx` (el archivo pasó de 372 a ~180 líneas).
- **Evento (público):** `EventsView.tsx` — galería compacta con contador y visor.
- **Evento (admin):** `EventForm.tsx` + `CmsEventsSection.tsx` refactorizado.
- **Tips (público):** `TipsView.tsx` (`/tips`) y `TipDetailView.tsx` (`/tips/:id`).
- **Tips (admin):** `CmsTipsSection.tsx` + `TipForm.tsx`, pestaña nueva en `AdminContentCMSView.tsx`.
- **Navegación:** ítem «Tips» en `Header.tsx` y enlace en `Footer.tsx`.

### 1.3 Módulo Tips (artículo completo)

Modelo `TipItem` en `frontend/src/types/index.ts`:

| Campo | Uso |
|---|---|
| `title` | Título del artículo |
| `summary` | Entradilla de la tarjeta |
| `content` | Cuerpo largo; párrafos separados por línea en blanco y listas con `- ` |
| `category` | `Rutina` · `Cuidado` · `Maquillaje` · `Negocio` |
| `image` | Portada |
| `videoUrl` | Video opcional (archivo o YouTube/Vimeo) |
| `author` | Autora visible |
| `featured` | Se muestra como tarjeta destacada |
| `order` / `active` | Orden y visibilidad |

Contenido semilla: `frontend/src/data/tipsData.ts` (4 artículos). Clave de almacenamiento: `tips_v1`.

Se eligió **página de detalle** (`/tips/:id`) en lugar de modal: Google indexa el artículo y se puede compartir por WhatsApp.

---

## 2. Decisión clave: modo demostración

Los archivos subidos con el selector viven como **blob URLs de sesión** (`demo: true`).

- Motivo: `localStorage` ronda los 5 MB; un video de 20 MB no cabe y rompería toda la caché del CMS.
- La UI lo dice explícitamente: etiqueta ámbar **«Sesión»** en la miniatura y banner en el panel de carga.
- Los **enlaces** pegados (URL http/https) sí se guardan y persisten entre recargas.
- El registro `MediaItem` no se envía a ninguna API todavía.

**Punto único de cambio para producción:** `useMediaLibrary.addFiles` → subir a `POST /api/media/upload` y guardar la URL devuelta en lugar de `URL.createObjectURL`.

---

## 3. Backend: seguridad cerrada

Antes de esta entrega **no existía autenticación**: `POST /api/cms/events`, `DELETE /api/catalog/products/{id}` y la subida de archivos respondían a cualquiera. Con videos de 150 MB eso equivale a regalar el disco del VPS.

Implementado:

- `Common/Security/JwtSettings.cs` · `AuthRoles` (roles del enum: `Director`, `Consultant`, `Client`).
- `Services/Interfaces/ITokenService.cs` — JWT real HMAC-SHA256 con `sub`, `email`, `name` y `role`.
- `AuthService` emite el token real; `Program.cs` valida emisor, audiencia, firma y vigencia.
- Clave **solo** por `JWT_KEY` (variable de entorno) o `Jwt:Key`:
  - Development sin clave → se genera una temporal por proceso y se avisa en consola.
  - Producción sin clave → excepción al arrancar (falla rápido, no insegura).
  - Menos de 32 caracteres → excepción.
- `[Authorize]` por defecto en `Auth`, `Catalog`, `Cms`, `Crm`, `Media`, `Tips`; `[AllowAnonymous]` explícito en lecturas públicas (productos, eventos, tips, slides).
- `StrictUploadLimiter` (10 subidas/minuto) y `RequestSizeLimit` de 160 MB en `/api/media/upload`.
- `[OutputCache(NoStore = true)]` en `AuthController` y `MediaController` para no servir respuestas personalizadas desde la caché de salida.
- Registro del paquete `Microsoft.AspNetCore.Authentication.JwtBearer 8.0.10`.

### Endpoints de Tips

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/tips` | Público (solo activos) |
| `GET` | `/api/tips/{id}` | Público (404 si está inactivo) |
| `GET` | `/api/tips/admin` | `Director` (incluye ocultos) |
| `POST` | `/api/tips` | `Director` |
| `DELETE` | `/api/tips/{id}` | `Director` |

---

## 4. Base de datos

`cms_tips` — entidad `Entities/Tip.cs`, `DbSet<Tips>` + índice `(activo, orden)` en `AppDbContext.cs`.

Migración manual: **`database/002_cms_tips.sql`** (idempotente).

> **Importante:** `Program.cs` usa `db.Database.EnsureCreated()`. En una base existente **no** crea tablas nuevas. Antes de desplegar esta versión en el VPS hay que ejecutar ese script a mano.

No se creó `media_assets`. Se descartó a propósito: sería una tabla sin consumidor hasta que la reunión defina el modelo, y el código muerto se paga caro.

---

## 5. Deuda técnica conocida (para la reunión)

1. **El frontend no consume la API.** Todo el CMS vive en `localStorage` (`useCacheSync`). No hay `fetch`, ni `VITE_API_URL`, ni proxy en `vite.config.ts`. Consecuencia: el contenido no se comparte entre dispositivos y se pierde al limpiar el navegador. **Es el punto número uno a decidir.**
2. **Los archivos subidos no se persisten** (blob de sesión), por diseño de esta demo.
3. **El login del frontend también es local** (`AuthContext`), no llama a `/api/auth/login`, así que el JWT del backend todavía no se usa desde la interfaz.
4. **Productos y eventos guardan solo `imagen_url`** en la API; la galería múltiple existe únicamente en el frontend.
5. `media_assets` pendiente de definición.

---

## 6. Verificación realizada

- `dotnet build` → 0 errores, 0 advertencias.
- `npm run build` → OK (bundle 509 KB; aviso de tamaño ya existente).
- `npm run lint` → sin advertencias en los archivos nuevos.
- Navegador (5174): `/tips`, `/tips/:id`, `/producto/:id`, `/eventos`, `/admin/contenido` (pestaña Tips) y `/admin/catalogo` sin errores de consola.
- Flujo probado con **enlace**: crear producto con 1 foto + 1 video de YouTube, guardar, abrir su ficha y cambiar de miniatura (el `<iframe>` embebido se genera con la URL correcta). Producto de prueba eliminado después.
- Flujo probado con **archivo real**: subir un PNG por el input de la galería → se crea blob URL, aparece la etiqueta «Sesión», el contador «1 foto · 0 videos» y el banner de modo demostración. Formulario cancelado y sin residuos en `localStorage`.
- **Bug corregido durante la verificación:** `MediaUploader` renderizaba un `<form>` dentro del `<form>` del producto/tip/evento (HTML inválido; un Enter en el campo de enlace guardaba el registro a medias). Ahora es un `div` con manejo explícito de Enter.
