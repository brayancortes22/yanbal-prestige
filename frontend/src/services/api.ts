import type { Product, TipItem, EventItem, HeroSlide, LeadProspect } from '../types';
import type { UserRole } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const isApiConfigured = (): boolean => Boolean(API_BASE_URL);

export interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole | string;
  phone: string;
  isActive: boolean;
}

export interface ApiLoginResponse {
  success: boolean;
  message: string;
  token: string;
  user?: ApiUser;
}

/** Cabecera Authorization unificada. Antes se leía `auth_token` y el login
 * guardaba `yanbal_auth_token`, por lo que el JWT nunca se enviaba. */
const authHeaders = (): Record<string, string> => {
  const token =
    localStorage.getItem('yanbal_auth_token') || localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
        ...((options?.headers as Record<string, string>) || {}),
      },
    });

    if (!res.ok) {
      console.warn(`[API] ${endpoint} responded with status ${res.status}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[API] Call to ${endpoint} failed:`, err);
    return null;
  }
}

const readErrorMessage = async (res: Response): Promise<string> => {
  try {
    const body = (await res.json()) as { message?: string };
    return body.message || `Error HTTP ${res.status}`;
  } catch {
    return `Error HTTP ${res.status}`;
  }
};

export const api = {
  checkHealth: async (): Promise<{ status: string; timestamp: string } | null> => {
    return fetchJson<{ status: string; timestamp: string }>('/health');
  },

  login: async (email: string, password: string): Promise<ApiLoginResponse | null> => {
    if (!API_BASE_URL) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // 401 también trae un cuerpo útil con el mensaje genérico.
      return (await res.json()) as ApiLoginResponse;
    } catch (err) {
      console.warn('[API] Login failed:', err);
      return null;
    }
  },

  requestPin: async (email: string, turnstileToken = ''): Promise<{ success: boolean; message?: string; pin?: string | null }> => {
    if (!API_BASE_URL) return { success: true, pin: null };
    try {
      const res = await fetch(`${API_BASE_URL}/api/Auth/request-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });
      const body = await res.json();
      return res.ok ? body : { success: false, message: await readErrorMessage(res) };
    } catch {
      return { success: false, message: 'No fue posible conectar con el servidor.' };
    }
  },

  resetPassword: async (
    email: string,
    pinCode: string,
    newPassword: string,
    turnstileToken = ''
  ): Promise<{ success: boolean; message?: string }> => {
    if (!API_BASE_URL) return { success: true };
    try {
      const res = await fetch(`${API_BASE_URL}/api/Auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pinCode, newPassword, turnstileToken }),
      });
      return res.ok ? { success: true } : { success: false, message: await readErrorMessage(res) };
    } catch {
      return { success: false, message: 'No fue posible conectar con el servidor.' };
    }
  },

  getProducts: async (): Promise<Product[] | null> => {
    return fetchJson<Product[]>('/api/Catalog/products');
  },

  getTips: async (): Promise<TipItem[] | null> => {
    return fetchJson<TipItem[]>('/api/tips');
  },

  getEvents: async (): Promise<EventItem[] | null> => {
    return fetchJson<EventItem[]>('/api/Cms/events');
  },

  getHeroSlides: async (): Promise<HeroSlide[] | null> => {
    return fetchJson<HeroSlide[]>('/api/Cms/slides');
  },

  createLead: async (
    lead: LeadProspect
  ): Promise<{ success: boolean; message?: string }> => {
    // Modo demostración sin API: se conserva el comportamiento visual.
    if (!API_BASE_URL) return { success: true };
    try {
      const res = await fetch(`${API_BASE_URL}/api/Leads/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: lead.fullName,
          phone: lead.phone,
          city: lead.city,
          roleInterest: lead.roleInterest,
          acceptedHabeasData: lead.acceptedHabeasData,
          companyWebsite: lead.trapField || '',
          turnstileToken: lead.turnstileToken || '',
        }),
      });

      if (!res.ok) {
        return { success: false, message: await readErrorMessage(res) };
      }
      return { success: true };
    } catch (err) {
      console.warn('[API] Error submitting lead:', err);
      return {
        success: false,
        message: 'No pudimos enviar tu postulación. Revisa tu conexión e inténtalo de nuevo.',
      };
    }
  },

  uploadMedia: async (file: File): Promise<{ url: string; size: number } | null> => {
    if (!API_BASE_URL) return null;
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/Media/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });

      if (!res.ok) return null;
      return (await res.json()) as { url: string; size: number };
    } catch {
      return null;
    }
  },
};
