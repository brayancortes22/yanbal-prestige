# Respuesta a Yuli: VPS, dominio, correo, multimedia y costos reales

**Contexto:** respuesta al mensaje de July del 27/10/2026 (8:47 a. m.), corregida con los datos reales de la compra:
el dominio `.com` **viene incluido gratis** con el VPS de Hostinger, el hosting **no se compra aparte** porque es lo que
se monta sobre la VPS, y el correo **puede quedar en $0** usando cuentas Gmail + inicio de sesión con Google.

**Fecha:** 27 de octubre de 2026 · **TRM de referencia:** $4.100 COP/USD
**Nota:** precios de referencia; verificar antes de comprar.

---

## 1. Mensaje listo para enviar a July (WhatsApp)

> Yuli, te aclaro las dudas de la clienta una por una, porque ahí hay dos cosas que la están confundiendo y le van a hacer pagar de más:
>
> **1. Hosting no hay que comprar.**
> La VPS es una **máquina virtual Linux**: un computador completo en la nube donde se aloja lo que uno quiera. El "hosting" es justamente lo que se monta encima de esa máquina (servidor web, base de datos, certificados, carpetas de archivos). Si se configura bien —y eso ya está incluido en el despliegue— comprar un hosting aparte es pagar dos veces por lo mismo.
>
> **2. El dominio ya viene incluido.**
> Hostinger regala el dominio `.com` con la compra del VPS. Se registra a nombre de ella y desde ahí lo apuntamos a Vercel. **Ojo con un detalle honesto:** el dominio es gratis el **primer año**; desde la renovación se paga (~$11–15 USD/año). Mejor decirlo ahora que sorprenderla después.
>
> **3. El correo es aparte, y se puede dejar en $0.**
> Dos caminos:
> - **Sin costo:** los correos administrativos funcionan con cuentas Gmail normales y el acceso al panel se hace con **"Iniciar sesión con Google"** — igual que lo hicimos en Accesorios Lilis. Cero dólares.
> - **Con dominio propio** (ej. `admin@yanbalprestige.com`): ahí sí hay que pagar el servicio de correo, entre $1 y $7 USD por usuario al mes.
>
> Mi recomendación: arrancar con Gmail en $0 y, si ella quiere correo corporativo, se cotiza aparte. No lo mezclemos con la infraestructura.
>
> **4. Imágenes y videos: dentro de la VPS, sin costo extra.**
> Los 100 GB NVMe alcanzan de sobra para el catálogo completo. Además el backend convierte automáticamente lo que ella suba a **WebP** (y AVIF donde el navegador lo soporte), formatos que pesan hasta 80% menos que un JPG. Resultado: la web carga más rápido y el disco rinde más. No hay que pagar Cloudinary, S3 ni nada parecido.
>
> **5. El frontend ya está en Vercel y es gratis.**
> Vercel sirve la página al público: no se cae y no tiene costo. Lo único que hacemos con el dominio que da Hostinger es apuntarlo a Vercel y registrarlo en **Google Search Console**, para que el sitio aparezca en las búsquedas de Google. Cero costo adicional.
>
> **6. Nada de Railway, Azure, Cloudinary ni S3.**
> Con **VPS + Vercel + Cloudflare** queda cubierto todo: servidor, frontend, imágenes, videos, SSL y CDN. Esas plataformas solo se justifican en empresas grandes; aquí solo agregarían una factura mensual impredecible.
>
> **Cuentas claras del año 1:**
> VPS Hostinger anual (2 vCPU, 8 GB RAM, 100 GB NVMe) + dominio `.com` **incluido** + SSL + Cloudflare + Vercel + correo Gmail = **~$84 USD ≈ $345.000 COP al año**, es decir **~$29.000 COP al mes** para operar toda la plataforma.
>
> **Y un punto que le va a gustar:** ese servidor aguanta **3 a 5 proyectos más** sin pagar un peso extra. Con dos clientes adicionales, la infraestructura de Yanbal Prestige queda prácticamente gratis.
>
> **Tres cosas que necesito definir con ella ahora**, para que no haya sorpresas después:
> 1. La cuenta de Hostinger (VPS + dominio) se crea **a nombre de ella y con su tarjeta**. Nosotros administramos, pero la dueña es ella.
> 2. El dominio es gratis el **primer año**; desde el segundo se paga la renovación (~$11–15 USD). Dejemos ese rubro presupuestado desde ya.
> 3. Los respaldos se guardan también **fuera del servidor** (cuesta centavos al mes) para que un fallo del proveedor no se lleve la base de datos.

---

## 2. Qué es cada cosa (para explicarlo sin tecnicismos)

