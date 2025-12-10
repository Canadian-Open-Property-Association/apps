import { useState } from 'react';
import type { Entity, FurnisherField, FurnisherDataSchema } from '../../../types/entity';
import FurnisherFieldForm from './FurnisherFieldForm';

interface FurnisherDataSchemaSectionProps {
  entity: Entity;
  onUpdateSchema: (schema: FurnisherDataSchema) => void;
}

const DATA_TYPE_LABELS: Record<string, string> = {
  string: 'String',
  number: 'Number',
  integer: 'Integer',
  boolean: 'Boolean',
  date: 'Date',
  datetime: 'DateTime',
  array: 'Array',
  object: 'Object',
};

export default function FurnisherDataSchemaSection({ entity, onUpdateSchema }: FurnisherDataSchemaSectionProps) {
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<FurnisherField | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const schema = entity.dataSchema || { fields: [] };
  const fields = schema.fields || [];

  const handleAddField = () => {
    setEditingField(null);
    setShowFieldForm(true);
  };

  const handleEditField = (field: FurnisherField) => {
    setEditingField(field);
    setShowFieldForm(true);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    const updatedFields = fields.filter(f => f.id !== fieldId);
    onUpdateSchema({ ...schema, fields: updatedFields });
  };

  const handleSaveField = (field: FurnisherField) => {
    let updatedFields: FurnisherField[];

    if (editingField) {
      // Update existing field
      updatedFields = fields.map(f => f.id === editingField.id ? field : f);
    } else {
      // Add new field
      updatedFields = [...fields, { ...field, id: `field-${Date.now()}` }];
    }

    onUpdateSchema({ ...schema, fields: updatedFields });
    setShowFieldForm(false);
    setEditingField(null);
  };

  const handleUpdateMetadata = (key: keyof FurnisherDataSchema, value: string) => {
    onUpdateSchema({ ...schema, [key]: value || undefined });
  };

  return (
    <div className="mt-6 bg-blue-50 rounded-lg overflow-hidden">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
          Furnisher Data Schema
          <span className="text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            {fields.length} {fields.length === 1 ? 'field' : 'fields'}
          </span>
        </h3>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Schema Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">API Documentation URL</label>
              <input
                type="url"
                value={schema.apiDocumentationUrl || ''}
                onChange={(e) => handleUpdateMetadata('apiDocumentationUrl', e.target.value)}
                placeholder="https://docs.example.com/api"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">API Endpoint</label>
              <input
                type="url"
                value={schema.apiEndpoint || ''}
                onChange={(e) => handleUpdateMetadata('apiEndpoint', e.target.value)}
                placeholder="https://api.example.com/v1/data"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Update Frequency</label>
              <select
                value={schema.updateFrequency || ''}
                onChange={(e) => handleUpdateMetadata('updateFrequency', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select frequency...</option>
                <option value="realtime">Realtime</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <input
                type="text"
                value={schema.notes || ''}
                onChange={(e) => handleUpdateMetadata('notes', e.target.value)}
                placeholder="Integration notes..."
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Fields Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Fields</h4>
              <button
                onClick={handleAddField}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Field
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-gray-500 mb-2">No fields defined yet</p>
                <p className="text-xs text-gray-400 mb-3">Add fields that this furnisher provides in their data</p>
                <button
                  onClick={handleAddField}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Field
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Field Name</th>
                    <th className="px-4 py-2 text-left font-medium">Display Name</th>
                    <th className="px-4 py-2 text-left font-medium">Type</th>
                    <th className="px-4 py-2 text-left font-medium">API Path</th>
                    <th className="px-4 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fields.map((field) => (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{field.name}</code>
                        {field.required && (
                          <span className="ml-1 text-xs text-red-500">*</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-700">{field.displayName || '-'}</td>
                      <td className="px-4 py-2">
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {DATA_TYPE_LABELS[field.dataType || 'string'] || field.dataType}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {field.apiPath ? (
                          <code className="text-xs text-gray-500">{field.apiPath}</code>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleEditField(field)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Edit field"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete field"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Field Form Modal */}
      {showFieldForm && (
        <FurnisherFieldForm
          field={editingField}
          onSave={handleSaveField}
          onClose={() => {
            setShowFieldForm(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
}
