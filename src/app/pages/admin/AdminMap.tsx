import { useState, useEffect } from 'react';
import { storage, TreeData } from '../../utils/storage';
import { TreeMap } from '../../components/TreeMap';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, MapPin, TreePine, RefreshCw, X, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function AdminMap() {
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [filteredTrees, setFilteredTrees] = useState<TreeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleTreeClick = (tree: TreeData) => {
    setSelectedTreeId(tree.id);
  };

  const handleSearchResultClick = (tree: TreeData) => {
    setSelectedTreeId(tree.id);
  };

  const getHealthStatusColor = (status: TreeData['healthStatus']) => {
    switch (status) {
      case 'Excellent': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'Good':      return 'bg-sky-500 hover:bg-sky-600';
      case 'Fair':      return 'bg-amber-500 hover:bg-amber-600';
      case 'Poor':      return 'bg-orange-500 hover:bg-orange-600';
      case 'Dead':      return 'bg-slate-500 hover:bg-slate-600';
      default:          return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* Enhanced Header */}
      <div className="p-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tree Inventory Map</h1>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Monitoring {filteredTrees.length} of {trees.length} active specimens
            </p>
          </div>
          {/* <Button 
            onClick={loadTrees} 
            variant="outline" 
            size="sm" 
            disabled={isLoading}
            className="shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Data
          </Button> */}
        </div>

        {/* Enhanced Search Bar */}
        <div className="max-w-2xl relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            type="text"
            placeholder="Search by name, species, or health condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-12 h-11 bg-slate-100/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Search Results Sidebar with Smooth Entry */}
        <div className={`transition-all duration-300 ease-in-out border-r bg-white overflow-hidden flex flex-col ${searchQuery ? 'w-80 opacity-100' : 'w-0 opacity-0'}`}>
          <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              Matches ({filteredTrees.length})
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3 custom-scrollbar">
            {filteredTrees.map(tree => (
              <Card
                key={tree.id}
                className={`p-4 cursor-pointer border-l-4 transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${
                  selectedTreeId === tree.id 
                    ? 'ring-1 ring-emerald-500 border-l-emerald-500 bg-emerald-50/30' 
                    : 'border-l-transparent hover:border-l-slate-300'
                }`}
                onClick={() => handleSearchResultClick(tree)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                      <TreePine className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm leading-tight">{tree.name}</span>
                  </div>
                  <Badge variant="secondary" className={`${getHealthStatusColor(tree.healthStatus)} text-white border-none text-[10px] font-bold px-2 py-0.5 shadow-sm`}>
                    {tree.healthStatus.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 italic">{tree.species}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-100 w-fit px-2 py-1 rounded-md">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span className="font-mono">{tree.latitude.toFixed(5)}, {tree.longitude.toFixed(5)}</span>
                  </div>
                </div>
              </Card>
            ))}
            {filteredTrees.length === 0 && !isLoading && (
              <div className="text-center py-12 px-4">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-slate-900 font-semibold mb-1">No matches found</h4>
                <p className="text-sm text-slate-500">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {trees.length > 0 ? (
            <TreeMap
              trees={filteredTrees}
              selectedTreeId={selectedTreeId}
              onTreeClick={handleTreeClick}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-50">
              <div className="text-center max-w-xs animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                  <MapPin className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Map is empty</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Connect to a data source or wait for field users to sync their tree registrations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modernized Legend Footer */}
      <div className="px-6 py-4 border-t bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Index</div>
          {(['Excellent', 'Good', 'Fair', 'Poor', 'Dead'] as const).map(status => (
            <div key={status} className="flex items-center gap-2.5 group cursor-default">
              <div className={`w-3.5 h-3.5 rounded-full ring-2 ring-offset-2 ring-transparent group-hover:ring-slate-200 transition-all ${getHealthStatusColor(status).split(' ')[0]}`} />
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{status}</span>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}