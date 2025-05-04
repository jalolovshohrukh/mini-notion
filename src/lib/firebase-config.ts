
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore"; // Add if you need Firestore
// import { getStorage } from "firebase/storage"; // Add if you need Storage

// Use type assertion for safety, ensure env variables are strings
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
};

// Validate essential environment variables, especially the API key
if (!firebaseConfig.apiKey) {
  console.error(
    'Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or invalid. Please check your environment variables.'
  );
  // Throwing an error here will prevent the app from initializing Firebase incorrectly.
  throw new Error('Firebase API Key is missing or invalid. Check NEXT_PUBLIC_FIREBASE_API_KEY environment variable.');
}

if (
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  // Storage bucket, messaging sender ID, and App ID might be optional depending on usage
  // !firebaseConfig.storageBucket ||
  // !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  console.warn(
    'Some Firebase configuration values (authDomain, projectId, appId) might be missing. Check your environment variables if you encounter issues with specific Firebase services.'
  );
}


// Initialize Firebase only if it hasn't been initialized yet
let app;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
    } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        // Handle initialization error, maybe show a user-friendly message
        throw new Error("Firebase initialization failed. Please check configuration and environment variables.");
    }
} else {
    app = getApp();
}

const auth = getAuth(app);
// const db = getFirestore(app); // Initialize Firestore if needed
// const storage = getStorage(app); // Initialize Storage if needed

export { app, auth /*, db, storage */ }; // Export initialized services
