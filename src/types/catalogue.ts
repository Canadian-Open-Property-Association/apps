// Data Catalogue Types - Vocabulary-First Design
// Based on schema.org vocabulary model where DataTypes are the primary concept

export interface UserRef {
  id: string;
  login: string;
  name?: string;
}

// ============================================
// Categories - for organizing data types
// ============================================

export interface DataTypeCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
}

// ============================================
// Property - attributes/fields of a data type
// Similar to schema.org Property
// ============================================

export type PropertyValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'array'
  | 'object'
  | 'currency'
  | 'url'
  | 'email'
  | 'phone';

// ============================================
// ProviderMapping - links a Property to an Entity (provider)
// This enables data harmonization at the property level
// ============================================

export interface ProviderMapping {
  entityId: string; // Reference to Entity (e.g., "copa-landcor")
  entityName?: string; // Denormalized for display
  providerFieldName: string; // The provider's original field name (e.g., "assessed_val")
  regionsCovered?: string[]; // Optional region override
  notes?: string; // Integration notes
  addedAt: string;
  addedBy?: UserRef;
}

export interface Property {
  id: string;
  name: string; // Technical name (e.g., "assessed_value") - canonical vocabulary name
  displayName: string; // Human-readable (e.g., "Assessed Value")
  description?: string;
  valueType: PropertyValueType;
  required: boolean;
  sampleValue?: string;
  path?: string; // JSON path like "property_details.bedrooms"
  metadata?: Record<string, unknown>;
  providerMappings?: ProviderMapping[]; // Which entities provide this property with field name mapping
}

// ============================================
// DataSource - links a DataType to an Entity
// This is the "who provides this data type" relationship
// ============================================

export interface DataSource {
  entityId: string; // Reference to Entity from Entity Manager
  entityName?: string; // Denormalized for display (populated from Entity Manager)
  regionsCovered?: string[]; // Optional override - if empty, use Entity's regions
  updateFrequency?: string; // How often data is refreshed (e.g., "daily", "monthly")
  notes?: string; // Integration notes
  apiEndpoint?: string; // Technical integration endpoint
  addedAt: string;
  addedBy?: UserRef;
}

// ============================================
// DataType - the primary vocabulary concept
// Similar to schema.org Type
// ============================================

export interface DataType {
  id: string; // Slug-style ID (e.g., "property-valuation")
  name: string; // Display name (e.g., "Property Valuation")
  description?: string;
  category: string; // Category ID (e.g., "property", "financial", "identity")

  // Hierarchy support (like schema.org type inheritance)
  parentTypeId?: string; // Reference to parent DataType for inheritance
  childTypeIds?: string[]; // Populated dynamically, not stored

  // Properties (attributes of this type)
  properties: Property[];

  // Data Sources (which entities provide this type)
  sources: DataSource[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: UserRef;
  updatedBy?: UserRef;
}

// ============================================
// API Response Types
// ============================================

export interface DataTypeWithCategory extends DataType {
  categoryName?: string; // Denormalized category name
}

export interface DataTypeHierarchy {
  dataType: DataType;
  children: DataTypeHierarchy[];
}

export interface CategoryWithTypes {
  category: DataTypeCategory;
  dataTypes: DataType[];
}

// ============================================
// Stats for display
// ============================================

export interface DataTypeStats {
  propertyCount: number;
  sourceCount: number;
}

export interface CatalogueStats {
  totalDataTypes: number;
  totalProperties: number;
  totalSources: number;
  categoryCounts: Record<string, number>;
}
