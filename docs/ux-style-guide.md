# UX Style Guide

This guide documents the standard UI patterns for apps in the credential-design-tools platform. All new apps must follow these patterns to ensure a consistent user experience.

## App Navigation Bar

Every app must have a navigation bar at the top with the following layout:

```
[Save] [Unsaved] | [Panels: List JSON Preview] | [Create Pull Request] | [⚙️ Settings]
```

### Layout Pattern

```tsx
<AppNavBar
  left={/* Save actions */}
  panels={/* Panel toggles */}
  prButton={/* Create PR button */}
  settings={/* Settings gear icon */}
/>
```

### Standard Components

Import from `src/components/AppNavBar/`:

```tsx
import {
  AppNavBar,
  SaveButton,
  UnsavedIndicator,
  PanelToggles,
  PanelToggle,
  CreatePrButton,
  SettingsButton,
  NavDivider
} from '../../components/AppNavBar';
```

### Example Usage

```tsx
<AppNavBar
  left={
    <>
      <SaveButton onClick={handleSave} disabled={!isDirty} />
      <UnsavedIndicator show={isDirty} />
    </>
  }
  panels={
    <PanelToggles>
      <PanelToggle label="List" isVisible={showList} onClick={toggleList} />
      <PanelToggle label="JSON" isVisible={showJson} onClick={toggleJson} />
    </PanelToggles>
  }
  prButton={<CreatePrButton onClick={() => setShowPrModal(true)} />}
  settings={<SettingsButton onClick={() => setShowSettings(true)} />}
/>
```

---

## Component Specifications

### 1. Settings Button

**Position:** Always on far right of nav bar

**States:**
- **Enabled:** `text-gray-400 hover:text-gray-600 hover:bg-gray-100`
- **Disabled:** `text-gray-300 cursor-not-allowed`

**Rules:**
- Apps without settings show a disabled/greyed-out gear icon
- Never hide the settings button - show disabled state instead
- Title tooltip: "Settings" or "Settings (coming soon)" when disabled

```tsx
// Enabled (app has settings)
<SettingsButton onClick={() => setShowSettings(true)} />

// Disabled (app has no settings yet)
<SettingsButton disabled />
```

### 2. Create Pull Request Button

**Style:** Green background, white text, GitHub icon

**Classes:** `px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md`

**Copy:** Must always say "Create Pull Request" (not "Publish", "Save to Repo", etc.)

```tsx
<CreatePrButton onClick={() => setShowPrModal(true)} />
```

### 3. Panel Toggles

**Label:** Always prefix with "Panels:"

**Active state:** Blue (`text-blue-600 bg-blue-50 hover:bg-blue-100`)

**Inactive state:** Gray (`text-gray-400 bg-gray-100 hover:bg-gray-200`)

**Icons:** Eye icon (visible) / Eye-off icon (hidden)

```tsx
<PanelToggles>
  <PanelToggle label="List" isVisible={showList} onClick={toggleList} />
  <PanelToggle label="JSON" isVisible={showJson} onClick={toggleJson} />
  <PanelToggle label="Preview" isVisible={showPreview} onClick={togglePreview} />
</PanelToggles>
```

### 4. Vertical Dividers

**Style:** `w-px h-6 bg-gray-300 mx-2`

**Usage:** Between sections in the nav bar (panels, PR button, settings)

```tsx
<NavDivider />
```

### 5. Save Button

**Position:** Far left of nav bar

**States:**
- Default: Gray border
- Success: Green background (brief flash after save)
- Disabled: 50% opacity

```tsx
<SaveButton
  onClick={handleSave}
  disabled={!hasUnsavedChanges}
  isSaving={isSaving}
  showSuccess={showSaveSuccess}
/>
```

### 6. Unsaved Indicator

**Style:** `text-xs text-gray-400`

**Text:** "Unsaved"

```tsx
<UnsavedIndicator show={hasUnsavedChanges} />
```

---

## App Layout Pattern

