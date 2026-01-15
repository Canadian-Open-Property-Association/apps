/**
 * Test Verifier API Routes
 *
 * API routes for the Test Verifier app.
 * Handles proof request generation via Orbit LOB Verifier API.
 * Uses published templates from Proof Template Builder.
 */

import express from 'express';
import crypto from 'crypto';
import { getDb, schema } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import {
  getOrbitApiConfig,
  isApiConfigured,
  getOrbitConfigStatus,
} from '../lib/orbitConfig.js';

const router = express.Router();

/**
 * Get current user from session (COPA GitHub OAuth)
 */
const getCurrentUser = (req) => {
  if (req.session && req.session.user) {
    return {
      githubUserId: String(req.session.user.id),
      githubUsername: req.session.user.login,
    };
  }
  return null;
};

/**
 * Middleware to require authentication
 */
const requireAuth = (req, res, next) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = user;
  next();
};

/**
 * Middleware to check Orbit Verifier API configuration
 */
const requireOrbit = (req, res, next) => {
  if (!isApiConfigured('verifier')) {
    return res.status(503).json({
      error: 'Verifier API not configured',
      message: 'Please configure the Verifier API Base URL in Settings.',
    });
  }
  next();
};

// In-memory storage for proof requests
// In production, use database tables
const proofRequests = new Map();

/**
 * Map our credential format to Orbit's format
 */
const ORBIT_FORMAT_MAP = {
  'anoncreds': { proofCredFormat: 'ANONCREDS', messageProtocol: 'AIP2_0' },
  'w3c-jsonld': { proofCredFormat: 'JSONLD', messageProtocol: 'OID4VC' },
  'w3c-sd-jwt': { proofCredFormat: 'OID4VC', messageProtocol: 'OID4VC' },
  'iso-18013-5': { proofCredFormat: 'ISO_18013_5', messageProtocol: 'OID4VC' },
};

/**
 * Convert our template to Orbit proof request format
 */
function toOrbitProofRequest(template, socketSessionId) {
  const formatConfig = ORBIT_FORMAT_MAP[template.credentialFormat] || ORBIT_FORMAT_MAP['anoncreds'];

  // Build requested attributes from template
  const requestedAttributes = [];
  const requestedPredicates = [];

  for (const cred of template.requestedCredentials || []) {
    // Build restrictions from credential
    const restrictions = [];
    if (cred.restrictions) {
      const restriction = {};
      if (cred.restrictions.schemaId) {
        restriction.schemaId = cred.restrictions.schemaId;
      }
      if (cred.restrictions.credentialDefinitionId) {
        restriction.credentialDefinitionId = cred.restrictions.credentialDefinitionId;
      }
      if (cred.restrictions.issuerDid) {
        restriction.issuerDid = cred.restrictions.issuerDid;
      }
      if (Object.keys(restriction).length > 0) {
        restrictions.push(restriction);
      }
    }

    // Add requested attributes
    if (cred.requestedAttributes && cred.requestedAttributes.length > 0) {
      const attributes = cred.requestedAttributes.map((attr) => attr.attributeName);
      requestedAttributes.push({
        attributes,
        restrictions,
      });
    }

    // Add predicates
    if (cred.predicates && cred.predicates.length > 0) {
      for (const pred of cred.predicates) {
        // Map our operator to Orbit's pType
        const pTypeMap = {
          '>': '>',
          '>=': '>=',
          '<': '<',
          '<=': '<=',
          '==': '=',
          '!=': '!=',
        };
        const pType = pTypeMap[pred.operator] || '>=';

        requestedPredicates.push({
          attributeName: pred.attributeName,
          pType,
          pValue: typeof pred.value === 'number' ? pred.value : parseInt(pred.value, 10),
          restrictions,
        });
      }
    }
  }

  // Generate a unique credProofId based on template
  const ecosystemTag = template.metadata?.ecosystemTag || 'general';
  const safeName = template.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const credProofId = `${ecosystemTag}.${safeName}.${template.version || '1.0.0'}.${Date.now()}`;

  return {
    messageProtocol: formatConfig.messageProtocol,
    credProofId,
    proofAutoVerify: true,
    createClaim: false,
    sendProblemReport: false,
    problemReportMessage: '',
    proofName: template.name,
    proofPurpose: template.description || `Verify ${template.name}`,
    proofCredFormat: formatConfig.proofCredFormat,
    requestedAttributes,
    requestedPredicates: requestedPredicates.length > 0 ? requestedPredicates : undefined,
    ...(socketSessionId && { socketSessionId }),
  };
}

