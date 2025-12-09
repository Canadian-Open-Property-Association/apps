import { useState, useEffect } from 'react';
import { useDataCatalogueStore } from '../../../store/dataCatalogueStore';

interface Entity {
  id: string;
  name: string;
  types: string[];
}

interface BulkAssignModalProps {
  dataTypeId: string;
  selectedPropertyIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

export default function BulkAssignModal({ dataTypeId, selectedPropertyIds, onClose, onSuccess }: BulkAssignModalProps) {
  const { bulkAddProviderMapping, bulkRemoveProviderMapping } = useDataCatalogueStore();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [providerFieldName, setProviderFieldName] = useState('');
  const [regionsCovered, setRegionsCovered] = useState<string[]>([]);
  const [newRegion, setNewRegion] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch entities on mount
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/entities`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch entities');
        const data = await response.json();
        // Filter to only data furnishers
        const furnishers = data.filter((e: Entity) => e.types?.includes('data-furnisher'));
        setEntities(furnishers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entities');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntities();
  }, []);

  const handleAddRegion = () => {
    if (newRegion.trim() && !regionsCovered.includes(newRegion.trim().toUpperCase())) {
      setRegionsCovered([...regionsCovered, newRegion.trim().toUpperCase()]);
      setNewRegion('');
    }
  };

  const handleRemoveRegion = (region: string) => {
    setRegionsCovered(regionsCovered.filter(r => r !== region));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntityId) {
      setError('Please select an entity');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (mode === 'add') {
        const selectedEntity = entities.find(e => e.id === selectedEntityId);
        const result = await bulkAddProviderMapping(dataTypeId, selectedPropertyIds, {
          entityId: selectedEntityId,
          entityName: selectedEntity?.name || '',
          providerFieldName: providerFieldName.trim() || undefined,
          regionsCovered: regionsCovered.length > 0 ? regionsCovered : undefined,
          notes: notes.trim() || undefined,
        });

        if (result.added === 0) {
          setError(`No mappings added. ${result.skipped} properties already have this provider.`);
          setIsSaving(false);
          return;
        }
      } else {
        const result = await bulkRemoveProviderMapping(dataTypeId, selectedPropertyIds, selectedEntityId);

        if (result.removed === 0) {
          setError(`No mappings removed. ${result.skipped} properties don't have this provider.`);
          setIsSaving(false);
          return;
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mappings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'add' ? 'Assign' : 'Remove'} Provider from {selectedPropertyIds.length} Properties
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'add'
              ? 'Add a provider mapping to the selected properties'
              : 'Remove a provider mapping from the selected properties'
            }
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                mode === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Add Provider
            </button>
            <button
              type="button"
              onClick={() => setMode('remove')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                mode === 'remove'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Remove Provider
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading entities...</div>
            ) : (
              <>
                {/* Entity Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Provider Entity
                  </label>
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select an entity...</option>
                    {entities.map((entity) => (
                      <option key={entity.id} value={entity.id}>
                        {entity.name}
                      </option>
                    ))}
                  </select>
                </div>

                {mode === 'add' && (
                  <>
                    {/* Provider Field Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider Field Name
                        <span className="text-gray-400 font-normal ml-1">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={providerFieldName}
                        onChange={(e) => setProviderFieldName(e.target.value)}
                        placeholder="Leave blank to use property name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The field name used by this provider. If left blank, the property's canonical name will be used.
                      </p>
                    </div>

                    {/* Regions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Regions Covered
                        <span className="text-gray-400 font-normal ml-1">(optional)</span>
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newRegion}
                          onChange={(e) => setNewRegion(e.target.value)}
                          placeholder="e.g., BC, ON, AB"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddRegion();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddRegion}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Add
                        </button>
                      </div>
                      {regionsCovered.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {regionsCovered.map((region) => (
                            <span
                              key={region}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                            >
                              {region}
                              <button
                                type="button"
                                onClick={() => handleRemoveRegion(region)}
                                className="text-green-500 hover:text-green-700"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                        <span className="text-gray-400 font-normal ml-1">(optional)</span>
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Any additional notes about this mapping"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isLoading || !selectedEntityId}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                mode === 'add'
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
              }`}
            >
              {isSaving
                ? 'Processing...'
                : mode === 'add'
                  ? `Add to ${selectedPropertyIds.length} Properties`
                  : `Remove from ${selectedPropertyIds.length} Properties`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
