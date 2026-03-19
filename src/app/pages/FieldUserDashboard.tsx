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
import { MapPin, TreePine, LogOut, Wifi, WifiOff, Barcode as BarcodeIcon, X, Printer, Download, Loader2 } from 'lucide-react';
import { getTreePublicViewUrl, getQRCodeApiUrl } from '../utils/qrUtils';

const TREE_SPECIES = [
  'Narra',
  'Mahogany',
  'Acacia',
  'Mango',
  'Ipil-ipil',
  'Molave',
  'Pine',
  'Bamboo',
  'Coconut',
  'Banana',
  'Jackfruit',
  'Tamarind',
  'Dao',
  'Yakal',
  'Teak',
];

export function FieldUserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AppUser | null>(storage.getCurrentUser());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Form state
  const [treeName, setTreeName] = useState('');
  const [species, setSpecies] = useState('');
  const [healthStatus, setHealthStatus] = useState<TreeData['healthStatus']>('Good');
  const [age, setAge] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [generatedTreeId, setGeneratedTreeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const barcodeRef = useRef<HTMLCanvasElement>(null); // Ref to capture the barcode canvas

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'field_user') {
      navigate('/');
      return;
    }
    setUser(currentUser);

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const reverseGeocode = async (lat: number, lon: number) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.5',
          'User-Agent': 'MENRO-Pototan-Tree-Registry/1.0'
        }
      });
      const data = await response.json();
      
      if (data && data.address) {
        // Construct a localized address string
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
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress('Error fetching address');
    } finally {
      setIsGeocoding(false);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your device');
      return;
    }

    // Check if we are in a secure context (HTTPS)
    if (!window.isSecureContext) {
      toast.error('Geolocation requires a secure connection (HTTPS or localhost). Please use the ngrok URL.');
      return;
    }

    setIsCapturingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        setIsCapturingLocation(false);
        toast.success('Location captured successfully!');
        
        // Fetch human-readable address
        reverseGeocode(lat, lon);
      },
      (error) => {
        setIsCapturingLocation(false);
        let errorMsg = error.message;
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "User denied location access. Please enable it in your browser settings.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out. Please try again.";
        }
        toast.error(`Error capturing location: ${errorMsg}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for better mobile reliability
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      toast.error('Please capture the tree location first');
      return;
    }

    setIsSubmitting(true);
    try {
      const treeData: TreeData = {
        id: `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: treeName,
        species,
        healthStatus,
        age: parseInt(age),
        latitude,
        longitude,
        address,
        dateAdded: new Date().toISOString(),
        addedBy: user?.username || 'field_user',
      };

      // Save to Firestore
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

  const handlePrintBarcode = () => {
    if (!barcodeRef.current || !generatedTreeId) {
      toast.error('Barcode not ready for printing.');
      return;
    }

    const canvas = barcodeRef.current;
    const imageUrl = canvas.toDataURL('image/png');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              img { max-width: 100%; max-height: 100%; }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="Barcode" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handlePrintQRCode = () => {
    if (!generatedTreeId) return;
    const publicUrl = getTreePublicViewUrl(generatedTreeId);
    const qrCodeUrl = getQRCodeApiUrl(publicUrl, 300);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; flex-direction: column; font-family: sans-serif; text-align: center; }
              img { width: 250px; height: 250px; }
              .label { margin-top: 15px; font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <img src="${qrCodeUrl}" />
            <div class="label">${treeName}</div>
            <div style="font-size: 12px; color: #666; margin-top: 10px;">Scan to view tree information</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 800);
    }
  };

  const handleSaveBarcode = () => {
    if (!barcodeRef.current || !generatedTreeId) {
      toast.error('Barcode not ready for saving.');
      return;
    }

    const canvas = barcodeRef.current;
    const imageUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `barcode-${generatedTreeId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Barcode saved');
  };

  const handleSaveQRCode = () => {
    if (!generatedTreeId) return;
    const publicUrl = getTreePublicViewUrl(generatedTreeId);
    const qrCodeUrl = getQRCodeApiUrl(publicUrl, 300);
    
    fetch(qrCodeUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qrcode-${generatedTreeId}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('QR Code saved');
      })
      .catch(() => toast.error('Failed to save QR Code'));
  };


  const handleClear = () => {
    setTreeName('');
    setSpecies('');
    setHealthStatus('Good');
    setAge('');
    setLatitude(null);
    setLongitude(null);
    setAddress('');
    setGeneratedTreeId(null);
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
              <img 
                src="/img/Pototan-logo.png" 
                alt="Municipality of Pototan Logo" 
                className="w-10 h-10 object-contain" 
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MENRO</h1>
              <p className="text-sm text-gray-600">Welcome, {user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {generatedTreeId ? (
          <Card className="overflow-hidden border-none shadow-xl">
            <CardHeader className="bg-green-600 text-white pb-8">
              <CardTitle className="text-2xl">Registration Successful!</CardTitle>
              <CardDescription className="text-green-100">
                Identification tags have been generated for {treeName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-white pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Barcode Section */}
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Internal Barcode</span>
                  <div className="bg-white p-2 rounded border shadow-sm">
                    <Barcode
                      value={generatedTreeId}
                      ref={barcodeRef}
                      width={1.5}
                      height={80}
                      fontSize={12}
                    />
                  </div>
                  <div className="flex gap-2 mt-4 w-full">
                    <Button variant="outline" size="sm" className="flex-1 text-[10px]" onClick={handlePrintBarcode}>
                      <Printer className="w-3 h-3 mr-1" /> Print
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-[10px]" onClick={handleSaveBarcode}>
                      <Download className="w-3 h-3 mr-1" /> Save
                    </Button>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center p-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-4">Public QR Code</span>
                  <div className="bg-white p-2 rounded border shadow-sm">
                    <img 
                      src={getQRCodeApiUrl(getTreePublicViewUrl(generatedTreeId), 120)} 
                      alt="QR Code"
                      width="120"
                      height="120"
                    />
                  </div>
                  <div className="flex gap-2 mt-4 w-full">
                    <Button variant="outline" size="sm" className="flex-1 text-[10px] border-blue-200 text-blue-700" onClick={handlePrintQRCode}>
                      <Printer className="w-3 h-3 mr-1" /> Print
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-[10px] border-blue-200 text-blue-700" onClick={handleSaveQRCode}>
                      <Download className="w-3 h-3 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Button onClick={handleClear} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg font-bold">
                  <X className="w-5 h-5 mr-2" />
                  Add Another Tree
                </Button>
                <p className="text-center text-xs text-gray-400 italic">
                  Note: The QR code allows the public to scan and see tree information without logging in.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Quick Tree Data Entry</CardTitle>
              <CardDescription>
                Fill in the tree information to generate a barcode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tree Name */}
                <div className="space-y-2">
                  <Label htmlFor="treeName">Tree Name / Identifier</Label>
                  <Input
                    id="treeName"
                    type="text"
                    placeholder="e.g., Tree-001, Oak-Central-Park"
                    value={treeName}
                    onChange={(e) => setTreeName(e.target.value)}
                    required
                  />
                </div>

                {/* Species */}
                <div className="space-y-2">
                  <Label htmlFor="species">Species</Label>
                  <Select value={species} onValueChange={setSpecies} required>
                    <SelectTrigger id="species">
                      <SelectValue placeholder="Select tree species" />
                    </SelectTrigger>
                    <SelectContent>
                      {TREE_SPECIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Health Status */}
                <div className="space-y-3">
                  <Label>Health Status</Label>
                  <RadioGroup value={healthStatus} onValueChange={(value) => setHealthStatus(value as TreeData['healthStatus'])}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Excellent" id="excellent" />
                      <Label htmlFor="excellent" className="cursor-pointer">Excellent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Good" id="good" />
                      <Label htmlFor="good" className="cursor-pointer">Good</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Fair" id="fair" />
                      <Label htmlFor="fair" className="cursor-pointer">Fair</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Poor" id="poor" />
                      <Label htmlFor="poor" className="cursor-pointer">Poor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Dead" id="dead" />
                      <Label htmlFor="dead" className="cursor-pointer">Dead</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age">Age (Years)</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    placeholder="e.g., 5"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>

                {/* Location Capture */}
                <div className="space-y-2">
                  <Label>Location (GPS Coordinates)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={captureLocation}
                    disabled={isCapturingLocation}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {isCapturingLocation ? 'Capturing Location...' : 'Capture Current Location'}
                  </Button>
                  {latitude && longitude && (
                    <div className="p-3 bg-green-50 rounded-md text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">Location Captured</span>
                      </div>
                      <div className="text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="font-bold">Address:</span>
                           {isGeocoding ? (
                             <div className="flex items-center gap-1 text-blue-600 animate-pulse">
                               <Loader2 className="w-3 h-3 animate-spin" /> 
                               Identifying address...
                             </div>
                           ) : (
                             <span className="text-green-800 font-medium">{address}</span>
                           )}
                        </div>
                        <div className="text-[10px] opacity-60">Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || isGeocoding}>
                    <BarcodeIcon className="w-5 h-5 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save & Generate Identification'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}