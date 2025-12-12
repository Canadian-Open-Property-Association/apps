import { useSchemaStore } from '../../../store/schemaStore';
import {
  SchemaProperty,
  SchemaPropertyType,
  PROPERTY_TYPE_LABELS,
} from '../../../types/schema';

export default function PropertyEditor() {
  const { properties, selectedPropertyId, updateProperty } = useSchemaStore();

  // Find selected property recursively
  const findProperty = (props: SchemaProperty[], id: string): SchemaProperty | null => {
    for (const prop of props) {
      if (prop.id === id) return prop;
      if (prop.properties) {
        const found = findProperty(prop.properties, id);
        if (found) return found;
      }
      if (prop.items?.properties) {
        const found = findProperty(prop.items.properties, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedProperty = selectedPropertyId
    ? findProperty(properties, selectedPropertyId)
    : null;

  if (!selectedProperty) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 p-4">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-sm">Select a property to edit</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<SchemaProperty>) => {
    updateProperty(selectedProperty.id, updates);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Property Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Name (JSON key)
        </label>
        <input
          type="text"
          value={selectedProperty.name}
          onChange={(e) => handleUpdate({ name: e.target.value })}
          placeholder="e.g., property_address"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title (Display Label)
        </label>
        <input
          type="text"
          value={selectedProperty.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          placeholder="e.g., Property Address"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={selectedProperty.description || ''}
          onChange={(e) => handleUpdate({ description: e.target.value })}
          placeholder="Describe this property..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <select
          value={selectedProperty.type}
          onChange={(e) => handleUpdate({ type: e.target.value as SchemaPropertyType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Required */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={selectedProperty.required}
          onChange={(e) => handleUpdate({ required: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="required" className="text-sm font-medium text-gray-700">
          Required
        </label>
      </div>

      {/* Array info */}
      {selectedProperty.type === 'array' && selectedProperty.items && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Array Items</h4>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              Array items type: <strong>{PROPERTY_TYPE_LABELS[selectedProperty.items.type]}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Configure item properties in the tree view
            </p>
          </div>
        </div>
      )}

      {/* Object info */}
      {selectedProperty.type === 'object' && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Object Properties</h4>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              {selectedProperty.properties?.length || 0} nested properties
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Add and configure nested properties using the tree view
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
