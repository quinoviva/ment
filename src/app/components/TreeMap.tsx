import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { TreeData } from '../utils/storage';
import { calculateAge } from '../utils/dateUtils';

// Fix for default marker icons
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

  // Refined Semantic Palette
  const getMarkerColor = (status: TreeData['healthStatus']): string => {
    switch (status) {
      case 'Excellent': return '#10b981'; // Emerald 500
      case 'Good': return '#0ea5e9';      // Sky 500
      case 'Fair': return '#f59e0b';      // Amber 500
      case 'Poor': return '#ef4444';      // Red 500
      case 'Dead': return '#475569';      // Slate 600
      default: return '#94a3b8';
    }
  };

  const createCustomIcon = (status: TreeData['healthStatus'], isSelected: boolean = false) => {
    const color = getMarkerColor(status);
    const size = isSelected ? 48 : 36;
    
    return L.divIcon({
      className: 'custom-marker-wrapper',
      html: `
        <div class="marker-pin ${isSelected ? 'selected' : ''}" style="--marker-color: ${color}; --marker-size: ${size}px;">
          <div class="marker-inner">
            <span class="marker-emoji">🌳</span>
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size - 10],
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      maxZoom: 22,
      zoomControl: false,
      wheelPxPerZoomLevel: 60 
    }).setView([10.9388, 122.6322], 13);

    // Map Types (Preserved and Expanded)
    const googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 22, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '© Google' });
    const googleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 22, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '© Google' });
    const googleTerrain = L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', { maxZoom: 22, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '© Google' });
    const lightMode = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© CARTO', subdomains: 'abcd', maxZoom: 20 });
    const darkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© CARTO', subdomains: 'abcd', maxZoom: 20 });

    googleHybrid.addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseMaps = {
      "<span class='layer-label'>Satellite Hybrid</span>": googleHybrid,
      "<span class='layer-label'>Satellite Pure</span>": googleSatellite,
      "<span class='layer-label'>Terrain View</span>": googleTerrain,
      "<span class='layer-label'>Light Minimal</span>": lightMode,
      "<span class='layer-label'>Dark Minimal</span>": darkMatter,
    };
    
    L.control.layers(baseMaps, {}, { position: 'topright', collapsed: true }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="cluster-bubble"><span>${count}</span></div>`,
          className: 'custom-cluster-icon',
          iconSize: [44, 44]
        });
      }
    });
    
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    mapInstanceRef.current = map;

    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;
    clusterGroupRef.current.clearLayers();
    markersRef.current = {};
    if (trees.length === 0) return;

    const bounds = L.latLngBounds([]);

    trees.forEach(tree => {
      const isSelected = tree.id === selectedTreeId;
      const marker = L.marker([tree.latitude, tree.longitude], {
        icon: createCustomIcon(tree.healthStatus, isSelected),
        zIndexOffset: isSelected ? 1000 : 0
      });

      marker.bindPopup(`
        <div class="tree-popup-container">
          <div class="popup-header-gradient">
            <div class="species-info">
              <span class="badge">#${tree.id.slice(-6).toUpperCase()}</span>
              <h3>${tree.species}</h3>
            </div>
            <div class="header-icon-container">🌳</div>
          </div>
          
          <div class="popup-content">
            <div class="info-grid">
               <div class="info-card">
                  <label>Health Status</label>
                  <p style="color: ${getMarkerColor(tree.healthStatus)}">${tree.healthStatus}</p>
               </div>
               <div class="info-card">
                  <label>Tree Age</label>
                  <p>${tree.datePlanted ? calculateAge(tree.datePlanted) : `${tree.age}y`}</p>
               </div>
            </div>

            <div class="detail-row">
              <label>Location</label>
              <p>${tree.address || 'GPS Coordinates Provided'}</p>
            </div>

            <div class="detail-row user-row">
               <div class="user-avatar">${tree.name.charAt(0)}</div>
               <div>
                 <label>Contributor</label>
                 <p>${tree.name}</p>
               </div>
            </div>
            
            <div class="popup-actions">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${tree.latitude},${tree.longitude}" 
                target="_blank" 
                class="primary-btn">
                Open Directions
              </a>
            </div>
        </div>
      `, { 
        maxWidth: 320, 
        className: 'modern-popup-system',
        offset: [0, -5]
      });

      marker.on('click', () => onTreeClick?.(tree));
      clusterGroupRef.current!.addLayer(marker);
      markersRef.current[tree.id] = marker;
      bounds.extend([tree.latitude, tree.longitude]);
    });

    if (trees.length > 0 && !selectedTreeId) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [trees, selectedTreeId, onTreeClick]);

  // --- Selection and Panning Fix ---
  useEffect(() => {
    // 1. Added a check to ensure markersRef.current actually contains the ID
    if (!mapInstanceRef.current || !selectedTreeId || !clusterGroupRef.current) return;
    
    const selectedTree = trees.find(t => t.id === selectedTreeId);
    const marker = markersRef.current[selectedTreeId];

    // 2. CRITICAL: Only proceed if both the data and the actual Leaflet marker exist
    if (selectedTree && marker) {
      try {
        clusterGroupRef.current.zoomToShowLayer(marker, () => {
          // Double check marker still exists before calling methods
          if (marker && mapInstanceRef.current) {
            marker.openPopup();
            mapInstanceRef.current.setView(
              [selectedTree.latitude, selectedTree.longitude], 
              19, 
              { animate: true }
            );
          }
        });
      } catch (err) {
        console.warn("Leaflet clustering sync issue:", err);
      }
    }
  }, [selectedTreeId, trees]); // Effect stays dependent on trees to ensure markers are ready

  return (
    <div className="relative w-full h-full overflow-hidden shadow-2xl rounded-2xl border border-slate-200 bg-slate-50">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '600px', zIndex: 0 }} />
      
      <style>{`
        /* 1. Global Leaflet UI Colors */
        .leaflet-control-layers { border: none !important; border-radius: 12px !important; padding: 8px !important; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1) !important; }
        .layer-label { font-size: 12px; font-weight: 600; color: #1e293b; padding-left: 4px; }
        .leaflet-bar a { background: white !important; color: #475569 !important; border: 1px solid #f1f5f9 !important; }

        /* 2. Marker Styling */
        .marker-pin {
          width: var(--marker-size); height: var(--marker-size);
          background: var(--marker-color); border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;
          border: 3px solid #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .marker-inner { transform: rotate(45deg); }
        .marker-emoji { font-size: calc(var(--marker-size) * 0.55); }
        .marker-pin.selected {
          box-shadow: 0 0 0 6px rgba(255,255,255,0.4), 0 0 0 12px var(--marker-color);
          animation: markerPulse 2s infinite;
        }

        @keyframes markerPulse {
          0% { box-shadow: 0 0 0 0px var(--marker-color); }
          70% { box-shadow: 0 0 0 15px transparent; }
          100% { box-shadow: 0 0 0 0px transparent; }
        }

        /* 3. Popup Styling (Modernized) */
        .modern-popup-system .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); }
        .modern-popup-system .leaflet-popup-content { margin: 0 !important; width: 320px !important; }
        .modern-popup-system .leaflet-popup-tip-container { display: none; }

        .tree-popup-container { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
        .popup-header-gradient {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 24px; color: white; display: flex; justify-content: space-between; align-items: center;
        }
        .species-info h3 { margin: 4px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
        .badge { font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 6px; letter-spacing: 0.05em; }
        .header-icon-container { font-size: 32px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 16px; }

        .popup-content { padding: 24px; background: #fff; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .info-card { background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; }
        .info-card label { display: block; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
        .info-card p { margin: 0; font-size: 15px; font-weight: 700; color: #1e293b; }

        .detail-row { margin-bottom: 20px; }
        .detail-row label { display: block; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
        .detail-row p { margin: 0; font-size: 14px; color: #475569; font-weight: 500; line-height: 1.5; }
        
        .user-row { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 12px; }
        .user-avatar { width: 32px; height: 32px; background: #059669; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; }

        .primary-btn {
        display: block; 
        width: 100%; 
        padding: 14px; 
        background: #059669; /* Emerald Green Background */
        color: #ffffff !important; /* White Font Color */
        text-align: center;
        border-radius: 12px; 
        font-weight: 700; 
        text-decoration: none; 
        transition: all 0.2s;
        border: none;
        box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.4);
      }

      .primary-btn:hover { 
        background: #047857; 
        transform: translateY(-2px); 
        box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.5);
      }

        /* 4. Cluster Design */
        .cluster-bubble {
          background: #059669; border: 4px solid white; color: white; border-radius: 50%;
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          font-weight: 800; box-shadow: 0 10px 20px rgba(0,0,0,0.15); font-size: 14px;
        }
      `}</style>
    </div>
  );
}