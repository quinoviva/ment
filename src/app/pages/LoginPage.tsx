import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { storage } from '../utils/storage';
import { initializeSampleData } from '../utils/sampleData';
import { toast } from 'sonner';
import { TreePine, Lock, User } from 'lucide-react';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = storage.login(username, password);
      
      if (user) {
        toast.success(`Welcome, ${username}!`);
        if (user.role === 'field_user') {
          navigate('/field-user');
        } else {
          navigate('/admin');
        }
      } else {
        toast.error('Invalid credentials');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <TreePine className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl">MENRO</CardTitle>
          <CardDescription>
            Municipal Environment and Natural Resources Office
            <br />
            Tree Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div><strong>Field User:</strong> field_user / field2026</div>
              <div><strong>Admin User:</strong> admin_user / admin2026</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}