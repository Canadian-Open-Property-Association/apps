/**
 * Single panel toggle button with eye icon
 * Used within PanelToggles group
 */

interface PanelToggleProps {
  label: string;
  isVisible: boolean;
  onClick: () => void;
  title?: string;
}

export default function PanelToggle({ label, isVisible, onClick, title }: PanelToggleProps) {
  const defaultTitle = isVisible ? `Hide ${label} panel` : `Show ${label} panel`;

  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
        isVisible
          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
          : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
      }`}
      title={title || defaultTitle}
    >
      {isVisible ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      )}
      {label}
    </button>
  );
}
