import { useState, useEffect } from 'react';
import { useDataCatalogueStore } from '../../../store/dataCatalogueStore';
import { DataTypeWithAttributes } from '../../../types/catalogue';

interface DataTypeFormProps {
  furnisherId: string;
  dataType: DataTypeWithAttributes | null;
  onClose: () => void;
}

export default function DataTypeForm({ furnisherId, dataType, onClose }: DataTypeFormProps) {
  const createDataType = useDataCatalogueStore((state) => state.createDataType);
  const updateDataType = useDataCatalogueStore((state) => state.updateDataType);
  const dataTypeConfigs = useDataCatalogueStore((state) => state.dataTypeConfigs);
  const dataTypeCategories = useDataCatalogueStore((state) => state.dataTypeCategories);
  const fetchDataTypeConfigs = useDataCatalogueStore((state) => state.fetchDataTypeConfigs);

  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    configId: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data type configs on mount
  useEffect(() => {
    if (dataTypeConfigs.length === 0) {
      fetchDataTypeConfigs();
    }
  }, [dataTypeConfigs.length, fetchDataTypeConfigs]);

  useEffect(() => {
    if (dataType) {
      setFormData({
        name: dataType.name || '',
        description: dataType.description || '',
        configId: dataType.configId || '',
      });
      setSelectedConfigId(dataType.configId || '');
    }
  }, [dataType]);

  // When a config is selected, populate name and description
  const handleConfigSelect = (configId: string) => {
    setSelectedConfigId(configId);
    const config = dataTypeConfigs.find((c) => c.id === configId);
    if (config) {
      setFormData({
        name: config.name,
        description: config.description || '',
        configId: config.id,
      });
    } else {
      // Custom - clear fields but keep configId empty
      setFormData({
        name: '',
        description: '',
        configId: '',
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please select a data type or enter a custom name');
      return;
    }

    setSaving(true);
    try {
      if (dataType) {
        await updateDataType(dataType.id, formData);
      } else {
        await createDataType({
          ...formData,
          furnisherId,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data type');
    } finally {
      setSaving(false);
    }
  };

  // Group configs by category for the dropdown
  const configsByCategory = dataTypeConfigs.reduce(
    (acc, config) => {
      const cat = config.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(config);
      return acc;
    },
    {} as Record<string, typeof dataTypeConfigs>
  );

  // Sort categories
  const sortedCategories = Object.keys(configsByCategory).sort((a, b) => {
    const orderA = dataTypeCategories.find((c) => c.name === a)?.order || 999;
    const orderB = dataTypeCategories.find((c) => c.name === b)?.order || 999;
    return orderA - orderB;
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {dataType ? 'Edit Data Type' : 'Add Data Type'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Data Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Data Type <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedConfigId}
                onChange={(e) => handleConfigSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              >
                <option value="">-- Select a standard data type --</option>
                {sortedCategories.map((category) => (
                  <optgroup key={category} label={category}>
                    {configsByCategory[category]?.map((config) => (
                      <option key={config.id} value={config.id}>
                        {config.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose from standardized data type definitions
              </p>
            </div>

            {/* Selected Type Info */}
            {selectedConfigId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800">{formData.name}</p>
                {formData.description && (
                  <p className="text-xs text-blue-600 mt-1">{formData.description}</p>
                )}
              </div>
            )}

            {/* Custom Description Override (optional) */}
            {selectedConfigId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Description
                  <span className="text-xs font-normal text-gray-400 ml-1">(optional override)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Override the default description for this furnisher..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedConfigId}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : dataType ? 'Save Changes' : 'Add Data Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
