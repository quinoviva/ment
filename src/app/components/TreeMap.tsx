import { useEffect, useRef, useState } from 'react';
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
  const markersRef = useRef<L.Marker[]>([]);

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

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([14.5995, 120.9842], 13); // Default to Manila, Philippines

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (trees.length === 0) return;

    // Add markers for each tree
    const bounds = L.latLngBounds([]);

    trees.forEach(tree => {
      const isSelected = tree.id === selectedTreeId;
      const marker = L.marker([tree.latitude, tree.longitude], {
        icon: createCustomIcon(tree.healthStatus, isSelected),
      });

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${tree.name}</h3>
          <div style="font-size: 14px; line-height: 1.6;">
            <p style="margin: 4px 0;"><strong>Species:</strong> ${tree.species}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="background-color: ${getMarkerColor(tree.healthStatus)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${tree.healthStatus}</span></p>
            <p style="margin: 4px 0;"><strong>Age:</strong> ${tree.age} years</p>
            <p style="margin: 4px 0;"><strong>Added by:</strong> ${tree.addedBy}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">${new Date(tree.dateAdded).toLocaleDateString()}</p>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onTreeClick) {
          onTreeClick(tree);
        }
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
      bounds.extend([tree.latitude, tree.longitude]);
    });

    // Fit map to show all markers
    if (trees.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [trees, selectedTreeId, onTreeClick]);

  // Handle selected tree - zoom to it
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedTreeId) return;

    const selectedTree = trees.find(t => t.id === selectedTreeId);
    if (selectedTree) {
      mapInstanceRef.current.setView([selectedTree.latitude, selectedTree.longitude], 16, {
        animate: true,
      });

      // Open popup for selected marker
      const selectedMarker = markersRef.current.find((marker, index) => trees[index].id === selectedTreeId);
      if (selectedMarker) {
        selectedMarker.openPopup();
      }
    }
  }, [selectedTreeId, trees]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
  );
}
