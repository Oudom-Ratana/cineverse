import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCiniverseMockKeyForDevelopmentMode",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "Ciniverse-cinema.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "Ciniverse-cinema",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "Ciniverse-cinema.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109283746501",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109283746501:web:abcdef1234567890",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Ciniverse01"
};

// Check if using actual keys vs mock
export const isMockFirebase = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes('MockKey') || 
  firebaseConfig.apiKey.includes('your_firebase');

let app;
let auth;
let db;
let storage;
let messaging = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize messaging conditionally (browser only, supported only)
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported && !isMockFirebase) {
        messaging = getMessaging(app);
      }
    }).catch(() => {
      // Push not supported in this environment
    });
  }
} catch (error) {
  console.warn('[Ciniverse Firebase] Initialization warning:', error.message);
}

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

export {
  app,
  auth,
  db,
  storage,
  messaging,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  getToken,
  onMessage,
};
