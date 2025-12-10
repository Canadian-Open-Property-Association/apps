import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSchemaStore } from '../../../store/schemaStore';
import { toJsonSchema, toJsonLdContext, generateArtifactName } from '../../../types/schema';
import { useVocabularyStore } from '../../../store/vocabularyStore';

/**
 * Collapsible JSON Tree Viewer
 * Renders JSON with expandable/collapsible nested objects and arrays
 */
interface JsonNodeProps {
  keyName?: string;
  value: unknown;
  depth: number;
  isLast: boolean;
  defaultExpanded?: boolean;
}

function JsonNode({ keyName, value, depth, isLast, defaultExpanded = true }: JsonNodeProps) {
  // Auto-collapse deeply nested items to keep the view manageable
  const [isExpanded, setIsExpanded] = useState(defaultExpanded && depth < 2);
  const indent = depth * 16;

  const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  // Count items for collapsed preview
  const itemCount = isObject ? Object.keys(value as object).length : isArray ? (value as unknown[]).length : 0;

  // Render primitive values
  const renderValue = (val: unknown) => {
    if (val === null) return <span className="text-purple-400">null</span>;
    if (typeof val === 'boolean') return <span className="text-purple-400">{val.toString()}</span>;
    if (typeof val === 'number') return <span className="text-orange-400">{val}</span>;
    if (typeof val === 'string') return <span className="text-green-400">"{val}"</span>;
    return null;
  };

  if (!isExpandable) {
    return (
      <div style={{ paddingLeft: `${indent}px` }} className="leading-relaxed">
        {keyName !== undefined && (
          <span className="text-cyan-400">"{keyName}"</span>
        )}
        {keyName !== undefined && <span className="text-gray-400">: </span>}
        {renderValue(value)}
        {!isLast && <span className="text-gray-400">,</span>}
      </div>
    );
  }

  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';
  const entries = isArray
    ? (value as unknown[]).map((v, i) => ({ key: undefined, value: v, index: i }))
    : Object.entries(value as object).map(([k, v], i) => ({ key: k, value: v, index: i }));

  return (
    <div>
      {/* Key and opening bracket with toggle */}
      <div
        style={{ paddingLeft: `${indent}px` }}
        className="leading-relaxed cursor-pointer hover:bg-gray-800/50 flex items-center gap-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={`text-gray-500 w-3 text-center transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
          ▶
        </span>
        {keyName !== undefined && (
          <span className="text-cyan-400">"{keyName}"</span>
        )}
        {keyName !== undefined && <span className="text-gray-400">: </span>}
        <span className="text-gray-500">{openBracket}</span>
        {!isExpanded && (
          <>
            <span className="text-gray-600 text-xs ml-1">
              {itemCount} {isArray ? 'items' : 'keys'}
            </span>
            <span className="text-gray-500">{closeBracket}</span>
            {!isLast && <span className="text-gray-400">,</span>}
          </>
        )}
      </div>

      {/* Children */}
      {isExpanded && (
        <>
          {entries.map((entry, i) => (
            <JsonNode
              key={entry.key ?? i}
              keyName={entry.key}
              value={entry.value}
              depth={depth + 1}
              isLast={i === entries.length - 1}
              defaultExpanded={depth < 1}
            />
          ))}
          {/* Closing bracket */}
          <div style={{ paddingLeft: `${indent}px` }} className="leading-relaxed">
            <span className="w-3 inline-block" />
            <span className="text-gray-500">{closeBracket}</span>
            {!isLast && <span className="text-gray-400">,</span>}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Simple JSON syntax highlighter - returns HTML with colored spans
 * Used when in edit mode or as fallback
 */
function highlightJson(json: string): string {
  // Escape HTML entities first
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply syntax highlighting with regex
  return escaped
    // Strings (property names and values) - cyan for keys, green for values
    .replace(/"([^"\\]*(\\.[^"\\]*)*)"\s*:/g, '<span class="text-cyan-400">"$1"</span>:')
    .replace(/:\s*"([^"\\]*(\\.[^"\\]*)*)"/g, ': <span class="text-green-400">"$1"</span>')
    // Standalone strings (in arrays)
    .replace(/(?<=[\[,]\s*)"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="text-green-400">"$1"</span>')
    // Numbers - orange
    .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="text-orange-400">$1</span>')
    .replace(/(?<=[\[,]\s*)(-?\d+\.?\d*)(?=\s*[,\]])/g, '<span class="text-orange-400">$1</span>')
    // Booleans and null - purple
    .replace(/:\s*(true|false|null)/g, ': <span class="text-purple-400">$1</span>')
    .replace(/(?<=[\[,]\s*)(true|false|null)(?=\s*[,\]])/g, '<span class="text-purple-400">$1</span>')
    // Brackets and braces - gray
    .replace(/([{}[\]])/g, '<span class="text-gray-500">$1</span>');
}

export default function SchemaJsonPreview() {
  const [copied, setCopied] = useState(false);
  const [localJson, setLocalJson] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'tree'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Subscribe to store state
  const metadata = useSchemaStore((state) => state.metadata);
  const properties = useSchemaStore((state) => state.properties);
  const currentProjectName = useSchemaStore((state) => state.currentProjectName);
  const importSchema = useSchemaStore((state) => state.importSchema);
  const getSelectedVocab = useVocabularyStore((state) => state.getSelectedVocab);

  const isJsonLdMode = metadata.mode === 'jsonld-context';

  // Generate JSON Schema or JSON-LD Context based on mode
  const storeJsonString = useMemo(() => {
    if (isJsonLdMode) {
      const vocabulary = getSelectedVocab();
      const context = toJsonLdContext(metadata, properties, vocabulary);
      return JSON.stringify(context, null, 2);
    }
    const schema = toJsonSchema(metadata, properties);
    return JSON.stringify(schema, null, 2);
  }, [metadata, properties, isJsonLdMode, getSelectedVocab]);

  // Sync local JSON with store when not focused (external changes)
  useEffect(() => {
    if (!isFocused) {
      setLocalJson(storeJsonString);
      setParseError(null);
    }
  }, [storeJsonString, isFocused]);

  // Real-time syntax validation as user types
  const handleJsonChange = useCallback((value: string) => {
    setLocalJson(value);
    try {
      JSON.parse(value);
      setParseError(null);
    } catch (e) {
      setParseError((e as Error).message);
    }
  }, []);

  // Handle focus - start editing
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle blur - validate and apply changes
  const handleBlur = useCallback(() => {
    setIsFocused(false);

    // Don't apply if there's a parse error
    if (parseError) {
      return;
    }

    try {
      const parsed = JSON.parse(localJson);

      // Mode-specific validation
      if (isJsonLdMode) {
        // JSON-LD Credential Schema validation - must have credentialSubject with properties
        if (!parsed.properties?.credentialSubject) {
          setParseError('Invalid schema: missing credentialSubject');
          return;
        }
        // Only update if JSON actually changed
        if (localJson !== storeJsonString) {
          importSchema(localJson);
        }
        setParseError(null);
      } else {
        // JSON Schema validation - must have required structure
        if (!parsed.properties?.credentialSubject) {
          setParseError('Invalid schema: missing credentialSubject');
          return;
        }

        // Only update if JSON actually changed
        if (localJson !== storeJsonString) {
          importSchema(localJson);
        }
        setParseError(null);
      }
    } catch (e) {
      setParseError((e as Error).message);
    }
  }, [localJson, storeJsonString, parseError, isJsonLdMode, importSchema]);

  // Reset to store version
  const handleReset = useCallback(() => {
    setLocalJson(storeJsonString);
    setParseError(null);
  }, [storeJsonString]);

  // Sync scroll between textarea and highlighted pre
  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Check if there are unsaved changes
  const hasUnsavedChanges = localJson !== storeJsonString && !parseError;

  // Memoize the highlighted HTML for display mode
  const highlightedHtml = useMemo(() => highlightJson(localJson || storeJsonString), [localJson, storeJsonString]);

  // Generate filename based on namespace convention
  const getFilename = () => {
    const artifactName = generateArtifactName(metadata.category, metadata.credentialName);
    const baseName = artifactName || currentProjectName.replace(/\s+/g, '-').toLowerCase() || 'schema';

    if (isJsonLdMode) {
      return `${baseName}.context.jsonld`;
    }
    return `${baseName}.schema.json`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localJson || storeJsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([localJson || storeJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Action buttons */}
      <div className="flex gap-2 p-2 bg-gray-800 border-b border-gray-700 items-center flex-wrap">
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleDownload}
          className="px-3 py-1.5 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 rounded flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>

        {/* Reset button - shown when there are changes or errors */}
        {(parseError || hasUnsavedChanges) && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs bg-yellow-600 text-white hover:bg-yellow-700 rounded flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        )}

        {/* View mode toggle */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setViewMode('edit')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'edit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            title="Edit mode with syntax highlighting"
          >
            Edit
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === 'tree'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            title="Collapsible tree view"
          >
            Tree
          </button>
        </div>

        {hasUnsavedChanges && (
          <span className="text-xs text-yellow-400 ml-2">Click outside to apply</span>
        )}

        <span className="text-xs text-gray-500 ml-auto truncate max-w-[200px]" title={getFilename()}>
          {getFilename()}
        </span>
      </div>

      {/* Parse error banner */}
      {parseError && (
        <div className="px-3 py-2 bg-red-900/50 border-b border-red-700 text-red-300 text-xs">
          <span className="font-semibold">JSON Error:</span> {parseError}
        </div>
      )}

      {/* JSON editor content */}
      <div
        className={`flex-1 overflow-hidden relative ${
          parseError ? 'border-l-2 border-red-500' : ''
        } ${hasUnsavedChanges ? 'border-l-2 border-yellow-500' : ''}`}
      >
        {viewMode === 'edit' ? (
          // Overlay editing mode - syntax highlighting while editing
          <>
            {/* Syntax-highlighted layer (behind) */}
            <pre
              ref={preRef}
              className="absolute inset-0 p-4 m-0 font-mono text-xs leading-relaxed overflow-auto pointer-events-none whitespace-pre-wrap break-words"
              style={{ tabSize: 2 }}
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
            />
            {/* Editable textarea (in front, transparent) */}
            <textarea
              ref={textareaRef}
              value={localJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onScroll={handleScroll}
              className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white font-mono text-xs leading-relaxed resize-none focus:outline-none"
              style={{ tabSize: 2 }}
              spellCheck={false}
            />
          </>
        ) : (
          // Collapsible JSON tree view
          <div className="h-full overflow-auto p-4 font-mono text-xs">
            {(() => {
              try {
                const parsed = JSON.parse(localJson || storeJsonString);
                return <JsonNode value={parsed} depth={0} isLast={true} />;
              } catch {
                // Fallback to highlighted text if JSON is invalid
                return (
                  <pre
                    className="leading-relaxed whitespace-pre-wrap break-words"
                    style={{ tabSize: 2 }}
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                  />
                );
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
