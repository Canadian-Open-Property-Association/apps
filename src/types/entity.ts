// Entity Management Types

export type EntityType = 'issuer' | 'data-furnisher' | 'network-partner' | 'service-provider';

export type EntityStatus = 'active' | 'pending' | 'inactive';

export interface UserRef {
  id: string;
  login: string;
  name?: string;
}

export interface Entity {
  id: string;                    // Unique identifier (slug format)
  name: string;                  // Display name
  type: EntityType;
  description?: string;

  // Visual Identity
  logoUri?: string;              // Path to logo in GitHub (entities/logos/)
  primaryColor?: string;         // Brand color (hex)

  // Contact & Web
  website?: string;
  contactEmail?: string;

  // Technical Identity
  did?: string;                  // Decentralized Identifier (future)

  // Trust Registry Info (for issuers)
  credentialTypes?: string[];    // What credential types can this entity issue?
  regionsCovered?: string[];     // Geographic scope

  // Metadata
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: UserRef;
}

// Entity type display configuration
export const ENTITY_TYPE_CONFIG: Record<EntityType, { label: string; pluralLabel: string; color: string }> = {
  'issuer': {
    label: 'Issuer',
    pluralLabel: 'Issuers',
    color: 'blue',
  },
  'data-furnisher': {
    label: 'Data Furnisher',
    pluralLabel: 'Data Furnishers',
    color: 'green',
  },
  'network-partner': {
    label: 'Network Partner',
    pluralLabel: 'Network Partners',
    color: 'purple',
  },
  'service-provider': {
    label: 'Service Provider',
    pluralLabel: 'Service Providers',
    color: 'orange',
  },
};

// Status display configuration
export const ENTITY_STATUS_CONFIG: Record<EntityStatus, { label: string; color: string }> = {
  'active': {
    label: 'Active',
    color: 'green',
  },
  'pending': {
    label: 'Pending',
    color: 'yellow',
  },
  'inactive': {
    label: 'Inactive',
    color: 'gray',
  },
};

// Selection state for UI
export interface EntitySelection {
  entityId: string;
}
