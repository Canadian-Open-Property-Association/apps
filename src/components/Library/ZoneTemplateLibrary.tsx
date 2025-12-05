import { useState } from 'react';
import { useZoneTemplateStore } from '../../store/zoneTemplateStore';
import { ZoneTemplate } from '../../types/vct';
import ZoneEditor from '../ZoneEditor/ZoneEditor';

interface ZoneTemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (templateId: string) => void;
}

export default function ZoneTemplateLibrary({
  isOpen,
  onClose,
  onSelectTemplate,
}: ZoneTemplateLibraryProps) {
  const templates = useZoneTemplateStore((state) => state.templates);
  const addTemplate = useZoneTemplateStore((state) => state.addTemplate);
  const deleteTemplate = useZoneTemplateStore((state) => state.deleteTemplate);
  const duplicateTemplate = useZoneTemplateStore((state) => state.duplicateTemplate);
  const setEditingTemplate = useZoneTemplateStore((state) => state.setEditingTemplate);
  const selectedTemplateId = useZoneTemplateStore((state) => state.selectedTemplateId);
  const selectTemplate = useZoneTemplateStore((state) => state.selectTemplate);

  const [showZoneEditor, setShowZoneEditor] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const builtInTemplates = templates.filter((t) => t.isBuiltIn);
  const userTemplates = templates.filter((t) => !t.isBuiltIn);

  const handleCreateNew = () => {
    const newTemplate: ZoneTemplate = {
      id: crypto.randomUUID(),
      name: 'New Template',
      description: '',
      front: { zones: [] },
      back: { zones: [] },
      card_width: 340,
      card_height: 214,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBuiltIn: false,
    };
    addTemplate(newTemplate);
    setEditingTemplate(newTemplate);
    setShowZoneEditor(true);
  };

  const handleEdit = (template: ZoneTemplate) => {
    setEditingTemplate({ ...template });
    setShowZoneEditor(true);
  };

  const handleDuplicate = (template: ZoneTemplate) => {
    const newId = duplicateTemplate(template.id, `${template.name} (Copy)`);
    if (newId) {
      const newTemplate = templates.find((t) => t.id === newId);
      if (newTemplate) {
        setEditingTemplate({ ...newTemplate });
        setShowZoneEditor(true);
      }
    }
  };

  const handleDelete = (templateId: string) => {
    deleteTemplate(templateId);
    setConfirmDelete(null);
  };

  const handleSelect = (templateId: string) => {
    selectTemplate(templateId);
    onSelectTemplate?.(templateId);
    onClose();
  };

  const handleEditorClose = () => {
    setShowZoneEditor(false);
    setEditingTemplate(null);
  };

  const renderTemplateCard = (template: ZoneTemplate) => {
    const isSelected = selectedTemplateId === template.id;
    const frontZones = template.front.zones.length;
    const backZones = template.back.zones.length;

    return (
      <div
        key={template.id}
        className={`border rounded-lg p-4 transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium text-gray-800">{template.name}</h4>
            {template.description && (
              <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
            )}
          </div>
          {template.isBuiltIn && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
              Built-in
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 mb-3">
          Front: {frontZones} zone{frontZones !== 1 ? 's' : ''} · Back: {backZones} zone
          {backZones !== 1 ? 's' : ''}
        </div>

        {/* Mini preview of zones */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 mb-1">Front</div>
            <div
              className="relative bg-gray-100 rounded border border-gray-200"
              style={{ aspectRatio: '340/214' }}
            >
              {template.front.zones.slice(0, 6).map((zone) => (
                <div
                  key={zone.id}
                  className="absolute bg-blue-300/50 border border-blue-400 rounded-sm"
                  style={{
                    left: `${zone.position.x}%`,
                    top: `${zone.position.y}%`,
                    width: `${zone.position.width}%`,
                    height: `${zone.position.height}%`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 mb-1">Back</div>
            <div
              className="relative bg-gray-100 rounded border border-gray-200"
              style={{ aspectRatio: '340/214' }}
            >
              {template.back.zones.slice(0, 6).map((zone) => (
                <div
                  key={zone.id}
                  className="absolute bg-green-300/50 border border-green-400 rounded-sm"
                  style={{
                    left: `${zone.position.x}%`,
                    top: `${zone.position.y}%`,
                    width: `${zone.position.width}%`,
                    height: `${zone.position.height}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSelect(template.id)}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected ? 'Selected' : 'Use Template'}
          </button>

          {!template.isBuiltIn ? (
            <>
              <button
                onClick={() => handleEdit(template)}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                title="Edit template"
              >
                Edit
              </button>
              {confirmDelete === template.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="px-2 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-2 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(template.id)}
                  className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded"
                  title="Delete template"
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => handleDuplicate(template)}
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              title="Duplicate as custom template"
            >
              Duplicate
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Zone Template Library</h3>
              <p className="text-sm text-gray-500">
                Create and manage custom zone layouts for your credentials
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Create New Button */}
            <div className="mb-6">
              <button
                onClick={handleCreateNew}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                + Create New Template
              </button>
            </div>

            {/* Built-in Templates */}
            {builtInTemplates.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Built-in Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {builtInTemplates.map(renderTemplateCard)}
                </div>
              </div>
            )}

            {/* User Templates */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                My Templates ({userTemplates.length})
              </h4>
              {userTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userTemplates.map(renderTemplateCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No custom templates yet.</p>
                  <p className="text-xs mt-1">
                    Create a new template or duplicate a built-in one to get started.
                  </p>
                </div>
              )}
            </div>
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

      {/* Zone Editor Modal */}
      {showZoneEditor && <ZoneEditor onClose={handleEditorClose} />}
    </>
  );
}
