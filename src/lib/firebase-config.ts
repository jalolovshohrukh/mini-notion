
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
if (!firebaseConfig.apiKey || typeof firebaseConfig.apiKey !== 'string' || firebaseConfig.apiKey.trim() === '') {
  const errorMsg = `Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing, invalid, or empty in the environment where the application is running.
    Current value detected: '${firebaseConfig.apiKey}'
    Please verify the following:
    1. The .env.local (or similar) file contains the correct NEXT_PUBLIC_FIREBASE_API_KEY.
    2. The Next.js development server was restarted after setting the environment variable.
    3. If deploying, the environment variable is correctly set in your deployment environment/platform.
    4. The API key copied from the Firebase Console (Project settings > Your apps > Web app config) is accurate.`;
  console.error("CRITICAL FIREBASE CONFIGURATION ERROR:", errorMsg);
  // Throwing an error here will prevent the app from initializing Firebase incorrectly.
  throw new Error(errorMsg);
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
    'Some optional Firebase configuration values (authDomain, projectId, appId, etc.) might be missing. Check your environment variables if you encounter issues with specific Firebase services.'
  );
}


// Initialize Firebase only if it hasn't been initialized yet
let app;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully."); // Add log for successful init
    } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        // Handle initialization error, maybe show a user-friendly message
        throw new Error("Firebase initialization failed. Please check configuration and environment variables.");
    }
} else {
    app = getApp();
     // console.log("Firebase app already initialized."); // Optional log
}

const auth = getAuth(app);
// const db = getFirestore(app); // Initialize Firestore if needed
// const storage = getStorage(app); // Initialize Storage if needed

export { app, auth /*, db, storage */ }; // Export initialized services
