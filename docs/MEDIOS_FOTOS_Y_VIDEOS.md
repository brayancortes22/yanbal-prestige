# Medios: fotos y videos en el VPS

Guía del almacenamiento de imágenes y videos de Yanbal Prestige. El objetivo
es que el VPS no acumule basura y que el catálogo cargue rápido.

## 1. Dónde se guardan

- Carpeta física: `backend/YanbalPrestige.Api/wwwroot/uploads/<subcarpeta>/`.
- URL pública: `https://<api>/uploads/<subcarpeta>/<archivo>`.
- Subcarpetas usadas por el panel:
  - `products`: galería de productos.
  - `tips`: portada y video de los consejos.
  - `events`: fotos y videos de eventos.
- La base de datos guarda la URL absoluta en `productos.imagen_url` y la
  galería completa en `productos.media_json` (JSON con `type`, `url`, `alt`).

## 2. Qué hace el backend al subir

Endpoint autenticado: `POST /api/Media/upload` (`multipart/form-data` con
`file` y `subFolder`).

| Tipo | Procesamiento | Límite |
| :--- | :--- | :--- |
| Imagen (JPG/PNG/BMP/WebP) | Redimensiona a máx. 1920 px y convierte a **WebP** calidad 82 | 8 MB |
| Video (MP4/MOV/WebM) | Transcodifica a **MP4 H.264/AAC**, máx. 1280 px, 30 fps, CRF 25, `+faststart` | 150 MB |

- Si `ffmpeg` no está disponible, el video se guarda sin optimizar y se
  registra una advertencia. En el VPS debe estar instalado y accesible; se
  puede fijar la ruta con `Media:FfmpegPath`.
- Los archivos se guardan con nombre único (GUID + ticks), así que nunca se
  sobreescribe una foto existente.

## 3. Limpieza automática (sin basura)

1. **Al reemplazar o quitar medios de un producto**, `CatalogService` borra
   del disco las URL que ya no están en la galería.
2. **Al eliminar un producto**, se borran la portada y todos los archivos de
   `media_json`.
3. **Al cancelar un formulario** queda un archivo temporal. El
   `MediaCleanupWorker` revisa `uploads/products` cada 6 horas y elimina los
   archivos con más de 24 horas que ningún producto referencie.
   - Se puede ajustar con `Media:OrphanGraceHours` (por defecto 24).
   - Nunca toca archivos de menos de 24 h ni los `.tmp-*` de una subida en
     curso.

## 4. Cabeceras para mostrarlos desde otro dominio

Los archivos de `/uploads/` responden con:

```
Cross-Origin-Resource-Policy: cross-origin
Access-Control-Allow-Origin: *
Cache-Control: public, max-age=31536000, immutable
```

Esto permite mostrar las fotos desde el dominio del frontend (Vercel,
Netlify, otro VPS) aunque la API viva en un dominio distinto, y permite
cachearlas un año porque el nombre es único.

## 5. Verificación rápida

```powershell
# 1. Subir una imagen y un video con el token de la directora
curl.exe -X POST -H "Authorization: Bearer $token" `
  -F "file=@foto.png;type=image/png" -F "subFolder=products" `
  http://localhost:5075/api/Media/upload

# 2. Confirmar que la imagen quedó en WebP y el video en MP4
Get-ChildItem backend\YanbalPrestige.Api\wwwroot\uploads\products

# 3. Guardar un producto con "media" y luego eliminarlo
#    La carpeta debe quedar vacía.
```

Prueba ejecutada en esta iteración:

- Imagen 70 B → WebP de 36 B.
- Video de prueba 76.033 B → MP4 de 43.822 B (-42 %).
- Producto con foto + video: `media_json` persistido y ambos archivos
  borrados al eliminar el producto.
- Reemplazo de galería: el archivo anterior desapareció del disco.
