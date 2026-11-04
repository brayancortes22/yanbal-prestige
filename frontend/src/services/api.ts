import type { Product, TipItem, EventItem, HeroSlide, LeadProspect } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const isApiConfigured = (): boolean => Boolean(API_BASE_URL);

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  if (!API_BASE_URL) return null;
  try {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options?.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
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

export const api = {
  checkHealth: async (): Promise<{ status: string; timestamp: string } | null> => {
    return fetchJson<{ status: string; timestamp: string }>('/health');
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

  createLead: async (lead: LeadProspect): Promise<{ success: boolean; message?: string }> => {
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
        return { success: false, message: `Error HTTP ${res.status}` };
      }
      return { success: true };
    } catch (err) {
      console.warn('[API] Error submitting lead:', err);
      return { success: true };
    }
  },

  uploadMedia: async (file: File): Promise<{ url: string; size: number } | null> => {
    if (!API_BASE_URL) return null;
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/api/Media/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) return null;
      return (await res.json()) as { url: string; size: number };
    } catch {
      return null;
    }
  },
};
