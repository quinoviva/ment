import { initializeApp } from "firebase/app"; // Assuming this is needed for app instance
import { getAuth, signOut, UserCredential, User as FirebaseUser } from 'firebase/auth'; // Import signOut and FirebaseUser
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { app } from '../firebase/firebase'; // Import initialized app from firebase.ts

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

// User interface for application state, not directly Firebase User object
export interface User {
  username: string; // This might be email or display name from Firebase
  role: 'field_user' | 'admin_user';
}

// Removed TREES_STORAGE_KEY as data will be in Firestore
const CURRENT_USER_KEY = 'menro_current_user';

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export const storage = {
  // Tree data operations (already migrated to Firestore in previous step)
  async getTrees(): Promise<TreeData[]> {
    const treesCollectionRef = collection(db, 'trees');
    const querySnapshot: QuerySnapshot = await getDocs(treesCollectionRef);
    const trees: TreeData[] = [];
    querySnapshot.forEach((doc: DocumentSnapshot) => {
      // Safely cast data and add ID
      const treeData = doc.data() as TreeData; // Assuming Firestore data matches TreeData shape including ID
      trees.push({ ...treeData, id: doc.id });
    });
    return trees;
  },

  async addTree(tree: TreeData): Promise<void> {
    const treesCollectionRef = collection(db, 'trees');
    // Using setDoc with the client-generated ID to maintain consistency
    await setDoc(doc(db, 'trees', tree.id), tree);
  },

  async updateTree(id: string, updatedTree: Partial<TreeData>): Promise<void> {
    const treeDocRef = doc(db, 'trees', id);
    await updateDoc(treeDocRef, updatedTree);
  },

  async deleteTree(id: string): Promise<void> {
    const treeDocRef = doc(db, 'trees', id);
    await deleteDoc(treeDocRef);
  },

  async getTreeById(id: string): Promise<TreeData | undefined> {
    const treeDocRef = doc(db, 'trees', id);
    const docSnap = await getDoc(treeDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as TreeData; // Assuming all fields are present
      return { ...data, id: docSnap.id }; // Add the Firestore document ID
    }
    return undefined;
  },

  // User operations
  getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  async logout(): Promise<void> { // Make async to await signOut
    localStorage.removeItem(CURRENT_USER_KEY);
    try {
      await signOut(auth); // Sign out from Firebase Auth
      console.log("User signed out from Firebase Auth.");
    } catch (error) {
      console.error("Error signing out from Firebase Auth:", error);
      // Optionally, show a toast or handle error
    }
  },

  // Function to fetch user role from Firestore
  async fetchUserRole(uid: string): Promise<User['role'] | undefined> {
    try {
      const usersCollectionRef = collection(db, 'users');
      // Query for the user by their Firebase UID
      const q = query(usersCollectionRef, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // Assuming UID is unique
        const userData = userDoc.data();
        // Ensure the role field exists and has a valid value
        if (userData && userData.role && ['field_user', 'admin_user'].includes(userData.role)) {
          return userData.role;
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
    return undefined; // Return undefined if user not found or role is invalid
  },

  // Removed obsolete login function as Firebase Auth is used in LoginPage.tsx
};
