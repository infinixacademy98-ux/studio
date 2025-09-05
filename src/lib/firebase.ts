// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "mvs-karnataka",
  appId: "1:368897560025:web:e1b82d25198544f1df5dc8",
  storageBucket: "mvs-karnataka.firebasestorage.app",
  apiKey: "AIzaSyCREXCS8WwbCPMnA7Z9Cg13mHIvYbB6wpk",
  authDomain: "mvs-karnataka.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "368897560025",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
