import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { storage, TreeData } from '../utils/storage';
import { nfcUtils } from '../utils/nfc';
import { NFCInstructions } from '../components/NFCInstructions';
import { toast } from 'sonner';
import { MapPin, TreePine, LogOut, Wifi, WifiOff, Tag, HelpCircle } from 'lucide-react';

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
  const [showInstructions, setShowInstructions] = useState(false);

  // Form state
  const [treeName, setTreeName] = useState('');
  const [species, setSpecies] = useState('');
  const [healthStatus, setHealthStatus] = useState<TreeData['healthStatus']>('Good');
  const [age, setAge] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isWritingNFC, setIsWritingNFC] = useState(false);

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
    toast.success('Tree data saved to database');

    // Write to NFC tag
    if (nfcUtils.isSupported()) {
      setIsWritingNFC(true);
      try {
        await nfcUtils.writeToTag(treeData);
        toast.success('Tree data written to NFC tag! You can remove the tag now.');
        
        // Reset form
        setTreeName('');
        setSpecies('');
        setHealthStatus('Good');
        setAge('');
        setLatitude(null);
        setLongitude(null);
      } catch (error: any) {
        toast.error(`NFC Error: ${error.message}`);
      } finally {
        setIsWritingNFC(false);
      }
    } else {
      toast.warning('NFC not supported. Data saved to database only.');
      
      // Reset form
      setTreeName('');
      setSpecies('');
      setHealthStatus('Good');
      setAge('');
      setLatitude(null);
      setLongitude(null);
    }
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
            <Button variant="outline" size="sm" onClick={() => setShowInstructions(true)}>
              <HelpCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">NFC Help</span>
              <span className="sm:hidden">Help</span>
            </Button>
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

        {/* Quick Data Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tree Data Entry</CardTitle>
            <CardDescription>
              Fill in the tree information and write to NFC tag
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
                <Button type="submit" className="w-full" size="lg" disabled={isWritingNFC}>
                  {isWritingNFC ? (
                    <>
                      <Tag className="w-5 h-5 mr-2 animate-pulse" />
                      Writing to NFC Tag... Hold tag near device
                    </>
                  ) : (
                    <>
                      <Tag className="w-5 h-5 mr-2" />
                      Save & Write to NFC Tag
                    </>
                  )}
                </Button>
                {!nfcUtils.isSupported() && (
                  <p className="text-xs text-orange-600 mt-2 text-center">
                    ⚠️ NFC not available on this device. Data will be saved to database only.
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-900">
              <p className="mb-2">📱 <strong>Instructions:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Fill in all tree information fields</li>
                <li>Use the "Capture Location" button to get GPS coordinates</li>
                <li>Click "Save & Write to NFC Tag" to save data and write to tag</li>
                <li>Hold NFC tag near your device when prompted</li>
                <li>Works offline - data syncs when connection is restored</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NFC Instructions Dialog */}
      <NFCInstructions isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
}