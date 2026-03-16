import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, getDocs, collection, updateDoc, deleteDoc, onSnapshot, addDoc, doc, query, where, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

let app;
let analytics;
let secondaryApp;

try {
  console.log('Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  console.log('✓ Primary Firebase app initialized');

  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
    console.log('✓ Analytics initialized');
  }

  console.log('Initializing secondary Firebase app...');
  secondaryApp = initializeApp(firebaseConfig, 'Secondary');
  console.log('✓ Secondary Firebase app initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('Error details:', error.message);
}

export const db = getFirestore(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const googleProvider = new GoogleAuthProvider();
export { analytics };

export {
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  onSnapshot,
  addDoc,
  doc,
  query,
  where,
  getDoc,
  setDoc,
  ref,
  uploadBytes,
  getDownloadURL,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup
};
