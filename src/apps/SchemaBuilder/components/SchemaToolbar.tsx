import { useState } from 'react';
import { useSchemaStore } from '../../../store/schemaStore';
import { useAuthStore } from '../../../store/authStore';
import SaveSchemaToRepoModal from './SaveSchemaToRepoModal';
import NewSchemaModal from './NewSchemaModal';
import {
  AppNavBar,
  SaveButton,
  UnsavedIndicator,
  CreatePrButton,
  SettingsButton,
  NavDivider
} from '../../../components/AppNavBar';

export default function SchemaToolbar() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSaveToRepoModal, setShowSaveToRepoModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    currentProjectName,
    currentProjectId,
    isDirty,
    savedProjects,
    newSchema,
    saveSchema,
    loadSchema,
    deleteSchema,
    updateMetadata,
  } = useSchemaStore();

  const handleNew = () => {
    if (isDirty && !confirm('You have unsaved changes. Create new schema anyway?')) {
      return;
    }
    setShowNewModal(true);
  };

  const handleNewSchemaCreate = () => {
    newSchema();
    // Always use json-schema mode (for JSON-LD VCs)
    updateMetadata({ mode: 'json-schema' });
  };

  const handleSave = async () => {
    if (currentProjectId) {
      await saveSchema(currentProjectName);
      // Show save success feedback
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } else {
      setSaveName(currentProjectName);
      setShowSaveModal(true);
    }
  };

  const handleConfirmSave = async () => {
    if (saveName.trim()) {
      await saveSchema(saveName.trim());
      setShowSaveModal(false);
      setSaveName('');
      // Show save success feedback
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }
  };

  const handleLoad = (id: string) => {
    if (isDirty && !confirm('You have unsaved changes. Load anyway?')) {
      return;
    }
    loadSchema(id);
    setShowLoadModal(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this schema project?')) {
      await deleteSchema(id);
    }
  };

  return (
    <>
      <AppNavBar
        left={
          <>
            {/* New */}
            <button
              onClick={handleNew}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>

            {/* Save */}
            <SaveButton onClick={handleSave} showSuccess={showSaveSuccess} />

            {/* Load */}
            <button
              onClick={() => setShowLoadModal(true)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Open
            </button>

            {/* Format Badge */}
            <NavDivider />
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              JSON Schema
            </span>

            <UnsavedIndicator show={isDirty} />
          </>
        }
        prButton={isAuthenticated ? <CreatePrButton onClick={() => setShowSaveToRepoModal(true)} /> : undefined}
        settings={<SettingsButton disabled />}
      />

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Schema Project</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Project name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Open Schema Project</h3>
            {savedProjects.length === 0 ? (
              <p className="text-gray-500 text-sm">No saved projects yet.</p>
            ) : (
              <ul className="space-y-2">
                {savedProjects.map((project) => (
                  <li
                    key={project.id}
                    onClick={() => handleLoad(project.id)}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save to Repo Modal */}
      <SaveSchemaToRepoModal
        isOpen={showSaveToRepoModal}
        onClose={() => setShowSaveToRepoModal(false)}
      />

      {/* New Schema Modal */}
      <NewSchemaModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSelect={handleNewSchemaCreate}
      />
    </>
  );
}
