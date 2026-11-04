# 🛰️ Guía de Keep-Alive Anti-Suspensión para Render (Cero Costo y Cero Gasto de Cuotas)

Esta guía documenta la estrategia para mantener despierto el Backend ASP.NET Core 10 en **Render (Free Tier)** sin agotar minutos de **GitHub Actions** ni exceder los límites diarios de **Vercel Hobby**.

---

## ⚡ El Problema con el Tier Gratuito de Render
* Render suspende (pone a dormir) los servicios web gratuitos tras **15 minutos consecutivos de inactividad** (cero tráfico entrante).
* Cuando un usuario entra después de haberse dormido, la máquina tarda entre **30 y 50 segundos en hacer un *cold start***.

---

## 🛡️ La Solución en 2 Capas Implementada

### Capa 1: Pulso Wake-Up Automático desde Vercel (Frontend)
* En `frontend/src/context/ConfigContext.tsx`, al cargar la aplicación en el navegador de cualquier visitante, se dispara automáticamente una petición silenciosa en segundo plano a:
  ```http
  GET /health
  ```
* **Efecto:** Si la API estaba dormida, el primer visitante la despierta de inmediato sin congelar la interfaz gracias al fallback local de caché.

---

### Capa 2: Monitor HTTP Gratuito en la Nube (cron-job.org / UptimeRobot)
Para que el servidor nunca se duerma incluso si nadie visita la página por horas, se utiliza un servicio externo especializado de pings HTTP que **no consume minutos de GitHub Actions ni cuotas de Vercel**.

#### Configuración en cron-job.org (Recomendado - 100% Gratis de por vida):
1. Regístrate en [cron-job.org](https://cron-job.org) (gratuito).
2. Haz clic en **Create Cronjob**.
3. Configura los campos:
   * **Title:** `Yanbal Prestige Backend Keep-Alive`
   * **URL:** `https://<tu-backend-en-render>.onrender.com/health`
   * **Schedule:** Cada **10 minutos** (`*/10 * * * *`) o cada **14 minutos**.
   * **Request Method:** `GET`
4. Guarda el trabajo.

#### Configuración en UptimeRobot (Alternativa visual con alertas):
1. Crea una cuenta en [uptimerobot.com](https://uptimerobot.com).
2. Haz clic en **Add New Monitor**.
3. Tipo de monitor: **HTTP(s)**.
4. Friendly Name: `Yanbal Prestige API Health`.
5. URL: `https://<tu-backend-en-render>.onrender.com/health`.
6. Monitoring Interval: **5 minutos** (incluido en el plan gratis de UptimeRobot).
7. Haz clic en **Create Monitor**.

---

## 🐋 Despliegue en Render vía Dockerfile
El backend cuenta con su propio [`backend/YanbalPrestige.Api/Dockerfile`](../backend/YanbalPrestige.Api/Dockerfile) optimizado para .NET 10.
Al crear el Web Service en Render:
* **Environment:** `Docker`
* **Dockerfile Path:** `./backend/YanbalPrestige.Api/Dockerfile`
* **Docker Context:** `./backend/YanbalPrestige.Api`
* **Port:** `8080`
* **Health Check Path:** `/health`
