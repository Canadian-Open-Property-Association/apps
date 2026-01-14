import { useEffect, useState, useCallback, useRef } from 'react';
import { useSchemaStore, reloadSchemaProjects } from '../../store/schemaStore';
import { useAppTracking } from '../../hooks/useAppTracking';
import SchemaToolbar from './components/SchemaToolbar';
import SchemaInfoTab from './components/SchemaInfoTab';
import PropertiesTab from './components/PropertiesTab';
import SchemaJsonPreview from './components/SchemaJsonPreview';
import NewSchemaModal from './components/NewSchemaModal';
import SchemaList from './components/SchemaList';

type SchemaTab = 'info' | 'properties';

// Resizable divider component
function ResizableDivider({ onDrag }: { onDrag: (delta: number) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      startXRef.current = e.clientX;
      onDrag(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDrag]);

  return (
    <div
      className={`w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize flex-shrink-0 flex items-center justify-center transition-colors ${
        isDragging ? 'bg-blue-500' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      <div className="w-0.5 h-8 bg-gray-400 rounded" />
    </div>
  );
}

export default function SchemaBuilderApp() {
  // Track app access
  useAppTracking('schema-builder', 'Schema Builder');

  const [activeTab, setActiveTab] = useState<SchemaTab>('info');
  const [showNewModal, setShowNewModal] = useState(false);

  // Panel width for resizable layout (in pixels)
  const [configPanelWidth, setConfigPanelWidth] = useState(500);

  // Minimum and maximum panel widths
  const MIN_PANEL_WIDTH = 300;
  const MAX_PANEL_WIDTH = 800;

  const handleDividerDrag = useCallback((delta: number) => {
    setConfigPanelWidth((prev) => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, prev + delta)));
  }, []);

  const fetchGovernanceDocs = useSchemaStore((state) => state.fetchGovernanceDocs);
  const newSchema = useSchemaStore((state) => state.newSchema);
  const updateMetadata = useSchemaStore((state) => state.updateMetadata);
  const isEditing = useSchemaStore((state) => state.isEditing);

  // Load schema projects from server on mount
  useEffect(() => {
    reloadSchemaProjects();
  }, []);

  // Fetch governance docs on mount
  useEffect(() => {
    fetchGovernanceDocs();
  }, [fetchGovernanceDocs]);

  const handleNewSchemaCreate = () => {
    newSchema();
    // Always use json-schema mode (for JSON-LD VCs)
    updateMetadata({ mode: 'json-schema' });
    setShowNewModal(false);
  };

  // Render empty state when no schema is being edited
  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium">Select a schema</p>
        <p className="text-sm mt-1">Choose from the list or create a new one</p>
        <button
          onClick={() => setShowNewModal(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Create New Schema
        </button>
      </div>
    </div>
  );

  // Render the editor when a schema is selected
  const renderEditor = () => (
    <>
      {/* Left Panel - Tabbed Config */}
      <div
        className="bg-white flex flex-col overflow-hidden flex-shrink-0"
        style={{ width: `${configPanelWidth}px` }}
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Schema Info
            </span>
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'properties'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Credential Properties
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'info' && <SchemaInfoTab />}
          {activeTab === 'properties' && <PropertiesTab />}
        </div>
      </div>

      {/* Resizable Divider */}
      <ResizableDivider onDrag={handleDividerDrag} />

      {/* Right Panel - JSON Preview */}
      <div className="flex-1 bg-gray-900 flex flex-col overflow-hidden">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <h2 className="text-white font-medium text-sm">
            JSON Schema Preview
          </h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <SchemaJsonPreview />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <SchemaToolbar />

      {/* Main Content - Sidebar + Editor/Empty State */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Panel - Schema List Sidebar */}
        <div className="w-72 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <SchemaList onNew={() => setShowNewModal(true)} />
        </div>

        {/* Right Panel - Editor or Empty State */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex overflow-hidden">
          {isEditing ? renderEditor() : renderEmptyState()}
        </div>
      </main>

      {/* New Schema Modal */}
      <NewSchemaModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSelect={handleNewSchemaCreate}
      />
    </div>
  );
}
