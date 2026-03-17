import { useState, useEffect } from 'react';
import { storage, TreeData } from '../../utils/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { TreePine, TrendingUp, Activity, MapPin, Barcode as BarcodeIcon } from 'lucide-react';
import { toast } from 'sonner';
import { BarcodeScanner } from 'react-zxing';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export function AdminHome() {
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedTree, setScannedTree] = useState<TreeData | null>(null);

  useEffect(() => {
    loadTrees();
  }, []);

  const loadTrees = () => {
    const data = storage.getTrees();
    setTrees(data);
  };

  const handleBarcodeScan = (result: any) => {
    if (result) {
      const treeId = result.getText();
      const tree = storage.getTreeById(treeId);
      if (tree) {
        setScannedTree(tree);
        toast.success('Barcode scanned successfully!');
      } else {
        toast.error('Tree not found for the scanned barcode.');
      }
      setIsScannerOpen(false);
    }
  };

  const getHealthStatusColor = (status: TreeData['healthStatus']) => {
    switch (status) {
      case 'Excellent': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      case 'Fair': return 'bg-yellow-500';
      case 'Poor': return 'bg-orange-500';
      case 'Dead': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const healthCounts = {
    Excellent: trees.filter(t => t.healthStatus === 'Excellent').length,
    Good: trees.filter(t => t.healthStatus === 'Good').length,
    Fair: trees.filter(t => t.healthStatus === 'Fair').length,
    Poor: trees.filter(t => t.healthStatus === 'Poor').length,
    Dead: trees.filter(t => t.healthStatus === 'Dead').length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor and manage tree inventory</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Trees</CardTitle>
            <TreePine className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{trees.length}</div>
            <p className="text-xs text-gray-500 mt-1">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Healthy Trees</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{healthCounts.Excellent + healthCounts.Good}</div>
            <p className="text-xs text-gray-500 mt-1">Excellent & Good condition</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Need Attention</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{healthCounts.Fair + healthCounts.Poor}</div>
            <p className="text-xs text-gray-500 mt-1">Fair & Poor condition</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Dead Trees</CardTitle>
            <TreePine className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{healthCounts.Dead}</div>
            <p className="text-xs text-gray-500 mt-1">Require removal</p>
          </CardContent>
        </Card>
      </div>

      {/* Barcode Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Barcode Scanner</CardTitle>
            <CardDescription>Scan a tree's barcode to view its information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsScannerOpen(true)}
              className="w-full"
              size="lg"
            >
              <BarcodeIcon className="w-5 h-5 mr-2" />
              Scan Barcode
            </Button>
          </CardContent>
        </Card>

        {/* Scanned Tree Data */}
        {scannedTree && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarcodeIcon className="w-5 h-5 text-green-600" />
                Scanned Tree Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Tree Name:</span>
                  <p className="font-medium">{scannedTree.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Species:</span>
                  <p className="font-medium">{scannedTree.species}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Health Status:</span>
                  <div className="mt-1">
                    <Badge className={getHealthStatusColor(scannedTree.healthStatus)}>
                      {scannedTree.healthStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Age:</span>
                  <p className="font-medium">{scannedTree.age} years</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Location:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-sm">{scannedTree.latitude.toFixed(6)}, {scannedTree.longitude.toFixed(6)}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Added By:</span>
                  <p className="font-medium">{scannedTree.addedBy}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Date Added:</span>
                  <p className="text-sm">{new Date(scannedTree.dateAdded).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Health Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Health Status Distribution</CardTitle>
          <CardDescription>Overview of tree conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(healthCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{status}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full ${getHealthStatusColor(status as TreeData['healthStatus'])} flex items-center justify-end pr-3 text-white text-sm transition-all`}
                    style={{ width: trees.length > 0 ? `${(count / trees.length) * 100}%` : '0%' }}
                  >
                    {count > 0 && count}
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {trees.length > 0 ? Math.round((count / trees.length) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
          </DialogHeader>
          <BarcodeScanner onResult={handleBarcodeScan} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
