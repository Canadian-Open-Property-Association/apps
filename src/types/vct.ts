// VCT (Verifiable Credential Type) TypeScript Interfaces
// Based on SD-JWT-VC specification (draft-ietf-oauth-sd-jwt-vc)

export interface VCTLogo {
  uri: string;
  'uri#integrity'?: string;
  alt_text?: string;
}

export interface VCTBackgroundImage {
  uri: string;
  'uri#integrity'?: string;
}

export interface VCTSimpleRendering {
  background_color?: string;
  text_color?: string;
  font_family?: string;
  logo?: VCTLogo;
  background_image?: VCTBackgroundImage;
}

// Available font families for card rendering
export const FONT_FAMILY_OPTIONS = [
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
] as const;

export interface VCTSvgTemplateProperties {
  orientation?: 'portrait' | 'landscape';
  color_scheme?: 'light' | 'dark';
  contrast?: 'normal' | 'high';
}

export interface VCTSvgTemplate {
  uri: string;
  'uri#integrity'?: string;
  properties?: VCTSvgTemplateProperties;
}

// COPA Card Display Standard - Front/Back SVG Templates
export interface VCTSvgTemplates {
  front?: VCTSvgTemplate;
  back?: VCTSvgTemplate;
}

export interface VCTRendering {
  simple?: VCTSimpleRendering;
  svg_templates?: VCTSvgTemplate[] | VCTSvgTemplates; // Support both legacy array and COPA front/back
}

// COPA Card Display Standard - Card Element Positions
export type CardElementPosition =
  | 'top_left'
  | 'top_right'
  | 'center'
  | 'center_below'
  | 'bottom_left'
  | 'bottom_right'
  | 'top'
  | 'center_bottom';

// COPA Card Display Standard - Front Card Element
export interface VCTFrontCardElement {
  position: CardElementPosition;
  claim_path?: string; // JSONPath like "$.property_address"
  value?: string; // Static value for fixed elements
  label?: string; // Optional display label
  logo_uri?: string; // Logo/icon image URI (for portfolio_issuer, credential_issuer, network_mark)
}

// COPA Card Display Standard - Evidence Source Types
export type EvidenceSourceType =
  | 'linked_credential'
  | 'data_furnisher'
  | 'identity_verification'
  | 'regulatory_body';

// COPA Card Display Standard - Evidence Source
export interface VCTEvidenceSource {
  type: EvidenceSourceType;
  id: string;
  display: string;
  badge?: 'initials' | 'logo';
  logo_uri?: string;
  description: string;
}

// COPA Card Display Standard - Back Card Elements
export interface VCTBackCardElements {
  metadata?: {
    position: CardElementPosition;
    fields: string[]; // ['credential_type', 'issued_at', 'expires_at', 'status']
  };
  evidence?: {
    position: CardElementPosition;
    sources: VCTEvidenceSource[];
  };
}

// COPA Card Display Standard - Front Card Elements (6 standard positions)
export interface VCTFrontCardElements {
  portfolio_issuer?: VCTFrontCardElement;
  network_mark?: VCTFrontCardElement;
  primary_attribute?: VCTFrontCardElement;
  secondary_attribute?: VCTFrontCardElement;
  credential_name?: VCTFrontCardElement;
  credential_issuer?: VCTFrontCardElement;
}

// COPA Card Display Standard - Card Elements Container
export interface VCTCardElements {
  front?: VCTFrontCardElements;
  back?: VCTBackCardElements;
}

// ============================================
// DYNAMIC ZONE-BASED ELEMENTS (Forward declarations)
// ============================================

// Content type for zone elements
export type ZoneContentType = 'text' | 'image';

// Dynamic element bound to a zone
export interface DynamicCardElement {
  zone_id: string; // Reference to zone in template
  content_type: ZoneContentType; // text or image
  claim_path?: string; // JSONPath for dynamic data
  static_value?: string; // Static text/value
  logo_uri?: string; // Image URL for image content
  label?: string; // Optional display label
}

