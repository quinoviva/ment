import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { initializeSampleData } from '../utils/sampleData';
import { toast } from 'sonner';
import { TreePine, Lock, User } from 'lucide-react';

// Import Firebase functions and config
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'; // Firestore imports
<<<<<<< HEAD
import { app } from "../../firebase/firebase";
=======
import { app } from '../../firebase/firebase'; // Import initialized app
>>>>>>> 4fecdb78710441e337feaf67abf3ce0f9e71046c
import { storage, User as AppUser } from '../utils/storage'; // Rename User to AppUser to avoid conflict

const auth = getAuth(app); // Initialize Firebase Auth
const db = getFirestore(app); // Initialize Firestore

export function LoginPage() {
  const [username, setUsername] = useState(''); // For Firebase, this will be email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => { // Made async
    e.preventDefault();
    setIsLoading(true);

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const firebaseUser = userCredential.user;

      // Fetch user role from Firestore using UID
      const userProfile = await storage.fetchUserByUid(firebaseUser.uid);

      let appUserRole: AppUser['role'];
      if (userProfile && userProfile.role) {
        appUserRole = userProfile.role;
      } else {
        // Fallback or error handling if role is not found
        console.error(`Role not found for user ${firebaseUser.uid}. Defaulting to field_user.`);
        appUserRole = 'field_user'; // Default role, or could throw an error
        // Optionally, could also create a default user profile in Firestore here if it doesn't exist
      }

      // Create a user object conforming to our AppUser interface
      const user: AppUser = {
        username: firebaseUser.email || username, // Use email from Firebase Auth
        
        role: appUserRole,
      };

      storage.setCurrentUser(user); // Save user info to local storage for app-wide access
      toast.success(`Welcome, ${user.username}!`);
      
      if (user.role === 'field_user') {
        navigate('/field-user');
      } else {
        navigate('/admin');
      }
    } catch (error: any) {
      console.error("Firebase login error:", error);
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
              <Label htmlFor="username">Email</Label> {/* Changed label and placeholder to Email */}
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="username"
                  type="email" // Changed to type="email" for better input handling
                  placeholder="Enter email"
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
            <p className="text-sm text-gray-600 mb-2">Demo Credentials (for Firebase Auth):</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div><strong>Field User:</strong> field_user@example.com / field2026</div> {/* Using example.com for email */}
              <div><strong>Admin User:</strong> admin_user@example.com / admin2026</div> {/* Using example.com for email */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}