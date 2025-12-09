import { useState, useEffect } from 'react';
import { useDataCatalogueStore } from '../../../store/dataCatalogueStore';
import type { Property, PropertyValueType } from '../../../types/catalogue';

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

export default function PropertyForm({ dataTypeId, property, onClose }: PropertyFormProps) {
  const { addProperty, updateProperty } = useDataCatalogueStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    valueType: 'string' as PropertyValueType,
    required: false,
    sampleValue: '',
    path: '',
  });

  const isEditing = !!property;

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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
                Technical Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="assessed_value"
              />
              <p className="text-xs text-gray-500 mt-1">Used in JSON paths</p>
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
