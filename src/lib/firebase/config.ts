
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// Log received environment variables for debugging
console.log("Firebase Config Loading: NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Loaded" : "MISSING or undefined");
console.log("Firebase Config Loading: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Loaded" : "MISSING or undefined");
console.log("Firebase Config Loading: NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Loaded" : "MISSING or undefined");
console.log("Firebase Config Loading: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Loaded" : "MISSING or undefined");
console.log("Firebase Config Loading: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Loaded" : "MISSING or undefined");
console.log("Firebase Config Loading: NEXT_PUBLIC_FIREBASE_APP_ID:", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Loaded" : "MISSING or undefined");
console.log("Firebase Config Loading: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? "Loaded" : "MISSING or undefined");

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

let criticalConfigMissing = false;
let missingConfigDetails = [];

if (!firebaseApiKey) {
  const message = "CRITICAL: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing. Firebase services will not initialize correctly.";
  console.error(message);
  missingConfigDetails.push("API Key");
  criticalConfigMissing = true;
}
if (!authDomain) {
  const message = "CRITICAL: Firebase Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) is missing. Firebase Authentication will likely fail.";
  console.error(message);
  missingConfigDetails.push("Auth Domain");
  criticalConfigMissing = true;
}
if (!projectId) {
  const message = "CRITICAL: Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing. Firebase services, especially Firestore and Auth, will likely fail.";
  console.error(message);
  missingConfigDetails.push("Project ID");
  criticalConfigMissing = true;
}
if (!appId) {
  // While not always "critical" for basic auth/firestore, it's good practice and needed for other services.
  const message = "WARNING: Firebase App ID (NEXT_PUBLIC_FIREBASE_APP_ID) is missing. Some Firebase services might be affected.";
  console.warn(message);
  missingConfigDetails.push("App ID");
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

// Log the actual config object being used for initialization
console.log("Firebase Config Object (actual values used for initialization):", firebaseConfig);


let app: FirebaseApp;
if (!getApps().length) {
  if (criticalConfigMissing) {
    console.error(`Firebase initialization SKIPPED due to missing critical configuration: ${missingConfigDetails.join(', ')}. App will not function correctly.`);
    // @ts-ignore
    app = null; 
  } else {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase App initialized successfully.");
    } catch (e: any) {
      console.error("CRITICAL Error initializing Firebase App. This is likely due to invalid or incomplete configuration values even if the environment variables are present.", e);
      console.error("Error Name:", e.name);
      console.error("Error Message:", e.message);
      console.error("Error Code:", e.code);
      // @ts-ignore
      app = null; 
    }
  }
} else {
  app = getApp();
  console.log("Firebase App already initialized.");
}

const auth: Auth = app ? getAuth(app) : (null as unknown as Auth);
const db: Firestore = app ? getFirestore(app) : (null as unknown as Firestore);

if (!app) {
    console.error("Firebase app object is null. Auth and Firestore services will not be available.");
} else {
    if (!auth) console.error("Firebase Auth service failed to initialize.");
    if (!db) console.error("Firebase Firestore service failed to initialize.");
}


let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && app) {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId && firebaseConfig.measurementId) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log("Firebase Analytics initialized.");
      } else {
        console.warn("Firebase Analytics is not supported in this environment.");
      }
    }).catch(error => {
      console.warn("Error checking Firebase Analytics support:", error);
    });
  } else {
    console.warn("Firebase Analytics not initialized due to missing API key, Project ID, App ID, or Measurement ID in the configuration.");
  }
} else if (typeof window !== 'undefined' && !app && !criticalConfigMissing) {
    console.warn("Firebase Analytics not initialized because Firebase app failed to initialize.");
}


export { app, auth, db, analytics };
