/**
 * GitHub Publish Button
 *
 * A standardized button for creating GitHub pull requests across all governance apps.
 * Provides consistent styling, loading states, and disabled states.
 *
 * @example
 * ```tsx
 * <GitHubPublishButton
 *   onClick={() => setShowPublishModal(true)}
 *   disabled={!isAuthenticated}
 * />
 * ```
 */

interface GitHubPublishButtonProps {
  /** Click handler - typically opens a publish modal */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether a publish operation is in progress */
  loading?: boolean;
  /** Button text - defaults to "Create Pull Request" */
  text?: string;
  /** Loading text - defaults to "Creating PR..." */
  loadingText?: string;
  /** Additional CSS classes */
  className?: string;
}

/** GitHub logo SVG path */
const GITHUB_LOGO_PATH =
  'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z';

export function GitHubPublishButton({
  onClick,
  disabled = false,
  loading = false,
  text = 'Create Pull Request',
  loadingText = 'Creating PR...',
  className = '',
}: GitHubPublishButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
        isDisabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700'
      } ${className}`}
    >
      {loading ? (
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d={GITHUB_LOGO_PATH} />
        </svg>
      )}
      {loading ? loadingText : text}
    </button>
  );
}

export default GitHubPublishButton;
