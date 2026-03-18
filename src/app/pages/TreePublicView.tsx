import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { storage, TreeData } from '../utils/storage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, TreePine, Activity, Calendar, User, Info } from 'lucide-react';

export function TreePublicView() {
  const { treeId } = useParams<{ treeId: string }>();
  const [tree, setTree] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTree() {
      if (treeId) {
        try {
          const data = await storage.getTreeById(treeId);
          if (data) {
            setTree(data);
          }
        } catch (error) {
          console.error("Error fetching tree for public view:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchTree();
  }, [treeId]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <TreePine className="w-12 h-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading tree information...</p>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full border-red-100 shadow-lg">
          <CardContent className="pt-10 pb-10 text-center">
            <Info className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tree Not Found</h2>
            <p className="text-gray-600 mb-6">The tree record you are looking for does not exist or has been removed.</p>
            <div className="w-12 h-1 bg-red-100 mx-auto rounded-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Public Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white">
            <img 
              src="/img/Pototan-logo.png" 
              alt="MENRO Logo" 
              className="w-14 h-14 object-contain" 
            />
          </div>
          <h1 className="text-3xl font-extrabold text-green-900 tracking-tight">MENRO Pototan</h1>
          <p className="text-green-700 font-medium uppercase text-sm tracking-widest mt-1">Tree Management System</p>
        </div>

        {/* Tree Identity Card */}
        <Card className="overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-green-700 p-8 text-white relative overflow-hidden">
             {/* Decorative leaf patterns could be added here */}
             <div className="relative z-10">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1 mb-3 backdrop-blur-md">
                   Official Registry Record
                </Badge>
                <h2 className="text-4xl font-black mb-1">{tree.name}</h2>
                <p className="text-green-100 text-lg opacity-90 italic">{tree.species}</p>
             </div>
             <TreePine className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/10" />
          </div>
          <CardContent className="p-8 space-y-8 bg-white">
            {/* Health Status Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${getHealthStatusColor(tree.healthStatus)} text-white shadow-lg`}>
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Health Condition</p>
                  <p className="text-xl font-bold text-gray-800">{tree.healthStatus}</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Estimated Age</p>
                 <p className="text-xl font-bold text-green-700">{tree.age} <span className="text-sm font-medium text-gray-500">Years</span></p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Location Coordinates</p>
                  <p className="text-gray-800 font-mono text-sm bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {tree.latitude.toFixed(6)}, {tree.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Registration Date</p>
                  <p className="text-gray-800 font-semibold">
                    {new Date(tree.dateAdded).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Registered By</p>
                  <p className="text-gray-800 font-semibold">{tree.addedBy}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Info className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">System Tracking ID</p>
                  <p className="text-gray-500 font-mono text-[10px] break-all">{tree.id}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-dashed border-gray-200 text-center">
               <p className="text-gray-400 text-xs italic">
                 Official document of the Municipal Environment and Natural Resources Office of Pototan. <br /><br />
                 Generated on {new Date().toLocaleDateString()}.
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Attribution */}
        <div className="text-center py-6 text-gray-400 text-sm">
           &copy; 2026 MENRO Pototan - Municipality of Pototan
        </div>
      </div>
    </div>
  );
}