/**
 * GET /api/test-verifier/orbit-status
 * Check Orbit Verifier API connection status
 */
router.get('/orbit-status', requireAuth, (req, res) => {
  const verifierConfig = getOrbitApiConfig('verifier');
  const status = getOrbitConfigStatus();
  res.json({
    baseUrl: verifierConfig?.baseUrl || null,
    lobId: status.lobId,
    connected: isApiConfigured('verifier'),
    source: status.source,
  });
});

/**
 * GET /api/test-verifier/templates
 * Get published templates (alias for /api/proof-templates/published)
 */
router.get('/templates', requireAuth, async (req, res) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Test Verifier requires PostgreSQL.',
      });
    }

    const templates = await db
      .select()
      .from(schema.proofTemplates)
      .where(
        and(
          eq(schema.proofTemplates.githubUserId, req.user.githubUserId),
          eq(schema.proofTemplates.publishedToVerifier, true)
        )
      )
      .orderBy(desc(schema.proofTemplates.updatedAt));

    // Convert to response format
    const response = templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      version: t.version || '1.0.0',
      credentialFormat: t.credentialFormat || 'anoncreds',
      requestedCredentials: t.requestedCredentials || [],
      metadata: t.metadata || {},
      status: t.status,
      publishedToVerifier: t.publishedToVerifier,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching published templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * POST /api/test-verifier/proof-request
 * Create a new proof request from a template
 */
router.post('/proof-request', requireAuth, requireOrbit, async (req, res) => {
  const timestamp = new Date().toISOString();

  try {
    const { templateId, socketSessionId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'templateId is required' });
    }

    // Get the template from database
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Test Verifier requires PostgreSQL.',
      });
    }

    const [template] = await db
      .select()
      .from(schema.proofTemplates)
      .where(eq(schema.proofTemplates.id, templateId));

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check ownership and published status
    if (template.githubUserId !== req.user.githubUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!template.publishedToVerifier) {
      return res.status(400).json({
        error: 'Template not published to verifier',
        message: 'Enable this template in Proof Template Builder settings first.',
      });
    }

    // Get verifier API config
    const verifierConfig = getOrbitApiConfig('verifier');
    if (!verifierConfig || !verifierConfig.baseUrl || !verifierConfig.lobId) {
      return res.status(503).json({
        error: 'Verifier API not properly configured',
        message: 'Please configure the Verifier API with Base URL and LOB ID in Settings.',
      });
    }

    // Build Orbit proof request
    const orbitPayload = toOrbitProofRequest(template, socketSessionId);

    // Normalize baseUrl
    const normalizedBaseUrl = verifierConfig.baseUrl.replace(/\/+$/, '');

    // Call Orbit Verifier API
    const url = `${normalizedBaseUrl}/api/lob/${verifierConfig.lobId}/proof-request/url?connectionless=true`;
    const headers = {
      'Content-Type': 'application/json',
      ...(verifierConfig.apiKey && { 'api-key': verifierConfig.apiKey }),
    };

    console.log('[TestVerifier] Creating proof request:');
    console.log('[TestVerifier]   URL:', url);
    console.log('[TestVerifier]   Template:', template.name);
    console.log('[TestVerifier]   Format:', template.credentialFormat);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(orbitPayload),
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = {};
    }

    if (!response.ok) {
      console.error('[TestVerifier] Proof request failed:', response.status, responseText);
      return res.status(response.status).json({
        error: result.message || result.error || 'Failed to create proof request',
        apiDetails: {
          message: result.message || result.error || 'Failed to create proof request',
          timestamp,
          requestUrl: url,
          requestMethod: 'POST',
          requestPayload: orbitPayload,
          statusCode: response.status,
          responseBody: responseText,
        },
      });
    }

    console.log('[TestVerifier] Proof request created successfully');
    console.log('[TestVerifier]   Cred Proof ID:', result.data?.credProofId);
    console.log('[TestVerifier]   Short URL:', result.data?.shortUrl);

    // Store proof request locally for tracking
    const proofRequestId = crypto.randomUUID();
    const now = new Date();
    const proofRequest = {
      id: proofRequestId,
      templateId: template.id,
      templateName: template.name,
      credentialFormat: template.credentialFormat,
      credProofId: result.data?.credProofId || orbitPayload.credProofId,
      shortUrl: result.data?.shortUrl,
      longUrl: result.data?.longUrl,
      status: 'generated',
      socketSessionId: socketSessionId || null,
      requestPayload: JSON.stringify(orbitPayload),
      createdAt: now.toISOString(),
      verifiedAt: null,
      verificationResult: null,
      errorMessage: null,
      userId: req.user.githubUserId,
    };

    proofRequests.set(proofRequestId, proofRequest);

    res.status(201).json({
      id: proofRequest.id,
      templateId: proofRequest.templateId,
      templateName: proofRequest.templateName,
      credentialFormat: proofRequest.credentialFormat,
      credProofId: proofRequest.credProofId,
      shortUrl: proofRequest.shortUrl,
      longUrl: proofRequest.longUrl,
      status: proofRequest.status,
      requestPayload: proofRequest.requestPayload,
      createdAt: proofRequest.createdAt,
      // Include API details for debugging
      apiDetails: {
        message: 'Proof request created successfully',
        timestamp,
        requestUrl: url,
        requestMethod: 'POST',
        requestPayload: orbitPayload,
        statusCode: response.status,
        responseBody: responseText,
      },
    });
  } catch (error) {
    console.error('[TestVerifier] Error creating proof request:', error);
    res.status(500).json({
      error: 'Failed to create proof request',
      message: error.message,
      apiDetails: {
        message: error.message,
        timestamp,
      },
    });
  }
});

