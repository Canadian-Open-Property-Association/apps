/**
 * MetadataPanel Component
 *
 * Allows editing schema-level metadata including:
 * - Title
 * - Description
 * - Category (for VDR namespace)
 * - Credential Name (for VDR namespace)
 */

import { useSchemaStore } from '../../../store/schemaStore';
import { generateArtifactName, generateContextUrl } from '../../../types/schema';

// Predefined categories aligned with Data Catalogue
const SCHEMA_CATEGORIES = [
  { value: '', label: 'Select category...' },
  { value: 'property', label: 'Property' },
  { value: 'identity', label: 'Identity' },
  { value: 'financial', label: 'Financial' },
  { value: 'badge', label: 'Badge' },
  { value: 'professional', label: 'Professional' },
];

export default function MetadataPanel() {
  const metadata = useSchemaStore((state) => state.metadata);
  const updateMetadata = useSchemaStore((state) => state.updateMetadata);

  const isJsonLdMode = metadata.mode === 'jsonld-context';

  // Generate artifact name preview
  const artifactName = generateArtifactName(metadata.category, metadata.credentialName);

  // Convert title to kebab-case for credential name suggestion
  const suggestCredentialName = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    updateMetadata({ title });
    // Auto-suggest credential name if empty
    if (!metadata.credentialName) {
      updateMetadata({ credentialName: suggestCredentialName(title) });
    }
  };

  return (
    <div className="p-3 border-b border-gray-200 bg-gray-50">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isJsonLdMode ? 'Context Metadata' : 'Schema Metadata'}
      </h3>

      <div className="space-y-3">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Title
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., Home Credential"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Description
          </label>
          <textarea
            value={metadata.description}
            onChange={(e) => updateMetadata({ description: e.target.value })}
            placeholder="Describe the schema/context..."
            rows={2}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Namespace Fields */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">VDR Namespace</p>

          <div className="grid grid-cols-2 gap-2">
            {/* Category */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Category
              </label>
              <select
                value={metadata.category || ''}
                onChange={(e) => updateMetadata({ category: e.target.value || undefined })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {SCHEMA_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Credential Name */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Credential Name
              </label>
              <input
                type="text"
                value={metadata.credentialName || ''}
                onChange={(e) => updateMetadata({ credentialName: e.target.value || undefined })}
                placeholder="e.g., home-credential"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Filename Preview */}
          {artifactName && (
            <div className="mt-2 p-2 bg-blue-50 rounded">
              <p className="text-xs text-blue-700">
                <span className="font-medium">Filename:</span>{' '}
                <code className="bg-blue-100 px-1 rounded">
                  {artifactName}.{isJsonLdMode ? 'context.jsonld' : 'schema.json'}
                </code>
              </p>
              {isJsonLdMode && (
                <p className="text-xs text-blue-600 mt-1">
                  <span className="font-medium">Context URL:</span>{' '}
                  <code className="bg-blue-100 px-1 rounded text-[10px]">
                    {generateContextUrl(metadata.title, metadata.category, metadata.credentialName)}
                  </code>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
