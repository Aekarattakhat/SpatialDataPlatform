import { create } from 'zustand';
import type { Feature } from '../types';

interface AppState {
  // View state
  viewMode: 'table' | 'map' | 'split';
  setViewMode: (mode: 'table' | 'map' | 'split') => void;

  // Data state
  data: Feature[];
  loading: boolean;
  error: string | null;
  setData: (data: Feature[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Pagination state
  page: number;
  totalPages: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotalPages: (totalPages: number) => void;

  // Selection state
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  showHeatmap: boolean;
  setShowHeatmap: (show: boolean) => void;

  // Modal state
  isAddingLocation: boolean;
  isPickingFromMap: boolean;
  isEditing: boolean;
  draftId: string | null;
  draftCoords: [number, number] | null;
  draftName: string;
  isSubmitting: boolean;
  deleteConfirmId: string | null;

  // Modal actions
  setIsAddingLocation: (isAdding: boolean) => void;
  setIsPickingFromMap: (isPicking: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
  setDraftId: (id: string | null) => void;
  setDraftCoords: (coords: [number, number] | null) => void;
  setDraftName: (name: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setDeleteConfirmId: (id: string | null) => void;

  // Split view state
  splitWidth: number;
  setSplitWidth: (width: number) => void;

  // Reset actions
  resetModalState: () => void;
  resetDraftState: () => void;

  // Action handlers
  handleAddNewLocation: () => void;
  handlePickFromMap: () => void;
  handleCancelAdd: () => void;
  handleEditClick: (feature: Feature) => void;
  onMapClickAdd: (coords: [number, number]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state (same as App.tsx)
  viewMode: 'split',
  data: [],
  loading: true,
  error: null,
  page: 1,
  totalPages: 1,
  limit: 10,
  selectedLocationId: null,
  showHeatmap: false,
  isAddingLocation: false,
  isPickingFromMap: false,
  isEditing: false,
  draftId: null,
  draftCoords: null,
  draftName: '',
  isSubmitting: false,
  deleteConfirmId: null,
  splitWidth: window.innerWidth / 2,

  // Setters
  setViewMode: (mode) => set({ viewMode: mode }),
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setSelectedLocationId: (id) => set({ selectedLocationId: id }),
  setShowHeatmap: (show) => set({ showHeatmap: show }),
  setIsAddingLocation: (isAdding) => set({ isAddingLocation: isAdding }),
  setIsPickingFromMap: (isPicking) => set({ isPickingFromMap: isPicking }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setDraftId: (id) => set({ draftId: id }),
  setDraftCoords: (coords) => set({ draftCoords: coords }),
  setDraftName: (name) => set({ draftName: name }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setDeleteConfirmId: (id) => set({ deleteConfirmId: id }),
  setSplitWidth: (width) => set({ splitWidth: width }),

  // Reset actions
  resetModalState: () => set({
    isAddingLocation: false,
    isPickingFromMap: false,
    isEditing: false,
    deleteConfirmId: null,
  }),
  resetDraftState: () => set({
    draftId: null,
    draftCoords: null,
    draftName: '',
  }),

  // Action handlers
  handleAddNewLocation: () => set({
    isEditing: false,
    draftId: null,
    draftCoords: null,
    draftName: '',
    isAddingLocation: true,
  }),

  handlePickFromMap: () => set({
    isPickingFromMap: true,
    isAddingLocation: false,
  }),

  handleCancelAdd: () => set({
    isAddingLocation: false,
    isPickingFromMap: false,
    isEditing: false,
    deleteConfirmId: null,
    draftId: null,
    draftCoords: null,
    draftName: '',
  }),

  handleEditClick: (feature) => set({
    draftId: feature.properties._id || feature.id,
    draftName: feature.properties.name || '',
    draftCoords: feature.geometry.coordinates as [number, number],
    isEditing: true,
    isAddingLocation: true,
    isPickingFromMap: false,
  }),

  onMapClickAdd: (coords) => set((state) => ({
    draftCoords: coords,
    isAddingLocation: state.isAddingLocation ? true : true,
    isPickingFromMap: false,
  })),
}));
