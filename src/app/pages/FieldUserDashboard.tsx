import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import Barcode from 'react-barcode';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { storage, TreeData, User as AppUser } from '../utils/storage';
import { toast } from 'sonner';
import { MapPin, TreePine, LogOut, Wifi, WifiOff, Barcode as BarcodeIcon, X, Printer, Download, Loader2, Calendar, Crosshair, Map as MapIcon, Layers } from 'lucide-react';
import { getTreePublicViewUrl, getQRCodeApiUrl } from '../utils/qrUtils';
import { calculateAge, calculateAgeInYears } from '../utils/dateUtils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TREE_SPECIES = [
  'Narra', 'Mahogany', 'Acacia', 'Mango', 'Ipil-ipil', 'Molave', 'Pine', 'Bamboo', 'Coconut', 'Banana', 'Jackfruit', 'Tamarind', 'Dao', 'Yakal', 'Teak',
];

export function FieldUserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(storage.getCurrentUser());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Form state
  const [species, setSpecies] = useState('');
  const [treeName, setTreeName] = useState('');
  const [healthStatus, setHealthStatus] = useState<TreeData['healthStatus']>('Good');
  const [ageDisplay, setAgeDisplay] = useState('');
  const [datePlanted, setDatePlanted] = useState('');
  
  // Location state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Map state
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [generatedTreeId, setGeneratedTreeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'field_user') {
      navigate('/');
      return;
    }
    setUser(currentUser);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  useEffect(() => {
    if (datePlanted) setAgeDisplay(calculateAge(datePlanted));
    else setAgeDisplay('');
  }, [datePlanted]);

  // Initialize and update capture map
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstance.current) {
      const initialLat = latitude || 10.9388;
      const initialLon = longitude || 122.6322;

      mapInstance.current = L.map(mapRef.current, {
        center: [initialLat, initialLon],
        zoom: 18,
        maxZoom: 22
      });

      // Google Hybrid Layer (Like Google Maps Satellite)
      const googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 22,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps'
      }).addTo(mapInstance.current);

      markerRef.current = L.marker([initialLat, initialLon], {
        draggable: true,
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:#15803d; width:24px; height:24px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.5)'></div>",
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(mapInstance.current);

      markerRef.current.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        setLatitude(position.lat);
        setLongitude(position.lng);
        setAccuracy(null); // Manual adjustment overrides GPS accuracy
        reverseGeocode(position.lat, position.lng);
      });
    }

    return () => {
      if (mapInstance.current && !showMap) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [showMap]);

  const reverseGeocode = async (lat: number, lon: number) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en-US,en;q=0.5', 'User-Agent': 'MENRO-Pototan-Tree-Registry/1.0' }
      });
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const village = addr.village || addr.suburb || addr.neighbourhood || '';
        const road = addr.road || '';
        const city = addr.city || addr.town || addr.municipality || 'Pototan';
        const province = addr.province || addr.state || 'Iloilo';
        let formattedAddress = '';
        if (village) formattedAddress += `Brgy. ${village}, `;
        if (road) formattedAddress += `${road}, `;
        formattedAddress += `${city}, ${province}`;
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const startGpsCapture = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    setIsCapturingLocation(true);
    setShowMap(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon, accuracy: acc } = position.coords;
        setLatitude(lat);
        setLongitude(lon);
        setAccuracy(acc);
        setIsCapturingLocation(false);
        
        if (mapInstance.current && markerRef.current) {
          mapInstance.current.setView([lat, lon], 19);
          markerRef.current.setLatLng([lat, lon]);
          
          // Clear old circle
          if (accuracyCircleRef.current) mapInstance.current.removeLayer(accuracyCircleRef.current);
          
          // Add accuracy circle (Google Maps style)
          accuracyCircleRef.current = L.circle([lat, lon], {
            radius: acc,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 1
          }).addTo(mapInstance.current);
        }
        
        reverseGeocode(lat, lon);
        toast.success(`GPS Locked (±${acc.toFixed(1)}m). Drag pin to refine.`);
      },
      (error) => {
        setIsCapturingLocation(false);
        toast.error(`GPS Error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      toast.error('Please capture the tree location first');
      return;
    }
    if (!datePlanted) {
      toast.error('Please select the date planted');
      return;
    }

    setIsSubmitting(true);
    try {
      const treeData: TreeData = {
        id: `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: treeName,
        species,
        healthStatus,
        age: calculateAgeInYears(datePlanted),
        latitude,
        longitude,
        address,
        dateAdded: new Date().toISOString(),
        datePlanted: datePlanted,
        addedBy: user?.username || 'field_user',
      };
      await storage.addTree(treeData);
      setGeneratedTreeId(treeData.id);
      toast.success('Tree data saved & identification generated!');
    } catch (error) {
      console.error("Error adding tree:", error);
      toast.error("Failed to save tree data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setSpecies('');
    setTreeName('');
    setHealthStatus('Good');
    setAgeDisplay('');
    setDatePlanted('');
    setLatitude(null);
    setLongitude(null);
    setAccuracy(null);
    setAddress('');
    setGeneratedTreeId(null);
    setShowMap(false);
  };

  const handleLogout = async () => {
    await storage.logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
              <img src="/img/Pototan-logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MENRO</h1>
              <p className="text-sm text-gray-600">Field Registry</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {generatedTreeId ? (
          <Card className="overflow-hidden border-none shadow-xl">
            <CardHeader className="bg-green-600 text-white pb-8">
              <CardTitle className="text-2xl">Registration Successful!</CardTitle>
              <CardDescription className="text-green-100">Tags generated for {treeName}.</CardDescription>
            </CardHeader>
            <CardContent className="bg-white pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Internal Barcode</span>
                  <div className="bg-white p-2 rounded border shadow-sm">
                    <Barcode value={generatedTreeId} ref={barcodeRef} width={1.5} height={80} fontSize={12} />
                  </div>
                </div>
                <div className="flex flex-col items-center p-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-4">Public QR Code</span>
                  <div className="bg-white p-2 rounded border shadow-sm">
                    <img src={getQRCodeApiUrl(getTreePublicViewUrl(generatedTreeId), 120)} alt="QR Code" width="120" height="120" />
                  </div>
                </div>
              </div>
              <Button onClick={handleClear} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg font-bold">
                <X className="w-5 h-5 mr-2" /> Add Another Tree
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Tree Data Entry</CardTitle>
              <CardDescription>Fill in the tree information precisely</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="species">Species</Label>
                  <Select value={species} onValueChange={setSpecies} required>
                    <SelectTrigger id="species"><SelectValue placeholder="Select species" /></SelectTrigger>
                    <SelectContent>{TREE_SPECIES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treeName">Identifier / Name</Label>
                  <Input id="treeName" type="text" placeholder="e.g., Tree-001" value={treeName} onChange={(e) => setTreeName(e.target.value)} required />
                </div>

                <div className="space-y-3">
                  <Label>Health Status</Label>
                  <RadioGroup value={healthStatus} onValueChange={(value) => setHealthStatus(value as TreeData['healthStatus'])}>
                    <div className="flex flex-wrap gap-4">
                      {['Excellent', 'Good', 'Fair', 'Poor', 'Dead'].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <RadioGroupItem value={status} id={status} />
                          <Label htmlFor={status} className="cursor-pointer">{status}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="datePlanted" className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Date Planted</Label>
                    <Input id="datePlanted" type="date" value={datePlanted} onChange={(e) => setDatePlanted(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Calculated Age</Label>
                    <Input id="age" type="text" value={ageDisplay} readOnly className="bg-gray-50 font-bold text-green-700" />
                  </div>
                </div>

                {/* Accuracy Improvement Section */}
                <div className="space-y-4 pt-4 border-t">
                  <Label className="flex justify-between items-center">
                    Exact Location
                    {accuracy && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${accuracy < 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        GPS Precision: ±{accuracy.toFixed(1)}m
                      </span>
                    )}
                  </Label>
                  
                  {!showMap ? (
                    <Button type="button" variant="outline" className="w-full py-10 border-dashed border-2 hover:bg-green-50 hover:border-green-500 group" onClick={startGpsCapture}>
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-green-100 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                          <Crosshair className="w-6 h-6" />
                        </div>
                        <span className="font-bold">Locate Tree & Open Map</span>
                        <span className="text-xs text-gray-500">Uses GPS + Satellite imagery for exact positioning</span>
                      </div>
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div ref={mapRef} className="h-64 w-full rounded-xl border-2 border-green-200 shadow-md z-0 overflow-hidden" />
                      <p className="text-[10px] text-center text-gray-500 flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" /> 
                        Drag the pin to the <strong>exact crown</strong> of the tree on the map
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={startGpsCapture} disabled={isCapturingLocation}>
                          {isCapturingLocation ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Crosshair className="w-3 h-3 mr-2" />}
                          Recenter GPS
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => setShowMap(false)}>
                          <X className="w-3 h-3 mr-2" /> Hide Map
                        </Button>
                      </div>
                    </div>
                  )}

                  {latitude && (
                    <div className="p-3 bg-green-50 rounded-lg text-xs space-y-1">
                      <div className="flex items-center gap-2 font-bold text-green-800">
                        <MapIcon className="w-3 h-3" />
                        {isGeocoding ? 'Detecting address...' : address || 'Coordinates Locked'}
                      </div>
                      <div className="text-gray-500 font-mono">
                        {latitude.toFixed(6)}, {longitude?.toFixed(6)}
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !latitude}>
                  <BarcodeIcon className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}