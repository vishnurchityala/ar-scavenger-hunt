import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import firebase from "./firebaseconfig.js";

const app = firebase;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const eventDetails = document.getElementById('event-details');

const text = "JANUARY 25 - 4PM TO 6PM - ON CAMPUS";
let index = 0;
let isDeleting = false;
const speed = 100;

function typeWriter() {
    if (!isDeleting && index < text.length) {
        eventDetails.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeWriter, speed);
    } else if (isDeleting && index > 1) {
        eventDetails.innerHTML = text.substring(0, index - 1);
        index--;
        setTimeout(typeWriter, speed);
    } else {
        isDeleting = !isDeleting;
        setTimeout(typeWriter, speed * 2);
    }
}

typeWriter();

loginButton.addEventListener('click', () => {
    signInWithPopup(auth, googleProvider)
        .then((result) => {
            console.log(`User signed in: ${result.user.displayName}`);
            alert(`Welcome, ${result.user.displayName}!`);
            // Open dashboard.html in a new tab
            window.open('dashboard.html', '_blank');
        })
        .catch((error) => {
            console.error('Error during sign in:', error);
            alert('Failed to sign in. Please try again.');
        });
});

logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log('User signed out');
            alert('You have been signed out.');
        })
        .catch((error) => {
            console.error('Error during sign out:', error);
            alert('Failed to sign out. Please try again.');
        });
});
