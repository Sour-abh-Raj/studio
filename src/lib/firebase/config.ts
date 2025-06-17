
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

let criticalConfigMissing = false;

if (!firebaseApiKey) {
  console.error(
    "CRITICAL: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or undefined. " +
    "Firebase services will not initialize correctly. " +
    "Please ensure this environment variable is set in your .env.local file (for local development) " +
    "or in your hosting provider's environment settings."
  );
  criticalConfigMissing = true;
}
if (!authDomain) {
  console.error(
    "CRITICAL: Firebase Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) is missing or undefined. " +
    "Firebase Authentication will likely fail. Please set this environment variable."
  );
  criticalConfigMissing = true;
}
if (!projectId) {
  console.error(
    "CRITICAL: Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing or undefined. " +
    "Firebase services, especially Firestore and Auth, will likely fail. Please set this environment variable."
  );
  criticalConfigMissing = true;
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
// Initialize Firebase app. If config is incomplete (e.g. missing API key, authDomain, or projectId),
// Firebase SDK might throw errors when services like Auth or Firestore are accessed.
if (!getApps().length) {
  if (criticalConfigMissing) {
    console.error("Firebase initialization skipped due to missing critical configuration. App will not function correctly.");
    // @ts-ignore
    app = null; // Prevent further Firebase calls if config is critically missing
  } else {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Error initializing Firebase App. This is likely due to invalid or incomplete configuration values even if the environment variables are present.", e);
      // @ts-ignore
      app = null; 
    }
  }
} else {
  app = getApp();
}

// Ensure app is initialized before trying to get Auth or Firestore
const auth: Auth = app ? getAuth(app) : (null as unknown as Auth);
const db: Firestore = app ? getFirestore(app) : (null as unknown as Firestore);


let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && app) {
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
} else if (typeof window !== 'undefined' && !app && !criticalConfigMissing) {
    console.warn("Firebase Analytics not initialized because Firebase app failed to initialize.");
}


export { app, auth, db, analytics };

