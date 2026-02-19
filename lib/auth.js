// Firebase Authentication Service
// This file handles authentication functions (login, logout, register, etc.)

import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { auth } from './firebase';

// Google Sign In
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

// Email/Password Sign In
export async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

// Register with Email/Password
export async function registerWithEmail(email, password, displayName) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Update user profile with display name
    if (displayName) {
      await updateProfile(result.user, { displayName: displayName });
    }
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

// Sign Out
export async function logout() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

// Auth State Observer
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// Get Current User
export function getCurrentUser() {
  return auth.currentUser;
}
