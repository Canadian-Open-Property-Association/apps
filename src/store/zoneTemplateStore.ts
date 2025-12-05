import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import {
  ZoneTemplate,
  ZoneTemplateStore,
  createCopaStandardTemplate,
  COPA_STANDARD_TEMPLATE_ID,
  CARD_WIDTH,
  CARD_HEIGHT,
} from '../types/vct';
import { getCurrentUserId } from './authStore';

const generateId = () => crypto.randomUUID();

// Get storage key based on current user
const getStorageKey = () => {
  const userId = getCurrentUserId();
  return `zone-templates-${userId || 'anonymous'}`;
};

// Custom storage that uses user-specific keys
const userStorage: StateStorage = {
  getItem: (_name: string): string | null => {
    const key = getStorageKey();
    return localStorage.getItem(key);
  },
  setItem: (_name: string, value: string): void => {
    const key = getStorageKey();
    localStorage.setItem(key, value);
  },
  removeItem: (_name: string): void => {
    const key = getStorageKey();
    localStorage.removeItem(key);
  },
};

// Create the zone template store
export const useZoneTemplateStore = create<ZoneTemplateStore>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: [createCopaStandardTemplate()],
      selectedTemplateId: COPA_STANDARD_TEMPLATE_ID,
      editingTemplate: null,

      // Add a new template
      addTemplate: (template) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newTemplate: ZoneTemplate = {
          ...template,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
        return id;
      },

      // Update an existing template
      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id && !t.isBuiltIn
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      // Delete a template (cannot delete built-in templates)
      deleteTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (template?.isBuiltIn) return;

        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          selectedTemplateId:
            state.selectedTemplateId === id
              ? COPA_STANDARD_TEMPLATE_ID
              : state.selectedTemplateId,
        }));
      },

      // Duplicate a template with a new name
      duplicateTemplate: (id, newName) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) return '';

        const newId = generateId();
        const now = new Date().toISOString();

        // Deep clone the template
        const duplicated: ZoneTemplate = {
          ...JSON.parse(JSON.stringify(template)),
          id: newId,
          name: newName,
          isBuiltIn: false,
          createdAt: now,
          updatedAt: now,
        };

        // Generate new IDs for all zones
        duplicated.front.zones = duplicated.front.zones.map((z) => ({
          ...z,
          id: generateId(),
        }));
        duplicated.back.zones = duplicated.back.zones.map((z) => ({
          ...z,
          id: generateId(),
        }));

        set((state) => ({
          templates: [...state.templates, duplicated],
        }));
        return newId;
      },

      // Select a template for use
      selectTemplate: (id) => set({ selectedTemplateId: id }),

      // Set the template being edited (creates a working copy)
      setEditingTemplate: (template) => {
        if (template) {
          // Create a deep copy for editing
          set({ editingTemplate: JSON.parse(JSON.stringify(template)) });
        } else {
          set({ editingTemplate: null });
        }
      },

      // Add a zone to the editing template
      addZone: (face, zone) => {
        set((state) => {
          if (!state.editingTemplate || state.editingTemplate.isBuiltIn) {
            return state;
          }
          return {
            editingTemplate: {
              ...state.editingTemplate,
              [face]: {
                zones: [
                  ...state.editingTemplate[face].zones,
                  { ...zone, id: generateId() },
                ],
              },
            },
          };
        });
      },

      // Update a zone in the editing template
      updateZone: (face, zoneId, updates) => {
        set((state) => {
          if (!state.editingTemplate || state.editingTemplate.isBuiltIn) {
            return state;
          }
          return {
            editingTemplate: {
              ...state.editingTemplate,
              [face]: {
                zones: state.editingTemplate[face].zones.map((z) =>
                  z.id === zoneId ? { ...z, ...updates } : z
                ),
              },
            },
          };
        });
      },

      // Delete a zone from the editing template
      deleteZone: (face, zoneId) => {
        set((state) => {
          if (!state.editingTemplate || state.editingTemplate.isBuiltIn) {
            return state;
          }
          return {
            editingTemplate: {
              ...state.editingTemplate,
              [face]: {
                zones: state.editingTemplate[face].zones.filter(
                  (z) => z.id !== zoneId
                ),
              },
            },
          };
        });
      },

      // Copy front zones to back
      copyFrontToBack: () => {
        set((state) => {
          if (!state.editingTemplate || state.editingTemplate.isBuiltIn) {
            return state;
          }
          return {
            editingTemplate: {
              ...state.editingTemplate,
              back: {
                zones: state.editingTemplate.front.zones.map((z) => ({
                  ...z,
                  id: generateId(),
                })),
              },
            },
          };
        });
      },

      // Copy back zones to front
      copyBackToFront: () => {
        set((state) => {
          if (!state.editingTemplate || state.editingTemplate.isBuiltIn) {
            return state;
          }
          return {
            editingTemplate: {
              ...state.editingTemplate,
              front: {
                zones: state.editingTemplate.back.zones.map((z) => ({
                  ...z,
                  id: generateId(),
                })),
              },
            },
          };
        });
      },

      // Save the editing template back to the templates list
      saveEditingTemplate: () => {
        const { editingTemplate, templates } = get();
        if (!editingTemplate || editingTemplate.isBuiltIn) return;

        const now = new Date().toISOString();
        const existingIndex = templates.findIndex(
          (t) => t.id === editingTemplate.id
        );

        if (existingIndex >= 0) {
          // Update existing template
          set((state) => ({
            templates: state.templates.map((t) =>
              t.id === editingTemplate.id
                ? { ...editingTemplate, updatedAt: now }
                : t
            ),
            editingTemplate: null,
          }));
        } else {
          // Add as new template
          set((state) => ({
            templates: [
              ...state.templates,
              { ...editingTemplate, createdAt: now, updatedAt: now },
            ],
            editingTemplate: null,
          }));
        }
      },

      // Get a template by ID
      getTemplate: (id) => get().templates.find((t) => t.id === id),

      // Get all built-in templates
      getBuiltInTemplates: () => get().templates.filter((t) => t.isBuiltIn),

      // Get all user-created templates
      getUserTemplates: () => get().templates.filter((t) => !t.isBuiltIn),
    }),
    {
      name: 'zone-templates',
      storage: createJSONStorage(() => userStorage),
      partialize: (state) => ({
        // Only persist user templates and selection (not built-in templates)
        templates: state.templates.filter((t) => !t.isBuiltIn),
        selectedTemplateId: state.selectedTemplateId,
      }),
      // Merge persisted state with initial state (to include built-in templates)
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ZoneTemplateStore>;
        return {
          ...currentState,
          templates: [
            createCopaStandardTemplate(),
            ...(persisted.templates || []),
          ],
          selectedTemplateId:
            persisted.selectedTemplateId || COPA_STANDARD_TEMPLATE_ID,
        };
      },
    }
  )
);

// Helper to create a new blank template
export const createBlankTemplate = (name: string): Omit<ZoneTemplate, 'id' | 'createdAt' | 'updatedAt'> => ({
  name,
  description: '',
  front: { zones: [] },
  back: { zones: [] },
  card_width: CARD_WIDTH,
  card_height: CARD_HEIGHT,
  isBuiltIn: false,
});

// Reload templates when user changes (call this when auth state changes)
export const reloadUserTemplates = () => {
  const stored = localStorage.getItem(getStorageKey());
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.state?.templates) {
        useZoneTemplateStore.setState({
          templates: [createCopaStandardTemplate(), ...data.state.templates],
          selectedTemplateId:
            data.state.selectedTemplateId || COPA_STANDARD_TEMPLATE_ID,
        });
      }
    } catch (e) {
      console.error('Failed to load zone templates:', e);
    }
  } else {
    // No stored templates for this user, reset to defaults
    useZoneTemplateStore.setState({
      templates: [createCopaStandardTemplate()],
      selectedTemplateId: COPA_STANDARD_TEMPLATE_ID,
    });
  }
};
