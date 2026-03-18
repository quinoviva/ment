import { useState, useEffect } from 'react';
import { storage, TreeData, User as AppUser } from '../../utils/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { User, Shield, Calendar, Activity } from 'lucide-react';

export function AdminProfile() {
  const [user, setUser] = useState<AppUser | null>(storage.getCurrentUser());
  const [trees, setTrees] = useState<TreeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const currentUser = storage.getCurrentUser();
      setUser(currentUser);
      
      try {
        const fetchedTrees = await storage.getTrees();
        setTrees(fetchedTrees);
      } catch (error) {
        console.error("Error fetching trees:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = {
    totalTrees: trees.length,
    addedByUser: trees.filter(t => t.addedBy === user?.username).length,
    healthyTrees: trees.filter(t => t.healthStatus === 'Excellent' || t.healthStatus === 'Good').length,
    needAttention: trees.filter(t => t.healthStatus === 'Fair' || t.healthStatus === 'Poor').length,
  };

  if (!user) return null;
  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-6">Profile</h1>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Username</label>
                  <p className="text-lg font-medium">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <div className="mt-1">
                    <Badge className="bg-blue-600">
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role === 'admin_user' ? 'Administrator' : 'Field User'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Account Type</label>
                  <p className="text-sm">MENRO Tree Management System</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Trees in System</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.totalTrees}</div>
              <p className="text-xs text-gray-500 mt-1">All registered trees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Trees Added by Me</CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.addedByUser}</div>
              <p className="text-xs text-gray-500 mt-1">Your contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Healthy Trees</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.healthyTrees}</div>
              <p className="text-xs text-gray-500 mt-1">Excellent & Good condition</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Need Attention</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.needAttention}</div>
              <p className="text-xs text-gray-500 mt-1">Fair & Poor condition</p>
            </CardContent>
          </Card>
        </div>

        {/* Permissions & Access */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions & Access</CardTitle>
            <CardDescription>Your system capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">View Tree Database</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Edit Tree Records</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Delete Tree Records</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">View Map Interface</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Export Reports</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="mt-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">System Information</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>MENRO Tree Management System</span>
            </div>
            <div>Municipal Environment and Natural Resources Office</div>
            <div>© 2026 - All rights reserved</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
