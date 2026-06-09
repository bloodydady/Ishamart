// lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCwukAsIx1FaaLJ6wnJUtoURDvnMd7PKfk",
  authDomain: "ishamart-5f8fa.firebaseapp.com",
  projectId: "ishamart-5f8fa",
  storageBucket: "ishamart-5f8fa.firebasestorage.app",
  messagingSenderId: "960429248491",
  appId: "1:960429248491:web:c301040f8dfd53586b13ae",
  measurementId: "G-HCQBSZDNZN"
};

/*
 * Firestore Security Rules needed:
 * - users: read own, write own, admin read/write all
 * - products: public read, admin write
 * - orders: user read own, user create, admin read/write all
 * - pathologyPackages: public read, admin write
 * - pathologyAppointments: user create, admin read/write
 * - allrounderEnquiries: user create, admin read/write
 * - settings: public read, admin write
 *
 * Admin email: admin@ishamart.com
 */

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics conditionally (only in browser environment)
export const analytics = typeof window !== 'undefined' ? 
  isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export default app;
