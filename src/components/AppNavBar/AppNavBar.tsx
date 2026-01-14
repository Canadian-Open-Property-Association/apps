/**
 * Standard App Navigation Bar container
 *
 * Layout pattern:
 * [Left: Save/Actions] | [Center: flex-1 spacer] | [Right: Panels | PR Button | Settings]
 *
 * Usage:
 * <AppNavBar
 *   left={<SaveButton />}
 *   panels={<PanelToggles>...</PanelToggles>}
 *   prButton={<CreatePrButton onClick={...} />}
 *   settings={<SettingsButton onClick={...} />}
 * />
 */

import { ReactNode } from 'react';
import NavDivider from './NavDivider';

interface AppNavBarProps {
  /** Left section - typically save buttons and unsaved indicator */
  left?: ReactNode;
  /** Panel toggles section */
  panels?: ReactNode;
  /** Pull request button */
  prButton?: ReactNode;
  /** Settings button - always rendered on far right */
  settings?: ReactNode;
  /** Additional content after settings (rare) */
  extra?: ReactNode;
}

export default function AppNavBar({ left, panels, prButton, settings, extra }: AppNavBarProps) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {left}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {panels && (
            <>
              {panels}
              {(prButton || settings) && <NavDivider />}
            </>
          )}
          {prButton && (
            <>
              {prButton}
              {settings && <NavDivider />}
            </>
          )}
          {settings}
          {extra}
        </div>
      </div>
    </div>
  );
}
