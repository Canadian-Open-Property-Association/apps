import { useVctStore } from '../../store/vctStore';

export default function MetadataForm() {
  const currentVct = useVctStore((state) => state.currentVct);
  const updateVctField = useVctStore((state) => state.updateVctField);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Credential Metadata
      </h3>

      {/* VCT URI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          VCT URI <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={currentVct.vct}
          onChange={(e) => updateVctField('vct', e.target.value)}
          placeholder="https://example.com/credentials/my-credential"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Unique identifier URI for this credential type
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={currentVct.name}
          onChange={(e) => updateVctField('name', e.target.value)}
          placeholder="My Credential"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Human-readable name for the credential type
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={currentVct.description || ''}
          onChange={(e) => updateVctField('description', e.target.value)}
          placeholder="A brief description of this credential..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {/* Schema URI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Schema URI
        </label>
        <input
          type="url"
          value={currentVct.schema_uri || ''}
          onChange={(e) => updateVctField('schema_uri', e.target.value)}
          placeholder="https://example.com/schemas/my-credential.json"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          URL to the JSON Schema defining this credential's structure
        </p>
      </div>

      {/* Schema URI Integrity */}
      {currentVct.schema_uri && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schema URI Integrity Hash
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentVct['schema_uri#integrity'] || ''}
              onChange={(e) =>
                updateVctField('schema_uri#integrity', e.target.value)
              }
              placeholder="sha256-..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
            />
            <button
              type="button"
              onClick={async () => {
                if (currentVct.schema_uri) {
                  try {
                    const response = await fetch(
                      `http://localhost:5174/hash?url=${encodeURIComponent(currentVct.schema_uri)}`
                    );
                    const data = await response.json();
                    if (data.hash) {
                      updateVctField('schema_uri#integrity', data.hash);
                    }
                  } catch (error) {
                    console.error('Failed to generate hash:', error);
                    alert('Failed to generate hash. Make sure the proxy server is running.');
                  }
                }
              }}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Generate
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            SHA-256 integrity hash for the schema file
          </p>
        </div>
      )}
    </div>
  );
}
