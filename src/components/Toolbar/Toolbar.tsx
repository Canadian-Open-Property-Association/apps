import { useState } from 'react';
import { useVctStore } from '../../store/vctStore';
import ImportModal from '../Modals/ImportModal';
import NewProjectModal from '../Modals/NewProjectModal';
import SaveToRepoModal from '../Library/SaveToRepoModal';
import VctSettingsModal from '../Modals/VctSettingsModal';
import {
  AppNavBar,
  SaveButton,
  UnsavedIndicator,
  PanelToggles,
  PanelToggle,
  CreatePrButton,
  SettingsButton
} from '../AppNavBar';

interface ToolbarProps {
  showFormPanel: boolean;
  setShowFormPanel: (show: boolean) => void;
  showJsonPanel: boolean;
  setShowJsonPanel: (show: boolean) => void;
  showPreviewPanel: boolean;
  setShowPreviewPanel: (show: boolean) => void;
}

export default function Toolbar({
  showFormPanel,
  setShowFormPanel,
  showJsonPanel,
  setShowJsonPanel,
  showPreviewPanel,
  setShowPreviewPanel,
}: ToolbarProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLocalLibrary, setShowLocalLibrary] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showSaveToRepo, setShowSaveToRepo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const currentProjectName = useVctStore((state) => state.currentProjectName);
  const currentProjectId = useVctStore((state) => state.currentProjectId);
  const savedProjects = useVctStore((state) => state.savedProjects);
  const isDirty = useVctStore((state) => state.isDirty);
  const newProject = useVctStore((state) => state.newProject);
  const saveProject = useVctStore((state) => state.saveProject);
  const loadProject = useVctStore((state) => state.loadProject);
  const deleteProject = useVctStore((state) => state.deleteProject);

  const handleSave = async () => {
    if (currentProjectId) {
      // Already has a name, save directly
      await saveProject(currentProjectName);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } else {
      // First save, show dialog
      setProjectName(currentProjectName);
      setShowSaveDialog(true);
    }
  };

  const handleSaveConfirm = async () => {
    if (projectName.trim()) {
      await saveProject(projectName.trim());
      setShowSaveDialog(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }
  };

  const handleNew = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to create a new project?')) {
        setShowNewProjectModal(true);
      }
    } else {
      setShowNewProjectModal(true);
    }
  };

  const handleStartFresh = () => {
    newProject();
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  return (
    <>
      <AppNavBar
        left={
          <>
            <button
              onClick={handleNew}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
            <SaveButton onClick={handleSave} showSuccess={showSaveSuccess} />
            <button
              onClick={() => setShowLocalLibrary(true)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Open
            </button>
            <UnsavedIndicator show={isDirty} />
          </>
        }
        panels={
          <PanelToggles>
            <PanelToggle
              label="Form"
              isVisible={showFormPanel}
              onClick={() => setShowFormPanel(!showFormPanel)}
            />
            <PanelToggle
              label="JSON"
              isVisible={showJsonPanel}
              onClick={() => setShowJsonPanel(!showJsonPanel)}
            />
            <PanelToggle
              label="Preview"
              isVisible={showPreviewPanel}
              onClick={() => setShowPreviewPanel(!showPreviewPanel)}
            />
          </PanelToggles>
        }
        prButton={<CreatePrButton onClick={() => setShowSaveToRepo(true)} />}
        settings={<SettingsButton onClick={() => setShowSettings(true)} />}
      />

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onStartFresh={handleStartFresh}
        onImport={handleImport}
      />

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Project</h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Library Dialog */}
      {showLocalLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Local Library</h3>
                <button
                  onClick={() => setShowLocalLibrary(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Your locally saved VCT projects</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {savedProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="mb-2">No saved projects yet</p>
                  <p className="text-sm">Create a VCT and click Save to add it to your library.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          if (isDirty) {
                            if (confirm('You have unsaved changes. Load this project anyway?')) {
                              loadProject(project.id);
                              setShowLocalLibrary(false);
                            }
                          } else {
                            loadProject(project.id);
                            setShowLocalLibrary(false);
                          }
                        }}
                      >
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-gray-500">
                          Updated: {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {deleteConfirm === project.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              deleteProject(project.id);
                              setDeleteConfirm(null);
                            }}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(project.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete project"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowLocalLibrary(false)}
                className="w-full px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />

      {/* Create Pull Request Modal */}
      <SaveToRepoModal isOpen={showSaveToRepo} onClose={() => setShowSaveToRepo(false)} />

      {/* Settings Modal */}
      {showSettings && <VctSettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
