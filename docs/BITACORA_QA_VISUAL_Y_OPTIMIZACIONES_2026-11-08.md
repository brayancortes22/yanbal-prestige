# Bitácora de QA Visual, Mejoras de Alta Densidad y Automatización Excel
**Fecha:** 8 de noviembre de 2026  
**Proyecto:** Yanbal Prestige — Plataforma de Comercio & Gestión de Red  
**Desarrollador:** Brayan Stid Cortés Lombana (`bscl`)  
**Entorno de Pruebas:** Antigravity Native Browser (Chromium CDP integrado)

---

## 1. Resumen Ejecutivo
Durante la sesión interactiva de aseguramiento de calidad (QA) visual en vivo, se inspeccionaron todas las rutas operativas del sistema (Gerencia de Red, Portal de Consultora, CMS y Prospectos). Se identificaron oportunidades de optimización en experiencia de usuario (UX), rendimiento del DOM y ergonomía de datos con alto volumen de información.

Se ejecutó un refactor modular bajo la filosofía **Ponytail** (<150-200 líneas por componente), erradicando vistas de tarjetas densas y scrolls infinitos en favor de **tablas institucionales Refero AAA**, validación nativa de Excel con `exceljs` y lenguaje universal e inclusivo.

---

## 2. Hallazgos y Soluciones Quirúrgicas

