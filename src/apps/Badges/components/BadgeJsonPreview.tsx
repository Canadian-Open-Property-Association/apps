/**
 * Badge JSON Preview Component
 *
 * Displays the badge export JSON with syntax highlighting.
 * Uses the shared JsonViewer component for consistent dark theme styling.
 */

import { useBadgeStore } from '../../../store/badgeStore';
import { badgeToExportFormat } from '../../../types/badge';
import { JsonViewer } from '../../../components/shared';

export default function BadgeJsonPreview() {
  const currentBadge = useBadgeStore((state) => state.currentBadge);

  if (!currentBadge) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-500 p-4">
        <p className="text-sm text-gray-400">No badge selected</p>
      </div>
    );
  }

  const exportData = badgeToExportFormat(currentBadge);

  return (
    <JsonViewer
      json={exportData}
      filename={currentBadge.id || 'badge'}
      showDownload={true}
      stats={[
        { label: 'Rules', value: currentBadge.eligibilityRules?.length || 0 },
        { label: 'Evidence', value: currentBadge.evidenceConfig?.length || 0 },
      ]}
    />
  );
}
