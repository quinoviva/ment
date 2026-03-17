// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2QiPEJwW4OsSYDcjzOqZKcUe5h-5ZE1w",
  authDomain: "ment-31705.firebaseapp.com",
  projectId: "ment-31705",
  storageBucket: "ment-31705.firebasestorage.app",
  messagingSenderId: "1006884827316",
  appId: "1:1006884827316:web:a1f198fa98746b806ee7e1",
  measurementId: "G-WVXZ1BFF0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the initialized app for use in other parts of the application
export { app, analytics };
