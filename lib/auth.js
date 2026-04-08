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

const AUTH_NOT_CONFIGURED_ERROR =
  "Firebase Auth is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.";

const hasAuth = () => Boolean(auth);

// Google Sign In
export async function loginWithGoogle() {
  if (!hasAuth()) {
    return { user: null, error: AUTH_NOT_CONFIGURED_ERROR };
  }

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
  if (!hasAuth()) {
    return { user: null, error: AUTH_NOT_CONFIGURED_ERROR };
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

// Register with Email/Password
export async function registerWithEmail(email, password, displayName) {
  if (!hasAuth()) {
    return { user: null, error: AUTH_NOT_CONFIGURED_ERROR };
  }

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
  if (!hasAuth()) {
    return { error: AUTH_NOT_CONFIGURED_ERROR };
  }

  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
}

// Auth State Observer
export function onAuthChange(callback) {
  if (!hasAuth()) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// Get Current User
export function getCurrentUser() {
  if (!hasAuth()) return null;
  return auth.currentUser;
}
