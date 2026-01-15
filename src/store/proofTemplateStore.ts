/**
 * Proof Template Store
 *
 * Zustand store for managing proof templates in the Proof Templates Builder app.
 * All data is stored in PostgreSQL via the API.
 *
 * Key features:
 * - References credentials from Credential Catalogue
 * - Supports multiple credential formats
 * - Publishing to Test Verifier app
 */

import { create } from 'zustand';
import {
  ProofTemplate,
  ProofTemplateListItem,
  ProofTemplateMetadata,
  RequestedCredential,
  RequestedAttribute,
  Predicate,
  CredentialFormat,
  CreateProofTemplateRequest,
  UpdateProofTemplateRequest,
  ProofTemplateType,
  DEFAULT_PROOF_TEMPLATE_CATEGORIES,
  DEFAULT_REQUESTED_CREDENTIAL,
  DEFAULT_REQUESTED_ATTRIBUTE,
  DEFAULT_PREDICATE,
} from '../types/proofTemplate';
import type { CatalogueCredential } from '../types/catalogue';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// API client for proof templates
const proofTemplatesApi = {
  async list(): Promise<ProofTemplateListItem[]> {
    const response = await fetch(`${API_BASE}/api/proof-templates`, {
      credentials: 'include',
    });
    if (!response.ok) {
      if (response.status === 401) return [];
      if (response.status === 503) {
        console.warn('Proof Templates: Database unavailable');
        return [];
      }
      throw new Error('Failed to fetch proof templates');
    }
    return response.json();
  },

  async get(id: string): Promise<ProofTemplate> {
    const response = await fetch(`${API_BASE}/api/proof-templates/${id}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch proof template');
    }
    return response.json();
  },

  async create(data: CreateProofTemplateRequest): Promise<ProofTemplate> {
    const response = await fetch(`${API_BASE}/api/proof-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create proof template');
    }
    return response.json();
  },

  async update(id: string, data: UpdateProofTemplateRequest): Promise<ProofTemplate> {
    const response = await fetch(`${API_BASE}/api/proof-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update proof template');
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/proof-templates/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to delete proof template');
    }
  },

  async clone(id: string): Promise<ProofTemplate> {
    const response = await fetch(`${API_BASE}/api/proof-templates/${id}/clone`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to clone proof template');
    }
    return response.json();
  },

  async publishToVerifier(id: string, enabled: boolean): Promise<void> {
    const response = await fetch(`${API_BASE}/api/proof-templates/${id}/publish-to-verifier`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ enabled }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update verifier status');
    }
  },
};

// API for fetching catalogue credentials
const catalogueApi = {
  async getCredentialsByFormat(format: CredentialFormat): Promise<CatalogueCredential[]> {
    // Map our format to catalogue format
    const catalogueFormat = mapToCatalogueFormat(format);
    const response = await fetch(`${API_BASE}/api/credential-catalogue?format=${catalogueFormat}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch credentials from catalogue');
    }
    return response.json();
  },

  async getAllCredentials(): Promise<CatalogueCredential[]> {
    const response = await fetch(`${API_BASE}/api/credential-catalogue`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch credentials from catalogue');
    }
    return response.json();
  },
};

// Map our credential format to catalogue format
function mapToCatalogueFormat(format: CredentialFormat): string {
  const mapping: Record<CredentialFormat, string> = {
    'anoncreds': 'anoncreds',
    'w3c-jsonld': 'w3c-json-ld',
    'w3c-sd-jwt': 'w3c-sd-jwt',
    'iso-18013-5': 'iso-mdl',
  };
  return mapping[format] || format;
}

// Store state interface
interface ProofTemplateState {
  // Data
  templates: ProofTemplateListItem[];
  currentTemplate: ProofTemplate | null;
  databaseAvailable: boolean;

  // Catalogue integration
  catalogueCredentials: CatalogueCredential[];
  filteredCatalogueCredentials: CatalogueCredential[];

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  selectedCredentialId: string | null;

  // New UI state for single-page layout
  selectedTemplateId: string | null;
  showSidebar: boolean;
  showJsonPreview: boolean;
  searchQuery: string;

  // Template types (categories)
  templateTypes: ProofTemplateType[];

