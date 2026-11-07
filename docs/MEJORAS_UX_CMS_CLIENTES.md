# Mejoras de UX, CMS, clientes y contabilidad

Iteración enfocada en los comentarios de revisión hechos directamente sobre
las pantallas de la aplicación.

## 1. CMS con contexto visual

- Cada pestaña muestra un bloque **“Se verá en …”** con la página, la ruta y
  una mini maqueta que resalta la posición del bloque dentro del sitio.
- Secciones cubiertas: Hero, Líneas, Catálogo Digital, Videos, Eventos, Tips,
  Quiénes Somos y Únete.
- Todas las imágenes del CMS ahora se pueden **subir** (no solo pegar URL):
  Hero, Líneas, Portada del catálogo, Miniatura de video y Eventos.
- Los videos tutoriales aceptan un archivo de video real y se reproducen en el
  modal público; si no hay archivo, se muestra un aviso.
- **Líneas Emblemáticas** ahora muestra una tarjeta con el producto más vendido
  de su categoría. La administradora puede dejarlo en automático o fijar un
  producto desde el editor de la línea.

## 2. Eventos con calendario

- Se reemplazó el texto libre por un selector de fecha y dos horas (inicio/fin).
- Se valida que la hora final sea posterior a la inicial.
- No se permite publicar un evento con fecha anterior al día actual.
- Se guardan `startAt` y `endAt` en ISO para ordenar y validar.

## 3. Equipo y ventas

- Al pulsar **Editar** en Equipo & Roles, la página hace scroll suave al
  formulario y lo deja visible.
- Desactivar/reactivar una cuenta pide confirmación.
- Pausar/reactivar un producto pide confirmación.
- La columna “Consultora asignada” ya no muestra nombres duplicados con el rol
  repetido y conserva una opción de respaldo si la consultora no está en la
  lista actual.
- Reasignar una factura pide confirmación.

## 4. Portal de la consultora / líder

- Las **Herramientas rápidas** pasaron arriba del panel de equipo para no tener
  que bajar cientos de filas antes de registrar una venta.
- El panel de equipo pagina de 8 en 8 con Anterior/Siguiente y contador.

## 5. Datos de clientas y facturación

Nuevos campos en `clientes_consultora`:

- `correo`, `documento`, `ciudad`, `barrio`, `direccion`, `codigo_postal`.

Nuevos campos en `pedidos` (instantánea histórica de la factura):

- `cliente_correo`, `cliente_barrio`, `cliente_codigo_postal`.

Comportamiento:

- El formulario de CRM y la venta directa piden los datos completos.
- Al elegir una clienta del CRM se autocompletan sus datos de despacho.
- El checkout público pide correo, cédula/NIT, barrio y código postal.
- La factura muestra el correo y la dirección completa.
- El botón **Correo** de la factura abre el cliente de correo con el resumen
  (no requiere SMTP configurado). Para envío automático real falta conectar un
  proveedor de correo transaccional.

## 6. Cancelaciones y devoluciones

- Un pedido se puede **anular** desde administración o desde la consultora;
  la factura queda con estado de pago `anulada` y entrega `cancelado`.
- Se puede **reactivar** si fue un error.
- Los pagos recibidos se conservan para auditoría.
- Se agregó el método **Reembolso / devolución** con monto negativo.
- Reglas contables:
  - un pago normal debe ser positivo;
  - un reembolso debe ser negativo;
  - la suma no puede superar el total ni quedar por debajo de cero;
  - una factura anulada mantiene el estado `anulada` aunque se registren
    devoluciones.

## 7. Ficha de producto y páginas públicas

- Galería con miniaturas al costado izquierdo en escritorio (estilo Mercado
  Libre) y debajo en móvil; incluye contador, visor y etiqueta “Video”.
- Formulario PDP reorganizado en tarjetas con vista previa de la tarjeta
  botánica y de garantía.
- “Quiénes Somos” incluye línea de tiempo, diferenciadores, cifras y CTA.
- “Únete” pide correo, departamento, dirección y experiencia.
- Nuevas páginas legales: `/terminos`, `/privacidad`, `/cookies` y
  `/devoluciones`, enlazadas en el pie de página.

## 8. Pendientes conscientes

- El contenido CMS (hero, líneas, catálogo digital, videos, eventos, tips)
  sigue guardándose en la configuración local del navegador. Tiene endpoints
  en el backend para tips/eventos/slides, pero falta migrar todo el CMS a
  MySQL para que se comparta entre dispositivos.
- El envío de factura por correo usa `mailto:`; para envío automático hace
  falta configurar SMTP o un proveedor transaccional.
- La política legal es una base informativa; debe ser revisada por un abogado
  antes de producción.
- El nombre de la marca y los datos de contacto legales deben confirmarse con
  la administradora (`contacto@yanbalprestige.com` es un valor de ejemplo).

## 9. Segunda ronda de revisión

- **Venta en móvil:** el resumen del pedido (Paso 3) sube en el orden visual
  antes de la tabla de productos, para que el carrito no quede al final de una
  lista larga.
- **Código postal:** campo con sugerencias de las principales ciudades,
  explicación y enlace a la consulta oficial de 4-72; sigue siendo opcional.
- **Clientas del CRM:** al entrar a la venta se abre el modo CRM en cuanto
  cargan las clientas; al seleccionar una se muestran y autocompletan sus datos
  (correo, ciudad, barrio, dirección y código postal). La administradora ve toda
  la cartera y la líder la de su equipo.
- **Botones de anulación:** ahora tienen el texto visible “Anular” /
  “Reactivar”, no solo el icono.
- **Vista previa real del CMS:** cada pestaña muestra una simulación en
  miniatura de la sección con los datos actuales (hero, líneas, catálogo,
  videos, eventos, tips, quiénes somos, únete, legal).
- **Prospectos reales:** la tabla de Prospectos dejó de usar datos de ejemplo;
  lee `GET /api/Leads`, muestra correo, departamento, dirección, experiencia y
  fecha, y permite desplegar cada postulación.
- **Alta desde prospecto:** el botón “Crear integrante” lleva a Equipo & Roles
  con nombre, correo, WhatsApp, zona y rol precargados; solo falta completar la
  cédula.
- **Legal y pie de página editables:** dos pestañas independientes en el CMS,
  “Legal” y “Pie & Redes”, para editar los cuatro documentos por un lado y los
  enlaces de WhatsApp, Instagram, TikTok, correo y aviso legal por otro, sin
  hacer scroll largo.
