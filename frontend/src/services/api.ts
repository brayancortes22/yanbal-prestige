import type { TipItem, EventItem, HeroSlide, LeadProspect } from '../types';
import type { ApiClient, ApiUser, ApiProduct, ApiOrder } from './apiMappers';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const isApiConfigured = (): boolean => Boolean(API_BASE_URL);

export type { ApiUser } from './apiMappers';

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

/**
 * Petición autenticada que lanza error con el mensaje del backend.
 * Las lecturas tolerantes usan `fetchJson`; las mutaciones usan esta para
 * no simular éxito cuando la API rechaza (401/403/400/500).
 */
async function requestJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) throw new Error('La API no está configurada.');
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

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

  getProducts: async (): Promise<ApiProduct[] | null> => {
    return fetchJson<ApiProduct[]>('/api/Catalog/products');
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
          email: lead.email || '',
          department: lead.department || '',
          address: lead.address || '',
          experience: lead.experience || '',
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

  /* ---------------------------------------------------------------------
   * Datos de la red: todo pasa por el backend y el backend valida el rol.
   * ------------------------------------------------------------------- */
  getMe: async (): Promise<ApiUser> => requestJson<ApiUser>('/api/Auth/me'),

  getLeads: async (): Promise<LeadProspect[]> => requestJson<LeadProspect[]>('/api/Leads'),

  getUsers: async (): Promise<ApiUser[]> => requestJson<ApiUser[]>('/api/Auth/users'),

  saveUser: async (payload: unknown): Promise<ApiUser> =>
    requestJson<ApiUser>('/api/Auth/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  toggleUser: async (id: string): Promise<{ success: boolean }> =>
    requestJson<{ success: boolean }>(`/api/Auth/users/${id}/toggle`, { method: 'PATCH' }),

  deleteUser: async (id: string): Promise<{ success: boolean }> =>
    requestJson<{ success: boolean }>(`/api/Auth/users/${id}`, { method: 'DELETE' }),

  getClients: async (consultantId?: string): Promise<ApiClient[]> =>
    requestJson<ApiClient[]>(
      `/api/Crm/clients${consultantId ? `?consultantId=${encodeURIComponent(consultantId)}` : ''}`
    ),

  getAllClients: async (): Promise<ApiClient[]> =>
    requestJson<ApiClient[]>('/api/Crm/clients/all'),

  saveClient: async (payload: unknown): Promise<ApiClient> =>
    requestJson<ApiClient>('/api/Crm/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteClient: async (id: string, consultantId: string): Promise<{ success: boolean }> =>
    requestJson<{ success: boolean }>(
      `/api/Crm/clients/${id}?consultantId=${encodeURIComponent(consultantId)}`,
      { method: 'DELETE' }
    ),

  getOrders: async (): Promise<ApiOrder[]> => {
    const response = await requestJson<{ data: ApiOrder[] }>('/api/Orders?pageSize=200');
    return response.data || [];
  },

  createOrder: async (payload: unknown): Promise<ApiOrder> =>
    requestJson<ApiOrder>('/api/Orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateOrderStatus: async (
    id: string,
    payload: { deliveryStatus?: string; notes?: string }
  ): Promise<{ success: boolean }> =>
    requestJson<{ success: boolean }>(`/api/Orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  assignOrder: async (
    id: string,
    consultantId: string,
    consultantName: string
  ): Promise<{ success: boolean }> =>
    requestJson<{ success: boolean }>(`/api/Orders/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ consultantId, consultantName }),
    }),

  updateOrderPayments: async (id: string, payments: unknown[]): Promise<ApiOrder> =>
    requestJson<ApiOrder>(`/api/Orders/${id}/payments`, {
      method: 'PUT',
      body: JSON.stringify(payments),
    }),

  saveProduct: async (payload: unknown): Promise<ApiProduct> =>
    requestJson<ApiProduct>('/api/Catalog/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  toggleProduct: async (id: string): Promise<{ success: boolean }> =>
    requestJson<{ success: boolean }>(`/api/Catalog/products/${id}/toggle`, {
      method: 'PATCH',
    }),

  deleteProduct: async (id: string): Promise<{ success: boolean }> =>
    requestJson<{ success: boolean }>(`/api/Catalog/products/${id}`, { method: 'DELETE' }),

  /**
   * Sube un archivo al backend, que lo comprime (WebP ≤1920 px o MP4
   * H.264 ≤1280 px) y devuelve la URL absoluta lista para guardar.
   */
  uploadMedia: async (
    file: File,
    subFolder = 'general'
  ): Promise<{ url: string; absoluteUrl: string; sizeBytes: number; fileName: string }> => {
    if (!API_BASE_URL) throw new Error('La API no está configurada.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subFolder', subFolder);

    const res = await fetch(`${API_BASE_URL}/api/Media/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });

    if (!res.ok) throw new Error(await readErrorMessage(res));

    const data = (await res.json()) as {
      url: string;
      sizeBytes?: number;
      size?: number;
      fileName?: string;
    };

    return {
      url: data.url,
      absoluteUrl: `${API_BASE_URL}${data.url}`,
      sizeBytes: data.sizeBytes ?? data.size ?? file.size,
      fileName: data.fileName ?? file.name,
    };
  },
};
