/**
 * Forms Builder Settings Store
 *
 * Manages configurable settings for the Forms Builder app,
 * including credential registry URL.
 */

import { create } from 'zustand';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

interface FormsBuilderSettings {
  credentialRegistryPath: string;
}

interface FormsBuilderSettingsState {
  settings: FormsBuilderSettings;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<FormsBuilderSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: FormsBuilderSettings = {
  credentialRegistryPath: 'credentials/branding',
};

export const useFormsBuilderSettingsStore = create<FormsBuilderSettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/api/forms-builder/settings`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        set({ settings: { ...DEFAULT_SETTINGS, ...data }, isLoading: false });
      } else if (response.status === 404) {
        // Settings not found, use defaults
        set({ settings: DEFAULT_SETTINGS, isLoading: false });
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
        isLoading: false,
      });
    }
  },

  updateSettings: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const currentSettings = get().settings;
      const newSettings = { ...currentSettings, ...updates };

      const response = await fetch(`${API_BASE}/api/forms-builder/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      set({ settings: newSettings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update settings',
        isLoading: false,
      });
    }
  },

  resetSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/api/forms-builder/settings/reset`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to reset settings');
      }

      set({ settings: DEFAULT_SETTINGS, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reset settings',
        isLoading: false,
      });
    }
  },
}));
