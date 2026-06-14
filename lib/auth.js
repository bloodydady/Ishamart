// lib/auth.js
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Sign in user with email and password
 * Checks if user is blocked before allowing login
 */
export async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user is blocked
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().blocked) {
      await signOut(auth);
      throw new Error('Your account has been blocked. Contact admin.');
    }

    return { user, error: null };
  } catch (error) {
    let message = 'Something went wrong. Please try again.';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message = 'Invalid email or password.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled.';
        break;
      default:
        message = error.message || message;
    }
    return { user: null, error: message };
  }
}

/**
 * Register new user
 */
export async function registerUser(email, password, name, phone) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName: name });

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      phone,
      blocked: false,
      createdAt: serverTimestamp(),
    });

    return { user, error: null };
  } catch (error) {
    let message = 'Something went wrong. Please try again.';
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered.';
        break;
      case 'auth/weak-password':
        message = 'Password must be at least 6 characters.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address.';
        break;
      default:
        message = error.message || message;
    }
    return { user: null, error: message };
  }
}

/**
 * Sign in or Register with Google
 */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      if (userDoc.data().blocked) {
        await signOut(auth);
        throw new Error('Your account has been blocked. Contact admin.');
      }
    } else {
      // Register the new user
      await setDoc(userDocRef, {
        name: user.displayName || 'Google User',
        email: user.email,
        phone: user.phoneNumber || '',
        blocked: false,
        createdAt: serverTimestamp(),
        authProvider: 'google'
      });
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message || 'Failed to authenticate with Google' };
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    let message = 'Something went wrong.';
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address.';
        break;
      default:
        message = error.message || message;
    }
    return { error: message };
  }
}

/**
 * Admin emails list
 */
export const ADMIN_EMAILS = [
  'monsteroflove1234@gmail.com',
  'gisha6684@gmail.com',
];

/**
 * Check if user is admin
 */
export function isAdminUser(user) {
  return ADMIN_EMAILS.includes(user?.email);
}
