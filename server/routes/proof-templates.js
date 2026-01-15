/**
 * Proof Templates API Routes
 *
 * CRUD operations for proof templates in the Proof Templates Builder app.
 * Uses PostgreSQL via Drizzle ORM.
 *
 * New structure (v2):
 * - Templates reference credentials from Credential Catalogue
 * - One credential format per template (for Orbit compound proof compatibility)
 * - requestedCredentials array replaces claims
 * - Publishing to Test Verifier app
 */

import express from 'express';
import { getDb, schema } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth, getOctokit } from '../auth.js';

const router = express.Router();

// GitHub repo configuration (same as github.js)
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'Canadian-Open-Property-Association';
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'governance';
const PROOF_TEMPLATE_FOLDER_PATH = process.env.PROOF_TEMPLATE_FOLDER_PATH || 'credentials/proof-templates';
const BASE_URL = process.env.BASE_URL || 'https://openpropertyassociation.ca';
const GITHUB_BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || null;

/**
 * Middleware to check database availability
 */
const requireDatabase = (req, res, next) => {
  const db = getDb();
  if (!db) {
    return res.status(503).json({
      error: 'Database unavailable',
      message: 'Proof Templates Builder requires PostgreSQL. Please check DATABASE_URL configuration.',
    });
  }
  req.db = db;
  next();
};

/**
 * Get current user from session (COPA GitHub OAuth)
 */
const getCurrentUser = (req) => {
  if (req.session && req.session.user) {
    return {
      githubUserId: String(req.session.user.id),
      githubUsername: req.session.user.login,
      authorName: req.session.user.name || req.session.user.login,
      authorEmail: req.session.user.email,
    };
  }
  return null;
};

/**
 * Convert database row to ProofTemplate response (full template)
 */
const toProofTemplateResponse = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  version: row.version || '1.0.0',
  credentialFormat: row.credentialFormat || 'anoncreds',
  requestedCredentials: row.requestedCredentials || [],
  metadata: {
    author: row.metadata?.author || row.githubUsername || row.authorName,
    ecosystemTag: row.metadata?.ecosystemTag || '',
    tags: row.metadata?.tags || [],
    ...(row.metadata || {}),
  },
  status: row.status,
  publishedToVerifier: row.publishedToVerifier || false,
  vdrUri: row.vdrUri,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  publishedAt: row.publishedAt,
});

/**
 * Convert database row to list item response
 */
const toListItemResponse = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  credentialFormat: row.credentialFormat || 'anoncreds',
  status: row.status,
  credentialCount: (row.requestedCredentials || []).length,
  publishedToVerifier: row.publishedToVerifier || false,
  vdrUri: row.vdrUri,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  publishedAt: row.publishedAt,
});

/**
 * GET /api/proof-templates
 * List all proof templates for the current user
 */
router.get('/', requireDatabase, async (req, res) => {
  try {
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const templates = await req.db
      .select()
      .from(schema.proofTemplates)
      .where(eq(schema.proofTemplates.githubUserId, user.githubUserId))
      .orderBy(desc(schema.proofTemplates.updatedAt));

    res.json(templates.map(toListItemResponse));
  } catch (error) {
    console.error('Error fetching proof templates:', error);
    res.status(500).json({ error: 'Failed to fetch proof templates' });
  }
});

/**
 * GET /api/proof-templates/published
 * Get all templates published to Test Verifier (for Test Verifier app)
 */
router.get('/published', requireDatabase, async (req, res) => {
  try {
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get templates that are published to verifier for this user
    const templates = await req.db
      .select()
      .from(schema.proofTemplates)
      .where(
        and(
          eq(schema.proofTemplates.githubUserId, user.githubUserId),
          eq(schema.proofTemplates.publishedToVerifier, true)
        )
      )
      .orderBy(desc(schema.proofTemplates.updatedAt));

    res.json(templates.map(toProofTemplateResponse));
  } catch (error) {
    console.error('Error fetching published proof templates:', error);
    res.status(500).json({ error: 'Failed to fetch published proof templates' });
  }
});

