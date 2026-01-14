import { useEffect, useState, useCallback, useRef } from 'react';
import { useBadgeStore } from '../../store/badgeStore';
import { useBadgesSettingsStore } from '../../store/badgesSettingsStore';
import BadgeForm from './components/BadgeForm';
import BadgeJsonPreview from './components/BadgeJsonPreview';
import BadgePreview from './components/BadgePreview';
import BadgesToolbar from './components/BadgesToolbar';
import BadgeList from './components/BadgeList';

type MobilePanel = 'form' | 'json' | 'preview';

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
      className={`hidden md:flex w-1 bg-gray-300 hover:bg-amber-400 cursor-col-resize flex-shrink-0 items-center justify-center transition-colors ${
        isDragging ? 'bg-amber-500' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      <div className="w-0.5 h-8 bg-gray-400 rounded" />
    </div>
  );
}

export default function BadgesApp() {
  const {
    fetchBadges,
    currentBadge,
    newBadge,
  } = useBadgeStore();

  const { fetchSettings } = useBadgesSettingsStore();

  // Panel visibility state for responsive layout
  const [showFormPanel, setShowFormPanel] = useState(true);
  const [showJsonPanel, setShowJsonPanel] = useState(true);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [mobileActivePanel, setMobileActivePanel] = useState<MobilePanel>('form');

  // Panel widths for resizable panels (in pixels)
  const [formPanelWidth, setFormPanelWidth] = useState(420);
  const [jsonPanelWidth, setJsonPanelWidth] = useState(380);

  // Minimum and maximum panel widths
  const MIN_PANEL_WIDTH = 200;
  const MAX_PANEL_WIDTH = 600;

  const handleFormDividerDrag = useCallback((delta: number) => {
    setFormPanelWidth((prev) => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, prev + delta)));
  }, []);

  const handleJsonDividerDrag = useCallback((delta: number) => {
    setJsonPanelWidth((prev) => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, prev + delta)));
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchBadges();
    fetchSettings();
  }, [fetchBadges, fetchSettings]);

  // Helper to check if we're editing (have a current badge)
  const isEditing = !!currentBadge;

  // Render empty state when no badge is selected
  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <p className="text-lg font-medium">Select a badge</p>
        <p className="text-sm mt-1">Choose from the list or create a new one</p>
        <button
          onClick={() => newBadge()}
          className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium"
        >
          Create New Badge
        </button>
      </div>
    </div>
  );

  // Render the editor panels
  const renderEditor = () => (
    <>
      {/* Mobile Panel Tabs - visible on small screens only */}
      <div className="md:hidden flex bg-gray-100 border-b border-gray-300">
        <button
          onClick={() => setMobileActivePanel('form')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            mobileActivePanel === 'form'
              ? 'bg-white text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-600'
          }`}
        >
          Form
        </button>
        <button
          onClick={() => setMobileActivePanel('json')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            mobileActivePanel === 'json'
              ? 'bg-white text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-600'
          }`}
        >
          JSON
        </button>
        <button
          onClick={() => setMobileActivePanel('preview')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            mobileActivePanel === 'preview'
              ? 'bg-white text-amber-600 border-b-2 border-amber-600'
              : 'text-gray-600'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Editor Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form Input */}
        <div
          className={`
            flex-col bg-white overflow-y-auto flex-shrink-0
            ${mobileActivePanel === 'form' ? 'flex' : 'hidden'}
            ${showFormPanel ? 'md:flex' : 'md:hidden'}
          `}
          style={{
            width: showFormPanel ? `${formPanelWidth}px` : undefined,
          }}
        >
          <BadgeForm />
        </div>

        {/* Resizable divider after Form panel */}
        {showFormPanel && (showJsonPanel || showPreviewPanel) && (
          <ResizableDivider onDrag={handleFormDividerDrag} />
        )}

        {/* Middle Panel - JSON Preview */}
        <div
          className={`
            flex-col bg-gray-900 overflow-y-auto flex-shrink-0
            ${mobileActivePanel === 'json' ? 'flex' : 'hidden'}
            ${showJsonPanel ? 'md:flex' : 'md:hidden'}
            ${!showPreviewPanel && showJsonPanel ? 'md:flex-1' : ''}
          `}
          style={{
            width: showJsonPanel && showPreviewPanel ? `${jsonPanelWidth}px` : undefined,
          }}
        >
          <div className="sticky top-0 bg-gray-800 px-4 py-2 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-white font-medium">Badge JSON</h2>
          </div>
          <BadgeJsonPreview />
        </div>

        {/* Resizable divider after JSON panel */}
        {showJsonPanel && showPreviewPanel && (
          <ResizableDivider onDrag={handleJsonDividerDrag} />
        )}

        {/* Right Panel - Badge Preview */}
        <div
          className={`
            flex-col flex-1 bg-gray-50 overflow-y-auto
            ${mobileActivePanel === 'preview' ? 'flex' : 'hidden'}
            ${showPreviewPanel ? 'md:flex' : 'md:hidden'}
          `}
        >
          {/* Preview Header */}
          <div className="sticky top-0 z-10 bg-white px-4 py-2 border-b border-gray-200">
            <h2 className="font-medium text-gray-800">Badge Preview</h2>
          </div>
          <BadgePreview />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <BadgesToolbar
        showFormPanel={showFormPanel}
        setShowFormPanel={setShowFormPanel}
        showJsonPanel={showJsonPanel}
        setShowJsonPanel={setShowJsonPanel}
        showPreviewPanel={showPreviewPanel}
        setShowPreviewPanel={setShowPreviewPanel}
      />

      {/* Main Content - Sidebar + Editor/Empty State */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Panel - Badge List Sidebar (hidden on mobile when editing) */}
        <div className={`w-72 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${isEditing ? 'hidden md:flex' : 'flex'}`}>
          <BadgeList onNew={() => newBadge()} />
        </div>

        {/* Right Panel - Editor or Empty State */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {isEditing ? renderEditor() : renderEmptyState()}
        </div>
      </main>
    </div>
  );
}
