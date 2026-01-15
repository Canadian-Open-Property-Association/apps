/**
 * VDR Path Hook
 *
 * Provides access to VDR (Verifiable Data Registry) paths from tenant configuration.
 * Used by publish modals to determine where to save files in the GitHub repository.
 *
 * @example
 * ```tsx
 * const { getPath, getFullUrl } = useVdrPaths();
 *
 * // Get repository path for a VCT file
 * const path = getPath('vct', 'my-credential.json');
 * // Returns: "credentials/vct/my-credential.json"
 *
 * // Get full URL for a schema
 * const url = getFullUrl('schemas', 'my-schema.schema.json');
 * // Returns: "https://example.com/credentials/schemas/my-schema.schema.json"
 * ```
 */

import { useAdminStore } from '../store/adminStore';
import type { VdrPaths } from '../types/tenantConfig';

// Default paths matching current hardcoded values
const DEFAULT_PATHS: VdrPaths = {
  vct: 'credentials/vct',
  schemas: 'credentials/schemas',
  contexts: 'credentials/contexts',
  entities: 'credentials/entities',
  badges: 'credentials/badges',
  proofTemplates: 'credentials/proof-templates',
};

const DEFAULT_BASE_URL = 'https://openpropertyassociation.ca';

export type VdrPathType = keyof VdrPaths;

export function useVdrPaths() {
  const tenantConfig = useAdminStore((state) => state.tenantConfig);
  const fetchTenantConfig = useAdminStore((state) => state.fetchTenantConfig);

  /**
   * Get the base path for a specific content type
   */
  const getBasePath = (type: VdrPathType): string => {
    return tenantConfig?.vdr?.paths?.[type] || DEFAULT_PATHS[type];
  };

  /**
   * Get full repository path for a file
   * @param type - The VDR content type (vct, schemas, contexts, etc.)
   * @param filename - The filename to append
   * @returns Full path like "credentials/vct/my-file.json"
   */
  const getPath = (type: VdrPathType, filename: string): string => {
    const basePath = getBasePath(type);
    // Remove leading/trailing slashes and join
    const cleanBase = basePath.replace(/^\/|\/$/g, '');
    const cleanFilename = filename.replace(/^\//, '');
    return `${cleanBase}/${cleanFilename}`;
  };

  /**
   * Get full URL for a published file
   * @param type - The VDR content type
   * @param filename - The filename
   * @returns Full URL like "https://example.com/credentials/vct/my-file.json"
   */
  const getFullUrl = (type: VdrPathType, filename: string): string => {
    // Base URL is now derived from GitHub repository or uses default
    // In the future, this could construct a GitHub Pages URL from the repository
    const baseUrl = DEFAULT_BASE_URL;
    const path = getPath(type, filename);
    // Remove trailing slash from baseUrl and join
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/${path}`;
  };

  /**
   * Get the VDR base URL
   * Note: baseUrl was removed from VdrConfig as redundant with GitHub repository URL
   */
  const getBaseUrl = (): string => {
    return DEFAULT_BASE_URL;
  };

  /**
   * Get GitHub repository configuration
   */
  const getGitHubConfig = () => {
    return {
      owner: tenantConfig?.github?.owner || 'Canadian-Open-Property-Association',
      repo: tenantConfig?.github?.repo || 'governance',
      baseBranch: tenantConfig?.github?.baseBranch || 'main',
    };
  };

  /**
   * Check if tenant config is loaded
   */
  const isConfigLoaded = (): boolean => {
    return tenantConfig !== null;
  };

  /**
   * Ensure tenant config is loaded (call on component mount if needed)
   */
  const ensureConfigLoaded = async (): Promise<void> => {
    if (!tenantConfig) {
      await fetchTenantConfig();
    }
  };

  return {
    getPath,
    getFullUrl,
    getBasePath,
    getBaseUrl,
    getGitHubConfig,
    isConfigLoaded,
    ensureConfigLoaded,
    tenantConfig,
  };
}