/**
 * GET /api/proof-templates/:id
 * Get a single proof template by ID
 */
router.get('/:id', requireDatabase, async (req, res) => {
  try {
    const { id } = req.params;
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [template] = await req.db
      .select()
      .from(schema.proofTemplates)
      .where(eq(schema.proofTemplates.id, id));

    if (!template) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    // Check ownership (published templates can be viewed by anyone)
    if (template.githubUserId !== user.githubUserId && template.status !== 'published') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(toProofTemplateResponse(template));
  } catch (error) {
    console.error('Error fetching proof template:', error);
    res.status(500).json({ error: 'Failed to fetch proof template' });
  }
});

/**
 * POST /api/proof-templates
 * Create a new proof template
 */
router.post('/', requireDatabase, async (req, res) => {
  try {
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name, description, credentialFormat, ecosystemTag } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Validate credential format
    const validFormats = ['anoncreds', 'w3c-jsonld', 'w3c-sd-jwt', 'iso-18013-5'];
    const format = credentialFormat || 'anoncreds';
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        error: 'Invalid credential format',
        message: `Format must be one of: ${validFormats.join(', ')}`,
      });
    }

    const [template] = await req.db
      .insert(schema.proofTemplates)
      .values({
        name,
        description: description || '',
        version: '1.0.0',
        credentialFormat: format,
        requestedCredentials: [],
        metadata: {
          author: user.authorName || user.githubUsername,
          ecosystemTag: ecosystemTag || '',
          tags: [],
        },
        status: 'draft',
        publishedToVerifier: false,
        githubUserId: user.githubUserId,
        githubUsername: user.githubUsername,
        authorName: user.authorName,
        authorEmail: user.authorEmail,
      })
      .returning();

    res.status(201).json(toProofTemplateResponse(template));
  } catch (error) {
    console.error('Error creating proof template:', error);
    res.status(500).json({ error: 'Failed to create proof template' });
  }
});

/**
 * PUT /api/proof-templates/:id
 * Update a proof template
 */
router.put('/:id', requireDatabase, async (req, res) => {
  try {
    const { id } = req.params;
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check ownership and status
    const [existingTemplate] = await req.db
      .select()
      .from(schema.proofTemplates)
      .where(eq(schema.proofTemplates.id, id));

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    if (existingTemplate.githubUserId !== user.githubUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, version, requestedCredentials, metadata, publishedToVerifier } = req.body;

    const updateData = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (version !== undefined) updateData.version = version;
    if (requestedCredentials !== undefined) updateData.requestedCredentials = requestedCredentials;
    if (publishedToVerifier !== undefined) updateData.publishedToVerifier = publishedToVerifier;
    if (metadata !== undefined) {
      // Merge with existing metadata
      updateData.metadata = {
        ...(existingTemplate.metadata || {}),
        ...metadata,
      };
    }

    const [updatedTemplate] = await req.db
      .update(schema.proofTemplates)
      .set(updateData)
      .where(eq(schema.proofTemplates.id, id))
      .returning();

    res.json(toProofTemplateResponse(updatedTemplate));
  } catch (error) {
    console.error('Error updating proof template:', error);
    res.status(500).json({ error: 'Failed to update proof template' });
  }
});

/**
 * PATCH /api/proof-templates/:id/publish-to-verifier
 * Toggle publishedToVerifier status for Test Verifier app
 */
router.patch('/:id/publish-to-verifier', requireDatabase, async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled (boolean) is required' });
    }

    // Check ownership
    const [existingTemplate] = await req.db
      .select()
      .from(schema.proofTemplates)
      .where(eq(schema.proofTemplates.id, id));

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    if (existingTemplate.githubUserId !== user.githubUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update publishedToVerifier status
    const [updatedTemplate] = await req.db
      .update(schema.proofTemplates)
      .set({
        publishedToVerifier: enabled,
        updatedAt: new Date(),
      })
      .where(eq(schema.proofTemplates.id, id))
      .returning();

    res.json({ success: true, publishedToVerifier: updatedTemplate.publishedToVerifier });
  } catch (error) {
    console.error('Error updating publish-to-verifier status:', error);
    res.status(500).json({ error: 'Failed to update verifier status' });
  }
});

