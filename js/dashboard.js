import firebase from './firebaseconfig.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const app = firebase;
const db = getFirestore(app);
const auth = getAuth(app);

function getLoggedInUserEmail() {
    const user = auth.currentUser;
    return user ? user.email : null;
}

async function checkPlayerInCollection(loggedInEmail) {
    if (!loggedInEmail) {
        console.log('No user is logged in. Redirecting...');
        window.location.href = "index.html";
        return;
    }

    try {
        const playersRef = collection(db, 'players');
        const q = query(playersRef, where('email', '==', loggedInEmail));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('User not found in players collection. Redirecting...');
            window.location.href = "index.html";
        } else {
            console.log('User found in players collection.');
        }
    } catch (error) {
        console.error('Error checking player in collection:', error);
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        const loggedInEmail = user.email;
        console.log('User is authenticated:', loggedInEmail);
        checkPlayerInCollection(loggedInEmail);
    } else {
        console.log('No user is authenticated. Redirecting...');
        window.location.href = "index.html";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded. Checking user authentication...');
    const loggedInEmail = getLoggedInUserEmail();
    if (loggedInEmail) {
        checkPlayerInCollection(loggedInEmail);
    } else {
        window.location.href = "index.html";
    }
});
