
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

if (!firebaseApiKey) {
  console.error(
    "CRITICAL: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or undefined. " +
    "Firebase services will not initialize correctly, leading to 'auth/invalid-api-key' or similar errors. " +
    "Please ensure this environment variable is set in your .env.local file (for local development) " +
    "or in your hosting provider's environment settings."
  );
}
if (!authDomain) {
  console.warn("Warning: Firebase Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) is missing or undefined. This might cause issues.");
}
if (!projectId) {
  console.warn("Warning: Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing or undefined. This might cause issues.");
}


const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId,
};

let app: FirebaseApp;
// Initialize Firebase app. If config is incomplete (e.g. missing API key),
// Firebase SDK will throw an error, like the 'auth/invalid-api-key' you're seeing.
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  // Check for essential config before attempting to get analytics
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(error => {
      console.warn("Error checking Firebase Analytics support:", error);
    });
  } else {
    console.warn("Firebase Analytics not initialized due to missing API key, Project ID, or App ID in the configuration.");
  }
}

export { app, auth, db, analytics };
