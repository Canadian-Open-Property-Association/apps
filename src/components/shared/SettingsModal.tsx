/**
 * Settings Modal Component
 *
 * A standardized settings modal shell with sidebar navigation.
 * Based on the Entity Manager settings modal pattern.
 *
 * Features:
 * - Fixed 800x600px modal
 * - Left sidebar with category navigation
 * - Right content area (scrollable)
 * - Header with icon, title, subtitle, and close button
 * - Footer with unsaved changes indicator and action buttons
 *
 * @example
 * ```tsx
 * <SettingsModal
 *   isOpen={showSettings}
 *   onClose={() => setShowSettings(false)}
 *   title="App Settings"
 *   subtitle="Configure application options"
 *   categories={[
 *     { id: 'general', label: 'General', icon: <SettingsIcon /> },
 *     { id: 'advanced', label: 'Advanced', icon: <CogIcon /> },
 *   ]}
 *   activeCategory={activeCategory}
 *   onCategoryChange={setActiveCategory}
 *   hasChanges={hasChanges}
 *   onSave={handleSave}
 *   isSaving={isSaving}
 * >
 *   {activeCategory === 'general' && <GeneralSettings />}
 *   {activeCategory === 'advanced' && <AdvancedSettings />}
 * </SettingsModal>
 * ```
 */

import { ReactNode } from 'react';

export interface SettingsCategory {
  /** Unique identifier for the category */
  id: string;
  /** Display label */
  label: string;
  /** Icon element (SVG recommended) */
  icon: ReactNode;
}

interface SettingsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Navigation categories for sidebar */
  categories: SettingsCategory[];
  /** Currently active category ID */
  activeCategory: string;
  /** Handler for category change */
  onCategoryChange: (categoryId: string) => void;
  /** Content to render (should check activeCategory) */
  children: ReactNode;
  /** Whether there are unsaved changes */
  hasChanges?: boolean;
  /** Save handler */
  onSave?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Optional error message */
  error?: string | null;
  /** Custom footer content (replaces default buttons) */
  customFooter?: ReactNode;
}

/** Settings gear icon SVG path */
const GEAR_ICON_OUTER =
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
const GEAR_ICON_INNER = 'M15 12a3 3 0 11-6 0 3 3 0 016 0z';

export function SettingsModal({
  isOpen,
  onClose,
  title,
  subtitle,
  categories,
  activeCategory,
  onCategoryChange,
  children,
  hasChanges = false,
  onSave,
  isSaving = false,
  error,
  customFooter,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={GEAR_ICON_OUTER}
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={GEAR_ICON_INNER}
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar - Categories */}
          <div className="w-56 border-r border-gray-200 bg-gray-50 flex-shrink-0">
            <nav className="p-3 space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <span
                    className={activeCategory === category.id ? 'text-blue-600' : 'text-gray-400'}
                  >
                    {category.icon}
                  </span>
                  {category.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Error message */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          {customFooter ? (
            customFooter
          ) : (
            <>
              <div className="text-sm text-gray-500">
                {hasChanges && <span className="text-amber-600">Unsaved changes</span>}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {hasChanges ? 'Cancel' : 'Close'}
                </button>
                {hasChanges && onSave && (
                  <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
