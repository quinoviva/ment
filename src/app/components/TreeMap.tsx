import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TreeData } from '../utils/storage';

// Fix for default marker icons in Leaflet
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
  const markersRef = useRef<{ [key: string]: L.Marker }>({}); // Store as object for faster lookup

  const getMarkerColor = (status: TreeData['healthStatus']): string => {
    switch (status) {
      case 'Excellent': return '#22c55e'; // green
      case 'Good': return '#3b82f6'; // blue
      case 'Fair': return '#eab308'; // yellow
      case 'Poor': return '#f97316'; // orange
      case 'Dead': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const createCustomIcon = (status: TreeData['healthStatus'], isSelected: boolean = false) => {
    const color = getMarkerColor(status);
    const size = isSelected ? 40 : 30;
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: ${isSelected ? '4px' : '3px'} solid white;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: ${isSelected ? '20px' : '16px'};
          ">🌳</div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  };

  // 1. INITIALIZE MAP
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Center on Pototan, Iloilo with a high maxZoom
    const map = L.map(mapRef.current, {
      maxZoom: 22,
      zoomControl: true,
      wheelPxPerZoomLevel: 60 // Smoother zooming
    }).setView([10.9388, 122.6322], 13);

    // Google Hybrid Layer (Satellite + Labels) - supports up to zoom 22
    const googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    });

    // Standard OSM Layer as a fallback
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    });

    googleHybrid.addTo(map);

    // Add Layer Control so you can toggle views
    const baseMaps = {
      "Satellite (Hybrid)": googleHybrid,
      "Street Map": osm
    };
    L.control.layers(baseMaps).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. UPDATE MARKERS
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    if (trees.length === 0) return;

    const bounds = L.latLngBounds([]);

    trees.forEach(tree => {
      const isSelected = tree.id === selectedTreeId;
      const marker = L.marker([tree.latitude, tree.longitude], {
        icon: createCustomIcon(tree.healthStatus, isSelected),
      });

      marker.bindPopup(`
        <div style="min-width: 200px; font-family: sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${tree.name}</h3>
          <div style="font-size: 14px; line-height: 1.6;">
            <p style="margin: 4px 0;"><strong>Species:</strong> ${tree.species}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="background-color: ${getMarkerColor(tree.healthStatus)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${tree.healthStatus}</span></p>
            <p style="margin: 4px 0;"><strong>Age:</strong> ${tree.age} years</p>
            <p style="margin: 4px 0;"><strong>Added by:</strong> ${tree.addedBy}</p>
            <p style="margin: 4px 0; font-size: 11px; color: #666;">${new Date(tree.dateAdded).toLocaleDateString()}</p>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onTreeClick) onTreeClick(tree);
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current[tree.id] = marker; // Store by ID for easy selection
      bounds.extend([tree.latitude, tree.longitude]);
    });

    // Only fit bounds automatically if we aren't currently focusing on a specific tree
    if (trees.length > 0 && !selectedTreeId) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [trees, selectedTreeId, onTreeClick]);

  // 3. ZOOM TO SELECTED TREE
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedTreeId) return;

    const selectedTree = trees.find(t => t.id === selectedTreeId);
    if (selectedTree) {
      // Zoom in deeper (level 20) for the high-res satellite view
      mapInstanceRef.current.setView([selectedTree.latitude, selectedTree.longitude], 20, {
        animate: true,
      });

      const marker = markersRef.current[selectedTreeId];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedTreeId, trees]);

  return (
    <div 
      ref={mapRef} 
      className="rounded-lg shadow-inner" 
      style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 0 }} 
    />
  );
}