  // Actions - API
  fetchTemplates: () => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  createTemplate: (name: string, credentialFormat: CredentialFormat, description?: string, ecosystemTag?: string) => Promise<ProofTemplate>;
  saveTemplate: () => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  cloneTemplate: (id: string) => Promise<ProofTemplate>;
  publishToVerifier: (id: string, enabled: boolean) => Promise<void>;

  // Actions - Local editing
  updateTemplateName: (name: string) => void;
  updateTemplateDescription: (description: string) => void;
  updateTemplateVersion: (version: string) => void;
  updateTemplateMetadata: (metadata: Partial<ProofTemplateMetadata>) => void;
  updateCredentialFormat: (format: CredentialFormat) => void;

  // Actions - Requested Credentials
  addRequestedCredential: (catalogueCredential: CatalogueCredential) => void;
  updateRequestedCredential: (credentialId: string, updates: Partial<RequestedCredential>) => void;
  removeRequestedCredential: (credentialId: string) => void;
  selectCredential: (credentialId: string | null) => void;

  // Actions - Requested Attributes
  addRequestedAttribute: (credentialId: string, attributeName: string) => void;
  updateRequestedAttribute: (credentialId: string, attributeId: string, updates: Partial<RequestedAttribute>) => void;
  removeRequestedAttribute: (credentialId: string, attributeId: string) => void;
  toggleAllAttributes: (credentialId: string, selected: boolean) => void;

  // Actions - Predicates
  addPredicate: (credentialId: string, attributeName: string) => void;
  updatePredicate: (credentialId: string, predicateId: string, updates: Partial<Predicate>) => void;
  removePredicate: (credentialId: string, predicateId: string) => void;

  // Actions - Catalogue Integration
  fetchCatalogueCredentials: () => Promise<void>;
  fetchCatalogueCredentialsByFormat: (format: CredentialFormat) => Promise<void>;

  // Utility actions
  clearCurrentTemplate: () => void;
  clearError: () => void;
  setError: (error: string) => void;

  // New UI actions for single-page layout
  setSelectedTemplateId: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleJsonPreview: () => void;
  setSearchQuery: (query: string) => void;

  // Template types actions
  fetchTemplateTypes: () => Promise<void>;
  addTemplateType: (name: string) => Promise<void>;
  deleteTemplateType: (id: string) => Promise<void>;
}

