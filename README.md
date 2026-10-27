# 🌸 Yanbal Prestige — Monorepo Enterprise

Portal web de alta cosmética, catálogo interactivo y plataforma de gestión para la Red de Consultoras y Directoras Independientes de Yanbal.

Desarrollado bajo la metodología **Ciclo Completo bscl**, estándar estético **Refero AAA**, modularidad **Ponytail** (<150 líneas por archivo) y arquitectura desacoplada para alto rendimiento.

---

## 📑 Tabla de Contenidos
1. [Visión y Propósito del Proyecto](#-visión-y-propósito-del-proyecto)
2. [Arquitectura del Monorepo](#-arquitectura-del-monorepo)
3. [Frontend: Stack, Decisiones y Componentes](#-frontend-stack-decisiones-y-componentes)
4. [Backend: Stack, Rendimiento y Escalabilidad](#-backend-stack-rendimiento-y-escalabilidad)
5. [Base de Datos: Motor, Esquema e Índices](#-base-de-datos-motor-esquema-e-índices)
6. [Seguridad Defensiva, Anti-Bots y Cumplimiento Legal](#-seguridad-defensiva-anti-bots-y-cumplimiento-legal)
7. [Integración con Figma Desktop](#-integración-con-figma-desktop)
8. [Guía de Instalación y Despliegue](#-guía-de-instalación-y-despliegue)

---

## 🎯 Visión y Propósito del Proyecto

El proyecto surge de la necesidad comercial de una Red de Consultoras y Directoras Independientes de Yanbal (liderado por la socia Yuli y su equipo) para:
* **Digitalizar su catálogo de ventas:** Permitir a los clientes armar rutinas personalizadas con instrucciones de aplicación (*Modo de Uso*).
* **Consolidar pedidos directamente en WhatsApp:** Un carrito de compras sin fricción que genera el pedido con totales y referencias exactas para la consultora.
* **Captar nuevas emprendedoras (Plan de Carrera):** Reclutar consultoras mediante un formulario blindado contra bots y conforme a la normativa colombiana.
* **Autonomía Operativa (CMS):** Permitir a la líder actualizar precios, subir ofertas de campaña y registrar eventos sin depender de soporte técnico constante.

---

## 🏛️ Arquitectura del Monorepo

El repositorio está unificado en una sola raíz para facilitar el control de versiones, el despliegue continuo y la coherencia en los contratos de datos:

```
yanbal-prestige/
├── frontend/                     # Aplicación SPA en React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # AdminNav.tsx (Navegación centralizada de páginas de administración)
│   │   │   ├── consultant/       # ConsultantNav.tsx (Navegación del portal de consultora)
│   │   │   ├── auth/             # ProtectedRoute.tsx (Guarda de seguridad en rutas privadas)
│   │   │   ├── common/           # Header con anuncio dinámico MAYA y Footer con iconos SVGL
│   │   │   ├── cart/             # CartDrawer.tsx (Slide-over con checkout a WhatsApp)
│   │   │   ├── home/             # HeroSlider, LineAccordion (Ultraprotección), Videos
│   │   │   ├── catalog/          # CatalogFilters, ProductCard, ProductModal
│   │   │   └── join/             # JoinForm.tsx (Honeypot + Ley 1581 Habeas Data)
│   │   ├── views/                # Vistas SPA independientes (Anti-Modales Centralizadas)
│   │   │   ├── HomeView.tsx      # Vista Inicio
│   │   │   ├── CatalogView.tsx   # Vista Catálogo dedicada con filtros y paginación
│   │   │   ├── AboutView.tsx     # Vista Quiénes Somos (Bento Grid)
│   │   │   ├── EventsView.tsx    # Vista Agenda y Talleres de Automaquillaje
│   │   │   ├── JoinView.tsx      # Vista Sé Consultora
│   │   │   ├── NotFoundView.tsx  # Vista de Error 404 Refero AAA
│   │   │   ├── admin/            # Páginas Centralizadas de Administración
│   │   │   │   ├── AdminLoginView.tsx         # Login por correo con redirección por rol
│   │   │   │   ├── AdminDashboardView.tsx     # Métricas y KPIs de ventas de campaña
│   │   │   │   ├── AdminCatalogView.tsx       # Catálogo con Códigos SKU y Paginación
│   │   │   │   ├── AdminAnnouncementsView.tsx # Gestión de anuncios y banners de campaña
│   │   │   │   ├── AdminUsersView.tsx         # Equipo, roles y desbloqueo de PINs OTP
│   │   │   │   └── AdminLeadsView.tsx         # Bandeja de aspirantes de Únete
│   │   │   ├── consultant/       # Páginas Centralizadas de Consultora
│   │   │   │   ├── ConsultantPortalView.tsx   # Resumen de metas y enlace de asesora
│   │   │   │   ├── ConsultantClientsView.tsx  # CRM de clientas (tipo de piel y WhatsApp)
│   │   │   │   └── ConsultantCatalogView.tsx  # Buscador rápido de códigos SKU
│   │   │   └── auth/
│   │   │       └── ResetPasswordView.tsx      # Cambio de clave por PIN OTP (Cero SMTP)
│   │   ├── hooks/                # useCacheSync.ts (Caché SWR 0ms) y useIdleTimer.ts (15m logout)
│   │   ├── context/              # CartContext.tsx, AuthContext.tsx y ConfigContext.tsx
│   │   ├── data/                 # catalogData.ts (Mock tipado con datos de Yanbal)
│   │   ├── types/                # index.ts (Contratos TypeScript estrictos)
│   │   └── App.tsx               # Enrutador principal BrowserRouter con rutas protegidas
├── backend/                      # API REST en ASP.NET Core 10 Web API (Clean Architecture)
│   └── YanbalPrestige.Api/
│       ├── Controllers/          # Auth, Catalog, Crm, Cms, Leads, Media (<80 líneas c/u)
│       ├── Services/             # Service Layer desacoplado (Interfaces e Implementaciones)
│       │   ├── Background/       # DatabaseBackupWorker.cs (Backups diarios & purga 30 días)
│       │   ├── Implementations/  # Catalog, Cms, MediaStorage (WebP 82%), Turnstile
│       │   └── Interfaces/       # IAuthService, ICatalogService, ICmsService, etc.
│       ├── Entities/             # Product, User, ConsultantClient, HeroSlide, VideoTip, etc.
│       ├── DTOs/                 # AuthDtos, CatalogDtos, CrmDtos, CmsDtos, MediaDtos
│       ├── Common/               # Enums & Security (TurnstileSettings)
│       ├── Data/                 # AppDbContext (Fluent API B-Trees) & DbInitializer (Seed Yuli)
│       ├── Directory.Build.targets # Bypass local de SixLabors para Release/CI
│       └── Program.cs            # OpenAPI 3.1.1 nativo, OutputCache, CORS, StaticFiles, OWASP
├── database/
│   └── yanbal_prestige.sql       # Script SQL DDL y semillas iniciales para MySQL 8.0+
└── figma/
    ├── guia_figma_desktop.md     # Guía de importación en 1 clic a Figma Desktop
    └── figma_design_tokens.json  # Tokens de diseño para Tokens Studio
```

---

## 💻 Frontend: Stack, Decisiones y Componentes

### 1. ¿Por qué React 19 + TypeScript + Vite?
* **React 19:** Renderizado concurrente óptimo, gestión declarativa de estados y ecosistema maduro para componentes de interfaz de usuario.
* **TypeScript Estricto:** Cero errores de `undefined` o tipos ambiguos en tiempo de ejecución. Cada producto, paso de modo de uso y prospecto cuenta con una interfaz tipada en `src/types/index.ts`.
* **Vite 8:** Compilación ultra-rápida (1.88s en producción) impulsada por Rollup y HMR instantáneo para agilidad máxima de desarrollo.

### 2. Estilo Visual Refero AAA y Tailwind CSS v4
* Se utilizó la extensión oficial `@tailwindcss/vite` de Tailwind v4, reduciendo el bundle CSS a solo 46 KB gzippeado.
* **Paleta Warm Apricot & Champagne Silk:**
  * Primario de Acento: `#E85D36` (Terracota / Albaricoque suave, evitando el naranja chillón corporativo en fondos masivos).
  * Fondo Principal: `#FAF8F5` (Champagne Silk, descansado para la vista).
  * Tipografía: `Playfair Display` (editorial de lujo para titulares) + `Plus Jakarta Sans` (geométrica limpia para precios y datos).
* **Superficies Glassmorphism:** Bordes ultra-delgados `1px solid rgba(28, 25, 23, 0.06)` y desenfoque de fondo `backdrop-blur-md` a 60 FPS estables.

### 3. React Router DOM y Rutas Protegidas (`ProtectedRoute`)
En lugar de forzar al usuario a scrollear una página kilométrica, se implementó un enrutamiento por vistas independientes:
* `/` ➔ Inicio (Hero Slider, Acordeón de Líneas Ultraprotección, Revista Digital, Videos).
* `/catalogo` ➔ Catálogo dedicado con buscador y filtros facetados.
* `/quienes-somos` ➔ Historia del equipo de consultoras y Bento Grid.
* `/eventos` ➔ Talleres presenciales y virtuales con reserva por WhatsApp.
* `/tips` ➔ **Tips & Consejos:** artículos de las consultoras con filtro por categoría (`Rutina`, `Cuidado`, `Maquillaje`, `Negocio`).
* `/tips/:id` ➔ Artículo completo (página indexable, compartible por WhatsApp, con imagen o video).
* `/unete` ➔ Formulario blindado de captación de consultoras.
* `/admin/login` ➔ Acceso administrativo para directoras.
* `/admin` ➔ **Ruta Protegida por `ProtectedRoute`:** Si un usuario no autenticado intenta entrar directamente en `/admin`, es interceptado y redirigido al login.
* `*` ➔ **Página de Error 404 (`NotFoundView.tsx`):** Vista de lujo Refero AAA con registro de auditoría en consola, aviso empático y enlaces directos de navegación y contacto a WhatsApp.

### 4. Carrito de Compras Dinámico con WhatsApp Bridge
* Implementado con `CartContext` y sincronizado en `localStorage`.
* Slide-over lateral que calcula subtotales, permite sumar/restar unidades y exporta el pedido formateado en un solo clic hacia el WhatsApp de la consultora con el detalle consolidado.

### 5. Acordeón de Imágenes de Líneas (Inspirado en Yanbal Ultraprotección)
* Módulo interactivo horizontal (`LineAccordion.tsx`) que permite desplegar los 4 pilares: *Total Block Ultraprotección*, *Sentiva Extracto Divino*, *Perfumería Ccori* y *Joyería Bañada en Oro*, mostrando claims dermatológicos y redirigiendo al catálogo filtrado por esa categoría.

### 6. Iconografía Vectorial Oficial (SVGL)
* Erradicación de enlaces en texto plano. Uso de vectores SVG oficiales de [SVGL](https://svgl.app/) para WhatsApp, Instagram y TikTok, con efectos hover suaves.

### 7. Multimedia en Productos y Eventos (fotos + videos)
* Componentes reutilizables en `src/components/media/` (`MediaUploader`, `MediaDropzone`, `MediaThumb`, `MediaFrame`, `MediaViewer`, `MediaGallery`).
* La galería del producto reemplaza la imagen única: principal + miniaturas + zoom óptico solo en fotos + visor a pantalla completa con teclado.
* Eventos usan la variante compacta con contador y visor.
* Formatos: JPG, PNG, WebP, AVIF, BMP (8 MB) · MP4, MOV, WebM, M4V (150 MB) · hasta 10 archivos por elemento · también acepta enlaces de YouTube y Vimeo.
* **Modo demostración:** los archivos elegidos desde el disco son *blob URLs* de sesión (etiqueta ámbar «Sesión») y desaparecen al recargar; los enlaces sí persisten. El punto único de cambio hacia la API real es `useMediaLibrary.addFiles`. Ver `docs/PLAN_MULTIMEDIA_Y_TIPS.md`.

### 8. Módulo Tips & Consejos
* Artículo completo: título, resumen, categoría, cuerpo largo, portada, video opcional, autora, destacado, orden y visibilidad.
* Render sin librerías externas (`TipContent.tsx`): párrafos separados por línea en blanco y listas con `- `.
* Administración en `AdminContentCMSView` ➔ pestaña «Tips & Consejos» (`CmsTipsSection` + `TipForm`).

---

## ⚡ Backend: Stack, Rendimiento y Escalabilidad

### 1. ¿Por qué ASP.NET Core 10 Web API?
* **Rendimiento Extremo:** El servidor Kestrel en .NET 10 es líder mundial en los benchmarks de TechEmpower, consumiendo una fracción mínima de RAM frente a alternativas tradicionales.
* **Tipado Fuerte y Seguridad de Tipos:** Arquitectura en capas desacopladas con Entity Framework Core.
* **Separación de Responsabilidades:** Controladores delgados (*Skinny Controllers*) con métodos de menos de 30 líneas dedicados a un único caso de uso.

### 2. Capa de Servicios y Procesamiento Asíncrono
* **Conversión WebP Automática (SixLabors.ImageSharp):** Al subir cualquier imagen (JPG, PNG), el servicio MediaStorageService la redimensiona a un ancho máximo de 1920px y la codifica a WebP al 82% de calidad, reduciendo el peso en más de un 75% sin pérdida perceptual.
* **Streaming Progresivo de Videos:** Control de carga con límite de 150 MB y persistencia optimizada para reproducción por fragmentos (*Byte-Range Requests*).
* **Autolimpieza en Cascada (Garbage Collection Físico):** Al actualizar o eliminar productos, sliders o videos, el backend purga automáticamente del disco físico los archivos huérfanos anteriores (File.Delete), evitando el consumo desmedido del disco NVMe del VPS.
* **Copias de Seguridad Automáticas en Background (DatabaseBackupWorker):** Servicio continuo (BackgroundService) que genera respaldos SQL automáticos cada 24 horas y depura respaldos con más de 30 días de antigüedad.

### 3. Estrategia para Soportar 1.000+ Usuarios/Minuto (Escalabilidad Departamental)
Para garantizar que el portal soporte picos de tráfico concurrentes desde múltiples municipios de Colombia sin colapsar el servidor:
1. **Caché en Memoria de Respuesta (`OutputCache`):**
   * Configurado en `Program.cs` con una política de 30 segundos sobre `/api/catalog/products`.
   * Cuando 1.000 usuarios consultan el catálogo en el mismo minuto, la respuesta se entrega en **<5 milisegundos directamente desde memoria RAM**, sin ejecutar 1.000 consultas repetitivas hacia MySQL.
2. **Consultas sin Rastreo (`.AsNoTracking()`):**
   * Todas las consultas de lectura en `CatalogController` y `EventsController` usan `AsNoTracking()`, desactivando el Change Tracker de Entity Framework y ahorrando un 50% de CPU y memoria.
3. **CORS y Compresión:**
   * Política CORS estricta (`AllowFrontend`) restringida al origen autorizado.

---

## 🗄️ Base de Datos: Motor, Esquema e Índices

### 1. ¿Por qué MySQL 8.0+ en lugar de SQL Server para esta etapa?
* **Costo Operativo y Viabilidad para el Negocio:** Alojar una base de datos SQL Server licenciada en Azure genera costos fijos de **$30 a $60 USD mensuales**, inviables para una red local de consultoras. Con MySQL en Linux (o contenedores Docker), el costo de hosting se reduce a **$0 - $5 USD mensuales**.
* **Migración Transparente a SQL Server:** Gracias a Entity Framework Core, si la socia Yuli o la directora desean migrar a SQL Server en el futuro, solo se requiere cambiar el provider en `Program.cs` (`options.UseSqlServer(...)`) sin modificar una sola línea de lógica de negocio en los controladores.

### 2. Modelo de Tablas y Optimización de Índices
Entidades de EF Core en `backend/YanbalPrestige.Api/Entities`:
* `productos`: Catálogo con identificador único, código de referencia, nombre, categoría, precios, URL de imagen, modo de uso en JSON y tip de la consultora.
  * **Índices:** B-Tree en `categoria` y `activo` para búsquedas en tiempo logarítmico O(log N).
* `eventos`: Agenda de capacitaciones con modalidad, cupos, fecha y flyer.
* `cms_tips`: Artículos de Tips & Consejos (título, resumen, contenido largo, categoría, portada, video, autora, destacado, orden y visibilidad).
  * **Índice:** `(activo, orden)` para el listado público.
* `prospectos_unete`: Registro de aspirantes a consultoras con nombre, WhatsApp, ciudad y auditoría de aceptación de datos.
* **Collation:** `utf8mb4_unicode_ci` con soporte para tildes en español y caracteres especiales.

### 3. Migraciones Manuales
`Program.cs` usa `Database.EnsureCreated()`, que **no modifica** una base de datos existente. Cada tabla nueva requiere su script:

| Script | Contenido |
|---|---|
| `database/002_cms_tips.sql` | Crea `cms_tips` e índice `(activo, orden)` (idempotente) |

En una base vacía no hace falta: EF crea todo desde las entidades. Para una base con datos, ejecutar el script antes de desplegar la versión que incluye `TipsController`.

---

## 🛡️ Seguridad Defensiva, Anti-Bots y Cumplimiento Legal (Inspirado en Patrones Enterprise de `autogestion-sena`)

1. **Gestión y Auditoría de Rutas Huérfanas (Error 404):**
   * En `NotFoundView.tsx`, se detecta cualquier intento de navegación hacia rutas no existentes o escaneos maliciosos, registrando la traza con timestamp en telemetría para mitigar ataques de reconocimiento de directorios.
2. **Defensa contra Abandono de Puesto (`useIdleTimer.ts`):**
   * Inspirado en `userIdleTimer.ts` de `autogestion-sena`, monitorea la actividad física del usuario en el navegador (`mousemove`, `keydown`, `click`, `scroll`). Si transcurren 15 minutos sin interacción en el panel administrativo (`/admin`), la sesión se cierra automáticamente (`auto-logout`), protegiendo el CMS en computadores compartidos.
3. **Cabeceras de Seguridad Bancaria / OWASP en ASP.NET Core 10:**
   * Inyectadas en middleware de Kestrel (`Program.cs`):
     * `X-Frame-Options: SAMEORIGIN` (mitigación total de Clickjacking).
     * `X-Content-Type-Options: nosniff` (prevención de ataques MIME sniffing).
     * `Referrer-Policy: strict-origin-when-cross-origin`.
     * `X-XSS-Protection: 1; mode=block`.
4. **Rate Limiting por IP (`Microsoft.AspNetCore.RateLimiting`):**
   * Límite global de 120 peticiones/minuto por cliente para prevenir saturación de Kestrel.
   * Límite estricto `StrictLeadsLimiter` de 5 peticiones/minuto en `/api/leads/join` para prevenir ataques de *Denial of Inventory* o bombardeo de prospectos ficticios.
   * Límite `StrictUploadLimiter` de 10 subidas/minuto en `/api/media/upload` y cuerpo máximo de 160 MB en Kestrel (video de 150 MB + formulario), para que nadie llene el disco del VPS.
5. **Trampa Invisible Honeypot (Regla 8 Protocolo bscl):**
   * En `JoinForm.tsx` y `LeadsController.cs`, existe el campo oculto `company_website` posicionado fuera del viewport (`position: absolute; left: -9999px`).
   * Los usuarios humanos nunca lo ven ni lo llenan. Si un bot o scraper automático inyecta cualquier valor en este campo, el backend lo rechaza instantáneamente con `400 Bad Request` antes de procesar el registro.
6. **Blindaje Legal Anti-Demandas (Ley 1581 de 2012 / SIC Colombia):**
   * Todo formulario incluye casilla de consentimiento informado explícito obligatorio conforme al régimen de Habeas Data colombiano.
   * Se almacena el timestamp ISO de aceptación para trazabilidad ante requerimientos de la Superintendencia de Industria y Comercio (SIC).
7. **Protección de Marca Yanbal International:**
   * Disclaimer notorio en Header y Footer indicando que es un portal gestionado por Consultoras Independientes, blindando a la líder contra sanciones de propiedad intelectual.
8. **Prevención de Inyecciones SQL (SQLi):**
   * Entity Framework Core parametriza automáticamente todas las consultas LINQ, neutralizando cualquier intento de inyección mediante payloads en los campos de búsqueda o filtros.
9. **Cero Emojis de IA - Iconografía Vectorial Oficial:**
   * Erradicación completa de caracteres emoji genéricos de IA. Toda la interfaz utiliza exclusivamente componentes SVG estructurados de `lucide-react` y vectores oficiales de [SVGL](https://svgl.app/).
10. **Autenticación JWT Real (HMAC-SHA256):**
    * `ITokenService` firma tokens con `sub`, `email`, `name` y `role`; `Program.cs` valida emisor, audiencia, firma y vigencia (margen de reloj de 2 minutos).
    * La clave **nunca** vive en `appsettings.json`: se inyecta con la variable de entorno `JWT_KEY` (mínimo 32 caracteres). En `Development`, si falta, se genera una temporal por proceso y se avisa en consola; en producción la API se niega a arrancar.
    * `[Authorize]` por defecto en `Auth`, `Catalog`, `Cms`, `Crm`, `Media` y `Tips`; `[AllowAnonymous]` explícito solo en las lecturas públicas (catálogo, eventos, tips, slides y formulario de captación).
    * Los roles válidos son los del enum `UserRole`: `Director`, `Consultant` y `Client`. La gestión de contenido exige `Director`.
    * `AuthController` y `MediaController` llevan `[OutputCache(NoStore = true)]` para que la caché de salida no sirva respuestas personalizadas a otro usuario.

---

## 🎨 Integración con Figma Desktop

El proyecto está diseñado para conectarse directamente con **Figma Desktop** con Auto-Layout nativo:
1. Con el servidor local corriendo en `http://localhost:5173/`, abre **Figma Desktop**.
2. Ejecuta el plugin **html.to.design** (`Ctrl + P` ➔ html.to.design).
3. Ingresa la URL `http://localhost:5173/` e importa en breakpoints **1440px (Desktop)** y **390px (Mobile)**.
4. Para tokens de diseño, carga `figma/figma_design_tokens.json` en el plugin **Tokens Studio**.

---

## 🚀 Guía de Instalación y Despliegue

### Requisitos Previos
* Node.js v20+ y npm v10+ (instalado v26.5.0).
* .NET SDK 10.0 (instalado v10.0.400).
* MySQL 8.0+ en ejecución local o remota.

### 1. Iniciar el Frontend
```bash
cd frontend
npm install
npm run dev
# Acceso en: http://localhost:5173/
```

### 2. Iniciar el Backend (.NET API)
```bash
cd backend/YanbalPrestige.Api
# Clave de firma JWT (mínimo 32 caracteres). Sin esto, en Development se
# genera una temporal y los tokens se invalidan al reiniciar.
$env:JWT_KEY = "cambiar-por-una-clave-larga-y-secreta-de-produccion"
dotnet run
# Swagger UI en: http://localhost:5000/swagger
```

### 3. Base de Datos
* Base nueva: el arranque crea el esquema desde las entidades EF Core.
* Base existente: ejecutar `database/002_cms_tips.sql` (idempotente) antes de desplegar.
