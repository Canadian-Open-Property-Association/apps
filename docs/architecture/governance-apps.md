# Governance Apps Architecture

This document describes how governance apps work and how they publish content to the VDR (Verifiable Data Registry).

## Overview

Governance apps are configurator tools that allow users to:
1. Design/configure content according to specific standards/formats
2. Preview the output (typically as JSON)
3. Publish the content to a GitHub repository (VDR)

**Common workflow:**
```
Design in UI → Preview JSON → Create Pull Request → Merge → Published to VDR
```

---

## Governance Apps

| App | Content Type | VDR Path | Output Format |
|-----|--------------|----------|---------------|
| VCT Builder | Verifiable Credential Types | `credentials/vct/` | VCT JSON |
| Schema Builder | JSON Schemas | `credentials/schemas/` | JSON Schema |
| Entity Manager | Entity Statements | `credentials/entities/` | Entity JSON |
| Badges | Badge Definitions | `credentials/badges/` | Badge JSON |
| Proof Templates | Proof Request Templates | `credentials/proof-templates/` | DIF PE JSON |
| Data Dictionary | Vocabulary Types | `credentials/vocab/` | Vocab JSON |
| Asset Manager | Images/Logos | `credentials/*/` | Binary files |
| Data Harmonization | Field Mappings | (configurable) | Mapping JSON |

---

## VDR Path Configuration

### Tenant Configuration

VDR paths are configured per-tenant in `tenant-config.json`:

```json
{
  "vdr": {
    "baseUrl": "https://example.com",
    "paths": {
      "vct": "credentials/vct",
      "schemas": "credentials/schemas",
      "contexts": "credentials/contexts",
      "entities": "credentials/entities",
      "badges": "credentials/badges",
      "proofTemplates": "credentials/proof-templates"
    }
  },
  "github": {
    "owner": "my-organization",
    "repo": "governance",
    "baseBranch": "main"
  }
}
```

### Configuration UI

Paths are configured in **Settings → GitHub & VDR**:
- VDR Base URL - The domain where content is published
- Folder Paths (Advanced) - Individual paths for each content type

### Using Paths in Code

Apps should use the `useVdrPaths` hook to get paths:

```tsx
import { useVdrPaths } from '../hooks/useVdrPaths';

function PublishModal() {
  const { getPath, getFullUrl, getBasePath } = useVdrPaths();

  // Get full repository path
  const repoPath = getPath('vct', 'my-credential.json');
  // Result: "credentials/vct/my-credential.json"

  // Get published URL
  const publicUrl = getFullUrl('vct', 'my-credential.json');
  // Result: "https://example.com/credentials/vct/my-credential.json"

  // Pass path to backend API
  const response = await fetch('/api/github/vct', {
    body: JSON.stringify({
      filename: 'my-credential',
      path: getBasePath('vct'),  // "credentials/vct"
      content: vctData,
    }),
  });
}
```

---

## Publish Flow

### Frontend Flow

1. User clicks "Create Pull Request" button
2. Publish modal opens with filename and PR details form
3. Modal shows computed path from tenant config
4. User submits form
5. Frontend sends request to backend API
6. Backend creates PR on GitHub
7. Modal shows success with PR link

### Backend Flow

1. Receive publish request with content and path
2. Load tenant config (or use defaults)
3. Authenticate with GitHub API
4. Create branch from base branch
5. Commit file(s) to path
6. Create pull request
7. Return PR URL to frontend

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/github/vct` | Publish VCT files |
| `POST /api/github/schema` | Publish JSON Schemas |
| `POST /api/github/entity-statement` | Publish entity statements |
| `POST /api/github/badge` | Publish badge definitions |
| `POST /api/github/proof-template` | Publish proof templates |
| `POST /api/github/asset` | Publish image assets |

---

## File Naming Conventions

### VCT Files
```
{name}.json
Example: residential-property-ownership.json
```

### Schema Files
```
{category}-{credential-name}.schema.json
Example: property-residential-ownership.schema.json
```

### Entity Statements
```
{entity-id}.json
Example: abc-realty-corp.json
```

### Badges
```
{badge-id}.json
Example: verified-property-owner.json
```

### Proof Templates
```
{template-id}.json
Example: property-verification-request.json
```

---

## UI Components

### Publish Button

All governance apps use the shared `GitHubPublishButton`:

```tsx
import { GitHubPublishButton } from '../components/shared';

<GitHubPublishButton
  onClick={() => setShowPublishModal(true)}
  disabled={!isAuthenticated || !hasContent}
/>
```

**Styling:**
- Green background (`bg-green-600`)
- GitHub logo icon
- Text: "Create Pull Request"

### JSON Viewer

All governance apps use the shared `JsonViewer` for JSON preview:

```tsx
import { JsonViewer } from '../components/shared';

<JsonViewer
  json={outputData}
  filename="my-output"
  title="Output Preview"
  showDownload={true}
/>
```

**Features:**
- Dark theme (`bg-gray-900`)
- Syntax highlighting
- Copy/Download buttons
- Optional editing mode

### Publish Modal Pattern

Each app has a publish modal that:
1. Shows file path (from tenant config)
2. Allows filename customization
3. Takes PR title and description
4. Shows loading state during creation
5. Shows success with PR link

---

## Adding a New Governance App

### 1. Create the App Structure

```
src/apps/MyNewApp/
├── MyNewAppApp.tsx       # Main app component
├── components/
│   ├── MyToolbar.tsx     # App toolbar with publish button
│   ├── MyEditor.tsx      # Content editor
│   ├── MyPreview.tsx     # JSON preview
│   └── PublishModal.tsx  # Publish modal
├── store/                # Optional Zustand store
└── types/                # TypeScript types
```

### 2. Add VDR Path

Update `src/types/tenantConfig.ts`:

```typescript
export interface VdrPaths {
  // ... existing paths
  myNewType: string;
}

export const DEFAULT_TENANT_CONFIG = {
  vdr: {
    paths: {
      // ... existing paths
      myNewType: 'credentials/my-new-type',
    },
  },
};
```

Update `server/lib/tenantConfig.js` with matching defaults.

### 3. Add Backend Endpoint

Update `server/proxy.js`:

```javascript
// Publish my new content type
app.post('/api/github/my-new-type', authMiddleware, async (req, res) => {
  // Handle publish request
});
```

### 4. Use Shared Components

```tsx
// Toolbar
import { GitHubPublishButton } from '../../components/shared';

<GitHubPublishButton onClick={() => setShowModal(true)} />

// JSON Preview
import { JsonViewer } from '../../components/shared';

<JsonViewer json={outputData} filename="my-content" />

// Publish Modal - use useVdrPaths
import { useVdrPaths } from '../../hooks/useVdrPaths';

const { getPath, getBasePath } = useVdrPaths();
const fullPath = getPath('myNewType', `${filename}.json`);
```

### 5. Update Settings UI

Add the new path to `GitHubVdrConfigPanel.tsx`:

```tsx
{ key: 'myNewType', label: 'My New Type' },
```

---

## Configuration Defaults

When no tenant config exists, apps use these defaults:

```javascript
{
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
}
```

---

## Related Documentation

- [Shared Components](shared-components.md) - Reusable UI components
- [Multi-Tenancy](multi-tenancy.md) - Tenant configuration architecture
- [Orbit Integration](../orbit-integration/config-service.md) - Orbit API configuration