export const useProofTemplateStore = create<ProofTemplateState>((set, get) => ({
  // Initial state
  templates: [],
  currentTemplate: null,
  databaseAvailable: true,
  catalogueCredentials: [],
  filteredCatalogueCredentials: [],
  isLoading: false,
  isSaving: false,
  error: null,
  selectedCredentialId: null,

  // New UI state for single-page layout
  selectedTemplateId: null,
  showSidebar: true,
  showJsonPreview: true,
  searchQuery: '',

  // Template types - load from localStorage or use defaults
  templateTypes: (() => {
    try {
      const stored = localStorage.getItem('proofTemplateTypes');
      if (stored) {
        return JSON.parse(stored) as ProofTemplateType[];
      }
    } catch {
      // Ignore parse errors
    }
    // Return defaults if nothing stored
    return DEFAULT_PROOF_TEMPLATE_CATEGORIES.map((cat) => ({
      id: cat.value,
      name: cat.label,
    }));
  })(),

  // Fetch all templates for current user
  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await proofTemplatesApi.list();
      set({ templates, databaseAvailable: true, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch proof templates';
      set({ error: message, isLoading: false, databaseAvailable: false });
    }
  },

  // Fetch a single template by ID
  fetchTemplate: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const template = await proofTemplatesApi.get(id);
      set({ currentTemplate: template, isLoading: false, selectedCredentialId: null });
      // Also fetch catalogue credentials for the template's format
      if (template.credentialFormat) {
        get().fetchCatalogueCredentialsByFormat(template.credentialFormat);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch proof template';
      set({ error: message, isLoading: false });
    }
  },

  // Create a new template
  createTemplate: async (name: string, credentialFormat: CredentialFormat, description?: string, ecosystemTag?: string) => {
    set({ isLoading: true, error: null });
    try {
      const template = await proofTemplatesApi.create({
        name,
        credentialFormat,
        description,
        ecosystemTag,
      });
      set((state) => ({
        templates: [
          {
            id: template.id,
            name: template.name,
            description: template.description || '',
            credentialFormat: template.credentialFormat,
            status: template.status,
            credentialCount: template.requestedCredentials.length,
            publishedToVerifier: template.publishedToVerifier,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt,
          },
          ...state.templates,
        ],
        currentTemplate: template,
        isLoading: false,
      }));
      // Fetch catalogue credentials for this format
      get().fetchCatalogueCredentialsByFormat(credentialFormat);
      return template;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create proof template';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Save current template to database
  saveTemplate: async () => {
    const { currentTemplate } = get();
    if (!currentTemplate) return;

    set({ isSaving: true, error: null });
    try {
      const updated = await proofTemplatesApi.update(currentTemplate.id, {
        name: currentTemplate.name,
        description: currentTemplate.description,
        version: currentTemplate.version,
        requestedCredentials: currentTemplate.requestedCredentials,
        metadata: currentTemplate.metadata,
        publishedToVerifier: currentTemplate.publishedToVerifier,
      });
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === updated.id
            ? {
                ...t,
                name: updated.name,
                description: updated.description,
                credentialFormat: updated.credentialFormat,
                credentialCount: updated.requestedCredentials.length,
                publishedToVerifier: updated.publishedToVerifier,
                updatedAt: updated.updatedAt,
              }
            : t
        ),
        currentTemplate: updated,
        isSaving: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save proof template';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  // Delete a template
  deleteTemplate: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await proofTemplatesApi.delete(id);
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        currentTemplate: state.currentTemplate?.id === id ? null : state.currentTemplate,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete proof template';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Clone a template
  cloneTemplate: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const clonedTemplate = await proofTemplatesApi.clone(id);
      set((state) => ({
        templates: [
          {
            id: clonedTemplate.id,
            name: clonedTemplate.name,
            description: clonedTemplate.description,
            credentialFormat: clonedTemplate.credentialFormat,
            status: clonedTemplate.status,
            credentialCount: clonedTemplate.requestedCredentials.length,
            publishedToVerifier: clonedTemplate.publishedToVerifier,
            createdAt: clonedTemplate.createdAt,
            updatedAt: clonedTemplate.updatedAt,
          },
          ...state.templates,
        ],
        isLoading: false,
      }));
      return clonedTemplate;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clone proof template';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Publish to Test Verifier
  publishToVerifier: async (id: string, enabled: boolean) => {
    set({ isLoading: true, error: null });
    try {
      await proofTemplatesApi.publishToVerifier(id, enabled);
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? { ...t, publishedToVerifier: enabled } : t
        ),
        currentTemplate: state.currentTemplate?.id === id
          ? { ...state.currentTemplate, publishedToVerifier: enabled }
          : state.currentTemplate,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update verifier status';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Local editing - name
  updateTemplateName: (name: string) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? { ...state.currentTemplate, name }
        : null,
    }));
  },

  // Local editing - description
  updateTemplateDescription: (description: string) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? { ...state.currentTemplate, description }
        : null,
    }));
  },

  // Local editing - version
  updateTemplateVersion: (version: string) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? { ...state.currentTemplate, version }
        : null,
    }));
  },

  // Local editing - metadata
  updateTemplateMetadata: (metadata: Partial<ProofTemplateMetadata>) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            metadata: { ...state.currentTemplate.metadata, ...metadata },
          }
        : null,
    }));
  },

  // Update credential format (clears requested credentials since format changed)
  updateCredentialFormat: (format: CredentialFormat) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            credentialFormat: format,
            requestedCredentials: [], // Clear since format changed
          }
        : null,
    }));
    // Fetch credentials for new format
    get().fetchCatalogueCredentialsByFormat(format);
  },

  // Add a requested credential from catalogue
  addRequestedCredential: (catalogueCredential: CatalogueCredential) => {
    const newCredential: RequestedCredential = {
      ...DEFAULT_REQUESTED_CREDENTIAL,
      id: generateId(),
      catalogueCredentialId: catalogueCredential.id,
      credentialName: catalogueCredential.name,
      restrictions: {
        schemaId: catalogueCredential.schemaId,
        credentialDefinitionId: catalogueCredential.credDefId,
        issuerDid: catalogueCredential.issuerDid,
      },
      availableAttributes: catalogueCredential.attributes,
      requestedAttributes: [],
      predicates: [],
    };

    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            requestedCredentials: [...state.currentTemplate.requestedCredentials, newCredential],
          }
        : null,
      selectedCredentialId: newCredential.id,
    }));
  },

  // Update a requested credential
  updateRequestedCredential: (credentialId: string, updates: Partial<RequestedCredential>) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            requestedCredentials: state.currentTemplate.requestedCredentials.map((cred) =>
              cred.id === credentialId ? { ...cred, ...updates } : cred
            ),
          }
        : null,
    }));
  },

  // Remove a requested credential
  removeRequestedCredential: (credentialId: string) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            requestedCredentials: state.currentTemplate.requestedCredentials.filter(
              (cred) => cred.id !== credentialId
            ),
          }
        : null,
      selectedCredentialId: state.selectedCredentialId === credentialId ? null : state.selectedCredentialId,
    }));
  },

  // Select a credential for editing
  selectCredential: (credentialId: string | null) => {
    set({ selectedCredentialId: credentialId });
  },

  // Add a requested attribute to a credential
  addRequestedAttribute: (credentialId: string, attributeName: string) => {
    const newAttribute: RequestedAttribute = {
      ...DEFAULT_REQUESTED_ATTRIBUTE,
      id: generateId(),
      attributeName,
      label: attributeName, // Default label to attribute name
    };

    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            requestedCredentials: state.currentTemplate.requestedCredentials.map((cred) =>
              cred.id === credentialId
                ? {
                    ...cred,
                    requestedAttributes: [...cred.requestedAttributes, newAttribute],
                  }
                : cred
            ),
          }
        : null,
    }));
  },

  // Update a requested attribute
  updateRequestedAttribute: (credentialId: string, attributeId: string, updates: Partial<RequestedAttribute>) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            requestedCredentials: state.currentTemplate.requestedCredentials.map((cred) =>
              cred.id === credentialId
                ? {
                    ...cred,
                    requestedAttributes: cred.requestedAttributes.map((attr) =>
                      attr.id === attributeId ? { ...attr, ...updates } : attr
                    ),
                  }
                : cred
            ),
          }
        : null,
    }));
  },

  // Remove a requested attribute
  removeRequestedAttribute: (credentialId: string, attributeId: string) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            requestedCredentials: state.currentTemplate.requestedCredentials.map((cred) =>
              cred.id === credentialId
                ? {
                    ...cred,
                    requestedAttributes: cred.requestedAttributes.filter((attr) => attr.id !== attributeId),
                  }
                : cred
            ),
          }
        : null,
    }));
  },

  // Toggle all attributes for a credential
  toggleAllAttributes: (credentialId: string, selected: boolean) => {
    set((state) => {
      if (!state.currentTemplate) return state;

      const credential = state.currentTemplate.requestedCredentials.find((c) => c.id === credentialId);
      if (!credential) return state;

      let newAttributes: RequestedAttribute[];
      if (selected) {
        // Add all available attributes that aren't already added
        const existingNames = new Set(credential.requestedAttributes.map((a) => a.attributeName));
        const newAttrs = credential.availableAttributes
          .filter((name) => !existingNames.has(name))
          .map((name) => ({
            ...DEFAULT_REQUESTED_ATTRIBUTE,
            id: generateId(),
            attributeName: name,
            label: name,
          }));
        newAttributes = [...credential.requestedAttributes, ...newAttrs];
      } else {
        // Remove all attributes
        newAttributes = [];
      }

      return {
        currentTemplate: {
          ...state.currentTemplate,
          requestedCredentials: state.currentTemplate.requestedCredentials.map((cred) =>
            cred.id === credentialId
              ? { ...cred, requestedAttributes: newAttributes }
              : cred
          ),
        },
      };
    });
  },

  // Add a predicate to a credential
  addPredicate: (credentialId: string, attributeName: string) => {
    const newPredicate: Predicate = {
      ...DEFAULT_PREDICATE,
      id: generateId(),
      attributeName,
      label: `${attributeName} check`,
    };

    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            requestedCredentials: state.currentTemplate.requestedCredentials.map((cred) =>
              cred.id === credentialId
                ? {
                    ...cred,
                    predicates: [...cred.predicates, newPredicate],
                  }
                : cred
            ),
          }
        : null,
    }));
  },

  // Update a predicate
  updatePredicate: (credentialId: string, predicateId: string, updates: Partial<Predicate>) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            requestedCredentials: state.currentTemplate.requestedCredentials.map((cred) =>
              cred.id === credentialId
                ? {
                    ...cred,
                    predicates: cred.predicates.map((pred) =>
                      pred.id === predicateId ? { ...pred, ...updates } : pred
                    ),
                  }
                : cred
            ),
          }
        : null,
    }));
  },

  // Remove a predicate
  removePredicate: (credentialId: string, predicateId: string) => {
    set((state) => ({
      currentTemplate: state.currentTemplate
        ? {
            ...state.currentTemplate,
            requestedCredentials: state.currentTemplate.requestedCredentials.map((cred) =>
              cred.id === credentialId
                ? {
                    ...cred,
                    predicates: cred.predicates.filter((pred) => pred.id !== predicateId),
                  }
                : cred
            ),
          }
        : null,
    }));
  },

  // Fetch all catalogue credentials
  fetchCatalogueCredentials: async () => {
    try {
      const credentials = await catalogueApi.getAllCredentials();
      set({ catalogueCredentials: credentials });
    } catch (error) {
      console.error('Failed to fetch catalogue credentials:', error);
    }
  },

  // Fetch catalogue credentials by format
  fetchCatalogueCredentialsByFormat: async (format: CredentialFormat) => {
    try {
      const credentials = await catalogueApi.getCredentialsByFormat(format);
      set({ filteredCatalogueCredentials: credentials });
    } catch (error) {
      console.error('Failed to fetch catalogue credentials by format:', error);
      // Fall back to filtering from all credentials
      const { catalogueCredentials } = get();
      const catalogueFormat = mapToCatalogueFormat(format);
      const filtered = catalogueCredentials.filter((c) => c.credentialFormat === catalogueFormat);
      set({ filteredCatalogueCredentials: filtered });
    }
  },

  // Clear current template
  clearCurrentTemplate: () => {
    set({ currentTemplate: null, selectedCredentialId: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set error
  setError: (error: string) => {
    set({ error });
  },

  // New UI actions for single-page layout
  setSelectedTemplateId: (id: string | null) => {
    set({ selectedTemplateId: id, selectedCredentialId: null });
    // Also fetch the template if an ID is provided
    if (id) {
      get().fetchTemplate(id);
    } else {
      get().clearCurrentTemplate();
    }
  },

  toggleSidebar: () => {
    set((state) => ({ showSidebar: !state.showSidebar }));
  },

  toggleJsonPreview: () => {
    set((state) => ({ showJsonPreview: !state.showJsonPreview }));
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // Template types actions
  fetchTemplateTypes: async () => {
    // Load types from localStorage
    try {
      const stored = localStorage.getItem('proofTemplateTypes');
      if (stored) {
        const types = JSON.parse(stored) as ProofTemplateType[];
        set({ templateTypes: types });
      }
    } catch {
      // Ignore parse errors, use current state
    }
  },

  addTemplateType: async (name: string) => {
    const id = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newType: ProofTemplateType = { id, name };

    set((state) => {
      // Check for duplicates
      if (state.templateTypes.some((t) => t.id === id)) {
        return state;
      }

      const updatedTypes = [...state.templateTypes, newType];
      // Save all types to localStorage
      localStorage.setItem('proofTemplateTypes', JSON.stringify(updatedTypes));

      return { templateTypes: updatedTypes };
    });
  },

  deleteTemplateType: async (id: string) => {
    set((state) => {
      const updatedTypes = state.templateTypes.filter((t) => t.id !== id);
      // Save all types to localStorage
      localStorage.setItem('proofTemplateTypes', JSON.stringify(updatedTypes));

      return { templateTypes: updatedTypes };
    });
  },
}));
