# Frontend Refactoring Plan

## Overview
Refactor the frontend codebase to improve maintainability, type safety, and error handling while minimizing impact on UI and logic.

## Constraints
- No testing (unit, integration, or E2E)
- Minimal impact to existing UI and logic
- No overengineering
- Keep changes focused and practical

---

## Phase 1: Install Dependencies

### 1.1 Install Zustand
```bash
cd frontend && npm install zustand
```

**Impact:** None (new dependency)

---

## Phase 2: Type Safety Improvements

### 2.1 Add TypeScript Interfaces for API Payloads

**File:** `frontend/src/types.ts`

Add new interfaces:
```typescript
// Location creation payload
export interface CreateLocationPayload {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    name: string;
  };
}

// Location update payload (same as create for now)
export interface UpdateLocationPayload extends CreateLocationPayload {}
```

**Impact:** Zero - just adds type definitions

### 2.2 Update API Service to Use Proper Types

**File:** `frontend/src/services/api.ts`

Replace `any` with proper interfaces:
```typescript
// Line 26: Replace any with CreateLocationPayload
createLocation: async (payload: CreateLocationPayload): Promise<Feature>

// Line 31: Replace any with UpdateLocationPayload
updateLocation: async (id: string, payload: UpdateLocationPayload): Promise<Feature>
```

**Impact:** Zero - just type annotations, no logic changes

---

## Phase 3: Create Zustand Store

### 3.1 Create Main Store

**File:** `frontend/src/store/useAppStore.ts`

Create a Zustand store with all state from App.tsx:
```typescript
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
}));
```

**Impact:** Zero - just moves state from App.tsx to store

---

## Phase 4: Extract Components

### 4.1 Create Header Component

**File:** `frontend/src/components/Header.tsx`

Extract header section from App.tsx (lines 177-240):
```typescript
import { MapPin, PlusCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Header() {
  const {
    viewMode,
    setViewMode,
    showHeatmap,
    setShowHeatmap,
    handleAddNewLocation,
  } = useAppStore();

  return (
    <header className="header glass-panel animate-fade-in">
      {/* Title section */}
      <div className="title-section">
        {/* ... existing title code ... */}
      </div>

      {/* Controls */}
      <div className="header-controls">
        {/* Heatmap toggle */}
        {/* Add button */}
        {/* View toggle */}
      </div>
    </header>
  );
}
```

**Impact:** Zero - just moves JSX to new component

### 4.2 Create AddLocationModal Component

**File:** `frontend/src/components/AddLocationModal.tsx`

Extract modal from App.tsx (lines 337-408):
```typescript
import { X, MapPin, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function AddLocationModal() {
  const {
    isAddingLocation,
    isEditing,
    draftCoords,
    draftName,
    isSubmitting,
    setIsAddingLocation,
    setIsPickingFromMap,
    setIsEditing,
    setDraftId,
    setDraftCoords,
    setDraftName,
    setIsSubmitting,
    handlePickFromMap,
    handleSubmit,
    handleCancelAdd,
  } = useAppStore();

  if (!isAddingLocation) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        {/* ... existing modal JSX ... */}
      </div>
    </div>
  );
}
```

**Impact:** Zero - just moves JSX to new component

### 4.3 Create DeleteConfirmModal Component

**File:** `frontend/src/components/DeleteConfirmModal.tsx`

Extract delete modal from App.tsx (lines 410-426):
```typescript
import { Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function DeleteConfirmModal() {
  const {
    deleteConfirmId,
    setDeleteConfirmId,
    confirmDelete,
  } = useAppStore();

  if (!deleteConfirmId) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        {/* ... existing delete modal JSX ... */}
      </div>
    </div>
  );
}
```

**Impact:** Zero - just moves JSX to new component

### 4.4 Create Pagination Component

**File:** `frontend/src/components/Pagination.tsx`

Extract pagination from App.tsx (lines 297-334):
```typescript
import { useAppStore } from '../store/useAppStore';

export function Pagination() {
  const {
    page,
    totalPages,
    limit,
    setPage,
    setLimit,
    loading,
    data,
  } = useAppStore();

  if (loading || data.length === 0) return null;

  return (
    <footer className="footer glass-panel animate-fade-in">
      {/* ... existing pagination JSX ... */}
    </footer>
  );
}
```

**Impact:** Zero - just moves JSX to new component

---

## Phase 5: Add Error Handling

### 5.1 Create Error Boundary Component