| Concepto | Qué es en palabras simples | ¿Se paga aparte? |
| :--- | :--- | :--- |
| **VPS** | Un computador Linux encendido 24/7 en un datacenter, con disco, RAM y conexión propia. | ✅ Es la única compra real |
| **Hosting** | Lo que se instala *dentro* de esa máquina: servidor web, base de datos, SSL, carpetas de archivos. | ❌ No. Ya está en el despliegue |
| **Dominio** | La dirección (`yanbalprestige.com`). | 🎁 Incluido por Hostinger el año 1 |
| **SSL / HTTPS** | El candado de seguridad del navegador. | ❌ Gratis (Let's Encrypt) |
| **CDN** | Copias del sitio en servidores cercanos al cliente para que cargue rápido. | ❌ Gratis (Cloudflare) |
| **Frontend (Vercel)** | Donde vive la página que ve el público (React). | ❌ Gratis |
| **Correo** | Los buzones `@tudominio.com`. | ⚠️ Opcional: $0 con Gmail, o pago si quiere dominio propio |
| **Almacenamiento de imágenes** | Disco del VPS (100 GB) + conversión a WebP. | ❌ Incluido en el VPS |

> **Analogía:** la VPS es el local; el hosting es la decoración e instalación eléctrica (la hacemos nosotros); el dominio es la dirección del local (viene de regalo con el arriendo); el correo es el buzón (opcional, y se puede usar uno gratis).

---

## 3. Costos reales del año 1

| Concepto | Proveedor | Costo año 1 |
| :--- | :--- | ---: |
| VPS KVM 2 — 2 vCPU, 8 GB RAM, 100 GB NVMe | Hostinger (plan anual) | ~$84 USD |
| Dominio `.com` | **Incluido con el VPS** | **$0** |
| SSL Wildcard (HTTPS) | Let's Encrypt | $0 |
| CDN + anti-DDoS | Cloudflare Free | $0 |
| Frontend React | Vercel | $0 |
| Correo administrativo | Gmail + OAuth de Google | $0 |
| Almacenamiento multimedia | Disco NVMe del VPS + WebP | $0 |
| **TOTAL AÑO 1** | | **~$84 USD ≈ $345.000 COP** |
| **Promedio mensual real** | | **~$29.000 COP** |

### Proyección honesta desde el año 2

| Concepto | Costo estimado |
| :--- | ---: |
| Renovación VPS (sin promoción) | ~$120–144 USD |
| Renovación dominio `.com` | ~$11–15 USD |
| **Total año 2** | **~$135–160 USD ≈ $555.000–656.000 COP** |

> No es un aumento del proyecto: es cómo funcionan todos los proveedores. La diferencia es que aquí se avisa con un año de anticipación.

### Si algún día quiere correo con su propio dominio

| Opción | Costo anual | Nota |
| :--- | ---: | :--- |
| **Gmail con cuentas existentes + Google Sign-In** | **$0** | ✅ Recomendado para arrancar |
| Zoho Mail Free (5 cuentas, web/app) | $0 | Sin IMAP en Outlook |
| Zoho Mail Lite | ~$12 USD / usuario | Con IMAP |
| Google Workspace | ~$72–84 USD / usuario | Suite completa |
| Microsoft 365 | ~$84 USD / usuario | Solo si exige Outlook |

---

## 4. Puntos que hay que dejar cerrados (asesor crítico)

1. **Titularidad de la cuenta.** El VPS y el dominio deben quedar a nombre de Yuli, con su correo y su tarjeta. Si quedan a nombre del desarrollador, el día que haya un desacuerdo ella pierde el sitio. Nosotros administramos con accesos delegados, no somos dueños.
2. **Renovación del año 2.** El dominio gratis y el precio promocional del VPS no se repiten. Presupuestarlo desde la cotización, no después.
3. **Respaldos fuera del servidor.** El worker de backups guarda en el mismo disco: sirve para errores humanos, no para un fallo del proveedor. Una copia externa (Cloudflare R2 / Backblaze B2) cuesta centavos al mes.
4. **Correo fuera del VPS.** Nada de servidor de correo dentro del servidor: reputación de IP, DKIM/DMARC y bloqueos de Gmail no valen el ahorro.
5. **Search Console desde el día uno.** Registrar el dominio y subir el `sitemap.xml` para que Google indexe el catálogo. Es gratis y es lo que trae tráfico orgánico.
6. **El ahorro viene de la arquitectura, no de cupones.** Un VPS + Vercel + Cloudflare + WebP automático reemplaza cuatro servicios pagos. Ese es el argumento técnico, no el descuento.

---

## 5. Comparación contra lo que la clienta estaba evaluando

| Opción que ella propuso | Costo anual | Por qué no |
| :--- | ---: | :--- |
| Hosting aparte | ~$60–120 USD | Es lo mismo que ya se monta en la VPS: se paga dos veces |
| Dominio aparte | ~$11–15 USD | Hostinger ya lo incluye el año 1 |
| Correo corporativo | $12–84 USD/usuario | Se resuelve en $0 con Gmail + Google Sign-In |
| Cloudinary | $0 → **$99/mes** | Salta de precio al crecer; el VPS ya tiene 100 GB |
| AWS S3 | $0,023/GB + $0,09/GB egreso | El egreso de video es lo que quiebra |
| Railway | ~$120–240 USD | Pago por consumo, factura impredecible |
| Azure (App Service + SQL) | ~$885.000 COP | Solo se justifica si exigen Microsoft |

> **Frase de cierre para la reunión de Teams:** *"No estamos eligiendo lo barato: estamos eligiendo lo que no sube de precio cuando el negocio crece."*
