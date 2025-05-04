
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore"; // Add if you need Firestore
// import { getStorage } from "firebase/storage"; // Add if you need Storage

// Use the provided Firebase configuration directly
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAFdnZYRw76K91otUcfDoEWUU-AmY2ue5A",
  authDomain: "taskflow-kanban-atj0m.firebaseapp.com",
  projectId: "taskflow-kanban-atj0m",
  storageBucket: "taskflow-kanban-atj0m.appspot.com", // Corrected domain
  messagingSenderId: "314300195689",
  appId: "1:314300195689:web:74ec2afb4544a77b0353f8"
};

// Validate essential configuration values
if (!firebaseConfig.apiKey || typeof firebaseConfig.apiKey !== 'string' || firebaseConfig.apiKey.trim() === '') {
  const errorMsg = `Firebase API Key is missing, invalid, or empty in the configuration.
    Current value detected: '${firebaseConfig.apiKey}'
    Please verify the apiKey value provided.`;
  console.error("CRITICAL FIREBASE CONFIGURATION ERROR:", errorMsg);
  throw new Error(errorMsg);
}

if (
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.appId
) {
  console.warn(
    'Some optional Firebase configuration values (authDomain, projectId, appId, etc.) might be missing or invalid. Check the provided configuration if you encounter issues.'
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
        throw new Error("Firebase initialization failed. Please check the provided configuration.");
    }
} else {
    app = getApp();
     // console.log("Firebase app already initialized."); // Optional log
}

const auth = getAuth(app);
// const db = getFirestore(app); // Initialize Firestore if needed
// const storage = getStorage(app); // Initialize Storage if needed

export { app, auth /*, db, storage */ }; // Export initialized services
