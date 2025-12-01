import { useState, useRef } from 'react';
import { useVctStore } from '../../store/vctStore';

export default function Toolbar() {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentProjectName = useVctStore((state) => state.currentProjectName);
  const savedProjects = useVctStore((state) => state.savedProjects);
  const newProject = useVctStore((state) => state.newProject);
  const saveProject = useVctStore((state) => state.saveProject);
  const loadProject = useVctStore((state) => state.loadProject);
  const deleteProject = useVctStore((state) => state.deleteProject);
  const exportVct = useVctStore((state) => state.exportVct);
  const importVct = useVctStore((state) => state.importVct);

  const handleSave = () => {
    setProjectName(currentProjectName);
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = () => {
    if (projectName.trim()) {
      saveProject(projectName.trim());
      setShowSaveDialog(false);
    }
  };

  const handleExport = () => {
    const json = exportVct();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProjectName.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          importVct(json);
        } catch (error) {
          alert('Failed to import VCT file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-2">
        <button
          onClick={() => newProject()}
          className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-1"
        >
          <span>📄</span> New
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-1"
        >
          <span>💾</span> Save
        </button>
        <button
          onClick={() => setShowLoadDialog(true)}
          className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-1"
        >
          <span>📂</span> Load
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <button
          onClick={handleImport}
          className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-1"
        >
          <span>📥</span> Import JSON
        </button>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md flex items-center gap-1"
        >
          <span>📤</span> Export JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

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

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Load Project</h3>
            {savedProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No saved projects yet
              </p>
            ) : (
              <div className="space-y-2">
                {savedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        loadProject(project.id);
                        setShowLoadDialog(false);
                      }}
                    >
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-gray-500">
                        Updated: {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${project.name}"?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
