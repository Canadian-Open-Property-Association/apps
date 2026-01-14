/**
 * Proof Template Builder App
 *
 * Single-page layout for creating and managing proof templates.
 * - Collapsible sidebar with template list on left
 * - Two-pane config view when a template is selected
 * - Toggleable JSON preview panel on right (like Schema Builder)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppTracking } from '../../hooks/useAppTracking';
import { useProofTemplateStore } from '../../store/proofTemplateStore';
import TemplateSidebar from './components/TemplateSidebar';
import TemplateConfigPanel from './components/TemplateConfigPanel';
import PresentationPreview from './components/PresentationPreview';
import TemplateSettingsModal from './components/TemplateSettingsModal';
import {
  AppNavBar,
  SaveButton,
  UnsavedIndicator,
  PanelToggles,
  PanelToggle,
  CreatePrButton,
  SettingsButton
} from '../../components/AppNavBar';

// Resizable divider component for horizontal panel resizing
function ResizableDivider({ onDrag }: { onDrag: (delta: number) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      startXRef.current = e.clientX;
      onDrag(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDrag]);

  return (
    <div
      className={`w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize flex-shrink-0 flex items-center justify-center transition-colors ${
        isDragging ? 'bg-blue-500' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      <div className="w-0.5 h-8 bg-gray-400 rounded" />
    </div>
  );
}

export default function ProofTemplatesApp() {
  useAppTracking('proofs-template-builder', 'Proof Template Builder');

  const {
    showSidebar,
    showJsonPreview,
    selectedTemplateId,
    toggleSidebar,
    toggleJsonPreview,
    createTemplate,
    setSelectedTemplateId,
    getPresentationDefinition,
    currentTemplate,
    saveTemplate,
    publishTemplate,
    isSaving,
    templateTypes,
  } = useProofTemplateStore();

  // Panel width for resizable JSON preview (in pixels)
  const [configPanelWidth, setConfigPanelWidth] = useState(600);
  const MIN_PANEL_WIDTH = 400;
  const MAX_PANEL_WIDTH = 900;

  const handleDividerDrag = useCallback((delta: number) => {
    setConfigPanelWidth((prev) => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, prev + delta)));
  }, []);

  // Create template modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [isCreating, setIsCreating] = useState(false);

  // Publish modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; prUrl?: string; error?: string } | null>(null);

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track changes
  useEffect(() => {
    if (currentTemplate) {
      setHasUnsavedChanges(true);
    }
  }, [currentTemplate?.name, currentTemplate?.description, currentTemplate?.purpose, currentTemplate?.claims, currentTemplate?.metadata]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!currentTemplate || !hasUnsavedChanges) return;
    try {
      await saveTemplate();
      setHasUnsavedChanges(false);
    } catch {
      // Error handled in store
    }
  }, [currentTemplate, hasUnsavedChanges, saveTemplate]);

  // Handle publish
  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishResult(null);
    try {
      const result = await publishTemplate(publishMessage || undefined);
      setPublishResult({ success: true, prUrl: result.prUrl });
    } catch (err) {
      setPublishResult({ success: false, error: err instanceof Error ? err.message : 'Failed to publish' });
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle create template
  const handleCreate = async () => {
    if (!newName.trim()) return;

    setIsCreating(true);
    try {
      const template = await createTemplate(newName.trim(), newDescription.trim(), newCategory);
      setShowNewModal(false);
      setNewName('');
      setNewDescription('');
      setNewCategory('general');
      setSelectedTemplateId(template.id);
    } catch (err) {
      // Error handled in store
    } finally {
      setIsCreating(false);
    }
  };

  // Get presentation definition for JSON preview
  const definition = getPresentationDefinition();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with toggles and actions */}
      <AppNavBar
        left={
          currentTemplate && (
            <>
              <SaveButton
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                isSaving={isSaving}
              />
              <CreatePrButton
                onClick={() => setShowPublishModal(true)}
                disabled={currentTemplate.claims.length === 0}
              />
              <UnsavedIndicator show={hasUnsavedChanges && !isSaving} />
              {isSaving && <span className="text-xs text-blue-600">Saving...</span>}
            </>
          )
        }
        panels={
          <PanelToggles>
            <PanelToggle
              label="List"
              isVisible={showSidebar}
              onClick={toggleSidebar}
              title={showSidebar ? 'Hide template list' : 'Show template list'}
            />
            <PanelToggle
              label="JSON"
              isVisible={showJsonPreview}
              onClick={toggleJsonPreview}
              title={showJsonPreview ? 'Hide JSON panel' : 'Show JSON panel'}
            />
          </PanelToggles>
        }
        settings={<SettingsButton onClick={() => setShowSettings(true)} />}
      />

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <TemplateSidebar onCreateTemplate={() => setShowNewModal(true)} />
          </div>
        )}

        {/* Config panel (or empty state) */}
        {selectedTemplateId ? (
          <>
            <div
              className="bg-white flex flex-col overflow-hidden flex-shrink-0"
              style={{ width: showJsonPreview ? `${configPanelWidth}px` : '100%' }}
            >
              <TemplateConfigPanel />
            </div>

            {/* Resizable Divider and JSON Preview Panel */}
            {showJsonPreview && (
              <>
                <ResizableDivider onDrag={handleDividerDrag} />
                <div className="flex-1 bg-gray-900 flex flex-col overflow-hidden">
                  <PresentationPreview definition={definition} />
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-700">Select a Template</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                Choose a template from the sidebar to configure its verification rules
              </p>
              {!showSidebar && (
                <button
                  onClick={toggleSidebar}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                >
                  Show template list
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* New Template Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create New Proof Template</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Age Verification, Income Proof"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {templateTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of what this template verifies..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewName('');
                  setNewDescription('');
                  setNewCategory('general');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && <TemplateSettingsModal onClose={() => setShowSettings(false)} />}

      {/* Publish Modal */}
      {showPublishModal && currentTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Publish to VDR</h2>
              <p className="text-gray-600 text-sm mt-1">
                This will create a pull request to add this proof template to the Verifiable Data Registry.
              </p>
            </div>

            {publishResult ? (
              <div className="p-6">
                {publishResult.success ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pull Request Created!</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Your proof template has been submitted for review.
                    </p>
                    <a
                      href={publishResult.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      View Pull Request
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Publishing Failed</h3>
                    <p className="text-red-600 text-sm">{publishResult.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commit Message (optional)
                  </label>
                  <input
                    type="text"
                    value={publishMessage}
                    onChange={(e) => setPublishMessage(e.target.value)}
                    placeholder={`Add proof template: ${currentTemplate.name}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Template Summary</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Name:</dt>
                      <dd className="font-medium">{currentTemplate.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Category:</dt>
                      <dd>{currentTemplate.metadata.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Claims:</dt>
                      <dd>{currentTemplate.claims.length}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setPublishMessage('');
                  setPublishResult(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {publishResult ? 'Close' : 'Cancel'}
              </button>
              {!publishResult && (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isPublishing && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  Create Pull Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
