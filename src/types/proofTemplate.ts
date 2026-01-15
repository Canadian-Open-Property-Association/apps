/**
 * Proof Template Types
 *
 * Type definitions for the Proof Templates Builder app.
 * Proof templates define verification requirements using a custom JSON format
 * designed for consumption by third-party verifier applications.
 *
 * Key concepts:
 * - Templates reference real credentials from the Credential Catalogue
 * - One credential format per template (required for Orbit compound proofs)
 * - Template ID format: "ecosystemname.templatename.version"
 */

// ============================================================================
// Credential Formats
// ============================================================================

/**
 * Supported credential formats for proof templates.
 * Each template can only use ONE format (Orbit compound proof requirement).
 */
export type CredentialFormat = 'anoncreds' | 'w3c-jsonld' | 'w3c-sd-jwt' | 'iso-18013-5';

/**
 * Mapping from our formats to Orbit API values
 */
export const CREDENTIAL_FORMAT_LABELS: Record<CredentialFormat, string> = {
  'anoncreds': 'AnonCreds',
  'w3c-jsonld': 'W3C JSON-LD',
  'w3c-sd-jwt': 'W3C SD-JWT',
  'iso-18013-5': 'ISO 18013-5 (mDL)',
};

/**
 * Orbit API format mapping
 */
export const ORBIT_FORMAT_MAP: Record<CredentialFormat, { proofCredFormat: string; messageProtocol: string }> = {
  'anoncreds': { proofCredFormat: 'ANONCREDS', messageProtocol: 'AIP2_0' },
  'w3c-jsonld': { proofCredFormat: 'JSONLD', messageProtocol: 'OID4VC' },
  'w3c-sd-jwt': { proofCredFormat: 'OID4VC', messageProtocol: 'OID4VC' },
  'iso-18013-5': { proofCredFormat: 'ISO_18013_5', messageProtocol: 'OID4VC' }, // TBD - may need adjustment
};

// ============================================================================
// Core Types
// ============================================================================

/**
 * A Proof Template defines what verified claims are required
 * for a specific use case. It references credentials from the
 * Credential Catalogue and outputs a format suitable for
 * generating Orbit proof requests.
 */
export interface ProofTemplate {
  // Identity
  id: string;                    // Format: "ecosystemname.templatename.version"
  name: string;
  description: string;
  version: string;

  // Credential Format (one per template for Orbit compound proof compatibility)
  credentialFormat: CredentialFormat;

  // Requested Credentials (can request multiple credentials of same format)
  requestedCredentials: RequestedCredential[];

  // Metadata
  metadata: ProofTemplateMetadata;

  // Publishing
  status: ProofTemplateStatus;
  publishedToVerifier: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Metadata for a proof template
 */
export interface ProofTemplateMetadata {
  author: string;               // GitHub username or org
  ecosystemTag: string;         // Used in template ID generation
  tags: string[];               // Searchable tags
  category: string;             // e.g., "identity", "financial", "employment"
}

export type ProofTemplateStatus = 'draft' | 'published';

// ============================================================================
// Requested Credential Types
// ============================================================================

/**
 * A RequestedCredential represents a credential that must be presented
 * as part of the verification. It references a credential from the
 * Credential Catalogue.
 */
export interface RequestedCredential {
  id: string;

  // Reference to Credential Catalogue
  catalogueCredentialId: string;  // Links to credential in Credential Catalogue
  credentialName: string;         // Cached for display

  // Restrictions (from Credential Catalogue, used in Orbit request)
  restrictions: CredentialRestrictions;

  // All attributes available on this credential (from catalogue)
  availableAttributes: string[];

  // Requested Attributes (subset user wants to verify)
  requestedAttributes: RequestedAttribute[];

  // Predicates (prove without revealing)
  predicates: Predicate[];
}

/**
 * Restrictions used to identify the credential in Orbit requests
 */
export interface CredentialRestrictions {
  schemaId: string;               // Ledger schema ID
  credentialDefinitionId?: string; // Cred def ID (for AnonCreds)
  issuerDid?: string;             // Optional issuer restriction
}

// ============================================================================
// Requested Attribute Types
// ============================================================================

/**
 * A RequestedAttribute specifies an attribute from a credential
 * that should be verified. Supports selective disclosure options.
 */
export interface RequestedAttribute {
  id: string;
  attributeName: string;          // Must match credential attribute
  label: string;                  // Human-readable label
  required: boolean;

