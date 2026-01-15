/**
 * Template Settings Modal
 *
 * Modal for managing proof template settings:
 * - Template Types: Manage categories for templates
 * - Test Verifier: Enable/disable templates for Test Verifier app
 */

import { useState, useEffect } from 'react';
import { useProofTemplateStore } from '../../../store/proofTemplateStore';
import { CREDENTIAL_FORMAT_LABELS, CredentialFormat } from '../../../types/proofTemplate';

interface TemplateSettingsModalProps {
  onClose: () => void;
}

type SettingsCategory = 'template-types' | 'test-verifier';

const CATEGORIES = [
  {
    id: 'template-types' as const,
    label: 'Template Types',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
  {
    id: 'test-verifier' as const,
    label: 'Test Verifier',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
];

export default function TemplateSettingsModal({ onClose }: TemplateSettingsModalProps) {
  const {
    templates,
    templateTypes,
    fetchTemplates,
    fetchTemplateTypes,
    addTemplateType,
    deleteTemplateType,
    publishToVerifier,
  } = useProofTemplateStore();

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('template-types');
  const [newTypeName, setNewTypeName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch types and templates on mount
  useEffect(() => {
    fetchTemplateTypes();
    fetchTemplates();
  }, [fetchTemplateTypes, fetchTemplates]);

  // Generate ID from name
  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Add new type
  const handleAddType = async () => {
    if (!newTypeName.trim()) return;

    const id = generateId(newTypeName);

    // Check for duplicates
    if (templateTypes.some((t) => t.id === id)) {
      setError('A template type with this name already exists');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await addTemplateType(newTypeName.trim());
      setNewTypeName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add type');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete type
  const handleDeleteType = async (id: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await deleteTemplateType(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete type');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle template for verifier
  const handleToggleVerifier = async (templateId: string, currentlyEnabled: boolean) => {
    setTogglingId(templateId);
    setError(null);
    try {
      await publishToVerifier(templateId, !currentlyEnabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update verifier status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Template Settings</h2>
              <p className="text-sm text-gray-500">Configure template options and publishing</p>
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
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-white text-purple-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  <span
                    className={activeCategory === category.id ? 'text-purple-600' : 'text-gray-400'}
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
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Template Types */}
              {activeCategory === 'template-types' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Template Types</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage the types used to categorize proof templates.
                    </p>
                  </div>

                  {/* All Types */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Types ({templateTypes.length})
                    </h4>

                    {templateTypes.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {templateTypes.map((type) => (
                          <div
                            key={type.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
                              {type.name}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">{type.id}</span>
                            <button
                              onClick={() => handleDeleteType(type.id)}
                              disabled={isSaving}
                              className="ml-auto p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50"
                              title="Remove type"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-4">No types yet. Add one below.</p>
                    )}

                    {/* Add new type */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Type</h4>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                          placeholder="Type name (e.g., Real Estate)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={handleAddType}
                          disabled={!newTypeName.trim() || isSaving}
                          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSaving ? (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          )}
                          Add Type
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Verifier */}
              {activeCategory === 'test-verifier' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Test Verifier</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Enable templates to be available in the Test Verifier app for generating
                      proof requests.
                    </p>
                  </div>

                  {/* Templates List */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Templates ({templates.length})
                    </h4>

                    {templates.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto text-gray-300 mb-3"
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
                        <p className="text-sm">No templates yet</p>
                        <p className="text-xs mt-1">Create templates first to enable them here</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {templates.map((template) => {
                          const isToggling = togglingId === template.id;
                          return (
                            <div
                              key={template.id}
                              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              {/* Template Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 truncate">
                                    {template.name}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                    {CREDENTIAL_FORMAT_LABELS[template.credentialFormat as CredentialFormat] || template.credentialFormat}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {template.credentialCount} credential{template.credentialCount !== 1 ? 's' : ''} requested
                                </p>
                              </div>

                              {/* Toggle Switch */}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={template.publishedToVerifier}
                                  onChange={() => handleToggleVerifier(template.id, template.publishedToVerifier)}
                                  disabled={isToggling}
                                  className="sr-only peer"
                                />
                                <div className={`
                                  w-11 h-6 bg-gray-200 rounded-full peer
                                  peer-checked:bg-purple-600
                                  peer-focus:ring-4 peer-focus:ring-purple-300
                                  after:content-[''] after:absolute after:top-0.5 after:left-[2px]
                                  after:bg-white after:border-gray-300 after:border after:rounded-full
                                  after:h-5 after:w-5 after:transition-all
                                  peer-checked:after:translate-x-full peer-checked:after:border-white
                                  ${isToggling ? 'opacity-50 cursor-wait' : ''}
                                `} />
                                {isToggling && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="animate-spin h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24">
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-4">
                      Enabled templates will appear in the Test Verifier app where you can generate
                      QR codes for proof requests.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
