// Importing functions needed to initialize app and auth provider
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKVf7rCE9CHe79M3uuF0DPozP1WOlnv28",
  authDomain: "courso-mit-a3f17.firebaseapp.com",
  projectId: "courso-mit-a3f17",
  storageBucket: "courso-mit-a3f17.appspot.com",
  messagingSenderId: "19330625100",
  appId: "1:19330625100:web:4cc971718cc155c0ab0ee9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get auth instance and Google Auth Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
