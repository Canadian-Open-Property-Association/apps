import { useState } from 'react';
import { useHarmonizationStore } from '../../../store/harmonizationStore';

interface MappingFormProps {
  onClose: () => void;
}

export default function MappingForm({ onClose }: MappingFormProps) {
  const {
    selectedEntityId,
    selectedVocabTypeId,
    entities,
    vocabTypes,
    createMapping,
  } = useHarmonizationStore();

  const selectedEntity = entities.find(e => e.id === selectedEntityId);
  const selectedVocabType = vocabTypes.find(v => v.id === selectedVocabTypeId);

  const furnisherFields = selectedEntity?.dataSchema?.fields || [];
  const vocabProperties = selectedVocabType?.properties || [];

  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedField = furnisherFields.find(f => f.id === selectedFieldId);
  const selectedProperty = vocabProperties.find(p => p.id === selectedPropertyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEntityId || !selectedVocabTypeId || !selectedFieldId || !selectedPropertyId) {
      setError('Please select both a furnisher field and a vocabulary property');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createMapping({
        entityId: selectedEntityId,
        entityName: selectedEntity?.name,
        furnisherFieldId: selectedFieldId,
        furnisherFieldName: selectedField?.name,
        vocabTypeId: selectedVocabTypeId,
        vocabTypeName: selectedVocabType?.name,
        vocabPropertyId: selectedPropertyId,
        vocabPropertyName: selectedProperty?.name,
        notes: notes || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mapping');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Create Field Mapping</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Context info */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">{selectedEntity?.name}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="font-medium text-gray-700">{selectedVocabType?.name}</span>
            </div>
          </div>

          {/* Furnisher Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Furnisher Field <span className="text-red-500">*</span>
            </label>
            {furnisherFields.length === 0 ? (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                No fields defined for this furnisher. Add fields in Entity Manager first.
              </div>
            ) : (
              <select
                value={selectedFieldId}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select a field...</option>
                {furnisherFields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name} {field.displayName ? `(${field.displayName})` : ''}
                  </option>
                ))}
              </select>
            )}
            {selectedField && (
              <p className="mt-1 text-xs text-gray-500">
                Type: {selectedField.dataType || 'string'}
                {selectedField.description && ` - ${selectedField.description}`}
              </p>
            )}
          </div>

          {/* Vocab Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              COPA Vocabulary Property <span className="text-red-500">*</span>
            </label>
            {vocabProperties.length === 0 ? (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                No properties defined for this vocabulary type. Add properties in Data Dictionary first.
              </div>
            ) : (
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select a property...</option>
                {vocabProperties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name} ({prop.displayName})
                  </option>
                ))}
              </select>
            )}
            {selectedProperty && (
              <p className="mt-1 text-xs text-gray-500">
                Type: {selectedProperty.valueType || 'string'}
                {selectedProperty.description && ` - ${selectedProperty.description}`}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any transformation notes or comments..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedFieldId || !selectedPropertyId}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Mapping'}
          </button>
        </div>
      </div>
    </div>
  );
}