/**
 * GET /api/test-verifier/proof-request/:id
 * Get a single proof request by ID
 */
router.get('/proof-request/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const proofRequest = proofRequests.get(id);

  if (!proofRequest) {
    return res.status(404).json({ error: 'Proof request not found' });
  }

  if (proofRequest.userId !== req.user.githubUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(proofRequest);
});

/**
 * GET /api/test-verifier/status/:id
 * Get/refresh proof request status
 */
router.get('/status/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const proofRequest = proofRequests.get(id);

  if (!proofRequest) {
    return res.status(404).json({ error: 'Proof request not found' });
  }

  if (proofRequest.userId !== req.user.githubUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // For now, return stored status
  // In a full implementation, you could poll Orbit API for status updates
  // or rely on socket events which update the status via the store

  res.json({
    id: proofRequest.id,
    status: proofRequest.status,
    verifiedAt: proofRequest.verifiedAt,
    verificationResult: proofRequest.verificationResult,
    errorMessage: proofRequest.errorMessage,
  });
});

/**
 * PATCH /api/test-verifier/status/:id
 * Update proof request status (called by socket event handler)
 */
router.patch('/status/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status, verificationResult, errorMessage } = req.body;

  const proofRequest = proofRequests.get(id);

  if (!proofRequest) {
    return res.status(404).json({ error: 'Proof request not found' });
  }

  if (proofRequest.userId !== req.user.githubUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Update status
  if (status) {
    proofRequest.status = status;
    if (status === 'verified') {
      proofRequest.verifiedAt = new Date().toISOString();
    }
  }
  if (verificationResult !== undefined) {
    proofRequest.verificationResult = verificationResult;
  }
  if (errorMessage !== undefined) {
    proofRequest.errorMessage = errorMessage;
  }

  proofRequests.set(id, proofRequest);

  res.json(proofRequest);
});

/**
 * GET /api/test-verifier/history
 * Get proof request history for current user
 */
router.get('/history', requireAuth, (req, res) => {
  const userId = req.user.githubUserId;
  const history = [];

  for (const [, proofRequest] of proofRequests.entries()) {
    if (proofRequest.userId === userId) {
      history.push({
        id: proofRequest.id,
        templateId: proofRequest.templateId,
        templateName: proofRequest.templateName,
        credentialFormat: proofRequest.credentialFormat,
        status: proofRequest.status,
        createdAt: proofRequest.createdAt,
        verifiedAt: proofRequest.verifiedAt,
      });
    }
  }

  // Sort by creation date, newest first
  history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(history);
});

export default router;
