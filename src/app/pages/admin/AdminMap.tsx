import { useState, useEffect } from 'react';
import { storage, TreeData } from '../../utils/storage';
import { TreeMap } from '../../components/TreeMap';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, MapPin, TreePine, RefreshCw } from 'lucide-react';

export function AdminMap() {
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [filteredTrees, setFilteredTrees] = useState<TreeData[]>([]);

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
        tree.healthStatus.toLowerCase().includes(query)
      );
      setFilteredTrees(filtered);
    }
  }, [searchQuery, trees]);

  const loadTrees = () => {
    const data = storage.getTrees();
    setTrees(data);
    setFilteredTrees(data);
  };

  const handleTreeClick = (tree: TreeData) => {
    setSelectedTreeId(tree.id);
  };

  const handleSearchResultClick = (tree: TreeData) => {
    setSelectedTreeId(tree.id);
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl mb-1">Tree Map View</h1>
            <p className="text-sm text-gray-600">
              Showing {filteredTrees.length} of {trees.length} trees
            </p>
          </div>
          <Button onClick={loadTrees} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by tree name, species, or health status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Search Results Sidebar */}
        {searchQuery && (
          <div className="w-80 border-r bg-white overflow-auto p-4">
            <h3 className="font-medium mb-3">Search Results ({filteredTrees.length})</h3>
            <div className="space-y-2">
              {filteredTrees.map(tree => (
                <Card
                  key={tree.id}
                  className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedTreeId === tree.id ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => handleSearchResultClick(tree)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">{tree.name}</span>
                    </div>
                    <Badge className={`${getHealthStatusColor(tree.healthStatus)} text-xs`}>
                      {tree.healthStatus}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{tree.species}</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredTrees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TreePine className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No trees found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="flex-1">
          {trees.length > 0 ? (
            <TreeMap
              trees={filteredTrees}
              selectedTreeId={selectedTreeId}
              onTreeClick={handleTreeClick}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg mb-2">No Trees Registered</h3>
                <p className="text-sm text-gray-500">
                  Trees added by field users will appear on this map
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="text-sm font-medium">Health Status Legend:</div>
          {(['Excellent', 'Good', 'Fair', 'Poor', 'Dead'] as const).map(status => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${getHealthStatusColor(status)}`} />
              <span className="text-sm">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
