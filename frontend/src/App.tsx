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
    setDeleteConfirmId,
    setSplitWidth,
    handleEditClick,
    onMapClickAdd,
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

  return (
    <div className="app-container">
      <Header />
      <main className="main-content animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {loading ? (
          <div className="glass-panel view-section" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--accent-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading Spatial Data...</p>
            </div>
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
