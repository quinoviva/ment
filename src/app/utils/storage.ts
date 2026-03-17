export interface TreeData {
  id: string;
  name: string;
  species: string;
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead';
  age: number;
  latitude: number;
  longitude: number;
  dateAdded: string;
  addedBy: string;
}

export interface User {
  username: string;
  role: 'field_user' | 'admin_user';
}

const TREES_STORAGE_KEY = 'menro_trees';
const CURRENT_USER_KEY = 'menro_current_user';

export const storage = {
  // Tree data operations
  getTrees(): TreeData[] {
    const data = localStorage.getItem(TREES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addTree(tree: TreeData): void {
    const trees = this.getTrees();
    trees.push(tree);
    localStorage.setItem(TREES_STORAGE_KEY, JSON.stringify(trees));
  },

  updateTree(id: string, updatedTree: Partial<TreeData>): void {
    const trees = this.getTrees();
    const index = trees.findIndex(t => t.id === id);
    if (index !== -1) {
      trees[index] = { ...trees[index], ...updatedTree };
      localStorage.setItem(TREES_STORAGE_KEY, JSON.stringify(trees));
    }
  },

  deleteTree(id: string): void {
    const trees = this.getTrees();
    const filtered = trees.filter(t => t.id !== id);
    localStorage.setItem(TREES_STORAGE_KEY, JSON.stringify(filtered));
  },

  getTreeById(id: string): TreeData | undefined {
    const trees = this.getTrees();
    return trees.find(t => t.id === id);
  },

  // User operations
  getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Authentication
  login(username: string, password: string): User | null {
    const credentials = {
      field_user: { password: 'field2026', role: 'field_user' as const },
      admin_user: { password: 'admin2026', role: 'admin_user' as const },
    };

    const userCred = credentials[username as keyof typeof credentials];
    if (userCred && userCred.password === password) {
      const user: User = { username, role: userCred.role };
      this.setCurrentUser(user);
      return user;
    }
    return null;
  },
};
