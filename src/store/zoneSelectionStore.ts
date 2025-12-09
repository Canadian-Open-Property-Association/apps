import { create } from 'zustand';

interface ZoneSelectionState {
  selectedZoneId: string | null;
  selectedFace: 'front' | 'back' | null;
  hoveredZoneId: string | null;

  // Actions
  setSelectedZone: (zoneId: string | null, face?: 'front' | 'back') => void;
  setHoveredZone: (zoneId: string | null) => void;
  clearSelection: () => void;
}

export const useZoneSelectionStore = create<ZoneSelectionState>((set) => ({
  selectedZoneId: null,
  selectedFace: null,
  hoveredZoneId: null,

  setSelectedZone: (zoneId, face) => set({
    selectedZoneId: zoneId,
    selectedFace: face || null,
  }),

  setHoveredZone: (zoneId) => set({
    hoveredZoneId: zoneId,
  }),

  clearSelection: () => set({
    selectedZoneId: null,
    selectedFace: null,
    hoveredZoneId: null,
  }),
}));
