import { useState, useEffect } from 'react';
import { useDataCatalogueStore } from '../../../store/dataCatalogueStore';
import { useEntityStore } from '../../../store/entityStore';
import type { DataSource } from '../../../types/catalogue';

interface SourceFormProps {
  dataTypeId: string;
  source: DataSource | null;
  onClose: () => void;
}

const CANADIAN_REGIONS = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
];

export default function SourceForm({ dataTypeId, source, onClose }: SourceFormProps) {
  const { addSource, updateSource } = useDataCatalogueStore();
  const { entities, fetchEntities } = useEntityStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    entityId: '',
    entityName: '',
    regionsCovered: [] as string[],
    updateFrequency: '',
    notes: '',
    apiEndpoint: '',
  });

  const isEditing = !!source;

  // Fetch entities on mount
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  // Filter to only show data-furnisher entities
  const dataFurnishers = entities.filter(e => e.types?.includes('data-furnisher'));

  // Load existing source if editing
  useEffect(() => {
    if (source) {
      setFormData({
        entityId: source.entityId,
        entityName: source.entityName || '',
        regionsCovered: source.regionsCovered || [],
        updateFrequency: source.updateFrequency || '',
        notes: source.notes || '',
        apiEndpoint: source.apiEndpoint || '',
      });
    }
  }, [source]);

  // Update entity name when entity is selected
  const handleEntityChange = (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    setFormData(prev => ({
      ...prev,
      entityId,
      entityName: entity?.name || '',
      // Pre-fill regions from entity if available
      regionsCovered: entity?.regionsCovered || prev.regionsCovered,
    }));
  };

  const handleRegionToggle = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regionsCovered: prev.regionsCovered.includes(region)
        ? prev.regionsCovered.filter(r => r !== region)
        : [...prev.regionsCovered, region],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditing && source) {
        await updateSource(dataTypeId, source.entityId, formData);
      } else {
        await addSource(dataTypeId, formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save source');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Edit Data Source' : 'Add Data Source'}
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

            {/* Entity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.entityId}
                onChange={(e) => handleEntityChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isEditing}
              >
                <option value="">Select an entity...</option>
                {dataFurnishers.map(entity => (
                  <option key={entity.id} value={entity.id}>{entity.name}</option>
                ))}
              </select>
              {dataFurnishers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No data furnisher entities found. Create one in the Entity Manager first.
                </p>
              )}
            </div>

            {/* Regions Covered */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regions Covered
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Select regions where this entity provides this specific data type
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {CANADIAN_REGIONS.map((region) => (
                  <label
                    key={region.value}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded border cursor-pointer transition-colors text-sm ${
                      formData.regionsCovered.includes(region.value)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.regionsCovered.includes(region.value)}
                      onChange={() => handleRegionToggle(region.value)}
                      className="sr-only"
                    />
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                        formData.regionsCovered.includes(region.value)
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-400'
                      }`}
                    >
                      {formData.regionsCovered.includes(region.value) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{region.label}</span>
                  </label>
                ))}
              </div>
              {formData.regionsCovered.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.regionsCovered.length} region{formData.regionsCovered.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Update Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Frequency
              </label>
              <select
                value={formData.updateFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, updateFrequency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="real-time">Real-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
                <option value="on-demand">On-demand</option>
              </select>
            </div>

            {/* API Endpoint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Endpoint
              </label>
              <input
                type="text"
                value={formData.apiEndpoint}
                onChange={(e) => setFormData(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="https://api.example.com/data"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Integration notes, data quality info, etc."
              />
            </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting || !formData.entityId}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
