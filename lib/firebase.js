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
if (missingEnvVars.length > 0 && typeof window !== "undefined") {
  console.warn(
    `Missing Firebase env vars: ${missingEnvVars.join(", ")}. Falling back to default config.`
  );
}

// For Firebase JS SDK v7.20.0+, measurementId is optional.
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCJWgu2JENiNK11QylmscLYVDhLRDBNHk0",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "cody-portfolio-5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "cody-portfolio-5",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "cody-portfolio-5.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "365117403626",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:365117403626:web:b31976d07c51ce3c420293",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-K8H8XM2Y5P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, analytics, db, auth };