// Dynamic card elements using zone references
export interface DynamicCardElements {
  template_id: string; // Reference to zone template
  front: DynamicCardElement[]; // Elements for front of card
  back: DynamicCardElement[]; // Elements for back of card
}

export interface VCTClaimDisplay {
  locale: string;
  label: string;
  description?: string;
}

export interface VCTClaim {
  path: (string | null | number)[];
  display: VCTClaimDisplay[];
  mandatory?: boolean;
  sd?: 'always' | 'allowed' | 'never';
  svg_id?: string;
}

export interface VCTDisplay {
  locale: string;
  name: string;
  description?: string;
  rendering?: VCTRendering;
  card_elements?: VCTCardElements; // COPA Card Display Standard (legacy)
  dynamic_card_elements?: DynamicCardElements; // New dynamic zone-based elements
}

export interface VCT {
  vct: string;
  name: string;
  description?: string;
  extends?: string;
  'extends#integrity'?: string;
  schema_uri?: string;
  'schema_uri#integrity'?: string;
  display: VCTDisplay[];
  claims: VCTClaim[];
}

// Sample data for preview
export interface SampleData {
  [claimPath: string]: string;
}

// Saved project structure
export interface SavedProject {
  id: string;
  name: string;
  vct: VCT;
  sampleData: SampleData;
  createdAt: string;
  updatedAt: string;
}

