/**
 * "Unsaved" text indicator for navigation bars
 * Shows when there are unsaved changes
 */

interface UnsavedIndicatorProps {
  show: boolean;
}

export default function UnsavedIndicator({ show }: UnsavedIndicatorProps) {
  if (!show) return null;
  return <span className="text-xs text-gray-400">Unsaved</span>;
}
