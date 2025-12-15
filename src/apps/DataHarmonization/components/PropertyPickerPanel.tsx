import { useState, useMemo, useEffect } from 'react';
import { useHarmonizationStore, type MappingFieldContext } from '../../../store/harmonizationStore';
import { useDictionaryStore } from '../../../store/dictionaryStore';
import type { FlattenedProperty } from '../../../types/dictionary';
import { generateFieldPath } from '../../../types/harmonization';

const VALUE_TYPE_LABELS: Record<string, string> = {
  string: 'Text',
  number: 'Number',
  integer: 'Integer',
  boolean: 'Yes/No',
  date: 'Date',
  datetime: 'Date & Time',
  array: 'List',
  object: 'Object',
  currency: 'Currency',
  url: 'URL',
  email: 'Email',
  phone: 'Phone',
};

interface PropertyPickerPanelProps {
  context: MappingFieldContext;
  onClose: () => void;
}

export default function PropertyPickerPanel({ context, onClose }: PropertyPickerPanelProps) {
  const {
    createMapping,
    updateMapping,
    getMappingForField,
    fetchMappings,
  } = useHarmonizationStore();

  const {
    getAllProperties,
    isPropertyFavourite,
    fetchVocabTypes,
    fetchPropertyFavourites,
  } = useDictionaryStore();

  // Load dictionary data on mount
  useEffect(() => {
    fetchVocabTypes();
    fetchPropertyFavourites();
  }, [fetchVocabTypes, fetchPropertyFavourites]);

  const [search, setSearch] = useState('');
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get existing mapping for this field
  const existingMapping = getMappingForField(context.entityId, context.sourceId, context.field.id);

  // Get all properties from dictionary store
  const allProperties = getAllProperties();

  // Filter properties
  const filteredProperties = useMemo(() => {
    let result = [...allProperties];

    // Filter by search
    if (search.length >= 2) {
      const searchLower = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.displayName?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.vocabTypeName.toLowerCase().includes(searchLower)
      );
    }

    // Filter by favourites
    if (showFavouritesOnly) {
      result = result.filter(p => isPropertyFavourite(p.vocabTypeId, p.id));
    }

    // Sort alphabetically
    result.sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name));

    return result;
  }, [allProperties, search, showFavouritesOnly, isPropertyFavourite]);

  // Handle property selection - immediately creates mapping
  const handlePropertySelect = async (property: FlattenedProperty) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const fieldPath = generateFieldPath(context.entityId, context.sourceId, context.field.name);

      const mappingData = {
        entityId: context.entityId,
        entityName: context.entityName,
        sourceId: context.sourceId,
        sourceName: context.sourceName,
        furnisherFieldId: context.field.id,
        furnisherFieldName: context.field.displayName || context.field.name,
        fieldPath,
        vocabTypeId: property.vocabTypeId,
        vocabTypeName: property.vocabTypeName,
        vocabPropertyId: property.id,
        vocabPropertyName: property.displayName || property.name,
      };

      if (existingMapping) {
        await updateMapping(existingMapping.id, mappingData);
      } else {
        await createMapping(mappingData);
      }

      await fetchMappings();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mapping');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {existingMapping ? 'Change Mapping' : 'Map to COPA Property'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Source Field Info */}
        <div className="mt-2 p-2 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Mapping field</div>
          <div className="text-sm font-medium text-gray-900">
            {context.field.displayName || context.field.name}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {context.entityName} / {context.sourceName}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-2 flex items-center gap-3 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => setShowFavouritesOnly(false)}
          className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
            !showFavouritesOnly
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setShowFavouritesOnly(true)}
          className={`pb-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1 ${
            showFavouritesOnly
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Favourites
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-xs flex-shrink-0">
          {error}
        </div>
      )}

      {/* Properties List */}
      <div className="flex-1 overflow-auto">
        {filteredProperties.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <div className="text-center">
              <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium">
                {showFavouritesOnly ? 'No favourite properties' : 'No properties found'}
              </p>
              <p className="text-xs mt-1">
                {showFavouritesOnly
                  ? 'Star properties in Data Dictionary'
                  : 'Try a different search'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredProperties.map((prop) => {
              const isFavourite = isPropertyFavourite(prop.vocabTypeId, prop.id);

              return (
                <button
                  key={prop.fullId}
                  onClick={() => handlePropertySelect(prop)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-left hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  <div className="flex items-start gap-2">
                    {isFavourite && (
                      <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {prop.displayName || prop.name}
                        </span>
                        <span className="text-xs text-gray-400 truncate font-mono">
                          {prop.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                          {prop.vocabTypeName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {VALUE_TYPE_LABELS[prop.valueType] || prop.valueType}
                        </span>
                      </div>
                      {prop.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{prop.description}</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="text-xs text-gray-500 text-center">
          {filteredProperties.length} properties • Click to map
        </div>
      </div>
    </div>
  );
}
