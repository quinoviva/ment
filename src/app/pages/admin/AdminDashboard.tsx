import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router';
import { storage } from '../../utils/storage';
import { Button } from '../../components/ui/button';
import { TreePine, Home, Map, Database, User, LogOut, Users } from 'lucide-react'; // Added Users icon
import { toast } from 'sonner';

export function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(storage.getCurrentUser());

  useEffect(() => {
    if (!user || user.role !== 'admin_user') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const handleLogout = () => {
    storage.logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="/img/Pototan-logo.png" 
                alt="Municipality of Pototan Logo" 
                className="w-8 h-8 object-contain" 
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold">MENRO Admin</h1>
              <p className="text-xs text-gray-500">{user.username}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Link to="/admin">
              <Button
                variant={isActive('/admin') ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Home className="w-4 h-4 mr-3" />
                Home
              </Button>
            </Link>
            <Link to="/admin/map">
              <Button
                variant={isActive('/admin/map') ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Map className="w-4 h-4 mr-3" />
                Map View
              </Button>
            </Link>
            <Link to="/admin/database">
              <Button
                variant={isActive('/admin/database') ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Database className="w-4 h-4 mr-3" />
                Database
              </Button>
            </Link>
            <Link to="/admin/profile">
              <Button
                variant={isActive('/admin/profile') ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </Button>
            </Link>
            {/* New Link for User Management */}
            <Link to="/admin/users">
              <Button
                variant={isActive('/admin/users') ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Users className="w-4 h-4 mr-3" />
                Users
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button
                variant={isActive('/admin/reports') ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <TreePine className="w-4 h-4 mr-3" />
                Reports
              </Button>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