### A. Catálogo Rápido SKU para Consultoras (`/consultora/catalogo`)
* **Problema Previo:** Cuadrícula de 3 columnas de tarjetas para 168+ productos que generaba un scroll kilométrico y dificultaba cotizar rápidamente durante llamadas o chats.
* **Solución Implementada:**
  - Componente [`ConsultantCatalogTable.tsx`](file:///c:/Users/NITRO%20ACER/Desktop/proyectos%20con%20ia/yanbal-prestige/frontend/src/components/consultant/ConsultantCatalogTable.tsx).
  - Cabecera fija `sticky top-0 z-10 bg-stone-50/95 backdrop-blur` con sombra sutil.
  - Píldora monoespaciada para el SKU con copia en 1 clic y confirmación visual (`Check` verde).
  - Botón **Cotizar** que copia al portapapeles una ficha estructurada lista para enviar por WhatsApp:
    `✨ [Producto] (Ref: SKU) · Precio: $X COP · Envío seguro Yanbal Prestige`.
  - Paginación fluida de 15 productos por página (`PaginationControls`) y filtro por línea comercial.

### B. Módulo de Equipo de Trabajo & Roles (`/admin/usuarios`)
* **Problema Previo:**
  - El panel de recuperación de contraseñas (`ResetRequestsPanel`) estaba incrustado en medio del listado de usuarias, empujando la tabla hacia abajo.
  - La importación manual de personal no existía y la primera versión solo ofrecía CSV con textos sesgados en femenino ("usuarias").
* **Solución Implementada:**
  - **Sub-pestañas Internas:** Separación limpia entre `Directorio de la Red` y `Solicitudes de Clave` (con badge pulsante que indica solicitudes pendientes).
  - **Plantilla Oficial Excel (.xlsx):** Generación dinámica con `exceljs` en [`userXlsx.ts`](file:///c:/Users/NITRO%20ACER/Desktop/proyectos%20con%20ia/yanbal-prestige/frontend/src/utils/userXlsx.ts).
  - **Listas Desplegables Nativas (Data Validation):**
    - Columna `Rol en la Red`: Menú desplegable bloqueante con `CONSULTORA`, `LIDER_ZONA`, `ASISTENTE`, `DIRECTORA`.
    - Columna `Líder Asignado`: Menú desplegable con los líderes y directoras reales activos en el sistema.
  - **Hoja 2 de Directorio de Líderes:** Directorio con ID, Nombre, Zona y Correo para consulta directa en Excel.
  - **Resolución Inteligente en Parser:** Reconoce sinónimos de cargos y asocia automáticamente el `leaderId` aunque el usuario solo escriba el nombre común del líder (ej. "Andrea Gómez").
  - **Lenguaje Universal Neutro:** Términos neutros para personas e integrantes de cualquier género.

### C. Gestor de Contenidos CMS (`/admin/contenido`)
* **Quiénes Somos & Trayectoria:**
  - Componente [`CmsAboutTimelineEditor.tsx`](file:///c:/Users/NITRO%20ACER/Desktop/proyectos%20con%20ia/yanbal-prestige/frontend/src/components/admin/cms/CmsAboutTimelineEditor.tsx) para editar la historia, propósito y la línea de tiempo corporativa en tiempo real.
* **Líneas Emblemáticas Yanbal:**
  - Botón `+ Nueva Colección` para crear nuevas líneas en portada.
  - Botón `🎲 Asignar Aleatorio` para seleccionar un producto SKU al azar de la categoría.
  - Switch de `Rotación Automática en Portada` (`autoRotate`).

### D. Optimización de Tablas Administrativas Previas
* **Ventas (`/admin/ventas`):** Buscador inteligente desplegable [`SearchableConsultantSelect.tsx`](file:///c:/Users/NITRO%20ACER/Desktop/proyectos%20con%20ia/yanbal-prestige/frontend/src/components/sales/SearchableConsultantSelect.tsx) en lugar del `<select>` monolítico de 138 opciones.
* **Prospectos (`/admin/prospectos`):** Tabla [`AdminLeadsTable.tsx`](file:///c:/Users/NITRO%20ACER/Desktop/proyectos%20con%20ia/yanbal-prestige/frontend/src/components/admin/leads/AdminLeadsTable.tsx) con cabecera sticky y manejo amigable de expiración de sesión (401).
* **Clientas CRM (`/consultora/clientes`):** Tabla compacta [`ConsultantClientsTable.tsx`](file:///c:/Users/NITRO%20ACER/Desktop/proyectos%20con%20ia/yanbal-prestige/frontend/src/components/consultant/ConsultantClientsTable.tsx).

---

---

## 3. Ecosistema Multi-Herramienta de Testing & Verificación Forense

| Herramienta | Propósito / Alcance | Resultado / Métrica Validada |
| :--- | :--- | :--- |
| **k6 (Grafana Labs)** | Carga masiva, estrés extremo y ciclo de vida | **1,000 VUs** concurrentes soportados. Suite ull-lifecycle-all-entities.test.js: **1,601 de 1,601 checks aprobados (100.00%)**, 3,905 peticiones procesadas con 0.02% error. Transacciones atómicas consecutivas (FAC-202611-XXXX). |
| **WebCheck** | Auditoría perimétrica de seguridad y cabeceras | Resueltas advertencias críticas: CSP estricto en ercel.json, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Permissions-Policy, Referrer-Policy, RFC 9116 (security.txt) y Social OpenGraph Tags. |
| **Scrapling** | Simulación adversarial anti-bots y scrapers | Verificación de neutralización de bots de mutación y activación de trampas **Honeypot** (400 Bad Request + 145 eventos registrados en uditoria_eventos). |
| **Playwright** | Pruebas E2E automatizadas semánticas | Page Object Model con selectores accesibles (getByRole), validación de flujos de catálogo y checkout en Desktop (1440px), Tablet (768px) y Mobile (390px). |
| **Unlighthouse** | Auditoría global multi-ruta del frontend | Escaneo automatizado de todas las rutas (http://127.0.0.1:5173) evaluando Performance, Accesibilidad WCAG 2.2 AA, SEO y Buenas Prácticas. |
| **TestSprite** | Pruebas E2E autónomas asistidas por IA | Exploración de user journeys en el frontend y generación dinámica de aserciones contra regresiones. |
| **Chromium CDP** | QA visual interactivo en vivo | Panel integrado de Antigravity con captura del DOM y coordinación con el panel Inspector. |

---

## 4. Métricas de Calidad
* **TypeScript:** 0 errores en compilación estricta (`npm run tsc -b`).
* **Bundle:** Vite build completado en 1.10s - 1.54s.
* **Trazabilidad Git:** Rama `development` sincronizada con commits semánticos y flujo estricto de 3 ramas (`development` ➔ `qa` ➔ `main`).
