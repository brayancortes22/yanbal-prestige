# Pruebas de interfaz — 7 de noviembre de 2026

Pruebas ejecutadas **desde la interfaz web** (clics, formularios y confirmaciones),
con verificación posterior en MySQL. No se usaron llamadas directas a la API
para simular las acciones del usuario.

## Entorno

- Frontend: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:5075`
- MySQL: base `yanbal_prestige`
- Navegador integrado de OpenCode
- Activos descargados para las pruebas: foto JPEG de prueba y video MP4 de 5 s
  (1,1 MB), ambos usados en la galería del producto.

## Flujos probados

### Prospectos y alta de integrante

| Acción | Resultado |
| :--- | :--- |
| Abrir “Únete”, girar la tarjeta de Consultora y llenar el formulario completo | Formulario aceptó nombre, WhatsApp, correo, ciudad, departamento, dirección, experiencia y Habeas Data |
| Enviar postulación | Pantalla “¡Postulación Recibida con Éxito!” |
| Verificar MySQL | Fila en `prospectos_unete` con todos los campos y `rol_interes=consultora` |
| Abrir Prospectos en administración | El aspirante apareció con correo, ciudad, fecha y botones de acción |
| Desplegar “Ver más datos” | Mostró teléfono, correo, ciudad/departamento, dirección y experiencia |
| “Crear integrante” | Llevó a Equipo & Roles con nombre, correo, WhatsApp, zona y rol precargados |
| Completar cédula y guardar | Usuario creado en MySQL con `documento`, `zona`, `rol=2`, `lider_id=null` |
| Eliminar la integrante con confirmación | Fila eliminada de `usuarios` |

### Catálogo con foto y video

| Acción | Resultado |
| :--- | :--- |
| “Nuevo Producto” y llenar SKU, nombre, precio y descripción | Formulario validó y aceptó |
| Arrastrar foto JPEG y video MP4 | Subida real al backend; foto convertida a WebP y video a MP4 |
| Guardar producto | Producto visible en la tabla y en MySQL |
| Verificar `media_json` | Guardó las dos URL (`image` y `video`) |
| Verificar archivos | Foto 51,5 KB → WebP 37,8 KB; video 1,1 MB → MP4 249 KB |
| Pausar con confirmación | `productos.activo = 0` |
| Reactivar con confirmación | `productos.activo = 1` |
| Eliminar con confirmación | Producto y los dos archivos desaparecieron; `uploads/products` quedó vacía |

### Importación de catálogo

| Acción | Resultado |
| :--- | :--- |
| Abrir “Importar Catálogo CSV” | Modal con plantilla y zona de carga |
| Descargar Excel | Archivo `plantilla_catalogo_yanbal.xlsx` de 10,5 KB descargado |
| Cargar CSV de prueba | Vista previa con 1 fila “OK” |
| “Importar 1 referencias” | Producto creado y visible en MySQL |
| Eliminar el producto importado | Fila eliminada del catálogo |

### CRM de clientas

| Acción | Resultado |
| :--- | :--- |
| “Nueva Clienta” con nombre, WhatsApp, correo, cédula, ciudad, barrio, dirección y código postal | Guardado correcto |
| Verificar MySQL | Todos los campos en `clientes_consultora` |
| Editar teléfono y guardar | Teléfono actualizado en MySQL |
| Eliminar ficha con confirmación | Fila eliminada; quedaron las 4 clientas originales |

### Venta directa, abonos y devoluciones

| Acción | Resultado |
| :--- | :--- |
| Abrir venta directa | Modo CRM activado automáticamente con la primera clienta |
| Ver resumen “Datos cargados del CRM” | Mostró nombre, teléfono y dirección disponible |
| Agregar producto y definir abono de $70.000 | Carrito y resumen correctos |
| Registrar venta con confirmación | Factura `FAC-202611-0002` creada |
| Verificar MySQL | Pedido, ítem, precio del catálogo y pago Nequi por $70.000 |
| Registrar segundo pago | Pago por $98.000; estado pasó a `pagado` |
| Anular factura con confirmación | `estado_pago=anulada`, `estado_entrega=cancelado` |
| Registrar devolución | Movimiento `reembolso` por -$168.000 |
| Reactivar factura | Estado recalculado a `pendiente` con saldo completo |

### Pedido web público

| Acción | Resultado |
| :--- | :--- |
| Añadir producto, abrir carrito y “Confirmar Pedido” | Modal de checkout |
| Llenar nombre, WhatsApp, correo, cédula, ciudad, barrio, dirección, código postal y Habeas Data | Formulario aceptó todos los datos |
| Confirmar pedido | Factura `FAC-202611-0003` y apertura de WhatsApp |
| Verificar MySQL | Todos los campos de la clienta, total $995.000 y origen `web_catalogo` |
| Abrir factura desde administración | Mostró total, abono y botón “Correo” para la clienta con email |
| Reasignar consultora con confirmación | Cambió a Paula y volvió a Carolina en MySQL |

### CMS

| Acción | Resultado |
| :--- | :--- |
| Editar Hero y guardar | Tarjeta y portada pública reflejaron el texto; se restauró |
| Guardar Líneas | Guardado correcto |
| Guardar Catálogo Digital | Mensaje de éxito |
| Crear evento con calendario | Evento visible en `/eventos`; se eliminó con confirmación |
| Crear consejo | Consejo guardado en configuración; se eliminó con confirmación |
| Crear video tutorial | Guardado correcto; se eliminó |
| Guardar Quiénes Somos y Únete | Mensajes de éxito |
| Editar documento legal y guardar | `/privacidad` reflejó el cambio; se restauró |
| Editar correo del pie y guardar | El `mailto:` público cambió; se restauró |
| Pestañas Legal y Pie & Redes | Separadas, con vista previa y sin scroll largo |

### Otros botones y rutas

| Acción | Resultado |
| :--- | :--- |
| Descargar plantilla Excel | Archivo real descargado |
| Abrir/cerrar modal de importación | Correcto |
| Factura PDF | Abrió una ventana independiente con la factura |
| Login con contraseña incorrecta | Mensaje “Credenciales incorrectas o usuario inactivo” |
| Cerrar sesión | Token y rol eliminados; redirección al login |
| Asistente intenta abrir Equipo & Roles | Redirección al panel; menú sin Usuarios |
| Consultora intenta abrir `/admin/usuarios` | Redirección a su portal |
| Líder en su portal | Herramientas rápidas antes del equipo y 2 consultoras listadas |
| Navegación pública: catálogo, producto, eventos, tips, quiénes somos, únete y legales | Sin desbordes horizontales ni errores de consola |

## Correcciones surgidas durante las pruebas

- Se corrigió el `pattern` del teléfono en Únete, que generaba un error de
  consola en navegadores modernos.
- El botón de devolución ahora dice **“Registrar devolución”** también en el
  submit, no “Registrar pago”.
- Se corrigió el mensaje “volvió a estar activa” a “activo” para productos.
- Se verificó que la pestaña Legal y Pie & Redes ya no comparten scroll.

## Limpieza posterior

Se eliminaron los datos de prueba:

- usuario `ui.manual@example.com`
- usuario creado desde el prospecto
- clienta `clienta.ui@example.com`
- prospecto `ui.test.consultora@example.com`
- facturas `FAC-202611-0002` y `FAC-202611-0003`
- PIN de recuperación generado
- productos `UI-TEST-01` e `IMPORT-UI-01`
- archivos de `uploads/products`

Estado final de la base:

| Tabla | Filas |
| :--- | ---: |
| `usuarios` | 6 |
| `clientes_consultora` | 4 |
| `productos` | 3 |
| `pedidos` | 1 |
| `pagos_pedido` | 1 |
| `prospectos_unete` | 0 |
| `pines_restablecimiento` | 0 |

## Compilación y seguridad

- `npm run build`: correcto.
- `dotnet build -c Release`: 0 errores / 0 advertencias.
- Suite de seguridad: **20 PASS, 0 FAIL, 1 SKIP**.
