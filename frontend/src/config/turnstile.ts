/**
 * Cloudflare Turnstile — configuración del cliente.
 *
 * El widget solo se muestra cuando existe una Site Key real en
 * `VITE_TURNSTILE_SITEKEY`. Sin ella queda desactivado para no publicar
 * el aviso "Solo para pruebas" de Cloudflare en el sitio.
 *
 * Para activarlo: crea el site en Cloudflare y define en Vercel
 * `VITE_TURNSTILE_SITEKEY` (pública) y en la API
 * `CloudflareTurnstile__SecretKey` (privada).
 */
const rawSiteKey = import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined;

export const TURNSTILE_SITE_KEY = rawSiteKey?.trim() ?? '';

export const isTurnstileEnabled = TURNSTILE_SITE_KEY.length > 0;
