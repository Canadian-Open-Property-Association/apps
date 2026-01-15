/**
 * Tenant Configuration Types
 *
 * Defines the configuration structure for ecosystem/tenant-specific settings.
 * This prepares the platform for multi-tenancy while keeping single-tenant simple.
 *
 * Storage: {ASSETS_PATH}/tenant-config.json
 *
 * Future migration: When implementing multi-tenancy, this will move to:
 * - Per-tenant files: tenants/{slug}/tenant-config.json
 * - Or PostgreSQL tenants table
 */

/**
 * Ecosystem identity and branding
 */
export interface EcosystemConfig {
  name: string;
  tagline: string;
  logoUrl: string;
}

/**
 * GitHub repository configuration
 */
export interface GitHubConfig {
  repositoryUrl: string;           // Full GitHub URL (e.g., https://github.com/org/repo)
  token?: string;                  // GitHub Personal Access Token (for private repos)
  baseBranch?: string;             // Default branch for operations
  // Derived/cached from API:
  owner?: string;                  // Parsed from URL
  repo?: string;                   // Parsed from URL
  organizationName?: string;       // Fetched from GitHub API
  organizationAvatarUrl?: string;  // Fetched from GitHub API
  isPrivate?: boolean;             // Fetched from GitHub API
}

/**
 * VDR (Verifiable Data Registry) paths
 */
export interface VdrPaths {
  vct: string;
  schemas: string;
  contexts: string;
  entities: string;
  badges: string;
  proofTemplates: string;
}

/**
 * VDR configuration
 * Note: baseUrl removed as redundant - repository URL is the source of truth
 */
export interface VdrConfig {
  paths: VdrPaths;
}

/**
 * App access configuration
 */
export interface AppsConfig {
  enabledApps: string[];
}

/**
 * Complete tenant configuration
 */
export interface TenantConfig {
  ecosystem: EcosystemConfig;
  github: GitHubConfig;
  vdr: VdrConfig;
  apps: AppsConfig;
  configuredAt?: string;
  configuredBy?: string;
  source?: 'file' | 'defaults';
}

/**
 * Default tenant configuration
 * Matches current hardcoded values for backward compatibility
 */
export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  ecosystem: {
    name: 'Cornerstone Network',
    tagline: 'A digital trust toolkit for the Cornerstone Network ecosystem',
    logoUrl: '/cornerstone-logo.png',
  },
  github: {
    repositoryUrl: 'https://github.com/Canadian-Open-Property-Association/governance',
    baseBranch: 'main',
    // Derived fields (populated on save after API validation)
    owner: 'Canadian-Open-Property-Association',
    repo: 'governance',
  },
  vdr: {
    paths: {
      vct: 'credentials/vct',
      schemas: 'credentials/schemas',
      contexts: 'credentials/contexts',
      entities: 'credentials/entities',
      badges: 'credentials/badges',
      proofTemplates: 'credentials/proof-templates',
    },
  },
  apps: {
    enabledApps: [
      'vct-builder',
      'schema-builder',
      'entity-manager',
      'forms-builder',
      'proofs-template-builder',
      'badges',
      'data-dictionary',
      'data-harmonization',
      'test-issuer',
      'test-verifier',
      'credential-catalogue',
      'settings',
    ],
  },
};

/**
 * App category type - must match apps.tsx AppCategory
 */
export type AppCategory = 'governance' | 'testing' | 'admin';

/**
 * Available apps that can be enabled/disabled
 * This list should match apps.tsx with configurable: true
 */
export const AVAILABLE_APPS: ReadonlyArray<{
  id: string;
  name: string;
  description: string;
  category: AppCategory;
}> = [
  {
    id: 'vct-builder',
    name: 'VCT Builder',
    description: 'Design verifiable credential types',
    category: 'governance',
  },
  {
    id: 'schema-builder',
    name: 'Schema Builder',
    description: 'Create JSON schemas for credentials',
    category: 'governance',
  },
  {
    id: 'entity-manager',
    name: 'Entity Manager',
    description: 'Manage ecosystem entities and roles',
    category: 'governance',
  },
  {
    id: 'data-dictionary',
    name: 'Data Dictionary',
    description: 'Define data vocabulary',
    category: 'governance',
  },
  {
    id: 'data-harmonization',
    name: 'Data Harmonization',
    description: 'Map data between standards',
    category: 'governance',
  },
  {
    id: 'badges',
    name: 'Badges',
    description: 'Design achievement badges',
    category: 'governance',
  },
  {
    id: 'proofs-template-builder',
    name: 'Proof Template Builder',
    description: 'Build proof request templates',
    category: 'governance',
  },
  {
    id: 'forms-builder',
    name: 'Forms Builder',
    description: 'Create forms with VC verification',
    category: 'testing',
  },
  {
    id: 'test-issuer',
    name: 'Test Issuer',
    description: 'Issue test credentials',
    category: 'testing',
  },
  {
    id: 'credential-catalogue',
    name: 'Credential Catalogue',
    description: 'Import external credentials for verification',
    category: 'testing',
  },
  {
    id: 'test-verifier',
    name: 'Test Verifier',
    description: 'Verify credentials with proof requests',
    category: 'testing',
  },
];

/**
 * Apps that are always enabled (cannot be disabled)
 */
export const ALWAYS_ENABLED_APPS = ['settings'];
