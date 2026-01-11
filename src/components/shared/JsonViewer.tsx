/**
 * JSON Viewer Component
 *
 * A standardized JSON viewer with dark theme and syntax highlighting.
 * Used across governance apps to display JSON output.
 *
 * Features:
 * - Dark theme (bg-gray-900)
 * - Syntax highlighting (cyan keys, green strings, orange numbers, purple booleans)
 * - Copy to clipboard button
 * - Download as JSON file
 * - Optional read-only or editable modes
 *
 * @example
 * ```tsx
 * // Read-only viewer
 * <JsonViewer json={myData} filename="output.json" />
 *
 * // Editable viewer
 * <JsonViewer
 *   json={myData}
 *   editable
 *   onChange={(newJson) => setData(newJson)}
 *   onValidate={(json) => json.id !== undefined}
 * />
 * ```
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { highlightJson } from '../../utils/jsonHighlight';

interface JsonViewerProps {
  /** JSON data to display (object or string) */
  json: object | string;
  /** Whether the JSON is editable */
  editable?: boolean;
  /** Callback when JSON is edited (only for editable mode) */
  onChange?: (json: object) => void;
  /** Custom validation function (return true if valid) */
  onValidate?: (json: object) => boolean | string;
  /** Filename for download (without extension) */
  filename?: string;
  /** Whether to show the download button */
  showDownload?: boolean;
  /** Header title (shown above the viewer) */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Additional stats to show in footer */
  stats?: { label: string; value: string | number }[];
  /** Additional CSS classes for the container */
  className?: string;
}

export function JsonViewer({
  json,
  editable = false,
  onChange,
  onValidate,
  filename = 'output',
  showDownload = true,
  title,
  subtitle,
  stats,
  className = '',
}: JsonViewerProps) {
  // Convert to string if object
  const jsonString = typeof json === 'object' ? JSON.stringify(json, null, 2) : json;

  const [localJson, setLocalJson] = useState(jsonString);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Sync with external json when not editing
  useEffect(() => {
    if (!isFocused) {
      const newJsonString = typeof json === 'object' ? JSON.stringify(json, null, 2) : json;
      setLocalJson(newJsonString);
      setParseError(null);
    }
  }, [json, isFocused]);

  // Real-time validation as user types
  const handleJsonChange = useCallback(
    (value: string) => {
      setLocalJson(value);
      try {
        const parsed = JSON.parse(value);
        if (onValidate) {
          const validationResult = onValidate(parsed);
          if (validationResult === false) {
            setParseError('Validation failed');
          } else if (typeof validationResult === 'string') {
            setParseError(validationResult);
          } else {
            setParseError(null);
          }
        } else {
          setParseError(null);
        }
      } catch (e) {
        setParseError((e as Error).message);
      }
    },
    [onValidate]
  );

  // Apply changes on blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);

    if (!editable || !onChange || parseError) return;

    try {
      const parsed = JSON.parse(localJson);
      const originalString = typeof json === 'object' ? JSON.stringify(json, null, 2) : json;
      if (localJson !== originalString) {
        onChange(parsed);
      }
    } catch {
      // Don't apply if invalid
    }
  }, [editable, onChange, parseError, localJson, json]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Reset to original
  const handleReset = useCallback(() => {
    const originalString = typeof json === 'object' ? JSON.stringify(json, null, 2) : json;
    setLocalJson(originalString);
    setParseError(null);
  }, [json]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download as file
  const handleDownload = () => {
    const blob = new Blob([localJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Sync scroll between textarea and highlighted pre
  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Memoize highlighted HTML
  const highlightedHtml = useMemo(() => highlightJson(localJson), [localJson]);

  const hasUnsavedChanges =
    editable &&
    localJson !== (typeof json === 'object' ? JSON.stringify(json, null, 2) : json) &&
    !parseError;

  return (
    <div className={`h-full flex flex-col bg-gray-900 ${className}`}>
      {/* Header (optional) */}
      {(title || subtitle) && (
        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-medium text-gray-200">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 p-2 bg-gray-800 border-b border-gray-700 items-center flex-wrap">
        <button
          onClick={handleCopy}
          className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1 ${
            copied ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>

        {showDownload && (
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 rounded flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        )}

        {/* Reset button - shown when there are changes or errors */}
        {editable && (parseError || hasUnsavedChanges) && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs bg-yellow-600 text-white hover:bg-yellow-700 rounded flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reset
          </button>
        )}

        {editable && hasUnsavedChanges && (
          <span className="text-xs text-yellow-400 ml-2">Click outside to apply</span>
        )}

        {/* Filename indicator */}
        {filename && (
          <span className="text-xs text-gray-500 ml-auto truncate max-w-[200px]" title={filename}>
            {filename.endsWith('.json') ? filename : `${filename}.json`}
          </span>
        )}
      </div>

      {/* Parse error banner */}
      {parseError && (
        <div className="px-3 py-2 bg-red-900/50 border-b border-red-700 text-red-300 text-xs">
          <span className="font-semibold">JSON Error:</span> {parseError}
        </div>
      )}

      {/* JSON content */}
      <div
        className={`flex-1 overflow-hidden relative ${
          parseError ? 'border-l-2 border-red-500' : ''
        } ${hasUnsavedChanges ? 'border-l-2 border-yellow-500' : ''}`}
      >
        {editable ? (
          // Editable mode with overlay
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
          // Read-only mode
          <pre
            className="p-4 m-0 font-mono text-xs leading-relaxed overflow-auto whitespace-pre-wrap break-words h-full"
            style={{ tabSize: 2 }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
      </div>

      {/* Stats footer (optional) */}
      {stats && stats.length > 0 && (
        <div className="p-3 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {stats.map((stat, i) => (
              <span key={i}>
                {stat.label}: {stat.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default JsonViewer;
