import { initializeApp } from "firebase/app"; // Assuming this is needed for app instance
import { getAuth, signOut, UserCredential, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth'; // Import signOut and FirebaseUser, createUserWithEmailAndPassword
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where, DocumentSnapshot, QuerySnapshot, Timestamp } from 'firebase/firestore'; // Firestore imports
import { app } from '../../firebase/firebase'; // Import initialized app from firebase.ts

export interface TreeData {
  id: string;
  name: string;
  species: string;
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dead';
  age: number;
  latitude: number;
  longitude: number;
  dateAdded: string; // Store as ISO string
  addedBy: string;
}

// User interface for application state, not directly Firebase User object
export interface User {
  username: string; // This will be the email from Firebase Auth
  role: 'field_user' | 'admin_user';
}

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
      const treeData = doc.data() as TreeData;
      trees.push({ ...treeData, id: doc.id });
    });
    return trees;
  },

  async addTree(tree: TreeData): Promise<void> {
    const treesCollectionRef = collection(db, 'trees');
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
      const data = docSnap.data() as TreeData;
      return { ...data, id: docSnap.id };
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

  // Function to get all users (for admin interface)
  async getAllUsers(): Promise<User[]> {
    const usersCollectionRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollectionRef);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      // Ensure essential fields are present before casting
      if (userData.username && userData.role) {
        users.push({
          username: userData.username,
          role: userData.role,
        });
      }
    });
    return users;
  },

  // Function to add a new user
  async addUser(email: string, password: string, role: User['role']): Promise<void> {
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      // 2. Save user details and role to Firestore
      const usersCollectionRef = collection(db, 'users');
      await setDoc(doc(usersCollectionRef, uid), { // Use UID as document ID for easy lookup
        uid: uid,
        email: email,
        username: email, // Use email as username for simplicity
        role: role,
        createdAt: Timestamp.now(), // Optional: add creation timestamp
      });
      console.log(`User ${email} added with role ${role} and UID ${uid}`);
    } catch (error: any) {
      console.error("Error adding user:", error);
      throw error; // Re-throw error to be handled by caller
    }
  }
};

