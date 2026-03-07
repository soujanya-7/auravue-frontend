import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyArwqibZlnSA7SIfnwMGyqVJO8gzI_V6cU",
  authDomain: "auravue-c8b99.firebaseapp.com",
  databaseURL: "https://auravue-c8b99-default-rtdb.firebaseio.com", // ✅ Added for RTDB
  projectId: "auravue-c8b99",
  storageBucket: "auravue-c8b99.appspot.com",
  messagingSenderId: "966695370796",
  appId: "1:966695370796:web:3b02c7fb9d23d5e0bc5189"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Firestore
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true
});

// Realtime Database
const rtdb = getDatabase(app);

// Storage
const storage = getStorage(app);

export { app, auth, googleProvider, db, rtdb, storage };