All apps should follow the sidebar + main content pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Save] [Unsaved] | [Panels: ...] | [Create PR] | [⚙️]           │  ← Nav Bar
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│   SIDEBAR    │              MAIN CONTENT AREA                    │
│   (w-72)     │                                                   │
│              │   ┌─────────────────────────────────────────┐    │
│  [+ New]     │   │                                         │    │
│              │   │     Empty State (when no selection)     │    │
│  ┌────────┐  │   │                                         │    │
│  │ Item 1 │  │   │     "Select an item from the list      │    │
│  ├────────┤  │   │      or create a new one"              │    │
│  │ Item 2 │  │   │                                         │    │
│  ├────────┤  │   │     [+ Create New] button              │    │
│  │ Item 3 │  │   │                                         │    │
│  └────────┘  │   └─────────────────────────────────────────┘    │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

### Key Behaviors

1. **On app open:** Show sidebar with item list + empty state in main area
2. **No welcome/selection screen:** User immediately sees the app layout
3. **Sidebar visible by default:** Always show the item list on load
4. **Empty state message:** "Select an item from the list or create a new one"
5. **Click item:** Opens in editor (main content area)
6. **Click "New":** Creates item and opens in editor

### Empty State Component

When no item is selected, show this pattern:

```tsx
<div className="flex-1 flex items-center justify-center bg-white">
  <div className="text-center">
    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" /* icon */ />
    <p className="text-lg font-medium text-gray-700">Select a [Item Type]</p>
    <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
      Choose an item from the sidebar or create a new one
    </p>
    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
      + Create New
    </button>
  </div>
</div>
```

---

## Color Palette

| Element | Color | Tailwind Class |
|---------|-------|----------------|
| Panel toggle (active) | Blue | `text-blue-600 bg-blue-50` |
| Panel toggle (inactive) | Gray | `text-gray-400 bg-gray-100` |
| Create PR button | Green | `bg-green-600 hover:bg-green-700` |
| Settings button (enabled) | Gray | `text-gray-400 hover:text-gray-600` |
| Settings button (disabled) | Light gray | `text-gray-300` |
| Save button | Gray border | `border-gray-300` |
| Unsaved indicator | Gray | `text-gray-400` |
| Dividers | Light gray | `bg-gray-300` |

---

## Nav Bar Styling

All nav bars must use these base styles:

```tsx
<div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
  {/* content */}
</div>
```

---

## Settings Modal Pattern

Settings modals should use the split-pane layout:

```
┌─────────────────────────────────────────────────────────────────┐
│ Settings                                                    [X] │
├────────────────┬────────────────────────────────────────────────┤
│                │                                                 │
│  Categories    │  Category Content                               │
│                │                                                 │
│  > General     │  Setting 1: [input]                            │
│    Display     │  Setting 2: [input]                            │
│    Advanced    │  Setting 3: [toggle]                           │
│                │                                                 │
└────────────────┴────────────────────────────────────────────────┘
```

---

## Apps Reference

### Apps with Settings (enabled gear)
- Badges → BadgeSettings modal
- VCT Builder → VctSettingsModal
- Proof Template Builder → TemplateSettingsModal
- Credential Catalogue → CatalogueSettingsModal
- Entity Manager → SettingsModal

### Apps without Settings (disabled gear)
- Schema Builder
- Data Dictionary
- Data Harmonization
- Asset Manager
- Forms Builder
- Test Issuer

---

## Checklist for New Apps

When creating a new app:

- [ ] Import and use shared `AppNavBar` components
- [ ] Position settings gear icon on far right (even if disabled)
- [ ] Use standard "Create Pull Request" button style and copy
- [ ] Add "Panels:" label before panel toggles
- [ ] Use eye icons for panel visibility toggles
- [ ] Add vertical dividers between nav bar sections
- [ ] Open directly to sidebar + empty state (no welcome screen)
- [ ] Show empty state with "Select an item..." message when no selection
- [ ] Sidebar visible by default on app load
