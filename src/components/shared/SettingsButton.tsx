/**
 * Settings Button
 *
 * A standardized settings/gear icon button for opening settings modals.
 * Provides consistent styling across all apps.
 *
 * @example
 * ```tsx
 * <SettingsButton
 *   onClick={() => setShowSettings(true)}
 *   tooltip="App Settings"
 * />
 * ```
 */

interface SettingsButtonProps {
  /** Click handler - typically opens settings modal */
  onClick: () => void;
  /** Tooltip text shown on hover */
  tooltip?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Settings gear icon SVG path */
const GEAR_ICON_OUTER =
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
const GEAR_ICON_INNER = 'M15 12a3 3 0 11-6 0 3 3 0 016 0z';

export function SettingsButton({
  onClick,
  tooltip = 'Settings',
  disabled = false,
  className = '',
}: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      } ${className}`}
      title={tooltip}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={GEAR_ICON_OUTER} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={GEAR_ICON_INNER} />
      </svg>
    </button>
  );
}

export default SettingsButton;
