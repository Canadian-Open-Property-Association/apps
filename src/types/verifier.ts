/**
 * Types for Test Verifier App
 *
 * Defines interfaces for proof requests, verification results,
 * and Orbit verifier API integration.
 */

import type { CredentialFormat } from './proofTemplate';

// Proof Request Status
export type ProofRequestStatus =
  | 'generated'      // QR code generated, waiting for scan
  | 'scanned'        // Wallet scanned the QR code
  | 'request-sent'   // Proof request sent to wallet
  | 'proof-received' // Proof received from wallet
  | 'verified'       // Proof successfully verified
  | 'failed'         // Verification failed
  | 'expired';       // Request expired

// Proof Request
export interface ProofRequest {
  id: string;
  templateId: string;           // Our proof template ID
  templateName: string;         // Cached template name for display
  credentialFormat: CredentialFormat;
  credProofId: string;          // ID sent to Orbit for tracking
  shortUrl: string;             // QR code URL from Orbit
  longUrl: string;              // Full URL from Orbit
  status: ProofRequestStatus;
  socketSessionId?: string;     // Socket session for real-time updates
  requestPayload: string;       // JSON of the full Orbit request
  createdAt: string;
  verifiedAt?: string;
  verificationResult?: VerificationResult;
  errorMessage?: string;
}

// Verification Result
export interface VerificationResult {
  verified: boolean;
  timestamp: string;
  presentedCredentials: PresentedCredential[];
  predicateResults?: PredicateResult[];
}

// Presented Credential
export interface PresentedCredential {
  credentialId: string;
  credentialName: string;
  attributes: Record<string, string>;
  issuerDid?: string;
  issuanceDate?: string;
}

// Predicate Result
export interface PredicateResult {
  attributeName: string;
  predicateType: string;
  operator: string;
  value: number | string;
  result: boolean;
}

// Create Proof Request Request
export interface CreateProofRequestRequest {
  templateId: string;
  socketSessionId?: string;
}

// Proof Request List Item (for history view)
export interface ProofRequestListItem {
  id: string;
  templateId: string;
  templateName: string;
  credentialFormat: CredentialFormat;
  status: ProofRequestStatus;
  createdAt: string;
  verifiedAt?: string;
}

// Orbit Config for Verifier
export interface VerifierOrbitConfig {
  connected: boolean;
  baseUrl?: string;
  tenantId?: string;
  lobId?: string;
}

// Orbit Proof Request Body (what we send to Orbit)
export interface OrbitProofRequestBody {
  messageProtocol: 'AIP2_0' | 'OID4VC';
  credProofId: string;
  proofAutoVerify: boolean;
  createClaim: boolean;
  sendProblemReport: boolean;
  problemReportMessage: string;
  proofName: string;
  proofPurpose: string;
  proofCredFormat: 'ANONCREDS' | 'JSONLD' | 'OID4VC' | 'ISO_18013_5';
  requestedAttributes: OrbitRequestedAttribute[];
  requestedPredicates?: OrbitRequestedPredicate[];
}

// Orbit Requested Attribute
export interface OrbitRequestedAttribute {
  attributes: string[];
  restrictions: OrbitRestriction[];
}

// Orbit Requested Predicate
export interface OrbitRequestedPredicate {
  attributeName: string;
  pType: '>=' | '>' | '<=' | '<' | '==' | '!=';
  pValue: number;
  restrictions: OrbitRestriction[];
}

// Orbit Restriction
export interface OrbitRestriction {
  schemaId?: string;
  credentialDefinitionId?: string;
  issuerDid?: string;
}

// Orbit Proof Request Response
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

// Status color mapping
export const STATUS_COLORS: Record<ProofRequestStatus, { bg: string; text: string; border: string }> = {
  generated: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  scanned: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'request-sent': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'proof-received': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  verified: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

// Status labels
export const STATUS_LABELS: Record<ProofRequestStatus, string> = {
  generated: 'Awaiting Scan',
  scanned: 'Scanned',
  'request-sent': 'Request Sent',
  'proof-received': 'Proof Received',
  verified: 'Verified',
  failed: 'Failed',
  expired: 'Expired',
};
