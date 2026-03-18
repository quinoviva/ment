import { useState, useEffect } from 'react';
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
import { Plus, Search, User, Trash2, Pencil, RefreshCw, X } from 'lucide-react';

// Assume storage.ts will be updated to handle user operations from Firestore
// For now, using placeholder data and simulating operations.
import { storage, User as AppUser } from '../../utils/storage'; 

// Placeholder for user roles
const USER_ROLES = ['field_user', 'admin_user'] as const;

export function AdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  const [newUserFormData, setNewUserFormData] = useState({
    email: '',
    password: '',
    role: 'field_user' as AppUser['role'],
  });

  useEffect(() => {
    // Fetch users from storage (will be replaced by Firestore later)
    const fetchAndSetUsers = async () => {
      // Placeholder: In a real app, this would fetch from Firestore using a new storage.getUsers() method
      // For now, simulating with dummy data to populate the table.
      // const fetchedUsers = await storage.getUsers(); // Assuming storage.getUsers() will be implemented
      const fetchedUsers: AppUser[] = [
        { username: 'admin_user@example.com', role: 'admin_user' },
        { username: 'field_user@example.com', role: 'field_user' },
        { username: 'another_field@example.com', role: 'field_user' },
      ];
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
    };
    fetchAndSetUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleAddUser = async () => {
    if (!newUserFormData.email || !newUserFormData.password || !newUserFormData.role) {
      toast.error('Please fill in all fields.');
      return;
    }

    // TODO: Implement actual user creation via Firebase Auth and Firestore
    // This part will need significant updates to interact with Firebase Authentication and Firestore.
    // For now, this is a placeholder that adds to local state and simulates saving.
    const newUser: AppUser = {
      username: newUserFormData.email,
      role: newUserFormData.role,
    };

    // Simulate adding user to storage/backend
    setUsers(prevUsers => [...prevUsers, newUser]);
    setFilteredUsers(prevUsers => [...prevUsers, newUser]); // Update filtered list too

    toast.success(`User ${newUser.username} added successfully!`);
    setIsAddUserDialogOpen(false);
    setNewUserFormData({ email: '', password: '', role: 'field_user' }); // Reset form
  };

  const handleInputChange = (field: keyof typeof newUserFormData, value: string) => {
    setNewUserFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">User Management</h1>
            <p className="text-gray-600">Manage user accounts</p>
          </div>
          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>List of all registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username (Email)</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Add edit/delete actions if needed later */}
                        <Button variant="ghost" size="sm" disabled> {/* Temporarily disable actions */}
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" disabled> {/* Temporarily disable actions */}
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No users found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Enter details for the new user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={newUserFormData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="add-password">Password</Label>
              <Input
                id="add-password"
                type="password"
                value={newUserFormData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newUserFormData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger id="add-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
