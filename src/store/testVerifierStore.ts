/**
 * Test Verifier Store
 *
 * Zustand store for managing proof verification requests.
 * Handles template selection, proof request generation, and status tracking.
 */

import { create } from 'zustand';
import type {
  ProofRequest,
  ProofRequestListItem,
  ProofRequestStatus,
  VerifierOrbitConfig,
  CreateProofRequestRequest,
} from '../types/verifier';
import type { ProofTemplate } from '../types/proofTemplate';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

interface TestVerifierState {
  // Published templates (from Proof Template Builder)
  templates: ProofTemplate[];
  selectedTemplate: ProofTemplate | null;

  // Proof requests
  proofRequests: ProofRequestListItem[];
  currentProofRequest: ProofRequest | null;

  // Orbit config
  orbitConfig: VerifierOrbitConfig | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions - Templates
  fetchPublishedTemplates: () => Promise<void>;
  selectTemplate: (id: string | null) => void;

  // Actions - Proof Requests
  fetchProofRequests: () => Promise<void>;
  createProofRequest: (request: CreateProofRequestRequest) => Promise<ProofRequest>;
  fetchProofRequest: (id: string) => Promise<ProofRequest>;
  refreshProofRequestStatus: (id: string) => Promise<ProofRequest>;
  updateProofRequestStatusFromSocket: (credProofId: string, status: ProofRequestStatus, result?: unknown) => void;

  // Actions - Orbit
  checkOrbitConnection: () => Promise<void>;

  // Utility
  clearError: () => void;
  clearCurrentProofRequest: () => void;
}

export const useTestVerifierStore = create<TestVerifierState>((set, get) => ({
  // Initial state
  templates: [],
  selectedTemplate: null,
  proofRequests: [],
  currentProofRequest: null,
  orbitConfig: null,
  isLoading: false,
  error: null,

  // Fetch published templates from Proof Template Builder
  fetchPublishedTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/api/proof-templates/published`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          set({ templates: [], isLoading: false });
          return;
        }
        throw new Error('Failed to fetch published templates');
      }

      const templates = await response.json();
      set({ templates, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch templates',
        isLoading: false,
      });
    }
  },

  // Select a template for proof request
  selectTemplate: (id: string | null) => {
    if (!id) {
      set({ selectedTemplate: null });
      return;
    }

    const { templates } = get();
    const template = templates.find((t) => t.id === id);
    set({ selectedTemplate: template || null });
  },

  // Fetch proof request history
  fetchProofRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/api/test-verifier/history`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          set({ proofRequests: [], isLoading: false });
          return;
        }
        throw new Error('Failed to fetch proof requests');
      }

      const proofRequests = await response.json();
      set({ proofRequests, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch proof requests',
        isLoading: false,
      });
    }
  },

  // Create a new proof request
  createProofRequest: async (request: CreateProofRequestRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/api/test-verifier/proof-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create proof request');
      }

      const proofRequest = await response.json();
      set((state) => ({
        currentProofRequest: proofRequest,
        proofRequests: [
          {
            id: proofRequest.id,
            templateId: proofRequest.templateId,
            templateName: proofRequest.templateName,
            credentialFormat: proofRequest.credentialFormat,
            status: proofRequest.status,
            createdAt: proofRequest.createdAt,
            verifiedAt: proofRequest.verifiedAt,
          },
          ...state.proofRequests,
        ],
        isLoading: false,
      }));
      return proofRequest;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to create proof request',
        isLoading: false,
      });
      throw err;
    }
  },

  // Fetch a single proof request
  fetchProofRequest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/api/test-verifier/proof-request/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch proof request');
      }

      const proofRequest = await response.json();
      set({ currentProofRequest: proofRequest, isLoading: false });
      return proofRequest;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch proof request',
        isLoading: false,
      });
      throw err;
    }
  },

  // Refresh proof request status
  refreshProofRequestStatus: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/test-verifier/status/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh status');
      }

      const proofRequest = await response.json();

      // Update current proof request if it matches
      set((state) => {
        const updates: Partial<TestVerifierState> = {};

        if (state.currentProofRequest?.id === id) {
          updates.currentProofRequest = proofRequest;
        }

        // Update in list
        updates.proofRequests = state.proofRequests.map((pr) =>
          pr.id === id
            ? {
                ...pr,
                status: proofRequest.status,
                verifiedAt: proofRequest.verifiedAt,
              }
            : pr
        );

        return updates;
      });

      return proofRequest;
    } catch (err) {
      // Silently fail for polling errors
      console.error('Failed to refresh proof request status:', err);
      throw err;
    }
  },

  // Update proof request status from socket event
  updateProofRequestStatusFromSocket: (credProofId: string, status: ProofRequestStatus, result?: unknown) => {
    set((state) => {
      const updates: Partial<TestVerifierState> = {};

      // Update current proof request if credProofId matches
      if (state.currentProofRequest?.credProofId === credProofId) {
        updates.currentProofRequest = {
          ...state.currentProofRequest,
          status,
          verifiedAt: status === 'verified' ? new Date().toISOString() : state.currentProofRequest.verifiedAt,
          verificationResult: result ? (result as ProofRequest['verificationResult']) : state.currentProofRequest.verificationResult,
        };
      }

      // Update in list - find by matching credProofId
      updates.proofRequests = state.proofRequests.map((pr) => {
        // We need to check if this proof request's credProofId matches
        // Since we don't store credProofId in list items, we check by id
        if (state.currentProofRequest?.credProofId === credProofId && pr.id === state.currentProofRequest.id) {
          return {
            ...pr,
            status,
            verifiedAt: status === 'verified' ? new Date().toISOString() : pr.verifiedAt,
          };
        }
        return pr;
      });

      return updates;
    });
  },

  // Check Orbit connection
  checkOrbitConnection: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/test-verifier/orbit-status`, {
        credentials: 'include',
      });

      if (!response.ok) {
        set({ orbitConfig: { connected: false } });
        return;
      }

      const config = await response.json();
      set({ orbitConfig: config });
    } catch {
      set({ orbitConfig: { connected: false } });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Clear current proof request
  clearCurrentProofRequest: () => {
    set({ currentProofRequest: null, selectedTemplate: null });
  },
}));