// Available locales for the app
export const AVAILABLE_LOCALES = [
  { code: 'en-CA', name: 'English (Canada)' },
  { code: 'fr-CA', name: 'Français (Canada)' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
] as const;

// Store state
export interface VCTStore {
  // Current VCT being edited
  currentVct: VCT;
  sampleData: SampleData;
  currentProjectId: string | null;
  currentProjectName: string;
  isDirty: boolean;

  // Saved projects
  savedProjects: SavedProject[];

  // Actions
  setVct: (vct: VCT) => void;
  updateVctField: <K extends keyof VCT>(field: K, value: VCT[K]) => void;
  setSampleData: (data: SampleData) => void;
  updateSampleDataField: (path: string, value: string) => void;
  updateProjectName: (name: string) => void;

  // Display actions
  addDisplay: (locale: string) => void;
  updateDisplay: (index: number, display: Partial<VCTDisplay>) => void;
  removeDisplay: (index: number) => void;

  // Claim actions
  addClaim: () => void;
  updateClaim: (index: number, claim: Partial<VCTClaim>) => void;
  removeClaim: (index: number) => void;
  syncClaimLocales: () => void;

  // Project actions
  newProject: () => void;
  saveProject: (name: string) => Promise<void>;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => Promise<void>;

  // Import/Export
  exportVct: () => string;
  importVct: (json: string) => void;

  // COPA Card Display Standard actions
  updateCardElements: (displayIndex: number, cardElements: Partial<VCTCardElements>) => void;
  updateFrontElement: (
    displayIndex: number,
    elementKey: keyof VCTFrontCardElements,
    element: Partial<VCTFrontCardElement>
  ) => void;
  addEvidenceSource: (displayIndex: number, source: VCTEvidenceSource) => void;
  updateEvidenceSource: (
    displayIndex: number,
    sourceId: string,
    source: Partial<VCTEvidenceSource>
  ) => void;
  removeEvidenceSource: (displayIndex: number, sourceId: string) => void;
  updateSvgTemplateByFace: (
    displayIndex: number,
    face: 'front' | 'back',
    template: VCTSvgTemplate | null
  ) => void;

  // Dynamic zone element actions
  updateDynamicElement: (
    displayIndex: number,
    face: 'front' | 'back',
    zoneId: string,
    element: Partial<DynamicCardElement>
  ) => void;
  setDynamicCardElementsTemplate: (displayIndex: number, templateId: string) => void;
}

// Default empty VCT - starts with only en-CA
export const createDefaultVct = (): VCT => ({
  vct: '',
  name: '',
  description: '',
  schema_uri: '',
  display: [
    {
      locale: 'en-CA',
      name: '',
      description: '',
      rendering: {
        simple: {
          background_color: '#1E3A5F',
          text_color: '#FFFFFF',
        },
      },
    },
  ],
  claims: [],
});

// Helper to get locale display name
export const getLocaleName = (code: string): string => {
  const locale = AVAILABLE_LOCALES.find((l) => l.code === code);
  return locale?.name || code;
};

// COPA Card Display Standard - Helper Functions

// Check if svg_templates is in COPA front/back format
export const isFrontBackFormat = (
  templates: VCTSvgTemplate[] | VCTSvgTemplates | undefined
): templates is VCTSvgTemplates => {
  if (!templates) return false;
  if (Array.isArray(templates)) return false;
  return 'front' in templates || 'back' in templates;
};

// Check if svg_templates is in legacy array format
export const isLegacyFormat = (
  templates: VCTSvgTemplate[] | VCTSvgTemplates | undefined
): templates is VCTSvgTemplate[] => {
  return Array.isArray(templates);
};

// Convert legacy array format to COPA front/back format (for backward compatibility when importing)
export const migrateToFrontBack = (templates: VCTSvgTemplate[]): VCTSvgTemplates => {
  return {
    front: templates[0] || undefined,
    back: templates[1] || undefined,
  };
};

// Evidence source type labels
export const EVIDENCE_SOURCE_TYPE_LABELS: Record<EvidenceSourceType, string> = {
  linked_credential: 'Linked Credential',
  data_furnisher: 'Data Furnisher',
  identity_verification: 'Identity Verification',
  regulatory_body: 'Regulatory Body',
};

// Metadata field options for back of card
export const METADATA_FIELD_OPTIONS = [
  { id: 'credential_type', label: 'Credential Type' },
  { id: 'issued_at', label: 'Issued Date' },
  { id: 'expires_at', label: 'Expiry Date' },
  { id: 'status', label: 'Status' },
] as const;

// ============================================
// CUSTOMIZABLE ZONE TEMPLATE SYSTEM
// ============================================

// Zone positioning (percentages for responsive scaling)
export interface ZonePosition {
  x: number; // 0-100% of card width
  y: number; // 0-100% of card height
  width: number; // 0-100% of card width
  height: number; // 0-100% of card height
}

// A single zone in a template
export interface Zone {
  id: string; // Unique zone identifier (UUID)
  name: string; // Human-readable name (e.g., "Header Logo")
  position: ZonePosition; // Positioning data
  content_type: ZoneContentType; // What type of content this zone holds
}

// Zone template for front or back of card
export interface ZoneFaceTemplate {
  zones: Zone[];
}

// Complete zone template (front and back)
export interface ZoneTemplate {
  id: string;
  name: string;
  description?: string;
  front: ZoneFaceTemplate;
  back: ZoneFaceTemplate;
  card_width: number; // Reference width (default 340px)
  card_height: number; // Reference height (default 214px)
  createdAt: string;
  updatedAt: string;
  isBuiltIn?: boolean; // True for COPA standard template
}

// Built-in COPA template constant
export const COPA_STANDARD_TEMPLATE_ID = 'copa-standard-v1';

// Card dimensions (credit card ratio)
export const CARD_WIDTH = 340;
export const CARD_HEIGHT = 214;

// Helper to create COPA standard template (matches current fixed zones)
export const createCopaStandardTemplate = (): ZoneTemplate => ({
  id: COPA_STANDARD_TEMPLATE_ID,
  name: 'COPA Standard',
  description: 'Standard COPA credential card layout with 6 fixed zones',
  front: {
    zones: [
      {
        id: 'portfolio_issuer',
        name: 'Portfolio Issuer',
        position: { x: 0, y: 0, width: 50, height: 18.7 },
        content_type: 'image',
      },
      {
        id: 'network_mark',
        name: 'Network Mark',
        position: { x: 50, y: 0, width: 50, height: 18.7 },
        content_type: 'image',
      },
      {
        id: 'primary_attribute',
        name: 'Primary Attribute',
        position: { x: 0, y: 18.7, width: 100, height: 42.5 },
        content_type: 'text',
      },
      {
        id: 'secondary_attribute',
        name: 'Secondary Attribute',
        position: { x: 0, y: 61.2, width: 100, height: 17.8 },
        content_type: 'text',
      },
      {
        id: 'credential_name',
        name: 'Credential Name',
        position: { x: 0, y: 79, width: 50, height: 21 },
        content_type: 'text',
      },
      {
        id: 'credential_issuer',
        name: 'Credential Issuer',
        position: { x: 50, y: 79, width: 50, height: 21 },
        content_type: 'image',
      },
    ],
  },
  back: {
    zones: [
      {
        id: 'metadata',
        name: 'Metadata',
        position: { x: 0, y: 0, width: 100, height: 40 },
        content_type: 'text',
      },
      {
        id: 'evidence',
        name: 'Evidence Sources',
        position: { x: 0, y: 40, width: 100, height: 60 },
        content_type: 'image',
      },
    ],
  },
  card_width: CARD_WIDTH,
  card_height: CARD_HEIGHT,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isBuiltIn: true,
});

// Zone template store state interface
export interface ZoneTemplateStore {
  templates: ZoneTemplate[];
  selectedTemplateId: string | null;
  editingTemplate: ZoneTemplate | null;

  // Template CRUD
  addTemplate: (
    template: Omit<ZoneTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => string;
  updateTemplate: (id: string, updates: Partial<ZoneTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string, newName: string) => string;

  // Template selection
  selectTemplate: (id: string | null) => void;
  setEditingTemplate: (template: ZoneTemplate | null) => void;

  // Zone management within editing template
  addZone: (face: 'front' | 'back', zone: Omit<Zone, 'id'>) => void;
  updateZone: (
    face: 'front' | 'back',
    zoneId: string,
    updates: Partial<Zone>
  ) => void;
  deleteZone: (face: 'front' | 'back', zoneId: string) => void;

  // Copy operations
  copyFrontToBack: () => void;
  copyBackToFront: () => void;

  // Save editing template
  saveEditingTemplate: () => void;

  // Getters
  getTemplate: (id: string) => ZoneTemplate | undefined;
  getBuiltInTemplates: () => ZoneTemplate[];
  getUserTemplates: () => ZoneTemplate[];
}

// Helper to check for zone overlaps
export const zonesOverlap = (zone1: ZonePosition, zone2: ZonePosition): boolean => {
  // Check if zones don't overlap (one is completely to the left, right, above, or below the other)
  const noOverlap =
    zone1.x + zone1.width <= zone2.x || // zone1 is to the left of zone2
    zone2.x + zone2.width <= zone1.x || // zone2 is to the left of zone1
    zone1.y + zone1.height <= zone2.y || // zone1 is above zone2
    zone2.y + zone2.height <= zone1.y; // zone2 is above zone1

  return !noOverlap;
};

// Helper to check if a zone array has any overlaps
export const hasOverlappingZones = (zones: Zone[]): { hasOverlap: boolean; overlappingIds: string[] } => {
  const overlappingIds: Set<string> = new Set();

  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      if (zonesOverlap(zones[i].position, zones[j].position)) {
        overlappingIds.add(zones[i].id);
        overlappingIds.add(zones[j].id);
      }
    }
  }

  return {
    hasOverlap: overlappingIds.size > 0,
    overlappingIds: Array.from(overlappingIds),
  };
};

// Generate a unique zone color for visual distinction
export const getZoneColor = (index: number): string => {
  const colors = [
    'rgba(59, 130, 246, 0.3)', // blue
    'rgba(168, 85, 247, 0.3)', // purple
    'rgba(34, 197, 94, 0.3)', // green
    'rgba(251, 191, 36, 0.3)', // yellow
    'rgba(239, 68, 68, 0.3)', // red
    'rgba(236, 72, 153, 0.3)', // pink
    'rgba(20, 184, 166, 0.3)', // teal
    'rgba(249, 115, 22, 0.3)', // orange
  ];
  return colors[index % colors.length];
};
