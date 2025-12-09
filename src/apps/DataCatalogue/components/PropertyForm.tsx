import { useState, useEffect } from 'react';
import { useDataCatalogueStore } from '../../../store/dataCatalogueStore';
import type { Property, PropertyValueType, ProviderMapping } from '../../../types/catalogue';

interface Entity {
  id: string;
  name: string;
  types: string[];
}

interface PropertyFormProps {
  dataTypeId: string;
  property: Property | null;
  onClose: () => void;
}

const VALUE_TYPE_OPTIONS: { value: PropertyValueType; label: string }[] = [
  { value: 'string', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'currency', label: 'Currency' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'array', label: 'List' },
  { value: 'object', label: 'Object' },
];

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5174';

export default function PropertyForm({ dataTypeId, property, onClose }: PropertyFormProps) {
  const { addProperty, updateProperty, addProviderMapping, removeProviderMapping } = useDataCatalogueStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Entities for provider mapping
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);

  // Provider mapping form state
  const [showAddMapping, setShowAddMapping] = useState(false);
  const [mappingEntityId, setMappingEntityId] = useState('');
  const [mappingFieldName, setMappingFieldName] = useState('');
  const [mappingRegions, setMappingRegions] = useState<string[]>([]);
  const [newRegion, setNewRegion] = useState('');
  const [mappingNotes, setMappingNotes] = useState('');
  const [isAddingMapping, setIsAddingMapping] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    valueType: 'string' as PropertyValueType,
    required: false,
    sampleValue: '',
    path: '',
    providerMappings: [] as ProviderMapping[],
  });

  const isEditing = !!property;

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
        console.error('Failed to load entities:', err);
      } finally {
        setIsLoadingEntities(false);
      }
    };
    fetchEntities();
  }, []);

  // Load existing property if editing
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        displayName: property.displayName,
        description: property.description || '',
        valueType: property.valueType,
        required: property.required,
        sampleValue: property.sampleValue || '',
        path: property.path || '',
        providerMappings: property.providerMappings || [],
      });
    }
  }, [property]);

  // Auto-generate name from display name
  const handleDisplayNameChange = (displayName: string) => {
    setFormData(prev => ({
      ...prev,
      displayName,
      // Only auto-generate name for new properties
      name: isEditing ? prev.name : displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditing && property) {
        await updateProperty(dataTypeId, property.id, formData);
      } else {
        await addProperty(dataTypeId, {
          ...formData,
          id: `prop-${Date.now()}`,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Provider mapping handlers
  const handleAddMappingRegion = () => {
    if (newRegion.trim() && !mappingRegions.includes(newRegion.trim().toUpperCase())) {
      setMappingRegions([...mappingRegions, newRegion.trim().toUpperCase()]);
      setNewRegion('');
    }
  };

  const handleRemoveMappingRegion = (region: string) => {
    setMappingRegions(mappingRegions.filter(r => r !== region));
  };

  const handleAddProviderMapping = async () => {
    if (!mappingEntityId || !property) return;

    setIsAddingMapping(true);
    setError(null);

    try {
      const selectedEntity = entities.find(e => e.id === mappingEntityId);
      await addProviderMapping(dataTypeId, property.id, {
        entityId: mappingEntityId,
        entityName: selectedEntity?.name || '',
        providerFieldName: mappingFieldName.trim() || property.name,
        regionsCovered: mappingRegions.length > 0 ? mappingRegions : undefined,
        notes: mappingNotes.trim() || undefined,
      });

      // Reset form
      setShowAddMapping(false);
      setMappingEntityId('');
      setMappingFieldName('');
      setMappingRegions([]);
      setMappingNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add provider mapping');
    } finally {
      setIsAddingMapping(false);
    }
  };

  const handleRemoveProviderMapping = async (entityId: string) => {
    if (!property) return;

    try {
      await removeProviderMapping(dataTypeId, property.id, entityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove provider mapping');
    }
  };

  // Get available entities (not already mapped)
  const availableEntities = entities.filter(
    e => !formData.providerMappings.some(m => m.entityId === e.id)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Edit Property' : 'Add Property'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assessed Value"
                required
              />
            </div>

            {/* Technical Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technical Name (Canonical)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="assessed_value"
              />
              <p className="text-xs text-gray-500 mt-1">The canonical vocabulary name used in JSON</p>
            </div>

            {/* Value Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.valueType}
                onChange={(e) => setFormData(prev => ({ ...prev, valueType: e.target.value as PropertyValueType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {VALUE_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Required */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="required" className="text-sm text-gray-700">
                Required field
              </label>
            </div>

            {/* Sample Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Value
              </label>
              <input
                type="text"
                value={formData.sampleValue}
                onChange={(e) => setFormData(prev => ({ ...prev, sampleValue: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="$450,000"
              />
            </div>

            {/* JSON Path */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Path
              </label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="property_details.assessed_value"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Describe this property..."
              />
            </div>

            {/* Provider Mappings Section (only visible when editing) */}
            {isEditing && property && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Provider Mappings</h3>
                  {!showAddMapping && availableEntities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddMapping(true)}
                      className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Mapping
                    </button>
                  )}
                </div>

                {/* Existing Mappings */}
                {formData.providerMappings.length === 0 && !showAddMapping ? (
                  <p className="text-sm text-gray-500 italic">No provider mappings defined</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {formData.providerMappings.map((mapping) => (
                      <div
                        key={mapping.entityId}
                        className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-purple-900">
                              {mapping.entityName || mapping.entityId}
                            </div>
                            <div className="text-sm text-purple-700 mt-1">
                              <span className="text-purple-500">Provider field:</span>{' '}
                              <span className="font-mono">{mapping.providerFieldName}</span>
                            </div>
                            {mapping.regionsCovered && mapping.regionsCovered.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {mapping.regionsCovered.map((region) => (
                                  <span
                                    key={region}
                                    className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded"
                                  >
                                    {region}
                                  </span>
                                ))}
                              </div>
                            )}
                            {mapping.notes && (
                              <p className="text-xs text-purple-600 mt-1">{mapping.notes}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProviderMapping(mapping.entityId)}
                            className="text-purple-400 hover:text-red-600 p-1"
                            title="Remove mapping"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Mapping Form */}
                {showAddMapping && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Add Provider Mapping</h4>

                    {/* Entity Select */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Provider Entity</label>
                      {isLoadingEntities ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                      ) : (
                        <select
                          value={mappingEntityId}
                          onChange={(e) => setMappingEntityId(e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select provider...</option>
                          {availableEntities.map((entity) => (
                            <option key={entity.id} value={entity.id}>
                              {entity.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Provider Field Name */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Provider Field Name
                        <span className="text-gray-400 ml-1">(leave blank for same as canonical)</span>
                      </label>
                      <input
                        type="text"
                        value={mappingFieldName}
                        onChange={(e) => setMappingFieldName(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        placeholder={formData.name || 'assessed_val'}
                      />
                    </div>

                    {/* Regions */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Regions Covered</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newRegion}
                          onChange={(e) => setNewRegion(e.target.value)}
                          placeholder="e.g., BC"
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddMappingRegion();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddMappingRegion}
                          className="px-2 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Add
                        </button>
                      </div>
                      {mappingRegions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mappingRegions.map((region) => (
                            <span
                              key={region}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                            >
                              {region}
                              <button
                                type="button"
                                onClick={() => handleRemoveMappingRegion(region)}
                                className="text-purple-500 hover:text-purple-700"
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
                      <label className="block text-xs text-gray-500 mb-1">Notes</label>
                      <input
                        type="text"
                        value={mappingNotes}
                        onChange={(e) => setMappingNotes(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Optional notes..."
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddMapping(false);
                          setMappingEntityId('');
                          setMappingFieldName('');
                          setMappingRegions([]);
                          setMappingNotes('');
                        }}
                        className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={isAddingMapping}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddProviderMapping}
                        disabled={!mappingEntityId || isAddingMapping}
                        className="px-3 py-1.5 text-xs text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {isAddingMapping ? 'Adding...' : 'Add Mapping'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting || !formData.displayName}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
