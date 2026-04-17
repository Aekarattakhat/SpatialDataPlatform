import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature } from '../types';

interface MapViewProps {
    data: Feature[];
    selectedLocationId: string | null;
    onPointClick: (id: string) => void;
    showHeatmap: boolean;
    isAddingLocation: boolean;
    onMapClick: (coords: [number, number]) => void;
    draftCoords: [number, number] | null;
    onDelete: (id: string) => void;
    onEdit: (feature: Feature) => void;
}

export function MapView({ data, selectedLocationId, onPointClick, showHeatmap, isAddingLocation, onMapClick, draftCoords, onDelete, onEdit }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Keep callbacks fresh without re-triggering map event attachments
    const onPointClickRef = useRef(onPointClick);
    const onMapClickRef = useRef(onMapClick);
    useEffect(() => {
        onPointClickRef.current = onPointClick;
        onMapClickRef.current = onMapClick;
    }, [onPointClick, onMapClick]);

    const hoverPopup = useRef<maplibregl.Popup>(new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 15,
        className: 'hover-popup'
    }));

    const selectedPopup = useRef<maplibregl.Popup>(new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: 15
    }));

    const contextMenuPopup = useRef<maplibregl.Popup | null>(null);

    const draftMarker = useRef<maplibregl.Marker | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            center: [0, 0],
            zoom: 1,
            attributionControl: false
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            if (!map.current) return;

            map.current.addSource('locations', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                },
                promoteId: '_id'
            });

            map.current.addLayer({
                id: 'locations-heatmap',
                type: 'heatmap',
                source: 'locations',
                layout: {
                    visibility: 'none'
                },
                paint: {
                    // Increase weight as zoom increases
                    'heatmap-weight': 1,
                    // Increase intensity as zoom increases
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        9, 3
                    ],
                    // Assign color values based on density
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(33,102,172,0)',
                        0.2, '#3b82f6',
                        0.4, '#8b5cf6',
                        0.6, '#ec4899',
                        0.8, '#f43f5e',
                        1, '#ef4444'
                    ],
                    // Adjust radius by zoom level
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 15,
                        9, 30
                    ],
                    // Transition heatmap opacity by zoom level to fade out when points appear
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        7, 0.8,
                        14, 0.3
                    ]
                }
            });

            map.current.addLayer({
                id: 'locations-halo',
                type: 'circle',
                source: 'locations',
                paint: {
                    'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#f43f5e', '#60a5fa'],
                    'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 18, 12],
                    'circle-opacity': 0.3,
                    'circle-blur': 1
                }
            });

            map.current.addLayer({
                id: 'locations-point',
                type: 'circle',
                source: 'locations',
                paint: {
                    'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#fb7185', '#3b82f6'],
                    'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 8, 6],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });

            setIsLoaded(true);
        });

        // Cleanup on unmount
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Handle Heatmap Visibility
    useEffect(() => {
        if (!isLoaded || !map.current) return;
        if (map.current.getLayer('locations-heatmap')) {
            map.current.setLayoutProperty('locations-heatmap', 'visibility', showHeatmap ? 'visible' : 'none');
        }
    }, [isLoaded, showHeatmap]);

    // Handle interactability
    useEffect(() => {
        if (!isLoaded || !map.current) return;
        const currentMap = map.current; // Store map in a variable closure for cleanup

        // Hover
        const handleMouseEnter = (e: any) => {
            currentMap.getCanvas().style.cursor = 'pointer';
            const feature = e.features[0];
            if (!feature) return;

            hoverPopup.current
                .setLngLat(feature.geometry.coordinates)
                .setHTML(`<div style="font-weight: 600;">${feature.properties?.name || 'Unnamed Location'}</div>`)
                .addTo(currentMap);
        };

        const handleMouseLeave = () => {
            currentMap.getCanvas().style.cursor = isAddingLocation ? 'crosshair' : '';
            hoverPopup.current.remove();
        };

        const handlePointClick = (e: any) => {
            e.preventDefault(); // Tells the map click we handled it!
            const feature = e.features[0];
            if (!feature) return;

            const clickedId = feature.properties?._id || feature.properties?.id || feature.id;
            hoverPopup.current?.remove();
            if (clickedId) onPointClickRef.current(clickedId);
        };

        currentMap.on('mouseenter', 'locations-point', handleMouseEnter);
        currentMap.on('mouseleave', 'locations-point', handleMouseLeave);
        currentMap.on('click', 'locations-point', handlePointClick);

        return () => {
            currentMap.off('mouseenter', 'locations-point', handleMouseEnter);
            currentMap.off('mouseleave', 'locations-point', handleMouseLeave);
            currentMap.off('click', 'locations-point', handlePointClick);
        };
    }, [isLoaded, isAddingLocation]);

    // Handle Map Clicks for Adding Locations
    useEffect(() => {
        if (!isLoaded || !map.current) return;
        if (isAddingLocation) {
            map.current.getCanvas().style.cursor = 'crosshair';
        }

        const handleMapClick = (e: maplibregl.MapMouseEvent) => {
            if (e.defaultPrevented) return; // Point was clicked!

            if (isAddingLocation) {
                contextMenuPopup.current?.remove();
                contextMenuPopup.current = null;
                onMapClickRef.current([e.lngLat.lng, e.lngLat.lat]);
                return;
            }

            // Show context menu instead of directly creating
            contextMenuPopup.current?.remove();

            const div = document.createElement('div');
            div.style.padding = '2px';
            div.innerHTML = `
                <button class="create-menu-btn" style="background:transparent; border:none; padding:4px 8px; cursor:pointer; color:var(--text-primary); text-align:left; width: 100%; white-space:nowrap; font-family:inherit; font-size:14px; font-weight: 500;">
                   + Create Location
                </button>
            `;
            div.querySelector('.create-menu-btn')?.addEventListener('click', () => {
                contextMenuPopup.current?.remove();
                contextMenuPopup.current = null;
                onMapClickRef.current([e.lngLat.lng, e.lngLat.lat]);
            });

            contextMenuPopup.current = new maplibregl.Popup({ closeButton: false, anchor: 'top-left', closeOnClick: true })
                .setLngLat(e.lngLat)
                .setDOMContent(div)
                .addTo(map.current!);
        };

        map.current.on('click', handleMapClick);

        return () => {
            map.current?.off('click', handleMapClick);
        };
    }, [isLoaded, isAddingLocation]);

    // Manage Add Location Marker
    useEffect(() => {
        if (!map.current) return;

        if (draftCoords) {
            if (!draftMarker.current) {
                draftMarker.current = new maplibregl.Marker({ color: '#f59e0b' });
            }
            draftMarker.current.setLngLat(draftCoords).addTo(map.current);
        } else if (draftMarker.current) {
            draftMarker.current.remove();
            draftMarker.current = null;
        }
    }, [draftCoords]);

    // Update Data
    useEffect(() => {
        if (!isLoaded || !map.current) return;

        const source = map.current.getSource('locations') as maplibregl.GeoJSONSource | undefined;
        if (!source) return;

        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: data as any
        };
        source.setData(geojson);

        // MapLibre doesn't store feature.id mapped directly if we pass it through properties.
        // We use promoteId or manually lookup the feature.
        // For simplicity we will rely on popups and fitbounds for highlighting for now.

    }, [data, isLoaded]);

    // Handle Selection State & Popup
    useEffect(() => {
        if (!isLoaded || !map.current || data.length === 0) return;

        // Clear existing feature states (reset all)
        data.forEach(f => {
            map.current?.setFeatureState({ source: 'locations', id: f.id }, { selected: false });
        });

        if (selectedLocationId) {
            const feature = data.find(f => (f.properties?._id || f.id) === selectedLocationId);
            if (feature && feature.geometry.coordinates) {
                const coords = feature.geometry.coordinates as [number, number];

                // Fly to point
                map.current.flyTo({ center: coords, zoom: 12, duration: 1000 });

                // Open permanent popup
                const dt = new Date(feature.properties._createdAt).toLocaleString();
                const contentNode = document.createElement('div');
                const locationId = feature.properties._id || feature.id;
                contentNode.innerHTML = `
                    <div style="font-family: inherit;">
                        <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 4px; color: #a78bfa;">${feature.properties.name || 'Unnamed Location'}</h3>
                        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Lat: ${coords[1].toFixed(5)}<br/>Lng: ${coords[0].toFixed(5)}</p>
                        <hr style="border-color: rgba(255,255,255,0.1); margin: 8px 0;"/>
                        <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;">ID: ${locationId}</p>
                        <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">Added: ${dt}</p>
                        <button class="edit-btn btn" style="background:transparent; border:1px solid #3b82f6; color:#3b82f6; padding:4px 8px; font-size:12px; margin-right:8px; border-radius:4px; cursor:pointer;">Edit</button>
                        <button class="delete-btn btn btn-primary" style="background:#f43f5e; padding:4px 8px; font-size:12px; border-radius:4px; border:none; color:white; cursor:pointer;">Delete</button>
                    </div>
                `;
                contentNode.querySelector('.delete-btn')?.addEventListener('click', () => {
                    onDelete(locationId);
                });
                contentNode.querySelector('.edit-btn')?.addEventListener('click', () => {
                    onEdit(feature as Feature);
                });

                selectedPopup.current
                    .setLngLat(coords)
                    .setDOMContent(contentNode)
                    .addTo(map.current);

                // Set feature state if we had promoteId.
                // maplibregl source needs 'promoteId' setup for feature state to work flawlessly on custom IDs. 
                // We'll add promoteId down below if needed.
            }
        } else {
            selectedPopup.current.remove();

            // Re-fit all points if none selected
            if (data.length > 0) {
                const bounds = new maplibregl.LngLatBounds();
                data.forEach(f => {
                    if (f.geometry.coordinates) bounds.extend(f.geometry.coordinates as [number, number]);
                });
                try {
                    map.current.fitBounds(bounds, { padding: 50, duration: 1000, maxZoom: 14 });
                } catch (e) { }
            }
        }
    }, [selectedLocationId, data, isLoaded]);

    return <div ref={mapContainer} className="map-container" />;
}
