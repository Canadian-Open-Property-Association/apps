/**
 * AppNavBar - Shared navigation bar components
 *
 * Standard layout: [Save] [Unsaved] | [Panels: toggles] | [Create PR] | [Settings]
 *
 * Usage example:
 * ```tsx
 * import {
 *   AppNavBar,
 *   SaveButton,
 *   UnsavedIndicator,
 *   PanelToggles,
 *   PanelToggle,
 *   CreatePrButton,
 *   SettingsButton,
 *   NavDivider
 * } from '../../components/AppNavBar';
 *
 * <AppNavBar
 *   left={
 *     <>
 *       <SaveButton onClick={handleSave} disabled={!isDirty} />
 *       <UnsavedIndicator show={isDirty} />
 *     </>
 *   }
 *   panels={
 *     <PanelToggles>
 *       <PanelToggle label="List" isVisible={showList} onClick={toggleList} />
 *       <PanelToggle label="JSON" isVisible={showJson} onClick={toggleJson} />
 *     </PanelToggles>
 *   }
 *   prButton={<CreatePrButton onClick={() => setShowPrModal(true)} />}
 *   settings={<SettingsButton onClick={() => setShowSettings(true)} />}
 * />
 * ```
 */

export { default as AppNavBar } from './AppNavBar';
export { default as SaveButton } from './SaveButton';
export { default as UnsavedIndicator } from './UnsavedIndicator';
export { default as PanelToggles } from './PanelToggles';
export { default as PanelToggle } from './PanelToggle';
export { default as CreatePrButton } from './CreatePrButton';
export { default as SettingsButton } from './SettingsButton';
export { default as NavDivider } from './NavDivider';
