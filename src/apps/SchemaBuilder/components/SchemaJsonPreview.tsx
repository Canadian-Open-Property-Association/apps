import { useMemo, useState } from 'react';
import { useSchemaStore } from '../../../store/schemaStore';
import { toJsonSchema, toJsonLdContext, generateArtifactName } from '../../../types/schema';
import { useVocabularyStore } from '../../../store/vocabularyStore';

/**
 * Simple JSON syntax highlighter - returns HTML with colored spans
 * Pattern borrowed from VCT Builder's JsonPreview
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

  // Subscribe to metadata and properties so component re-renders when they change
  const metadata = useSchemaStore((state) => state.metadata);
  const properties = useSchemaStore((state) => state.properties);
  const currentProjectName = useSchemaStore((state) => state.currentProjectName);
  const getSelectedVocab = useVocabularyStore((state) => state.getSelectedVocab);

  const isJsonLdMode = metadata.mode === 'jsonld-context';

  // Generate JSON Schema or JSON-LD Context based on mode
  const schemaJson = useMemo(() => {
    if (isJsonLdMode) {
      const vocabulary = getSelectedVocab();
      const context = toJsonLdContext(metadata, properties, vocabulary);
      return JSON.stringify(context, null, 2);
    }
    const schema = toJsonSchema(metadata, properties);
    return JSON.stringify(schema, null, 2);
  }, [metadata, properties, isJsonLdMode, getSelectedVocab]);

  // Memoize the highlighted HTML
  const highlightedHtml = useMemo(() => highlightJson(schemaJson), [schemaJson]);

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
      await navigator.clipboard.writeText(schemaJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([schemaJson], { type: 'application/json' });
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
      <div className="flex gap-2 p-2 bg-gray-800 border-b border-gray-700 items-center">
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
        <span className="text-xs text-gray-500 ml-auto truncate max-w-[200px]" title={getFilename()}>
          {getFilename()}
        </span>
      </div>

      {/* Syntax-highlighted JSON display */}
      <div className="flex-1 overflow-auto">
        <pre
          className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words"
          style={{ tabSize: 2 }}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </div>
    </div>
  );
}
