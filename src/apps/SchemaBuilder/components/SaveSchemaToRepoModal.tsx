/**
 * SaveSchemaToRepoModal Component
 *
 * Modal for creating a GitHub PR to save the JSON Schema to the repository.
 * Schemas are saved to credentials/schemas/ folder.
 * Uses VDR namespace convention: {category}-{credential-name}.schema.json
 */

import { useState, useMemo } from 'react';
import { useSchemaStore } from '../../../store/schemaStore';
import { generateArtifactName } from '../../../types/schema';

interface SaveSchemaToRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

export default function SaveSchemaToRepoModal({ isOpen, onClose }: SaveSchemaToRepoModalProps) {
  const [filename, setFilename] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ prUrl: string; prNumber: number; uri: string } | null>(null);

  const metadata = useSchemaStore((state) => state.metadata);
  const currentProjectName = useSchemaStore((state) => state.currentProjectName);
  const exportSchema = useSchemaStore((state) => state.exportSchema);

  const typeLabel = 'JSON Schema';
  const fileExtension = '.schema.json';

  // Generate default filename using namespace convention
  const defaultFilename = useMemo(() => {
    const artifactName = generateArtifactName(metadata.category, metadata.credentialName);
    if (artifactName) return artifactName;
    // Fallback to project name if namespace not set
    return currentProjectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }, [metadata.category, metadata.credentialName, currentProjectName]);

  const hasNamespace = !!(metadata.category && metadata.credentialName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const content = exportSchema();

      const response = await fetch(`${API_BASE}/api/github/schema`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          filename: filename || defaultFilename,
          content: JSON.parse(content), // Parse back to object for proper handling
          title: title || `Add ${typeLabel}: ${metadata.title || currentProjectName}`,
          description,
          mode: 'json-schema', // Always use json-schema mode for schemas
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create PR');
      }

      const data = await response.json();
      setSuccess({ prUrl: data.pr.url, prNumber: data.pr.number, uri: data.uri });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save to repository');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFilename('');
    setTitle('');
    setDescription('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Save {typeLabel} to Repository
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-green-800 mb-2">Pull Request Created!</h4>
            <p className="text-gray-600 mb-2">
              PR #{success.prNumber} has been created successfully.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Once merged, the {typeLabel.toLowerCase()} will be available at:
              <br />
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block break-all">
                {success.uri}
              </code>
            </p>
            <a
              href={success.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View Pull Request
            </a>
            <button
              onClick={handleClose}
              className="block w-full mt-4 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Mode indicator */}
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Type:</strong> {typeLabel}
              </p>
              <p className="text-xs mt-1 text-blue-600">
                File will be saved to: <code>credentials/schemas/</code>
              </p>
            </div>

            {/* Namespace warning */}
            {!hasNamespace && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Set category and credential name in Metadata to use VDR naming convention.
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Convention: <code>{'{category}'}-{'{credential-name}'}{fileExtension}</code>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filename
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder={defaultFilename}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm font-mono"
                />
                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-500 font-mono">
                  {fileExtension}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {hasNamespace
                  ? `Using namespace convention: ${defaultFilename}${fileExtension}`
                  : 'Leave blank to use default name'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PR Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Add ${typeLabel}: ${metadata.title || currentProjectName}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Add any additional context about this ${typeLabel.toLowerCase()}...`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white rounded-md flex items-center gap-2 disabled:opacity-50 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating PR...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Create Pull Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
