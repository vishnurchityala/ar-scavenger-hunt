import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import firebase from "./firebaseconfig.js";

const app = firebase;
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

document.getElementById('login-button').addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            console.log(`User signed in: ${result.user.displayName}`);
        })
        .catch((error) => {
            console.error('Error during sign in:', error);
        });
});

document.getElementById('logout-button').addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('User signed out');
        })
        .catch((error) => {
            console.error('Error during sign out:', error);
        });
});
