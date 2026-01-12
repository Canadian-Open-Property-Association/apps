/**
 * Catalogue Settings Modal
 *
 * Modal for managing ecosystem tags in the Credential Catalogue.
 * Similar to Entity Manager's SettingsModal but focused on ecosystem tags.
 */

import { useState, useEffect } from 'react';
import { useCatalogueStore } from '../../../store/catalogueStore';
import { PREDEFINED_ECOSYSTEM_TAGS, EcosystemTag } from '../../../types/catalogue';

interface CatalogueSettingsModalProps {
  onClose: () => void;
}

export default function CatalogueSettingsModal({ onClose }: CatalogueSettingsModalProps) {
  const { ecosystemTags, fetchTags, addCustomTag, deleteTag, isLoading } = useCatalogueStore();

  const [customTags, setCustomTags] = useState<EcosystemTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Filter to get custom tags (not predefined)
  useEffect(() => {
    const custom = ecosystemTags.filter((t) => !t.isPredefined);
    setCustomTags(custom);
  }, [ecosystemTags]);

  // Generate ID from name
  const generateId = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Add new tag
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    const id = generateId(newTagName);

    // Check for duplicates (including predefined)
    if (ecosystemTags.some((t) => t.id === id)) {
      setError('An ecosystem tag with this name already exists');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await addCustomTag(newTagName.trim());
      setNewTagName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tag');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete custom tag
  const handleDeleteTag = async (id: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await deleteTag(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Catalogue Settings</h2>
              <p className="text-sm text-gray-500">Manage ecosystem tags</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Predefined Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Predefined Ecosystem Tags</h3>
            <p className="text-xs text-gray-500 mb-3">
              These tags are built-in and cannot be removed.
            </p>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_ECOSYSTEM_TAGS.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* Custom Tags */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Ecosystem Tags</h3>
            <p className="text-xs text-gray-500 mb-3">
              Add your own ecosystem tags to categorize imported credentials.
            </p>

            {customTags.length > 0 ? (
              <div className="space-y-2 mb-4">
                {customTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{tag.name}</span>
                      <span className="text-xs text-gray-400 font-mono">{tag.id}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      disabled={isSaving}
                      className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50"
                      title="Remove"
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
              <div className="text-sm text-gray-500 mb-4">No custom tags yet.</div>
            )}

            {/* Add new tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="New ecosystem tag name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTagName.trim() || isSaving}
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
                Add Tag
              </button>
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
