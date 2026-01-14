/**
 * Standard save button for app navigation bars
 * - Positioned on far left of nav bar
 * - Shows disabled state when no unsaved changes or during save
 */

interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isSaving?: boolean;
  showSuccess?: boolean;
}

export default function SaveButton({ onClick, disabled = false, isSaving = false, showSuccess = false }: SaveButtonProps) {
  const isDisabled = disabled || isSaving;

  if (showSuccess) {
    return (
      <button
        disabled
        className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md flex items-center gap-1"
      >
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Saved!
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
    >
      {isSaving ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      )}
      Save
    </button>
  );
}
