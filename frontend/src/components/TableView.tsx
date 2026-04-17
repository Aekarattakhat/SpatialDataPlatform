import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Feature } from '../types';

interface TableViewProps {
    viewMode: string;
    data: Feature[];
    selectedLocationId: string | null;
    onRowClick: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (feature: Feature) => void;
}

export function TableView({ viewMode, data, selectedLocationId, onRowClick, onDelete, onEdit }: TableViewProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (e: React.MouseEvent, feature: Feature) => {
        e.stopPropagation();
        const coords = `${feature.geometry.coordinates[1].toFixed(5)}, ${feature.geometry.coordinates[0].toFixed(5)}`;
        navigator.clipboard.writeText(coords);
        const actualId = feature.properties?._id || feature.id;
        setCopiedId(actualId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (!data || data.length === 0) {
        return (
            <div className="empty-state">
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p>No locations data available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        {viewMode === 'table' && <th>Object ID</th>}
                        <th>Coordinates [Lat, Lng]</th>
                        <th>Created At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((feature) => {
                        const actualId = feature.properties?._id || feature.id;
                        return (
                            <tr
                                key={actualId}
                                className={selectedLocationId === actualId ? 'selected' : ''}
                                onClick={() => onRowClick(actualId)}
                            >
                                <td>{feature.properties.name || 'Unnamed'}</td>
                                {viewMode === 'table' && <td><span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{actualId}</span></td>}
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontFamily: 'monospace', color: 'var(--accent-hover)' }}>
                                            {feature.geometry.coordinates[1].toFixed(5)}, {feature.geometry.coordinates[0].toFixed(5)}
                                        </span>
                                        <button
                                            className="copy-btn"
                                            title="Copy standard coordinates for Maps"
                                            onClick={(e) => handleCopy(e, feature)}
                                        >
                                            {copiedId === (feature.properties?._id || feature.id) ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </td>
                                <td>{new Date(feature.properties._createdAt).toLocaleString()}</td>
                                <td>
                                    <button className="edit-table-btn" onClick={(e) => { e.stopPropagation(); onEdit(feature); }}>
                                        Edit
                                    </button>
                                    <button className="delete-table-btn" onClick={(e) => { e.stopPropagation(); onDelete(feature.properties?._id || feature.id); }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