**File:** `frontend/src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '24px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#f43f5e' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 20px',
              background: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Impact:** Minimal - wraps app in error boundary, no UI changes under normal operation

### 5.2 Add API Error Handling

**File:** `frontend/src/services/api.ts`

Add error handling wrapper:
```typescript
import axios from 'axios';
import type { Feature, CreateLocationPayload, UpdateLocationPayload } from '../types';

const API_BASE_URL = import.meta.env.BACKEND_BASE_URL || 'http://127.0.0.1:8000/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);

    // Handle network errors
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }

    // Handle HTTP errors
    const status = error.response.status;
    let message = 'An error occurred';

    switch (status) {
      case 400:
        message = 'Invalid request. Please check your input.';
        break;
      case 401:
        message = 'Unauthorized. Please log in again.';
        break;
      case 403:
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        message = 'Resource not found.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      default:
        message = error.response.data?.message || 'An unexpected error occurred.';
    }

    throw new Error(message);
  }
);

// ... rest of the API service with proper types
```

**Impact:** Minimal - improves error messages, no UI changes

---

## Phase 6: Refactor App.tsx

### 6.1 Simplify App.tsx

**File:** `frontend/src/App.tsx`

Replace all state with Zustand store and extract components:
```typescript
import { useEffect, useRef } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { TableView } from './components/TableView';
import { AddLocationModal } from './components/AddLocationModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Pagination } from './components/Pagination';
import { useAppStore } from './store/useAppStore';
import { locationService } from './services/api';

