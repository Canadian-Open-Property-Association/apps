/**
 * NewSchemaModal Component
 *
 * Confirmation modal for creating a new JSON Schema.
 * Schema Builder only supports JSON Schema mode (for JSON-LD VCs).
 */

interface NewSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
}

export default function NewSchemaModal({ isOpen, onClose, onSelect }: NewSchemaModalProps) {
  if (!isOpen) return null;

  const handleCreate = () => {
    onSelect();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-2">Create New Schema</h3>
        <p className="text-sm text-gray-600 mb-4">
          Create a new JSON Schema to define the data structure for your credentials.
        </p>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-blue-800">JSON Schema</span>
          </div>
          <p className="text-xs text-gray-600">
            Defines property types, constraints, and required fields for JSON-LD Verifiable Credentials.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create Schema
          </button>
        </div>
      </div>
    </div>
  );
}
