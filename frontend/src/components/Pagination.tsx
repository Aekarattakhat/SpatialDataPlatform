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
    <footer className="footer glass-panel animate-fade-in" style={{ padding: '12px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Show</span>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          style={{ background: 'var(--bg-glass)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 8px', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
        >
          <option style={{ color: '#1e293b' }} value={10}>10</option>
          <option style={{ color: '#1e293b' }} value={25}>25</option>
          <option style={{ color: '#1e293b' }} value={50}>50</option>
          <option style={{ color: '#1e293b' }} value={100}>100</option>
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          className="btn btn-secondary"
          disabled={page <= 1}
          onClick={() => setPage(Math.max(1, page - 1))}
          style={{ padding: '6px 16px', fontSize: '0.875rem' }}
        >
          &lt; Prev
        </button>
        <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 500 }}>
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          disabled={page >= totalPages}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          style={{ padding: '6px 16px', fontSize: '0.875rem' }}
        >
          Next &gt;
        </button>
      </div>
    </footer>
  );
}
