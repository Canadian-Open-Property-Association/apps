/**
 * NewSchemaModal Component
 *
 * Prompts user to select schema type when creating a new schema:
 * - JSON-LD Context (for W3C VC JSON-LD credentials)
 * - SD-JWT Schema (for SD-JWT VC credentials)
 */

import { SchemaMode } from '../../../types/vocabulary';

interface NewSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: SchemaMode) => void;
}

export default function NewSchemaModal({ isOpen, onClose, onSelect }: NewSchemaModalProps) {
  if (!isOpen) return null;

  const handleSelect = (mode: SchemaMode) => {
    onSelect(mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[480px] max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-2">Create New Schema</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select the type of schema you want to create:
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* JSON-LD Context Option */}
          <button
            onClick={() => handleSelect('jsonld-context')}
            className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-semibold text-purple-800">JSON-LD Context</span>
            </div>
            <p className="text-xs text-gray-600">
              For W3C Verifiable Credentials using JSON-LD. Maps properties to vocabulary terms.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded">W3C VC</span>
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded">JSON-LD</span>
            </div>
          </button>

          {/* SD-JWT Schema Option */}
          <button
            onClick={() => handleSelect('json-schema')}
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-green-800">SD-JWT Schema</span>
            </div>
            <p className="text-xs text-gray-600">
              JSON Schema for SD-JWT Verifiable Credentials. Defines property types and constraints.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded">SD-JWT VC</span>
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded">JSON Schema</span>
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
