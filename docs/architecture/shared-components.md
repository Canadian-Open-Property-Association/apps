# Shared UI Components

This document describes the shared UI components used across governance apps for consistent user experience.

## Overview

The platform provides a set of reusable components located in `src/components/shared/` that ensure visual consistency across all governance apps.

**Key Principles:**
- Consistent styling (colors, spacing, typography)
- Standardized user interactions
- Dark theme for JSON viewers
- Blue accent colors for settings
- Green for GitHub/publish actions

---

## Components

### GitHubPublishButton

A standardized button for creating GitHub pull requests.

**Location:** `src/components/shared/GitHubPublishButton.tsx`

**Usage:**
```tsx
import { GitHubPublishButton } from '../components/shared';

<GitHubPublishButton
  onClick={() => setShowPublishModal(true)}
  disabled={!isAuthenticated}
  loading={isCreatingPR}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | required | Click handler |
| `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `text` | `string` | `"Create Pull Request"` | Button text |
| `loadingText` | `string` | `"Creating PR..."` | Text during loading |

**Styling:**
- Green background (`bg-green-600`)
- White text with GitHub logo icon
- Gray disabled state
- Loading spinner animation

---

### JsonViewer

A JSON viewer with dark theme and syntax highlighting.

**Location:** `src/components/shared/JsonViewer.tsx`

**Usage:**
```tsx
import { JsonViewer } from '../components/shared';

// Read-only viewer
<JsonViewer
  json={myData}
  filename="output.json"
  showDownload={true}
/>

// Editable viewer
<JsonViewer
  json={myData}
  editable
  onChange={(newJson) => setData(newJson)}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `json` | `object \| string` | required | JSON data to display |
| `editable` | `boolean` | `false` | Enable editing |
| `onChange` | `(json: object) => void` | - | Called on edit (editable mode) |
| `onValidate` | `(json: object) => boolean \| string` | - | Custom validation |
| `filename` | `string` | `"output"` | Download filename |
| `showDownload` | `boolean` | `true` | Show download button |
| `title` | `string` | - | Header title |
| `subtitle` | `string` | - | Header subtitle |
| `stats` | `{label, value}[]` | - | Footer statistics |

**Features:**
- Dark theme (`bg-gray-900`)
- Syntax highlighting (cyan keys, green strings, orange numbers, purple booleans)
- Copy to clipboard with feedback
- Download as JSON file
- Reset button (for editable mode)
- Parse error display
- Unsaved changes indicator

---

### SettingsModal

A modal shell with sidebar navigation for app settings.

**Location:** `src/components/shared/SettingsModal.tsx`

**Usage:**
```tsx
import { SettingsModal, SettingsCategory } from '../components/shared';

const categories: SettingsCategory[] = [
  { id: 'general', label: 'General', icon: <GearIcon /> },
  { id: 'advanced', label: 'Advanced', icon: <CogIcon /> },
];

<SettingsModal
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
  title="App Settings"
  subtitle="Configure application options"
  categories={categories}
  activeCategory={activeCategory}
  onCategoryChange={setActiveCategory}
  hasChanges={hasChanges}
  onSave={handleSave}
  isSaving={isSaving}
>
  {activeCategory === 'general' && <GeneralSettings />}
  {activeCategory === 'advanced' && <AdvancedSettings />}
</SettingsModal>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Whether modal is visible |
| `onClose` | `() => void` | required | Close handler |
| `title` | `string` | required | Modal title |
| `subtitle` | `string` | - | Subtitle text |
| `categories` | `SettingsCategory[]` | required | Navigation categories |
| `activeCategory` | `string` | required | Currently active category ID |
| `onCategoryChange` | `(id: string) => void` | required | Category change handler |
| `children` | `ReactNode` | required | Content (check activeCategory) |
| `hasChanges` | `boolean` | `false` | Show unsaved indicator |
| `onSave` | `() => void` | - | Save handler |
| `isSaving` | `boolean` | `false` | Saving state |
| `error` | `string \| null` | - | Error message |

**Layout:**
- Fixed 800x600px modal
- Left sidebar with category navigation
- Right content area (scrollable)
- Footer with Cancel/Save buttons

---

### SettingsButton

