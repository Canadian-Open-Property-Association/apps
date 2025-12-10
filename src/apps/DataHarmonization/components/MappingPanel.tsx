import { useHarmonizationStore } from '../../../store/harmonizationStore';

interface MappingPanelProps {
  onCreateMapping: () => void;
}

export default function MappingPanel({ onCreateMapping }: MappingPanelProps) {
  const {
    selectedEntityId,
    selectedVocabTypeId,
    getMappingsForSelection,
    deleteMapping,
    entities,
    vocabTypes,
  } = useHarmonizationStore();

  const selectedEntity = entities.find(e => e.id === selectedEntityId);
  const selectedVocabType = vocabTypes.find(v => v.id === selectedVocabTypeId);
  const filteredMappings = getMappingsForSelection();

  // Neither selected - show instructions
  if (!selectedEntityId && !selectedVocabTypeId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Field Mappings</h3>
        <p className="text-sm text-center max-w-xs">
          Select a data furnisher on the left and a vocabulary type on the right to view and create mappings.
        </p>
      </div>
    );
  }

  // Both selected - show mappings for the combination
  if (selectedEntityId && selectedVocabTypeId) {
    return (
      <div className="h-full flex flex-col">
        {/* Header showing selection */}
        <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-purple-800">{selectedEntity?.name}</span>
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="font-medium text-purple-800">{selectedVocabType?.name}</span>
          </div>
        </div>

        {/* Mappings list */}
        <div className="flex-1 overflow-y-auto">
          {filteredMappings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <p className="text-sm text-center mb-4">
                No mappings between these selections yet.
              </p>
              <button
                onClick={onCreateMapping}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Mapping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredMappings.map((mapping) => (
                <li key={mapping.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          {mapping.furnisherFieldName}
                        </code>
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <code className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          {mapping.vocabPropertyName}
                        </code>
                      </div>
                      {mapping.notes && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{mapping.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMapping(mapping.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete mapping"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Only one selected - show partial info
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
      <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
      <p className="text-sm text-center">
        {selectedEntityId
          ? 'Now select a vocabulary type on the right'
          : 'Now select a data furnisher on the left'}
      </p>
    </div>
  );
}
