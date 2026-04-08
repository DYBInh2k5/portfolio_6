// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
const isFirebaseConfigured = missingEnvVars.length === 0;

if (!isFirebaseConfigured) {
  console.warn(
    `Missing Firebase env vars: ${missingEnvVars.join(", ")}. Check your .env.local file.`
  );
}

// For Firebase JS SDK v7.20.0+, measurementId is optional.
const firebaseConfig = isFirebaseConfigured
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
        ? { measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
        : {}),
    }
  : null;

// Initialize Firebase
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const auth = app && typeof window !== "undefined" ? getAuth(app) : null;
const analytics = app && typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, analytics, db, auth, isFirebaseConfigured };
