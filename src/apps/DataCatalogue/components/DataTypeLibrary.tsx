import { useState, useEffect } from 'react';
import { useDataCatalogueStore } from '../../../store/dataCatalogueStore';
import { DataTypeConfig } from '../../../types/catalogue';

interface DataTypeLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataTypeLibrary({ isOpen, onClose }: DataTypeLibraryProps) {
  const dataTypeConfigs = useDataCatalogueStore((state) => state.dataTypeConfigs);
  const dataTypeCategories = useDataCatalogueStore((state) => state.dataTypeCategories);
  const isConfigsLoading = useDataCatalogueStore((state) => state.isConfigsLoading);
  const fetchDataTypeConfigs = useDataCatalogueStore((state) => state.fetchDataTypeConfigs);
  const createDataTypeConfig = useDataCatalogueStore((state) => state.createDataTypeConfig);
  const updateDataTypeConfig = useDataCatalogueStore((state) => state.updateDataTypeConfig);
  const deleteDataTypeConfig = useDataCatalogueStore((state) => state.deleteDataTypeConfig);
  const createCategory = useDataCatalogueStore((state) => state.createCategory);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DataTypeConfig | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', category: '' });
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchDataTypeConfigs();
    }
  }, [isOpen, fetchDataTypeConfigs]);

  useEffect(() => {
    if (editingConfig) {
      setFormData({
        name: editingConfig.name,
        description: editingConfig.description || '',
        category: editingConfig.category,
      });
      setShowAddForm(true);
    }
  }, [editingConfig]);

  const handleSubmit = async () => {
    setError(null);
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingConfig) {
        await updateDataTypeConfig(editingConfig.id, formData);
      } else {
        await createDataTypeConfig(formData);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDataTypeConfig(id);
      setConfirmDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const cat = await createCategory(newCategory.trim());
      setFormData((prev) => ({ ...prev, category: cat.name }));
      setNewCategory('');
      setShowNewCategory(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingConfig(null);
    setFormData({ name: '', description: '', category: '' });
    setError(null);
  };

  if (!isOpen) return null;

  // Group configs by category
  const configsByCategory = dataTypeConfigs.reduce(
    (acc, config) => {
      const cat = config.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(config);
      return acc;
    },
    {} as Record<string, DataTypeConfig[]>
  );

  // Sort categories by order from dataTypeCategories
  const sortedCategories = Object.keys(configsByCategory).sort((a, b) => {
    const orderA = dataTypeCategories.find((c) => c.name === a)?.order || 999;
    const orderB = dataTypeCategories.find((c) => c.name === b)?.order || 999;
    return orderA - orderB;
  });

  const filteredCategories = filterCategory
    ? sortedCategories.filter((cat) => cat === filterCategory)
    : sortedCategories;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Data Type Library</h3>
            <p className="text-sm text-gray-500">
              Standardized data type definitions for the catalogue
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {sortedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({configsByCategory[cat]?.length || 0})
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {dataTypeConfigs.length} data type{dataTypeConfigs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            + Add Data Type
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
              <button onClick={() => setError(null)} className="ml-2 text-red-500">
                &times;
              </button>
            </div>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">
                {editingConfig ? 'Edit Data Type' : 'New Data Type'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Property Details"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  {showNewCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      />
                      <button
                        onClick={handleAddCategory}
                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowNewCategory(false)}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select category...</option>
                        {dataTypeCategories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setShowNewCategory(true)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                        title="Add new category"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this data type..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingConfig ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {/* Data Types by Category */}
          {isConfigsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading data types...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No data types defined yet.</p>
              <p className="text-sm mt-1">Add your first standardized data type above.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map((category) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {category}
                    <span className="text-xs font-normal text-gray-400">
                      ({configsByCategory[category]?.length || 0})
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {configsByCategory[category]?.map((config) => (
                      <div
                        key={config.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-800 truncate">{config.name}</h5>
                            {config.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {config.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => setEditingConfig(config)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {confirmDelete === config.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(config.id)}
                                  className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(config.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
