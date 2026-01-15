/**
 * Tenant Configuration Service
 *
 * Manages tenant-specific configuration including:
 * - Ecosystem identity (name, logo, tagline)
 * - GitHub repository settings
 * - VDR (Verifiable Data Registry) configuration
 * - Enabled apps
 *
 * Storage: {ASSETS_PATH}/tenant-config.json
 *
 * Future migration: When implementing multi-tenancy, this will move to:
 * - Per-tenant files: tenants/{slug}/tenant-config.json
 * - Or PostgreSQL tenants table
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assets directory for persistent storage
const ASSETS_DIR = process.env.ASSETS_PATH || path.join(__dirname, '../assets');
const TENANT_CONFIG_FILE = path.join(ASSETS_DIR, 'tenant-config.json');

/**
 * Default tenant configuration
 * Matches current hardcoded values for backward compatibility
 */
const DEFAULT_TENANT_CONFIG = {
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
    // token: undefined - optional, for private repos
    // organizationName: undefined - populated from GitHub API
    // organizationAvatarUrl: undefined - populated from GitHub API
    // isPrivate: undefined - populated from GitHub API
  },
  vdr: {
    // Note: baseUrl removed as redundant - repository URL is source of truth
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
      'data-dictionary',
      'entity-manager',
      'data-harmonization',
      'badges',
      'proofs-template-builder',
      'forms-builder',
      'test-issuer',
      'test-verifier',
      'credential-catalogue',
      'settings',
    ],
  },
};

/**
 * Ensure assets directory exists
 */
function ensureAssetsDir() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
}

/**
 * Load tenant configuration from file
 * Returns merged config with defaults for any missing fields
 * Handles backward compatibility: migrates old owner/repo to repositoryUrl
 */
export function getTenantConfig() {
  try {
    if (fs.existsSync(TENANT_CONFIG_FILE)) {
      const fileContent = fs.readFileSync(TENANT_CONFIG_FILE, 'utf-8');
      const savedConfig = JSON.parse(fileContent);

      // Handle backward compatibility: if old config has owner/repo but no repositoryUrl
      let githubConfig = { ...savedConfig.github };
      if (!githubConfig.repositoryUrl && githubConfig.owner && githubConfig.repo) {
        githubConfig.repositoryUrl = `https://github.com/${githubConfig.owner}/${githubConfig.repo}`;
        githubConfig.needsMigration = true; // Flag to show migration notice in UI
      }

      // Deep merge with defaults to ensure all fields exist
      return {
        ecosystem: {
          ...DEFAULT_TENANT_CONFIG.ecosystem,
          ...savedConfig.ecosystem,
        },
        github: {
          ...DEFAULT_TENANT_CONFIG.github,
          ...githubConfig,
        },
        vdr: {
          ...DEFAULT_TENANT_CONFIG.vdr,
          ...savedConfig.vdr,
          paths: {
            ...DEFAULT_TENANT_CONFIG.vdr.paths,
            ...savedConfig.vdr?.paths,
          },
        },
        apps: {
          ...DEFAULT_TENANT_CONFIG.apps,
          ...savedConfig.apps,
        },
        configuredAt: savedConfig.configuredAt,
        configuredBy: savedConfig.configuredBy,
        source: 'file',
      };
    }
  } catch (error) {
    console.error('Error loading tenant config:', error.message);
  }

  // Return defaults if no file exists
  return {
    ...DEFAULT_TENANT_CONFIG,
    source: 'defaults',
  };
}

/**
 * Save tenant configuration to file
 * @param {object} config - The configuration to save
 * @param {string} username - The user making the change
 */
export function saveTenantConfig(config, username) {
  ensureAssetsDir();

  const configToSave = {
    ecosystem: config.ecosystem,
    github: config.github,
    vdr: config.vdr,
    apps: config.apps,
    configuredAt: new Date().toISOString(),
    configuredBy: username,
  };

  fs.writeFileSync(TENANT_CONFIG_FILE, JSON.stringify(configToSave, null, 2));

  return {
    ...configToSave,
    source: 'file',
  };
}

/**
 * Update just the ecosystem configuration
 */
export function updateEcosystemConfig(ecosystem, username) {
  const current = getTenantConfig();
  return saveTenantConfig(
    {
      ...current,
      ecosystem: {
        ...current.ecosystem,
        ...ecosystem,
      },
    },
    username
  );
}

/**
 * Update just the GitHub configuration
 */
export function updateGitHubConfig(github, username) {
  const current = getTenantConfig();
  return saveTenantConfig(
    {
      ...current,
      github: {
        ...current.github,
        ...github,
      },
    },
    username
  );
}

/**
 * Update just the VDR configuration
 */
export function updateVdrConfig(vdr, username) {
  const current = getTenantConfig();
  return saveTenantConfig(
    {
      ...current,
      vdr: {
        ...current.vdr,
        ...vdr,
        paths: {
          ...current.vdr.paths,
          ...vdr.paths,
        },
      },
    },
    username
  );
}

/**
 * Update enabled apps
 */
export function updateAppsConfig(apps, username) {
  const current = getTenantConfig();
  return saveTenantConfig(
    {
      ...current,
      apps: {
        ...current.apps,
        ...apps,
      },
    },
    username
  );
}

/**
 * Reset tenant configuration to defaults
 */
export function resetTenantConfig() {
  if (fs.existsSync(TENANT_CONFIG_FILE)) {
    fs.unlinkSync(TENANT_CONFIG_FILE);
    return true;
  }
  return false;
}

/**
 * Get the default configuration (for reference)
 */
export function getDefaultTenantConfig() {
  return { ...DEFAULT_TENANT_CONFIG };
}
