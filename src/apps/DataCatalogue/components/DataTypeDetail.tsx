import { useState } from 'react';
import { useDataCatalogueStore } from '../../../store/dataCatalogueStore';
import type { Property, DataSource } from '../../../types/catalogue';
import PropertyForm from './PropertyForm';
import SourceForm from './SourceForm';
import JsonPreviewModal from './JsonPreviewModal';
import BulkAssignModal from './BulkAssignModal';

interface DataTypeDetailProps {
  onEdit: () => void;
  onOpenCanvas?: () => void;
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const VALUE_TYPE_LABELS: Record<string, string> = {
  string: 'Text',
  number: 'Number',
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

export default function DataTypeDetail({ onEdit, onOpenCanvas }: DataTypeDetailProps) {
  const { selectedDataType, deleteProperty, removeSource } = useDataCatalogueStore();
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);

  // JSON Preview state
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);

  // Multi-select state
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  if (!selectedDataType) return null;

  const handleDeleteProperty = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      await deleteProperty(selectedDataType.id, propertyId);
    }
  };

  const handleRemoveSource = async (entityId: string) => {
    if (confirm('Are you sure you want to remove this source?')) {
      await removeSource(selectedDataType.id, entityId);
    }
  };

  // Multi-select handlers
  const handleSelectAll = () => {
    if (selectedPropertyIds.length === selectedDataType.properties.length) {
      setSelectedPropertyIds([]);
    } else {
      setSelectedPropertyIds(selectedDataType.properties.map(p => p.id));
    }
  };

  const handleSelectProperty = (propertyId: string) => {
    if (selectedPropertyIds.includes(propertyId)) {
      setSelectedPropertyIds(selectedPropertyIds.filter(id => id !== propertyId));
    } else {
      setSelectedPropertyIds([...selectedPropertyIds, propertyId]);
    }
  };

  const handleBulkAssignSuccess = () => {
    setSelectedPropertyIds([]);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{selectedDataType.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {selectedDataType.category || 'Uncategorized'}
            </span>
            <span className="text-xs text-gray-500">
              ID: {selectedDataType.id}
            </span>
          </div>
          {selectedDataType.description && (
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">{selectedDataType.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onOpenCanvas && (
            <button
              onClick={onOpenCanvas}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
              title="Open visual mapping canvas"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Canvas
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>
      </div>

      {/* Properties Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Properties
            <span className="text-gray-400 font-normal">({selectedDataType.properties.length})</span>
          </h3>
          <button
            onClick={() => { setEditingProperty(null); setShowPropertyForm(true); }}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedPropertyIds.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedPropertyIds.length} propert{selectedPropertyIds.length === 1 ? 'y' : 'ies'} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkAssign(true)}
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Assign/Remove Provider
              </button>
              <button
                onClick={() => setSelectedPropertyIds([])}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {selectedDataType.properties.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            No properties defined yet
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 w-8">
                    <input
                      type="checkbox"
                      checked={selectedPropertyIds.length === selectedDataType.properties.length && selectedDataType.properties.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Providers</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedDataType.properties.map((prop) => (
                  <tr
                    key={prop.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      // Don't trigger JSON preview if clicking on checkbox or action buttons
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'INPUT' || target.closest('button')) {
                        return;
                      }
                      setPreviewProperty(prop);
                    }}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedPropertyIds.includes(prop.id)}
                        onChange={() => handleSelectProperty(prop.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div>
                        <span className="font-medium text-gray-800">{prop.displayName}</span>
                        <span className="text-xs text-gray-400 ml-2 font-mono">{prop.name}</span>
                      </div>
                      {prop.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{prop.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {VALUE_TYPE_LABELS[prop.valueType] || prop.valueType}
                    </td>
                    <td className="px-4 py-2">
                      {prop.providerMappings && prop.providerMappings.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {prop.providerMappings.slice(0, 2).map((mapping) => (
                            <span
                              key={mapping.entityId}
                              className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded"
                              title={`Provider field: ${mapping.providerFieldName}`}
                            >
                              {mapping.entityName || mapping.entityId}
                            </span>
                          ))}
                          {prop.providerMappings.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{prop.providerMappings.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {prop.required ? (
                        <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">Required</span>
                      ) : (
                        <span className="text-xs text-gray-400">Optional</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setPreviewProperty(prop)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="View JSON"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { setEditingProperty(prop); setShowPropertyForm(true); }}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(prop.id)}
                        className="text-gray-400 hover:text-red-600 p-1 ml-1"
                        title="Delete"
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
          </div>
        )}
      </div>

      {/* Sources Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Data Sources (Type-Level)
            <span className="text-gray-400 font-normal">({selectedDataType.sources.length})</span>
          </h3>
          <button
            onClick={() => { setEditingSource(null); setShowSourceForm(true); }}
            className="text-xs text-green-600 hover:underline flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Source
          </button>
        </div>

        {selectedDataType.sources.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            No data sources linked yet
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDataType.sources.map((source) => (
              <div key={source.entityId} className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium text-gray-800">{source.entityName || source.entityId}</span>
                    {source.regionsCovered && source.regionsCovered.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {source.regionsCovered.map((region) => (
                          <span key={region} className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                            {region}
                          </span>
                        ))}
                      </div>
                    )}
                    {source.notes && (
                      <p className="text-xs text-gray-500 mt-1">{source.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingSource(source); setShowSourceForm(true); }}
                      className="text-gray-400 hover:text-blue-600 p-1"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemoveSource(source.entityId)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2 text-gray-700">
              {selectedDataType.createdAt ? formatDateTime(selectedDataType.createdAt) : '-'}
            </span>
            {selectedDataType.createdBy && (
              <span className="text-gray-400 ml-1">
                by {selectedDataType.createdBy.name || selectedDataType.createdBy.login}
              </span>
            )}
          </div>
          <div>
            <span className="text-gray-500">Updated:</span>
            <span className="ml-2 text-gray-700">
              {selectedDataType.updatedAt ? formatDateTime(selectedDataType.updatedAt) : '-'}
            </span>
            {selectedDataType.updatedBy && (
              <span className="text-gray-400 ml-1">
                by {selectedDataType.updatedBy.name || selectedDataType.updatedBy.login}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Property Form Modal */}
      {showPropertyForm && (
        <PropertyForm
          dataTypeId={selectedDataType.id}
          property={editingProperty}
          onClose={() => { setShowPropertyForm(false); setEditingProperty(null); }}
        />
      )}

      {/* Source Form Modal */}
      {showSourceForm && (
        <SourceForm
          dataTypeId={selectedDataType.id}
          source={editingSource}
          onClose={() => { setShowSourceForm(false); setEditingSource(null); }}
        />
      )}

      {/* JSON Preview Modal */}
      {previewProperty && (
        <JsonPreviewModal
          property={previewProperty}
          dataTypeName={selectedDataType.name}
          onClose={() => setPreviewProperty(null)}
        />
      )}

      {/* Bulk Assign Modal */}
      {showBulkAssign && (
        <BulkAssignModal
          dataTypeId={selectedDataType.id}
          selectedPropertyIds={selectedPropertyIds}
          onClose={() => setShowBulkAssign(false)}
          onSuccess={handleBulkAssignSuccess}
        />
      )}
    </div>
  );
}
