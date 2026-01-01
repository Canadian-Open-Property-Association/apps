import { create } from 'zustand';
import type { EntityAsset } from '../types/entity';

const API_BASE = import.meta.env.VITE_API_BASE || '';

interface LogoStore {
  logos: Record<string, string>;  // entityId -> logoUrl
  isLoading: boolean;
  lastFetched: number | null;

  fetchLogos: () => Promise<void>;
  getLogoUrl: (entityId: string, fallbackUri?: string) => string | null;
  invalidateCache: () => void;
}

export const useLogoStore = create<LogoStore>((set, get) => ({
  logos: {},
  isLoading: false,
  lastFetched: null,

  fetchLogos: async () => {
    // Prevent concurrent fetches
    if (get().isLoading) return;

    // Cache for 30 seconds to prevent excessive refetching
    const now = Date.now();
    const lastFetched = get().lastFetched;
    if (lastFetched && now - lastFetched < 30000) return;

    set({ isLoading: true });

    try {
      const res = await fetch(`${API_BASE}/api/assets?type=entity-logo`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch logos');
      }

      const assets: EntityAsset[] = await res.json();
      const logos: Record<string, string> = {};

      assets.forEach((asset) => {
        if (asset.entityId) {
          logos[asset.entityId] = asset.localUri;
        }
      });

      set({ logos, isLoading: false, lastFetched: now });
    } catch (error) {
      console.error('Failed to fetch logo assets:', error);
      set({ isLoading: false });
    }
  },

  getLogoUrl: (entityId: string, fallbackUri?: string) => {
    const logos = get().logos;
    return logos[entityId] || fallbackUri || null;
  },

  invalidateCache: () => {
    set({ lastFetched: null });
  },
}));

// Listen for logo update events to invalidate cache
if (typeof window !== 'undefined') {
  window.addEventListener('entity-logo-updated', () => {
    useLogoStore.getState().invalidateCache();
    useLogoStore.getState().fetchLogos();
  });
}