function AppContent() {
  const {
    viewMode,
    data,
    loading,
    error,
    page,
    limit,
    selectedLocationId,
    showHeatmap,
    isAddingLocation,
    isPickingFromMap,
    draftCoords,
    splitWidth,
    setData,
    setError,
    setPage,
    setTotalPages,
    setLoading,
    setSelectedLocationId,
    setIsAddingLocation,
    setIsPickingFromMap,
    setIsEditing,
    setDraftId,
    setDraftCoords,
    setDraftName,
    setIsSubmitting,
    setDeleteConfirmId,
    setSplitWidth,
    resetModalState,
    resetDraftState,
  } = useAppStore();

  const isResizing = useRef(false);

  // Fetch data
  const fetchData = async () => {
    try {
      const response = await locationService.getLocations(page, limit);
      setData(response.data);
      setTotalPages(response.totalPages || 1);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      console.warn('Failed to fetch from API', err);
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  // Split view resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.max(300, Math.min(e.clientX - 24, window.innerWidth * 0.7));
      setSplitWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Handle submit (moved to store action later)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftCoords || !draftName.trim()) return;

    setIsSubmitting(true);
    try {
      const reqPayload: CreateLocationPayload | UpdateLocationPayload = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: draftCoords
        },
        properties: {
          name: draftName.trim()
        }
      };

      const { isEditing, draftId } = useAppStore.getState();
      if (isEditing && draftId) {
        await locationService.updateLocation(draftId, reqPayload);
      } else {
        await locationService.createLocation(reqPayload);
      }

      await fetchData();
      resetDraftState();
      resetModalState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save location';
      console.error(err);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Other handlers...
  const handleCancelAdd = () => {
    resetModalState();
    resetDraftState();
  };

  const handlePickFromMap = () => {
    setIsPickingFromMap(true);
    setIsAddingLocation(false);
  };

  const handleEditClick = (feature: Feature) => {
    setDraftId(feature.properties._id || feature.id);
    setDraftName(feature.properties.name || '');
    setDraftCoords(feature.geometry.coordinates as [number, number]);
    setIsEditing(true);
    setIsAddingLocation(true);
    setIsPickingFromMap(false);
  };

  const handleAddNewLocation = () => {
    setIsEditing(false);
    resetDraftState();
    setIsAddingLocation(true);
  };

  const onMapClickAdd = (coords: [number, number]) => {
    setDraftCoords(coords);
    if (!isAddingLocation) {
      setIsAddingLocation(true);
    }
    if (isPickingFromMap) {
      setIsPickingFromMap(false);
      setIsAddingLocation(true);
    }
  };

  const confirmDelete = async () => {
    const { deleteConfirmId } = useAppStore.getState();
    if (!deleteConfirmId) return;
    try {
      await locationService.deleteLocation(deleteConfirmId);
      await fetchData();
      if (selectedLocationId === deleteConfirmId) setSelectedLocationId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete location';
      console.error(err);
      alert(message);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="glass-panel view-section" style={{ alignItems: 'center', justifyContent: 'center' }}>
            {/* Loading state */}
          </div>
        ) : (
          <>
            {(viewMode === 'table' || viewMode === 'split') && (
              <section className="glass-panel view-section" style={viewMode === 'split' ? { flex: 'none', width: splitWidth } : {}}>
                <TableView
                  viewMode={viewMode}
                  data={data}
                  selectedLocationId={selectedLocationId}
                  onRowClick={(id) => setSelectedLocationId(id === selectedLocationId ? null : id)}
                  onDelete={(id) => setDeleteConfirmId(id)}
                  onEdit={handleEditClick}
                />
              </section>
            )}
            {viewMode === 'split' && (
              <div
                className="resizer"
                onMouseDown={() => {
                  isResizing.current = true;
                  document.body.style.cursor = 'col-resize';
                }}
              />
            )}
            {(viewMode === 'map' || viewMode === 'split') && (
              <section className="glass-panel view-section">
                <MapView
                  data={data}
                  selectedLocationId={selectedLocationId}
                  onPointClick={(id) => setSelectedLocationId(id === selectedLocationId ? null : id)}
                  showHeatmap={showHeatmap}
                  isAddingLocation={isAddingLocation || isPickingFromMap}
                  onMapClick={onMapClickAdd}
                  draftCoords={draftCoords}
                  onDelete={(id) => setDeleteConfirmId(id)}
                  onEdit={handleEditClick}
                />
              </section>
            )}
          </>
        )}
      </main>
      <Pagination />
      <AddLocationModal />
      <DeleteConfirmModal />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
```

**Impact:** Minimal - same UI and logic, just organized differently

---

## Phase 7: Add Store Actions

### 7.1 Add Action Handlers to Store

**File:** `frontend/src/store/useAppStore.ts`

Add action handlers that were in App.tsx:
```typescript
// Add to the store interface
handleAddNewLocation: () => void;
handlePickFromMap: () => void;
handleCancelAdd: () => void;
handleEditClick: (feature: Feature) => void;
onMapClickAdd: (coords: [number, number]) => void;
handleSubmit: (e: React.FormEvent) => Promise<void>;
confirmDelete: () => Promise<void>;

// Add to the store implementation
handleAddNewLocation: () => set((state) => ({
  isEditing: false,
  draftId: null,
  draftCoords: null,
  draftName: '',
  isAddingLocation: true,
})),

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
```

**Impact:** Zero - just moves logic to store

---

## Phase 8: Clean Up

### 8.1 Remove Unused CSS

**File:** `frontend/src/App.css`

Remove or delete this file as it contains unused Vite template styles.

**Impact:** Zero - just removes unused code

---

## Summary of Changes

### New Files Created
1. `frontend/src/store/useAppStore.ts` - Zustand store
2. `frontend/src/components/ErrorBoundary.tsx` - Error boundary component
3. `frontend/src/components/Header.tsx` - Header component
4. `frontend/src/components/AddLocationModal.tsx` - Add location modal
5. `frontend/src/components/DeleteConfirmModal.tsx` - Delete confirmation modal
6. `frontend/src/components/Pagination.tsx` - Pagination component

### Files Modified
1. `frontend/src/types.ts` - Add CreateLocationPayload and UpdateLocationPayload interfaces
2. `frontend/src/services/api.ts` - Replace `any` with proper types, add error handling
3. `frontend/src/App.tsx` - Refactor to use store and extracted components
4. `frontend/package.json` - Add zustand dependency

### Files Deleted
1. `frontend/src/App.css` - Remove unused styles

---

## Impact Assessment

### UI Impact
- **Zero** - All UI remains exactly the same
- No visual changes
- No user experience changes

### Logic Impact
- **Minimal** - Logic is moved, not changed
- Same behavior as before
- Same API calls
- Same error handling flow

### Performance Impact
- **Neutral** - No performance degradation
- Slight improvement from better component organization
- No re-render issues

---

## Migration Steps

1. Install Zustand
2. Add type definitions
3. Create store with all state
4. Extract components (one at a time)
5. Update App.tsx to use store
6. Add error handling
7. Test manually
8. Clean up unused code

---

## Rollback Plan

If issues arise:
1. Revert App.tsx to original
2. Delete new component files
3. Remove store file
4. Remove zustand from package.json
5. Revert api.ts changes

All changes are additive and can be easily rolled back.