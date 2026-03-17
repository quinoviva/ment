import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import Barcode from 'react-barcode';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { storage, TreeData } from '../utils/storage';
import { toast } from 'sonner';
import { MapPin, TreePine, LogOut, Wifi, WifiOff, Barcode as BarcodeIcon, X, Printer, Download } from 'lucide-react';

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
  const [user, setUser] = useState(storage.getCurrentUser());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Form state
  const [treeName, setTreeName] = useState('');
  const [species, setSpecies] = useState('');
  const [healthStatus, setHealthStatus] = useState<TreeData['healthStatus']>('Good');
  const [age, setAge] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [generatedTreeId, setGeneratedTreeId] = useState<string | null>(null);
  const barcodeRef = useRef<HTMLCanvasElement>(null); // Ref to capture the barcode canvas

  useEffect(() => {
    if (!user || user.role !== 'field_user') {
      navigate('/');
      return;
    }

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, navigate]);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your device');
      return;
    }

    setIsCapturingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsCapturingLocation(false);
        toast.success('Location captured successfully!');
      },
      (error) => {
        setIsCapturingLocation(false);
        toast.error(`Error capturing location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
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

    const treeData: TreeData = {
      id: `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: treeName,
      species,
      healthStatus,
      age: parseInt(age),
      latitude,
      longitude,
      dateAdded: new Date().toISOString(),
      addedBy: user?.username || 'field_user',
    };

    // Save to local storage
    storage.addTree(treeData);
    setGeneratedTreeId(treeData.id);
    toast.success('Tree data saved & barcode generated!');
  };

  const handlePrint = () => {
    if (!barcodeRef.current || !generatedTreeId) {
      toast.error('Barcode not ready for printing.');
      return;
    }

    const canvas = barcodeRef.current;
    const imageUrl = canvas.toDataURL('image/png'); // Get image data URL

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
      // Use setTimeout to ensure content is loaded before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      toast.error('Could not open print window. Please allow pop-ups.');
    }
  };

  const handleSave = () => {
    if (!barcodeRef.current || !generatedTreeId) {
      toast.error('Barcode not ready for saving.');
      return;
    }

    const canvas = barcodeRef.current;
    const imageUrl = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${generatedTreeId}.png`; // Filename for the downloaded image
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Barcode saved as PNG');
  };


  const handleClear = () => {
    setTreeName('');
    setSpecies('');
    setHealthStatus('Good');
    setAge('');
    setLatitude(null);
    setLongitude(null);
    setGeneratedTreeId(null);
  };

  const handleLogout = () => {
    storage.logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <TreePine className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl">Field User Dashboard</h1>
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
          <Card>
            <CardHeader>
              <CardTitle>Barcode Generated</CardTitle>
              <CardDescription>
                Scan this barcode to retrieve tree information later. You can also print or save it.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-4 inline-block">
                <Barcode
                  value={generatedTreeId}
                  ref={barcodeRef} // Attach ref here
                  width={2} // Example styling, adjust as needed
                  height={100}
                  // The 'react-barcode' library typically renders to a canvas element.
                  // The ref will point to this canvas element.
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">ID: {generatedTreeId}</p>
              <div className="flex justify-center gap-4 mt-6 flex-wrap">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Barcode
                </Button>
                <Button variant="outline" onClick={handleSave}>
                  <Download className="w-4 h-4 mr-2" />
                  Save Barcode
                </Button>
                <Button onClick={handleClear}>
                  <X className="w-4 h-4 mr-2" />
                  Clear and Add New Tree
                </Button>
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
                      <div className="text-gray-600">
                        <div>Latitude: {latitude.toFixed(6)}</div>
                        <div>Longitude: {longitude.toFixed(6)}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" className="w-full" size="lg">
                    <BarcodeIcon className="w-5 h-5 mr-2" />
                    Save & Generate Barcode
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