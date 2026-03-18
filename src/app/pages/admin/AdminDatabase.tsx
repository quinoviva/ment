import { useState, useEffect } from 'react';
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
import { Pencil, Trash2, MapPin, RefreshCw, Eye, Search } from 'lucide-react';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [treeToDelete, setTreeToDelete] = useState<TreeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        tree.species.toLowerCase().includes(query) ||
        tree.healthStatus.toLowerCase().includes(query) ||
        tree.addedBy.toLowerCase().includes(query)
      );
      setFilteredTrees(filtered);
    }
  }, [searchQuery, trees]);

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
            <h1 className="text-3xl mb-2">Tree Database</h1>
            <p className="text-gray-600">Manage all tree records</p>
          </div>
          <Button onClick={loadTrees} variant="outline" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, species, health status, or added by..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Trees ({filteredTrees.length})</CardTitle>
          <CardDescription>Complete list of registered trees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableRow key={tree.id}>
                    <TableCell className="font-medium">{tree.name}</TableCell>
                    <TableCell>{tree.species}</TableCell>
                    <TableCell>
                      <Badge className={getHealthStatusColor(tree.healthStatus)}>
                        {tree.healthStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{tree.age}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">
                          {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{tree.addedBy}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(tree.dateAdded).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(tree)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tree)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(tree)}
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
              <div className="text-center py-12 text-gray-500">
                <p>No trees found</p>
              </div>
            )}
            {isLoading && (
              <div className="text-center py-12 text-gray-500">
                <p>Loading trees...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tree Details</DialogTitle>
          </DialogHeader>
          {viewingTree && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-600">Tree Name</Label>
                <p className="font-medium">{viewingTree.name}</p>
              </div>
              <div>
                <Label className="text-gray-600">Species</Label>
                <p className="font-medium">{viewingTree.species}</p>
              </div>
              <div>
                <Label className="text-gray-600">Health Status</Label>
                <div className="mt-1">
                  <Badge className={getHealthStatusColor(viewingTree.healthStatus)}>
                    {viewingTree.healthStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Age</Label>
                <p className="font-medium">{viewingTree.age} years</p>
              </div>
              <div>
                <Label className="text-gray-600">Location</Label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <p className="text-sm">
                    {viewingTree.latitude.toFixed(6)}, {viewingTree.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Added By</Label>
                <p className="font-medium">{viewingTree.addedBy}</p>
              </div>
              <div>
                <Label className="text-gray-600">Date Added</Label>
                <p className="text-sm">{new Date(viewingTree.dateAdded).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-gray-600">Tree ID</Label>
                <p className="text-xs text-gray-500 font-mono">{viewingTree.id}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tree</DialogTitle>
            <DialogDescription>Update tree information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tree Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-species">Species</Label>
              <Select value={formData.species} onValueChange={(value) => setFormData({ ...formData, species: value })}>
                <SelectTrigger id="edit-species">
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
              <Label>Health Status</Label>
              <RadioGroup
                value={formData.healthStatus}
                onValueChange={(value) => setFormData({ ...formData, healthStatus: value as TreeData['healthStatus'] })}
              >
                {(['Excellent', 'Good', 'Fair', 'Poor', 'Dead'] as const).map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <RadioGroupItem value={status} id={`edit-${status}`} />
                    <Label htmlFor={`edit-${status}`} className="cursor-pointer">{status}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="edit-age">Age (Years)</Label>
              <Input
                id="edit-age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-latitude">Latitude</Label>
              <Input
                id="edit-latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-longitude">Longitude</Label>
              <Input
                id="edit-longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Tree</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tree? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {treeToDelete && (
            <div className="p-4 bg-red-50 rounded-md">
              <p className="font-medium">{treeToDelete.name}</p>
              <p className="text-sm text-gray-600">{treeToDelete.species}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
