/**
 * VctList Component
 *
 * Sidebar component showing all saved VCT projects.
 * Users can select, create, or delete VCTs from this list.
 */

import { useVctStore } from '../../../store/vctStore';

interface VctListProps {
  onNew: () => void;
}

export default function VctList({ onNew }: VctListProps) {
  const {
    savedProjects,
    currentProjectId,
    isDirty,
    loadProject,
    deleteProject,
  } = useVctStore();

  const handleSelect = (id: string) => {
    if (currentProjectId === id) return;
    if (isDirty && !confirm('You have unsaved changes. Load anyway?')) {
      return;
    }
    loadProject(id);
  };

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${name}"?`)) {
      await deleteProject(id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">
            {savedProjects.length} VCT{savedProjects.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onNew}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            title="Create new VCT"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>
      </div>

      {/* VCT list */}
      {savedProjects.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 p-4">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-sm font-medium">No VCTs yet</p>
            <p className="text-xs mt-1">Click "New" to create one</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {savedProjects.map((project) => {
            const isSelected = currentProjectId === project.id;
            return (
              <div
                key={project.id}
                onClick={() => handleSelect(project.id)}
                className={`group p-3 cursor-pointer transition-colors border-l-4 ${
                  isSelected
                    ? 'bg-blue-50 border-l-blue-500'
                    : 'hover:bg-gray-50 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 text-sm truncate block">
                      {project.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(project.id, project.name, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
