import { useState, useCallback, useRef, useEffect } from 'react';
import { useVctStore, reloadUserProjects } from '../../store/vctStore';
import { useZoneTemplateStore } from '../../store/zoneTemplateStore';
import { getLocaleName } from '../../types/vct';
import { useAppTracking } from '../../hooks/useAppTracking';
import MetadataForm from '../../components/FormPanel/MetadataForm';
import DisplayForm from '../../components/FormPanel/DisplayForm';
import ClaimsForm from '../../components/FormPanel/ClaimsForm';
import CardZonesForm from '../../components/FormPanel/CardZonesForm';
import JsonPreview from '../../components/JsonPanel/JsonPreview';
import CredentialPreview from '../../components/PreviewPanel/CredentialPreview';
import Toolbar from '../../components/Toolbar/Toolbar';
import VctList from './components/VctList';

type FormSection = 'metadata' | 'display' | 'front' | 'back' | 'claims';
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
      className={`hidden md:flex w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize flex-shrink-0 items-center justify-center transition-colors ${
        isDragging ? 'bg-blue-500' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      <div className="w-0.5 h-8 bg-gray-400 rounded" />
    </div>
  );
}

export default function VctBuilderApp() {
  // Track app access
  useAppTracking('vct-builder', 'VCT Builder');

  // Load zone templates from server on mount
  const loadTemplates = useZoneTemplateStore((state) => state.loadTemplates);
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Load VCT projects from server on mount
  useEffect(() => {
    reloadUserProjects();
  }, []);

  const [activeSection, setActiveSection] = useState<FormSection>('metadata');
  const [previewLocale, setPreviewLocale] = useState<string>('en-CA');
  const [cardSide, setCardSide] = useState<'front' | 'back' | undefined>(undefined);

  // Panel visibility state for responsive layout
  const [showFormPanel, setShowFormPanel] = useState(true);
  const [showJsonPanel, setShowJsonPanel] = useState(true);
  const [showPreviewPanel, setShowPreviewPanel] = useState(true);
  const [mobileActivePanel, setMobileActivePanel] = useState<MobilePanel>('preview');

  // Panel widths for resizable panels (in pixels)
  const [formPanelWidth, setFormPanelWidth] = useState(384); // 24rem = 384px
  const [jsonPanelWidth, setJsonPanelWidth] = useState(384);

  // Minimum and maximum panel widths
  const MIN_PANEL_WIDTH = 200;
  const MAX_PANEL_WIDTH = 600;

  const handleFormDividerDrag = useCallback((delta: number) => {
    setFormPanelWidth((prev) => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, prev + delta)));
  }, []);

  const handleJsonDividerDrag = useCallback((delta: number) => {
    setJsonPanelWidth((prev) => Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, prev + delta)));
  }, []);

  const currentVct = useVctStore((state) => state.currentVct);
  const isEditing = useVctStore((state) => state.isEditing);
  const newProject = useVctStore((state) => state.newProject);

  // Get available locales from the current VCT display configuration
  const availableLocales = currentVct.display.map((d) => d.locale);

  // Check if schema is selected (required for Claims tab)
  const hasSchemaSelected = Boolean(currentVct.schema_uri && currentVct.schema_uri.trim());

  // Check if zone template is selected (required for Front/Back tabs)
  const selectedTemplateId = useZoneTemplateStore((state) => state.selectedTemplateId);
  const getTemplate = useZoneTemplateStore((state) => state.getTemplate);
  const hasZoneTemplateSelected = Boolean(selectedTemplateId);
  const selectedTemplate = selectedTemplateId ? getTemplate(selectedTemplateId) : null;
  const isFrontOnly = selectedTemplate?.frontOnly ?? false;

  // Empty state when no VCT is being edited
  const renderEmptyState = () => (
    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <p className="text-lg font-medium">Select a VCT</p>
        <p className="text-sm mt-1">Choose from the list or create a new one</p>
        <button
          onClick={() => newProject()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Create New VCT
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <Toolbar
        showFormPanel={showFormPanel}
        setShowFormPanel={setShowFormPanel}
        showJsonPanel={showJsonPanel}
        setShowJsonPanel={setShowJsonPanel}
        showPreviewPanel={showPreviewPanel}
        setShowPreviewPanel={setShowPreviewPanel}
      />

      {/* Mobile Panel Tabs - visible on small screens only */}
      <div className="md:hidden flex bg-gray-100 border-b border-gray-300">
        <button
          onClick={() => setMobileActivePanel('form')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            mobileActivePanel === 'form'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Form
        </button>
        <button
          onClick={() => setMobileActivePanel('json')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            mobileActivePanel === 'json'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          JSON
        </button>
        <button
          onClick={() => setMobileActivePanel('preview')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            mobileActivePanel === 'preview'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Main Content - Sidebar + Editor Layout */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Sidebar - VCT List (hidden on mobile) */}
        <div className="hidden md:flex w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 flex-col">
          <VctList onNew={() => newProject()} />
        </div>

        {/* Editor or Empty State */}
        {isEditing ? (
          <div className="flex-1 flex overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Form Panel */}
            {((mobileActivePanel === 'form') || showFormPanel) && (
          <div
            className={`
              flex-col bg-white overflow-y-auto
              ${mobileActivePanel === 'form' ? 'flex w-full' : 'hidden'}
              ${showFormPanel ? 'md:flex' : 'md:hidden'}
              ${!showJsonPanel && !showPreviewPanel ? 'flex-1' : 'flex-shrink-0'}
            `}
            style={{ width: mobileActivePanel === 'form' ? '100%' : (!showJsonPanel && !showPreviewPanel ? undefined : `${formPanelWidth}px`) }}
          >
            {/* Section Tabs */}
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10 flex-shrink-0">
              <button
                onClick={() => setActiveSection('metadata')}
                className={`flex-1 px-3 py-3 text-sm font-medium ${
                  activeSection === 'metadata'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Metadata
              </button>
              <button
                onClick={() => setActiveSection('display')}
                className={`flex-1 px-3 py-3 text-sm font-medium ${
                  activeSection === 'display'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Display
              </button>
              <button
                onClick={() => hasZoneTemplateSelected && setActiveSection('front')}
                disabled={!hasZoneTemplateSelected}
                title={!hasZoneTemplateSelected ? 'Select a zone template in Display tab first' : 'Configure front of card'}
                className={`flex-1 px-3 py-3 text-sm font-medium ${
                  activeSection === 'front'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : !hasZoneTemplateSelected
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Front
                {!hasZoneTemplateSelected && <span className="ml-1 text-xs">🔒</span>}
              </button>
              {!isFrontOnly && (
                <button
                  onClick={() => hasZoneTemplateSelected && setActiveSection('back')}
                  disabled={!hasZoneTemplateSelected}
                  title={!hasZoneTemplateSelected ? 'Select a zone template in Display tab first' : 'Configure back of card'}
                  className={`flex-1 px-3 py-3 text-sm font-medium ${
                    activeSection === 'back'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : !hasZoneTemplateSelected
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Back
                  {!hasZoneTemplateSelected && <span className="ml-1 text-xs">🔒</span>}
                </button>
              )}
              <button
                onClick={() => hasSchemaSelected && setActiveSection('claims')}
                disabled={!hasSchemaSelected}
                title={!hasSchemaSelected ? 'Select a schema first to configure claims' : 'Configure credential claims'}
                className={`flex-1 px-3 py-3 text-sm font-medium ${
                  activeSection === 'claims'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : !hasSchemaSelected
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Claims
                {!hasSchemaSelected && <span className="ml-1 text-xs">🔒</span>}
              </button>
            </div>

            {/* Form Content */}
            <div className="p-4 flex-1 overflow-y-auto">
              {activeSection === 'metadata' && <MetadataForm />}
              {activeSection === 'display' && <DisplayForm />}
              {activeSection === 'front' && <CardZonesForm face="front" displayIndex={0} />}
              {activeSection === 'back' && <CardZonesForm face="back" displayIndex={0} />}
              {activeSection === 'claims' && <ClaimsForm />}
            </div>
          </div>
        )}

        {/* Resizable divider after Form panel - shows when Form is visible */}
        {showFormPanel && (
          <ResizableDivider onDrag={handleFormDividerDrag} />
        )}

        {/* Middle Panel - JSON Preview */}
        {((mobileActivePanel === 'json') || showJsonPanel) && (
          <div
            className={`
              flex-col bg-gray-900 overflow-y-auto
              ${mobileActivePanel === 'json' ? 'flex w-full' : 'hidden'}
              ${showJsonPanel ? 'md:flex' : 'md:hidden'}
              ${!showPreviewPanel ? 'flex-1' : 'flex-shrink-0'}
            `}
            style={{ width: mobileActivePanel === 'json' ? '100%' : (!showPreviewPanel ? undefined : `${jsonPanelWidth}px`) }}
          >
            <div className="sticky top-0 bg-gray-800 px-4 py-2 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-white font-medium">VCT JSON</h2>
            </div>
            <JsonPreview />
          </div>
        )}

        {/* Resizable divider after JSON panel - shows when JSON is visible */}
        {showJsonPanel && (
          <ResizableDivider onDrag={handleJsonDividerDrag} />
        )}

        {/* Right Panel - Credential Preview */}
        {((mobileActivePanel === 'preview') || showPreviewPanel) && (
        <div
          className={`
            flex-col flex-1 bg-gray-50 overflow-y-auto transition-all duration-300
            ${mobileActivePanel === 'preview' ? 'flex w-full' : 'hidden'}
            ${showPreviewPanel ? 'md:flex' : 'md:hidden'}
          `}
        >
          {/* Preview Controls */}
          <div className="sticky top-0 z-10 bg-white px-4 py-2 border-b border-gray-200 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Language:</label>
              <select
                value={previewLocale}
                onChange={(e) => setPreviewLocale(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {availableLocales.map((locale) => (
                  <option key={locale} value={locale}>
                    {getLocaleName(locale)}
                  </option>
                ))}
              </select>
            </div>
            {/* Card Side Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Side:</label>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setCardSide(cardSide === 'front' ? undefined : 'front')}
                  className={`px-2 py-1 text-xs font-medium rounded-l-md border ${
                    cardSide === 'front'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => setCardSide(cardSide === 'back' ? undefined : 'back')}
                  className={`px-2 py-1 text-xs font-medium rounded-r-md border-t border-r border-b -ml-px ${
                    cardSide === 'back'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Back
                </button>
              </div>
              {cardSide && (
                <button
                  type="button"
                  onClick={() => setCardSide(undefined)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  title="Reset to interactive flip"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <CredentialPreview
            locale={previewLocale}
            cardSide={cardSide}
            onZoneSelect={(face) => {
              if (hasZoneTemplateSelected) {
                setActiveSection(face);
              }
            }}
          />
        </div>
        )}
          </div>
        ) : (
          renderEmptyState()
        )}
      </main>
    </div>
  );
}
