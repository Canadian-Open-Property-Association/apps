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
  owner: string;
  repo: string;
  baseBranch?: string;
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
 */
export interface VdrConfig {
  baseUrl: string;
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
    owner: 'Canadian-Open-Property-Association',
    repo: 'governance',
    baseBranch: 'main',
  },
  vdr: {
    baseUrl: 'https://openpropertyassociation.ca',
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
      'forms-builder',
      'proof-templates',
      'test-issuer',
      'settings',
    ],
  },
};

/**
 * Available apps that can be enabled/disabled
 */
export const AVAILABLE_APPS = [
  {
    id: 'vct-builder',
    name: 'VCT Builder',
    description: 'Design verifiable credential types',
  },
  {
    id: 'forms-builder',
    name: 'Forms Builder',
    description: 'Create forms with VC verification',
  },
  {
    id: 'proof-templates',
    name: 'Proof Templates',
    description: 'Build proof request templates',
  },
  {
    id: 'test-issuer',
    name: 'Test Issuer',
    description: 'Issue test credentials',
  },
] as const;

/**
 * Apps that are always enabled (cannot be disabled)
 */
export const ALWAYS_ENABLED_APPS = ['settings'];
