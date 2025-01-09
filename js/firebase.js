// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvaLOzdJ6uMD8pnTDUqq50s5PnIs5hM38",
    authDomain: "ar-scavenger-hunt-8c3f4.firebaseapp.com",
    projectId: "ar-scavenger-hunt-8c3f4",
    storageBucket: "ar-scavenger-hunt-8c3f4.firebasestorage.app",
    messagingSenderId: "186347365176",
    appId: "1:186347365176:web:80a20a642f4380644997cd",
    measurementId: "G-ZH0V2NX1C2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the app object
export default app;
