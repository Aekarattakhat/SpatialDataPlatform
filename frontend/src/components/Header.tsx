import { MapPin, PlusCircle, WifiOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function Header() {
  const {
    viewMode,
    setViewMode,
    showHeatmap,
    setShowHeatmap,
    error,
    handleAddNewLocation,
  } = useAppStore();

  return (
    <header className="header glass-panel animate-fade-in">
      <div className="title-section">
        <div style={{ background: 'var(--accent-color)', padding: '8px', borderRadius: '8px' }}>
          <MapPin size={24} color="white" />
        </div>
        <div>
          <h1>Spatial Data Platform</h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <span className="text-secondary text-xs">Locations Explorer</span>
            {error ? (
              <span className="status-badge offline">
                <WifiOff size={12} /> Offline
              </span>
            ) : (
              <span className="status-badge">
                Live
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="header-controls">
        {/* Heatmap Toggle */}
        <button
          className={`btn ${showHeatmap ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: showHeatmap ? 'none' : '1px solid var(--border-color)', background: showHeatmap ? '#ec4899' : '' }}
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          Heatmap
        </button>

        {/* Add Button */}
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={handleAddNewLocation}
        >
          <PlusCircle size={16} /> New Location
        </button>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
          >
            <span className="lucide lucide-table" style={{ display: 'inline-flex', width: '16px', height: '16px' }}></span> Table
          </button>
          <button
            className={viewMode === 'map' ? 'active' : ''}
            onClick={() => setViewMode('map')}
          >
            <span className="lucide lucide-map" style={{ display: 'inline-flex', width: '16px', height: '16px' }}></span> Map
          </button>
          <button
            className={viewMode === 'split' ? 'active' : ''}
            onClick={() => setViewMode('split')}
          >
            <span className="lucide lucide-layout-template" style={{ display: 'inline-flex', width: '16px', height: '16px' }}></span> Split
          </button>
        </div>
      </div>
    </header>
  );
}
