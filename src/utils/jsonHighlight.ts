/**
 * JSON Syntax Highlighting Utility
 *
 * Provides regex-based JSON syntax highlighting for use in JSON viewers.
 * Returns HTML string with colored spans using Tailwind CSS classes.
 *
 * Color scheme:
 * - Keys (property names): cyan-400
 * - String values: green-400
 * - Numbers: orange-400
 * - Booleans/null: purple-400
 * - Brackets/braces: gray-500
 */

/**
 * Highlight JSON string with syntax coloring
 * @param json - JSON string to highlight
 * @returns HTML string with colored spans
 */
export function highlightJson(json: string): string {
  // Escape HTML entities first
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply syntax highlighting with regex
  return (
    escaped
      // Strings (property names and values) - cyan for keys, green for values
      .replace(/"([^"\\]*(\\.[^"\\]*)*)"\s*:/g, '<span class="text-cyan-400">"$1"</span>:')
      .replace(/:\s*"([^"\\]*(\\.[^"\\]*)*)"/g, ': <span class="text-green-400">"$1"</span>')
      // Standalone strings (in arrays)
      .replace(/(?<=[\[,]\s*)"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="text-green-400">"$1"</span>')
      // Numbers - orange
      .replace(/:\s*(-?\d+\.?\d*)/g, ': <span class="text-orange-400">$1</span>')
      .replace(
        /(?<=[\[,]\s*)(-?\d+\.?\d*)(?=\s*[,\]])/g,
        '<span class="text-orange-400">$1</span>'
      )
      // Booleans and null - purple
      .replace(/:\s*(true|false|null)/g, ': <span class="text-purple-400">$1</span>')
      .replace(
        /(?<=[\[,]\s*)(true|false|null)(?=\s*[,\]])/g,
        '<span class="text-purple-400">$1</span>'
      )
      // Brackets and braces - gray
      .replace(/([{}[\]])/g, '<span class="text-gray-500">$1</span>')
  );
}
