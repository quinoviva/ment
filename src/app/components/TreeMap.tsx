import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { TreeData } from '../utils/storage';
import { calculateAge } from '../utils/dateUtils';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TreeMapProps {
  trees: TreeData[];
  selectedTreeId?: string | null;
  onTreeClick?: (tree: TreeData) => void;
}

export function TreeMap({ trees, selectedTreeId, onTreeClick }: TreeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const getMarkerColor = (status: TreeData['healthStatus']): string => {
    switch (status) {
      case 'Excellent': return '#22c55e';
      case 'Good': return '#3b82f6';
      case 'Fair': return '#eab308';
      case 'Poor': return '#f97316';
      case 'Dead': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const createCustomIcon = (status: TreeData['healthStatus'], isSelected: boolean = false) => {
    const color = getMarkerColor(status);
    const size = isSelected ? 40 : 30;
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: ${isSelected ? '4px' : '3px'} solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="transform: rotate(45deg); color: white; font-size: ${isSelected ? '20px' : '16px'};">🌳</div></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  };

  // 1. Initialize Map & Layers
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { maxZoom: 22, zoomControl: true, wheelPxPerZoomLevel: 60 }).setView([10.9388, 122.6322], 13);
    
    const googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 22, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '&copy; Google' });
    const googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 22, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '&copy; Google' });
    const darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 20 });
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OSM' });
    
    googleHybrid.addTo(map);
    const baseMaps = { "Satellite (Hybrid)": googleHybrid, "Satellite (Pure)": googleSatellite, "Dark Minimal": darkMatter, "Street Map": osm };
    L.control.layers(baseMaps, {}, { position: 'topright' }).addTo(map);

    const clusterGroup = L.markerClusterGroup({ spiderfyOnMaxZoom: true, showCoverageOnHover: false, zoomToBoundsOnClick: true, maxClusterRadius: 40 });
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    mapInstanceRef.current = map;

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  // 2. Manage Markers & Popups
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;
    clusterGroupRef.current.clearLayers();
    markersRef.current = {};
    if (trees.length === 0) return;

    const bounds = L.latLngBounds([]);
    trees.forEach(tree => {
      const isSelected = tree.id === selectedTreeId;
      const marker = L.marker([tree.latitude, tree.longitude], { icon: createCustomIcon(tree.healthStatus, isSelected) });
      
      marker.bindPopup(`
        <div style="min-width: 200px; font-family: sans-serif; padding: 5px;">
          <div style="background-color: #f0fdf4; padding: 10px; border-radius: 8px; border-left: 4px solid #15803d; margin-bottom: 10px;">
            <p style="margin: 0; font-size: 10px; text-transform: uppercase; color: #15803d; font-weight: bold; letter-spacing: 0.5px;">Species</p>
            <h3 style="margin: 2px 0 0 0; font-size: 18px; font-weight: 900; color: #064e3b;">${tree.species}</h3>
          </div>
          <div style="font-size: 13px; line-height: 1.5; color: #334155;">
            <p style="margin: 4px 0;"><strong>Participant:</strong> ${tree.name}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="background-color: ${getMarkerColor(tree.healthStatus)}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${tree.healthStatus}</span></p>
            <p style="margin: 4px 0;"><strong>Age:</strong> ${tree.datePlanted ? calculateAge(tree.datePlanted) : `${tree.age} years`}</p>
            ${tree.datePlanted ? `<p style="margin: 4px 0;"><strong>Planted:</strong> ${new Date(tree.datePlanted).toLocaleDateString()}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Added by:</strong> ${tree.addedBy}</p>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8;">ID: ${tree.id}</div>
          </div>
        </div>`, { autoClose: true });

      marker.on('click', () => onTreeClick?.(tree));
      clusterGroupRef.current!.addLayer(marker);
      markersRef.current[tree.id] = marker;
      bounds.extend([tree.latitude, tree.longitude]);
    });

    if (!selectedTreeId && trees.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [trees, selectedTreeId, onTreeClick]);

  // 3. Handle External Selection (Auto-zoom)
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedTreeId || !clusterGroupRef.current) return;
    const selectedTree = trees.find(t => t.id === selectedTreeId);
    const marker = markersRef.current[selectedTreeId];
    if (selectedTree && marker) {
      clusterGroupRef.current.zoomToShowLayer(marker, () => {
        marker.openPopup();
        mapInstanceRef.current?.setView([selectedTree.latitude, selectedTree.longitude], 20, { animate: true });
      });
    }
  }, [selectedTreeId, trees]);

  return <div ref={mapRef} className="rounded-lg shadow-inner" style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 0 }} />;
}