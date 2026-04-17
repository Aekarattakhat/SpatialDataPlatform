import { X, MapPin, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { locationService } from '../services/api';

export function AddLocationModal() {
  const {
    isAddingLocation,
    isEditing,
    draftCoords,
    draftName,
    isSubmitting,
    setDraftCoords,
    setDraftName,
    setIsSubmitting,
    resetModalState,
    resetDraftState,
    handleCancelAdd,
    handlePickFromMap,
  } = useAppStore();

  if (!isAddingLocation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftCoords || !draftName.trim()) return;

    setIsSubmitting(true);
    try {
      const reqPayload: any = {
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

      // Trigger data refresh through the store
      const store = useAppStore.getState();
      const response = await locationService.getLocations(store.page, store.limit);
      store.setData(response.data);
      store.setTotalPages(response.totalPages || 1);
      store.setError(null);

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

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{isEditing ? 'Edit Location' : 'Create Location'}</h2>
          <button onClick={handleCancelAdd} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          Enter details below.
          {!draftCoords && " Set coordinates manually or pick from map."}
        </p>

        <div style={{ marginBottom: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={handlePickFromMap} style={{ width: '100%', border: '1px dashed var(--border-color)' }}>
            <MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} />
            {draftCoords ? 'Re-pick from Map' : 'Select on Map'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Location Name</label>
            <input
              type="text"
              className="form-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="e.g. Headquarters"
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={draftCoords ? draftCoords[1] : ''}
                onChange={(e) => setDraftCoords(draftCoords ? [draftCoords[0], parseFloat(e.target.value)] : [0, parseFloat(e.target.value)])}
                placeholder="-10.62686"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={draftCoords ? draftCoords[0] : ''}
                onChange={(e) => setDraftCoords(draftCoords ? [parseFloat(e.target.value), draftCoords[1]] : [parseFloat(e.target.value), 0])}
                placeholder="123.35592"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCancelAdd}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !draftCoords || !draftName.trim()}>
              {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