  // Selective disclosure options
  selectiveDisclosure: SelectiveDisclosureConfig;

  // Value constraints (optional)
  constraints?: AttributeConstraints;
}

/**
 * Selective disclosure configuration for an attribute
 */
export interface SelectiveDisclosureConfig {
  enabled: boolean;
  revealValue: boolean;           // true = reveal, false = prove possession only
}

/**
 * Constraints on attribute values
 */
export interface AttributeConstraints {
  type: 'exact-match' | 'one-of';
  values: string[];
  caseSensitive: boolean;
}

// ============================================================================
// Predicate Types
// ============================================================================

/**
 * A Predicate allows proving a condition about an attribute
 * without revealing the actual value (e.g., "age >= 18")
 */
export interface Predicate {
  id: string;
  attributeName: string;
  label: string;

  // Comparison
  predicateType: PredicateDataType;
  operator: PredicateOperator;
  value: number | string;         // number for integer, ISO date string for date

  // What to reveal
  revealResult: boolean;          // Reveal comparison result (true/false)
}

export type PredicateDataType = 'integer' | 'date';
export type PredicateOperator = '>' | '>=' | '<' | '<=' | '==' | '!=';

/**
 * Human-readable labels for predicate operators
 */
export const PREDICATE_OPERATOR_LABELS: Record<PredicateOperator, string> = {
  '>': 'greater than',
  '>=': 'greater than or equal to',
  '<': 'less than',
  '<=': 'less than or equal to',
  '==': 'equals',
  '!=': 'not equals',
};

// ============================================================================
// List Item (for dashboard view)
// ============================================================================

export interface ProofTemplateListItem {
  id: string;
  name: string;
  description: string;
  credentialFormat: CredentialFormat;
  status: ProofTemplateStatus;
  credentialCount: number;
  publishedToVerifier: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateProofTemplateRequest {
  name: string;
  description?: string;
  credentialFormat: CredentialFormat;
  ecosystemTag?: string;
}

export interface UpdateProofTemplateRequest {
  name?: string;
  description?: string;
  version?: string;
  requestedCredentials?: RequestedCredential[];
  metadata?: Partial<ProofTemplateMetadata>;
  publishedToVerifier?: boolean;
}

export interface PublishToVerifierRequest {
  templateId: string;
  enabled: boolean;
}

// ============================================================================
// Orbit API Types
// ============================================================================

/**
 * Request body for Orbit proof-request/url endpoint
 * POST /api/lob/{lob_id}/proof-request/url?connectionless=true
 */
export interface OrbitProofRequestBody {
  messageProtocol: 'AIP2_0' | 'OID4VC';
  credProofId: string;              // Our template ID for tracking
  proofAutoVerify: boolean;
  createClaim: boolean;
  sendProblemReport: boolean;
  problemReportMessage: string;
  proofName: string;
  proofPurpose: string;
  proofCredFormat: 'ANONCREDS' | 'JSONLD' | 'OID4VC' | 'ISO_18013_5';
  requestedAttributes: OrbitRequestedAttribute[];
  requestedPredicates: OrbitRequestedPredicate[];
}

export interface OrbitRequestedAttribute {
  attributes: string[];
  restrictions: OrbitRestriction[];
}

export interface OrbitRequestedPredicate {
  attributeName: string;
  pType: '>=' | '>' | '<=' | '<';
  pValue: number;
  restrictions: OrbitRestriction[];
}

export interface OrbitRestriction {
  schemaId?: string;
  credentialDefinitionId?: string;
  issuerDid?: string;
}

export interface OrbitProofRequestResponse {
  success: boolean;
  message: string;
  data: {
    shortUrl: string;
    longUrl: string;
    credProofId: string;
    proofStatus: string;
  };
}

// ============================================================================
// Conversion Utilities
// ============================================================================

/**
 * Convert a ProofTemplate to Orbit proof request format
 */
export function toOrbitProofRequest(template: ProofTemplate, proofPurpose?: string): OrbitProofRequestBody {
  const formatConfig = ORBIT_FORMAT_MAP[template.credentialFormat];

  // Group attributes by credential for Orbit's format
  const requestedAttributes: OrbitRequestedAttribute[] = [];
  const requestedPredicates: OrbitRequestedPredicate[] = [];

  for (const cred of template.requestedCredentials) {
    // Get attributes that should be revealed
    const attributeNames = cred.requestedAttributes
      .filter(attr => attr.selectiveDisclosure.revealValue)
      .map(attr => attr.attributeName);

    if (attributeNames.length > 0) {
      requestedAttributes.push({
        attributes: attributeNames,
        restrictions: [toOrbitRestriction(cred.restrictions)],
      });
    }

    // Add predicates
    for (const pred of cred.predicates) {
      // Convert our operator to Orbit's pType format
      const pType = pred.operator as '>=' | '>' | '<=' | '<';
      const pValue = typeof pred.value === 'number' ? pred.value : parseInt(pred.value as string, 10);

      requestedPredicates.push({
        attributeName: pred.attributeName,
        pType,
        pValue,
        restrictions: [toOrbitRestriction(cred.restrictions)],
      });
    }
  }

  return {
    messageProtocol: formatConfig.messageProtocol as 'AIP2_0' | 'OID4VC',
    credProofId: template.id,
    proofAutoVerify: true,
    createClaim: false,
    sendProblemReport: false,
    problemReportMessage: '',
    proofName: template.name,
    proofPurpose: proofPurpose || template.description,
    proofCredFormat: formatConfig.proofCredFormat as 'ANONCREDS' | 'JSONLD' | 'OID4VC' | 'ISO_18013_5',
    requestedAttributes,
    requestedPredicates,
  };
}

function toOrbitRestriction(restrictions: CredentialRestrictions): OrbitRestriction {
  const result: OrbitRestriction = {};
  if (restrictions.schemaId) result.schemaId = restrictions.schemaId;
  if (restrictions.credentialDefinitionId) result.credentialDefinitionId = restrictions.credentialDefinitionId;
  if (restrictions.issuerDid) result.issuerDid = restrictions.issuerDid;
  return result;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_PROOF_TEMPLATE: Omit<ProofTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  version: '1.0.0',
  credentialFormat: 'anoncreds',
  requestedCredentials: [],
  metadata: {
    author: '',
    ecosystemTag: '',
    tags: [],
    category: 'general',
  },
  status: 'draft',
  publishedToVerifier: false,
};

export const DEFAULT_REQUESTED_CREDENTIAL: Omit<RequestedCredential, 'id'> = {
  catalogueCredentialId: '',
  credentialName: '',
  restrictions: {
    schemaId: '',
  },
  availableAttributes: [],
  requestedAttributes: [],
  predicates: [],
};

export const DEFAULT_REQUESTED_ATTRIBUTE: Omit<RequestedAttribute, 'id'> = {
  attributeName: '',
  label: '',
  required: true,
  selectiveDisclosure: {
    enabled: true,
    revealValue: true,
  },
};

export const DEFAULT_PREDICATE: Omit<Predicate, 'id'> = {
  attributeName: '',
  label: '',
  predicateType: 'integer',
  operator: '>=',
  value: 0,
  revealResult: true,
};

export const DEFAULT_PROOF_TEMPLATE_CATEGORIES = [
  { value: 'identity', label: 'Identity Verification' },
  { value: 'financial', label: 'Financial' },
  { value: 'employment', label: 'Employment' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'government', label: 'Government' },
  { value: 'membership', label: 'Membership' },
  { value: 'general', label: 'General' },
] as const;

// Template type for settings management
export interface ProofTemplateType {
  id: string;
  name: string;
}

// For backwards compatibility
export const PROOF_TEMPLATE_CATEGORIES = DEFAULT_PROOF_TEMPLATE_CATEGORIES;
