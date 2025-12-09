import { useDataCatalogueStore } from '../../../store/dataCatalogueStore';
import type { DataType } from '../../../types/catalogue';

export default function DataTypeList() {
  const {
    selectedDataType,
    selectDataType,
    deleteDataType,
    searchResults,
    getDataTypesByCategory,
  } = useDataCatalogueStore();

  // Use search results if available, otherwise group by category
  const categorizedTypes = searchResults ? null : getDataTypesByCategory();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this data type?')) {
      await deleteDataType(id);
    }
  };

  const renderDataTypeItem = (dt: DataType) => {
    const isSelected = selectedDataType?.id === dt.id;
    return (
      <div
        key={dt.id}
        onClick={() => selectDataType(dt.id)}
        className={`group px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
          isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
              {dt.name}
            </h3>
            {dt.description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{dt.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400">
                {(dt.properties || []).length} properties
              </span>
              {(dt.sources || []).length > 0 && (
                <span className="text-xs text-green-600">
                  {(dt.sources || []).length} source{(dt.sources || []).length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => handleDelete(e, dt.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // If we have search results, show flat list
  if (searchResults) {
    return (
      <div>
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-xs text-gray-500">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </span>
        </div>
        {searchResults.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No data types found
          </div>
        ) : (
          searchResults.map(renderDataTypeItem)
        )}
      </div>
    );
  }

  // Show categorized list
  if (!categorizedTypes || categorizedTypes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-sm">No data types yet</p>
        <p className="text-xs mt-1">Click "Add Data Type" to create one</p>
      </div>
    );
  }

  return (
    <div>
      {categorizedTypes.map(({ category, dataTypes: types }) => (
        <div key={category.id}>
          {/* Category header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {category.name}
            </span>
            <span className="ml-2 text-xs text-gray-400">
              ({types.length})
            </span>
          </div>
          {/* Data types in this category */}
          {types.map(renderDataTypeItem)}
        </div>
      ))}
    </div>
  );
}