A gear icon button for opening settings.

**Location:** `src/components/shared/SettingsButton.tsx`

**Usage:**
```tsx
import { SettingsButton } from '../components/shared';

<SettingsButton
  onClick={() => setShowSettings(true)}
  tooltip="App Settings"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | required | Click handler |
| `tooltip` | `string` | `"Settings"` | Tooltip text |
| `disabled` | `boolean` | `false` | Disable button |

---

## Hooks

### useVdrPaths

Access VDR (Verifiable Data Registry) paths from tenant configuration.

**Location:** `src/hooks/useVdrPaths.ts`

**Usage:**
```tsx
import { useVdrPaths } from '../hooks/useVdrPaths';

function MyComponent() {
  const { getPath, getFullUrl, getBasePath } = useVdrPaths();

  // Get repository path
  const path = getPath('vct', 'my-credential.json');
  // Returns: "credentials/vct/my-credential.json"

  // Get full URL
  const url = getFullUrl('schemas', 'my-schema.schema.json');
  // Returns: "https://example.com/credentials/schemas/my-schema.schema.json"
}
```

**Available path types:**
- `vct` - Verifiable Credential Types
- `schemas` - JSON Schemas
- `contexts` - JSON-LD Contexts
- `entities` - Entity statements
- `badges` - Badge definitions
- `proofTemplates` - Proof request templates

**Functions:**
| Function | Description |
|----------|-------------|
| `getPath(type, filename)` | Get repository path for a file |
| `getFullUrl(type, filename)` | Get full published URL |
| `getBasePath(type)` | Get base path for a content type |
| `getBaseUrl()` | Get VDR base URL |
| `getGitHubConfig()` | Get GitHub repo configuration |
| `ensureConfigLoaded()` | Ensure tenant config is loaded |

---

## Utilities

### highlightJson

Syntax highlighting for JSON strings.

**Location:** `src/utils/jsonHighlight.ts`

**Usage:**
```tsx
import { highlightJson } from '../utils/jsonHighlight';

const html = highlightJson(JSON.stringify(data, null, 2));
// Returns HTML string with colored spans
```

**Color scheme:**
- Keys: `text-cyan-400`
- Strings: `text-green-400`
- Numbers: `text-orange-400`
- Booleans/null: `text-purple-400`
- Brackets: `text-gray-500`

---

## Migration Guide

### Converting to shared components

**JSON Viewer:**
```tsx
// Before (light theme, no highlighting)
<pre className="text-xs font-mono">
  {JSON.stringify(data, null, 2)}
</pre>

// After (dark theme, syntax highlighting)
<JsonViewer json={data} filename="output" />
```

**Settings Modal:**
```tsx
// Before (custom modal)
<div className="fixed inset-0 ...">
  {/* Custom modal implementation */}
</div>

// After (shared modal)
<SettingsModal
  isOpen={show}
  onClose={handleClose}
  title="Settings"
  categories={categories}
  activeCategory={active}
  onCategoryChange={setActive}
>
  {/* Content */}
</SettingsModal>
```

**Publish Button:**
```tsx
// Before (inline button)
<button className="bg-green-600 text-white ...">
  <GitHubIcon />
  Create Pull Request
</button>

// After (shared component)
<GitHubPublishButton onClick={handlePublish} />
```

---

## Best Practices

1. **Always use shared components** for consistency
2. **Use useVdrPaths** for all GitHub publish operations
3. **Dark theme for JSON** - use JsonViewer, not raw `<pre>` tags
4. **Settings modal pattern** - sidebar navigation with categories
5. **Green for publish** - GitHub/publish actions use green styling
6. **Blue for settings** - Settings UI uses blue accent colors

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/components/shared/index.ts` | Exports all shared components |
| `src/components/shared/GitHubPublishButton.tsx` | Publish button |
| `src/components/shared/JsonViewer.tsx` | JSON viewer |
| `src/components/shared/SettingsModal.tsx` | Settings modal shell |
| `src/components/shared/SettingsButton.tsx` | Settings trigger |
| `src/hooks/useVdrPaths.ts` | VDR path hook |
| `src/utils/jsonHighlight.ts` | JSON syntax highlighting |
