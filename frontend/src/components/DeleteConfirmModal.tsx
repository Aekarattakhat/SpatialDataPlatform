import { Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { locationService } from '../services/api';

export function DeleteConfirmModal() {
  const {
    deleteConfirmId,
    setDeleteConfirmId,
    selectedLocationId,
    setSelectedLocationId,
    page,
    limit,
    setData,
    setTotalPages,
    setError,
  } = useAppStore();

  if (!deleteConfirmId) return null;

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await locationService.deleteLocation(deleteConfirmId);
      
      // Refresh data
      const response = await locationService.getLocations(page, limit);
      setData(response.data);
      setTotalPages(response.totalPages || 1);
      setError(null);
      
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
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px', color: '#f43f5e' }}>Confirm Deletion</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Are you sure you want to delete this location? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete} style={{ background: '#f43f5e' }}>
            <Trash2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
