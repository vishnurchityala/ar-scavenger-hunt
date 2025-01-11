// firebaseconfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";



// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAk7Qp_Q88lz1ovpznqN052bM7KuUAPqhw",
    authDomain: "ar-scavenger-62f3e.firebaseapp.com",
    projectId: "ar-scavenger-62f3e",
    storageBucket: "ar-scavenger-62f3e.firebasestorage.app",
    messagingSenderId: "237424627892",
    appId: "1:237424627892:web:76166ac4e2fb87b8f547e1",
    measurementId: "G-FDZMP0W5X5"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the app object
export default app;
