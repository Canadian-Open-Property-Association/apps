import { useEffect, useState } from 'react';
import { useDataCatalogueStore } from '../../store/dataCatalogueStore';
import DataTypeList from './components/DataTypeList';
import DataTypeDetail from './components/DataTypeDetail';
import DataTypeForm from './components/DataTypeForm';
import CatalogueToolbar from './components/CatalogueToolbar';
import MappingCanvas from './components/canvas/MappingCanvas';

type ViewMode = 'list' | 'canvas';

export default function DataCatalogueApp() {
  const {
    fetchDataTypes,
    fetchCategories,
    selectedDataType,
    isLoading,
    error,
  } = useDataCatalogueStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDataType, setEditingDataType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Load data on mount
  useEffect(() => {
    fetchDataTypes();
    fetchCategories();
  }, [fetchDataTypes, fetchCategories]);

  const handleAddDataType = () => {
    setEditingDataType(null);
    setShowAddForm(true);
  };

  const handleEditDataType = () => {
    if (selectedDataType) {
      setEditingDataType(selectedDataType.id);
      setShowAddForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingDataType(null);
  };

  const handleExport = async () => {
    try {
      const data = await useDataCatalogueStore.getState().exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-catalogue-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleOpenCanvas = () => {
    setViewMode('canvas');
  };

  const handleBackToList = () => {
    setViewMode('list');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <CatalogueToolbar
        onAddDataType={handleAddDataType}
        onExport={handleExport}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Error display */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Main content */}
      {viewMode === 'list' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel - Data Type List */}
          <div className="w-80 border-r border-gray-200 bg-white overflow-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : (
              <DataTypeList />
            )}
          </div>

          {/* Right panel - Detail View */}
          <div className="flex-1 overflow-auto">
            {selectedDataType ? (
              <DataTypeDetail onEdit={handleEditDataType} onOpenCanvas={handleOpenCanvas} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-lg font-medium">Select a data type</p>
                  <p className="text-sm mt-1">Choose from the list or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <MappingCanvas
          selectedDataTypeId={selectedDataType?.id || null}
          onBackToList={handleBackToList}
        />
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <DataTypeForm
          dataTypeId={editingDataType}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
