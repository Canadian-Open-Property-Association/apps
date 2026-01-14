/**
 * Group of panel toggles with "Panels:" label
 * Wraps multiple PanelToggle buttons
 */

import { ReactNode } from 'react';

interface PanelTogglesProps {
  children: ReactNode;
}

export default function PanelToggles({ children }: PanelTogglesProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-400 mr-1">Panels:</span>
      {children}
    </div>
  );
}