/**
 * DELETE /api/proof-templates/:id
 * Delete a proof template
 */
router.delete('/:id', requireDatabase, async (req, res) => {
  try {
    const { id } = req.params;
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check ownership
    const [existingTemplate] = await req.db
      .select()
      .from(schema.proofTemplates)
      .where(eq(schema.proofTemplates.id, id));

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    if (existingTemplate.githubUserId !== user.githubUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await req.db
      .delete(schema.proofTemplates)
      .where(eq(schema.proofTemplates.id, id));

    res.json({ success: true, message: 'Proof template deleted' });
  } catch (error) {
    console.error('Error deleting proof template:', error);
    res.status(500).json({ error: 'Failed to delete proof template' });
  }
});

/**
 * POST /api/proof-templates/:id/publish
 * Publish a proof template to the VDR (creates GitHub PR)
 */
router.post('/:id/publish', requireDatabase, requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { commitMessage } = req.body;
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get the template
    const [template] = await req.db
      .select()
      .from(schema.proofTemplates)
      .where(eq(schema.proofTemplates.id, id));

    if (!template) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    if (template.githubUserId !== user.githubUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate template has requested credentials
    if (!template.requestedCredentials || template.requestedCredentials.length === 0) {
      return res.status(400).json({
        error: 'Cannot publish template without requested credentials',
        message: 'Add at least one credential to the template before publishing.',
      });
    }

    // Generate the proof template JSON
    const templateJson = toPublishableFormat(template);

    // Create filename from ecosystem tag and name
    const ecosystemTag = template.metadata?.ecosystemTag || 'general';
    const safeName = template.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const filename = `${ecosystemTag}-${safeName}.json`;
    const filePath = `${PROOF_TEMPLATE_FOLDER_PATH}/${filename}`;

    const octokit = getOctokit(req);

    // Determine the base branch for the PR
    let baseBranch = GITHUB_BASE_BRANCH;
    if (!baseBranch) {
      const { data: repo } = await octokit.rest.repos.get({
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
      });
      baseBranch = repo.default_branch;
    }

    // Get the latest commit SHA of the base branch
    const { data: ref } = await octokit.rest.git.getRef({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      ref: `heads/${baseBranch}`,
    });
    const baseSha = ref.object.sha;

    // Create a new branch
    const timestamp = Date.now();
    const branchName = `proof-template/add-${safeName}-${timestamp}`;

    await octokit.rest.git.createRef({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    // Check if file already exists
    let existingSha = null;
    try {
      const { data: existingFile } = await octokit.rest.repos.getContent({
        owner: GITHUB_REPO_OWNER,
        repo: GITHUB_REPO_NAME,
        path: filePath,
        ref: baseBranch,
      });
      existingSha = existingFile.sha;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    // Create or update the file
    const fileContent = JSON.stringify(templateJson, null, 2);
    const encodedContent = Buffer.from(fileContent).toString('base64');
    const isUpdate = existingSha !== null;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      path: filePath,
      message: commitMessage || (isUpdate ? `Update proof template: ${template.name}` : `Add proof template: ${template.name}`),
      content: encodedContent,
      branch: branchName,
      ...(existingSha && { sha: existingSha }),
    });

    // Create a pull request
    const prTitle = isUpdate ? `Update proof template: ${template.name}` : `Add proof template: ${template.name}`;
    const credentialList = template.requestedCredentials
      .map((c) => `- ${c.credentialName}: ${c.requestedAttributes?.length || 0} attributes, ${c.predicates?.length || 0} predicates`)
      .join('\n');
    const prBody = `This PR ${isUpdate ? 'updates' : 'adds'} the proof template **${template.name}**.

**Description:** ${template.description || 'Not specified'}
**Credential Format:** ${template.credentialFormat}
**Requested Credentials:** ${template.requestedCredentials.length}

${credentialList}

Created by @${req.session.user.login} using the [Cornerstone Network Apps](https://apps.openpropertyassociation.ca).`;

    const { data: pr } = await octokit.rest.pulls.create({
      owner: GITHUB_REPO_OWNER,
      repo: GITHUB_REPO_NAME,
      title: prTitle,
      body: prBody,
      head: branchName,
      base: baseBranch,
    });

    // Update template status and VDR URI
    const vdrUri = `${BASE_URL}/${filePath}`;
    await req.db
      .update(schema.proofTemplates)
      .set({
        status: 'published',
        vdrUri,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.proofTemplates.id, id));

    res.json({
      success: true,
      prUrl: pr.html_url,
      vdrUri,
      isUpdate,
    });
  } catch (error) {
    console.error('Error publishing proof template:', error);
    res.status(500).json({ error: error.message || 'Failed to publish proof template' });
  }
});

/**
 * POST /api/proof-templates/:id/clone
 * Clone a proof template (creates a new draft copy)
 */
router.post('/:id/clone', requireDatabase, async (req, res) => {
  try {
    const { id } = req.params;
    const user = getCurrentUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [existingTemplate] = await req.db
      .select()
      .from(schema.proofTemplates)
      .where(eq(schema.proofTemplates.id, id));

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Proof template not found' });
    }

    // Anyone can clone a published template, but only owner can clone drafts
    if (existingTemplate.status !== 'published' && existingTemplate.githubUserId !== user.githubUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [clonedTemplate] = await req.db
      .insert(schema.proofTemplates)
      .values({
        name: `${existingTemplate.name} (Copy)`,
        description: existingTemplate.description,
        version: '1.0.0', // Reset version for clone
        credentialFormat: existingTemplate.credentialFormat,
        requestedCredentials: existingTemplate.requestedCredentials,
        metadata: {
          ...existingTemplate.metadata,
          author: user.authorName || user.githubUsername,
        },
        status: 'draft',
        publishedToVerifier: false,
        githubUserId: user.githubUserId,
        githubUsername: user.githubUsername,
        authorName: user.authorName,
        authorEmail: user.authorEmail,
        clonedFrom: id,
      })
      .returning();

    res.status(201).json(toProofTemplateResponse(clonedTemplate));
  } catch (error) {
    console.error('Error cloning proof template:', error);
    res.status(500).json({ error: 'Failed to clone proof template' });
  }
});

/**
 * Convert a ProofTemplate to publishable JSON format
 * This is our custom format designed for third-party verifier consumption
 */
function toPublishableFormat(template) {
  const ecosystemTag = template.metadata?.ecosystemTag || 'general';
  const safeName = template.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return {
    id: `${ecosystemTag}.${safeName}.${template.version || '1.0.0'}`,
    name: template.name,
    description: template.description || '',
    version: template.version || '1.0.0',
    credentialFormat: template.credentialFormat,
    requestedCredentials: (template.requestedCredentials || []).map((cred) => ({
      id: cred.id,
      catalogueCredentialId: cred.catalogueCredentialId,
      credentialName: cred.credentialName,
      restrictions: cred.restrictions,
      requestedAttributes: (cred.requestedAttributes || []).map((attr) => ({
        attributeName: attr.attributeName,
        label: attr.label,
        required: attr.required,
        selectiveDisclosure: attr.selectiveDisclosure,
        ...(attr.constraints && { constraints: attr.constraints }),
      })),
      predicates: (cred.predicates || []).map((pred) => ({
        attributeName: pred.attributeName,
        label: pred.label,
        predicateType: pred.predicateType,
        operator: pred.operator,
        value: pred.value,
        revealResult: pred.revealResult,
      })),
    })),
    metadata: {
      author: template.metadata?.author || template.githubUsername || template.authorName,
      ecosystemTag,
      tags: template.metadata?.tags || [],
    },
    status: template.status,
    publishedToVerifier: template.publishedToVerifier,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

export default router;
