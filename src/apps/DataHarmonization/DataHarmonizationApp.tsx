import { useEffect, useState } from 'react';
import { useHarmonizationStore } from '../../store/harmonizationStore';
import HarmonizationToolbar from './components/HarmonizationToolbar';
import EntityList from './components/EntityList';
import VocabTypeList from './components/VocabTypeList';
import MappingPanel from './components/MappingPanel';
import MappingForm from './components/MappingForm';

export default function DataHarmonizationApp() {
  const {
    fetchMappings,
    fetchEntities,
    fetchVocabTypes,
    selectedEntityId,
    selectedVocabTypeId,
    isLoading,
    isEntitiesLoading,
    isVocabTypesLoading,
    error,
  } = useHarmonizationStore();

  const [showMappingForm, setShowMappingForm] = useState(false);

  // Load data on mount
  useEffect(() => {
    fetchMappings();
    fetchEntities();
    fetchVocabTypes();
  }, [fetchMappings, fetchEntities, fetchVocabTypes]);

  const handleCreateMapping = () => {
    setShowMappingForm(true);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Toolbar */}
      <HarmonizationToolbar onCreateMapping={handleCreateMapping} />

      {/* Error display */}
      {error && (
        <div className="mx-4 mt-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Main content - 3 panel layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left panel - Data Furnishers */}
        <div className="w-72 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Data Furnishers</h2>
            <p className="text-xs text-gray-500 mt-0.5">Source fields to map</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isEntitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <EntityList />
            )}
          </div>
        </div>

        {/* Center panel - Mappings */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">Field Mappings</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedEntityId && selectedVocabTypeId
                ? 'Mappings between selected furnisher and vocab type'
                : selectedEntityId
                ? 'Select a vocab type to see mappings'
                : selectedVocabTypeId
                ? 'Select a furnisher to see mappings'
                : 'Select a furnisher and vocab type to manage mappings'}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <MappingPanel onCreateMapping={handleCreateMapping} />
            )}
          </div>
        </div>

        {/* Right panel - COPA Vocabulary */}
        <div className="w-72 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">COPA Vocabulary</h2>
            <p className="text-xs text-gray-500 mt-0.5">Target properties</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isVocabTypesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <VocabTypeList />
            )}
          </div>
        </div>
      </div>

      {/* Mapping Form Modal */}
      {showMappingForm && (
        <MappingForm onClose={() => setShowMappingForm(false)} />
      )}
    </div>
  );
}
