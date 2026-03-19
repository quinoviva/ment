import { useState, useEffect, useRef } from 'react';
import { storage, TreeData } from '../../utils/storage';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, MapPin, RefreshCw, Eye, Search, Download, Printer, Barcode as BarcodeIcon } from 'lucide-react';
import Barcode from 'react-barcode';
import { useZxing } from "react-zxing";
import { getTreePublicViewUrl, getQRCodeApiUrl } from '../../utils/qrUtils';

const TREE_SPECIES = [
  'Narra', 'Mahogany', 'Acacia', 'Mango', 'Ipil-ipil',
  'Molave', 'Pine', 'Bamboo', 'Coconut', 'Banana',
  'Jackfruit', 'Tamarind', 'Dao', 'Yakal', 'Teak',
];

export function AdminDatabase() {
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [filteredTrees, setFilteredTrees] = useState<TreeData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTree, setEditingTree] = useState<TreeData | null>(null);
  const [viewingTree, setViewingTree] = useState<TreeData | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [treeToDelete, setTreeToDelete] = useState<TreeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const barcodeRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    healthStatus: 'Good' as TreeData['healthStatus'],
    age: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadTrees();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTrees(trees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = trees.filter(tree =>
        tree.name.toLowerCase().includes(query) ||
        tree.id.toLowerCase().includes(query) ||
        tree.species.toLowerCase().includes(query) ||
        tree.healthStatus.toLowerCase().includes(query) ||
        tree.addedBy.toLowerCase().includes(query)
      );
      setFilteredTrees(filtered);
    }
  }, [searchQuery, trees]);

  // Barcode Scanner Hook
  const { ref: scannerRef } = useZxing({
    onDecodeResult(result) {
      if (result) {
        if ('vibrate' in navigator) navigator.vibrate(200);
        setSearchQuery(result.getText());
        setIsScannerOpen(false);
        toast.success("Barcode scanned and searched!");
      }
    },
    async onError(error: any) {
      console.error("Scanner error:", error);
      if (isScannerOpen) {
        // More specific error handling
        if (!window.isSecureContext) {
          toast.error("Barcode scanning requires a secure context (HTTPS or localhost).");
          return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error("Your browser does not support camera access APIs.");
          return;
        }

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          toast.error("Camera access denied. Please grant permission in your browser settings.");
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          // If environment fails, try listing devices to see if any camera exists
          try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(d => d.kind === 'videoinput');
            if (cameras.length === 0) {
              toast.error("No camera hardware detected on this device.");
            } else {
              toast.error(`Camera found but could not be initialized. Found ${cameras.length} cameras.`);
            }
          } catch (e) {
            toast.error("No camera detected on this device.");
          }
        } else if (error.name === 'OverconstrainedError') {
          toast.error("The camera constraints are not supported by your device.");
        } else {
          toast.error(`Camera error: ${error.message || "Please ensure permissions are granted."}`);
        }
      }
    },
    paused: !isScannerOpen,
    constraints: { 
      video: true // Simple constraint for better detection fallback
    }
  });

  const loadTrees = async () => {
    setIsLoading(true);
    try {
      const data = await storage.getTrees();
      setTrees(data);
      setFilteredTrees(data);
    } catch (error) {
      console.error("Error loading trees:", error);
      toast.error("Failed to load trees.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tree: TreeData) => {
    setEditingTree(tree);
    setFormData({
      name: tree.name,
      species: tree.species,
      healthStatus: tree.healthStatus,
      age: tree.age.toString(),
      latitude: tree.latitude.toString(),
      longitude: tree.longitude.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (tree: TreeData) => {
    setViewingTree(tree);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (tree: TreeData) => {
    setTreeToDelete(tree);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (treeToDelete) {
      try {
        await storage.deleteTree(treeToDelete.id);
        toast.success('Tree deleted successfully');
        loadTrees();
      } catch (error) {
        console.error("Error deleting tree:", error);
        toast.error("Failed to delete tree.");
      } finally {
        setIsDeleteDialogOpen(false);
        setTreeToDelete(null);
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingTree) return;

    const updatedTree: Partial<TreeData> = {
      name: formData.name,
      species: formData.species,
      healthStatus: formData.healthStatus,
      age: parseInt(formData.age),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    try {
      await storage.updateTree(editingTree.id, updatedTree);
      toast.success('Tree updated successfully');
      loadTrees();
    } catch (error) {
      console.error("Error updating tree:", error);
      toast.error("Failed to update tree.");
    } finally {
      setIsEditDialogOpen(false);
      setEditingTree(null);
    }
  };

  const handleDownloadBarcode = () => {
    if (!barcodeRef.current || !viewingTree) return;
    
    const svg = barcodeRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `barcode-${viewingTree.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success('Barcode downloaded successfully');
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleDownloadQRCode = () => {
    if (!viewingTree) return;
    const publicUrl = getTreePublicViewUrl(viewingTree.id);
    const qrCodeUrl = getQRCodeApiUrl(publicUrl, 300);
    
    // Create a temporary link to download the image from the API
    fetch(qrCodeUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qrcode-${viewingTree.id}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('QR Code downloaded successfully');
      })
      .catch(() => toast.error('Failed to download QR Code'));
  };

  const handlePrintBarcode = () => {
    if (!barcodeRef.current || !viewingTree) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Barcode - ${viewingTree.name}</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; flex-direction: column; font-family: sans-serif; }
              .label { margin-top: 10px; font-weight: bold; }
            </style>
          </head>
          <body>
            ${barcodeRef.current.innerHTML}
            <div class="label">${viewingTree.name} (${viewingTree.id})</div>
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
    if (!viewingTree) return;
    const publicUrl = getTreePublicViewUrl(viewingTree.id);
    const qrCodeUrl = getQRCodeApiUrl(publicUrl, 300);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${viewingTree.name}</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; flex-direction: column; font-family: sans-serif; text-align: center; }
              .label { margin-top: 15px; font-weight: bold; font-size: 20px; }
              .species { color: #666; font-size: 14px; margin-top: 5px; }
              .hint { margin-top: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee; pt-10px; }
            </style>
          </head>
          <body>
            <img src="${qrCodeUrl}" width="250" height="250" />
            <div class="label">${viewingTree.name}</div>
            <div class="species">${viewingTree.species}</div>
            <div class="hint">Scan to view tree details online</div>
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

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2 text-green-800 font-bold">MENRO Tree Management System</h1>
            <p className="text-gray-600">Manage all registered tree records</p>
          </div>
          <Button onClick={loadTrees} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search & Scan */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by ID, name, species, health, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setIsScannerOpen(true)}
            className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
          >
            <BarcodeIcon className="w-4 h-4 mr-2" />
            Scan to Search
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-green-100">
        <CardHeader className="bg-green-50/50">
          <CardTitle className="text-lg">Tree Database ({filteredTrees.length})</CardTitle>
          <CardDescription>Comprehensive list of tree inventory</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Health Status</TableHead>
                  <TableHead>Age (Years)</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrees.map((tree) => (
                  <TableRow key={tree.id} className="hover:bg-green-50/30">
                    <TableCell>
                      <div className="scale-75 origin-left -my-2 opacity-80 hover:opacity-100 transition-opacity">
                        <Barcode 
                          value={tree.id} 
                          width={1} 
                          height={30} 
                          fontSize={10}
                          displayValue={false}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-900">{tree.name}</TableCell>
                    <TableCell>{tree.species}</TableCell>
                    <TableCell>
                      <Badge className={`${getHealthStatusColor(tree.healthStatus)} border-none text-white`}>
                        {tree.healthStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{tree.age}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 text-green-600" />
                        <span className="truncate max-w-[100px]">
                          {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm italic text-gray-600">{tree.addedBy}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(tree.dateAdded).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(tree)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tree)}
                          title="Edit Tree"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(tree)}
                          title="Delete Tree"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredTrees.length === 0 && !isLoading && (
              <div className="text-center py-20 text-gray-400">
                <BarcodeIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No tree records match your criteria</p>
              </div>
            )}
            {isLoading && (
              <div className="text-center py-20 text-green-600">
                <RefreshCw className="w-10 h-10 mx-auto mb-4 animate-spin opacity-50" />
                <p>Retrieving tree database...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode or QR Code</DialogTitle>
            <DialogDescription>Point your camera at a tree barcode or QR code to find it in the database</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <video 
              ref={scannerRef} 
              autoPlay
              playsInline
              muted
              className="rounded-lg border-2 border-dashed border-green-300 w-full aspect-video object-cover" 
            />
            <p className="mt-4 text-sm text-gray-500 text-center">
              Align the code within the frame for automatic detection.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScannerOpen(false)} className="w-full">
              Cancel Scan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {/* View Dialog */}
<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
  {/* Changed max-w-md to sm:max-w-2xl for better horizontal fit */}
  <DialogContent className="sm:max-w-6xl">
    <DialogHeader>
      <DialogTitle className="text-xl text-green-800">Tree Record Details</DialogTitle>
    </DialogHeader>
    {viewingTree && (
      <div className="space-y-6">
        {/* Barcode and QR Code Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Barcode Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-green-50/50 rounded-xl border border-dashed border-green-200">
            <p className="text-[10px] font-bold text-green-700 uppercase mb-3">Inventory Barcode</p>
            <div ref={barcodeRef} className="bg-white p-4 rounded-lg shadow-sm">
              <Barcode 
                value={viewingTree.id} 
                width={1.5} 
                height={60} 
                fontSize={12}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleDownloadBarcode} className="h-8 text-[10px] border-green-200 text-green-700 hover:bg-green-100">
                <Download className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintBarcode} className="h-8 text-[10px] border-green-200 text-green-700 hover:bg-green-100">
                <Printer className="w-3 h-3 mr-1" />
                Print
              </Button>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-xl border border-dashed border-blue-200">
            <p className="text-[10px] font-bold text-blue-700 uppercase mb-3">Public View QR Code</p>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/view/${viewingTree.id}`)}`} 
                alt="QR Code"
                className="w-[120px] h-[120px]"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleDownloadQRCode} className="h-8 text-[10px] border-blue-200 text-blue-700 hover:bg-blue-100">
                <Download className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintQRCode} className="h-8 text-[10px] border-blue-200 text-blue-700 hover:bg-blue-100">
                <Printer className="w-3 h-3 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </div>

        {/* Tree Information Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-1">
            <Label className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Tree Name</Label>
            <p className="font-semibold text-green-900">{viewingTree.name}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Species</Label>
            <p className="font-semibold text-green-900">{viewingTree.species}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Condition</Label>
            <div className="mt-0.5">
              <Badge className={`${getHealthStatusColor(viewingTree.healthStatus)} border-none text-white text-[10px] px-2 h-5`}>
                {viewingTree.healthStatus}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Estimated Age</Label>
            <p className="font-semibold text-green-900">{viewingTree.age} years</p>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Coordinates</Label>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-green-600" />
              <p className="text-xs font-mono text-gray-600">
                {viewingTree.latitude.toFixed(6)}, {viewingTree.longitude.toFixed(6)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Registered By</Label>
            <p className="font-semibold text-green-900">{viewingTree.addedBy}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Registration Timestamp</Label>
            <p className="text-xs text-gray-600">{new Date(viewingTree.dateAdded).toLocaleString()}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">System Tracking ID</Label>
            <p className="text-[10px] text-gray-500 font-mono break-all bg-gray-100 p-2 rounded border border-gray-200">
              {viewingTree.id}
            </p>
          </div>
        </div>
      </div>
    )}
    <DialogFooter className="mt-8">
      <Button onClick={() => setIsViewDialogOpen(false)} className="w-full bg-green-700 hover:bg-green-800">Close Record</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tree Record</DialogTitle>
            <DialogDescription>Modify existing tree data in the central database</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Tree Name / Identifier</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="focus-visible:ring-green-500"
              />
            </div>
            <div>
              <Label htmlFor="edit-species">Species</Label>
              <Select value={formData.species} onValueChange={(value) => setFormData({ ...formData, species: value })}>
                <SelectTrigger id="edit-species" className="focus:ring-green-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TREE_SPECIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Health Status Condition</Label>
              <RadioGroup
                value={formData.healthStatus}
                onValueChange={(value) => setFormData({ ...formData, healthStatus: value as TreeData['healthStatus'] })}
                className="grid grid-cols-2 gap-2"
              >
                {(['Excellent', 'Good', 'Fair', 'Poor', 'Dead'] as const).map((status) => (
                  <div key={status} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                    <RadioGroupItem value={status} id={`edit-${status}`} className="text-green-600 border-green-200" />
                    <Label htmlFor={`edit-${status}`} className="cursor-pointer text-sm">{status}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label htmlFor="edit-age">Age (Yrs)</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="focus-visible:ring-green-500"
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="edit-latitude">Lat</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="focus-visible:ring-green-500"
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="edit-longitude">Long</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="focus-visible:ring-green-500"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Discard Changes
            </Button>
            <Button onClick={handleUpdate} className="bg-green-700 hover:bg-green-800">Save Updates</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700">Permanent Record Deletion</DialogTitle>
            <DialogDescription>
              Warning: This action will permanently remove this tree record from the global database.
            </DialogDescription>
          </DialogHeader>
          {treeToDelete && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-100 my-2">
              <p className="font-bold text-red-900">{treeToDelete.name}</p>
              <p className="text-xs text-red-700 mt-1">Species: {treeToDelete.species} | Tracking ID: {treeToDelete.id}</p>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}