import firebase from './firebaseconfig.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const app = firebase;
const db = getFirestore(app);
const auth = getAuth(app);

// Reference the loader element
const loader = document.getElementById('loader');

function showLoader() {
    loader.classList.remove('d-none');
}

function hideLoader() {
    loader.classList.add('d-none');
}

function getLoggedInUserEmail() {
    const user = auth.currentUser;
    return user ? user.email : null;
}

async function checkPlayerInCollection(loggedInEmail) {
    if (!loggedInEmail) {
        console.log('No user is logged in. Redirecting...');
        hideLoader();
        // window.location.href = "index.html";
        return;
    }

    try {
        showLoader();
        const playersRef = collection(db, 'players');
        const q = query(playersRef, where('__name__', '==', loggedInEmail));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('User not found in players collection. Redirecting...');
            hideLoader();
            window.location.href = "index.html";
        } else {
            console.log('User found in players collection.');
            const playerData = snapshot.docs[0].data();
            console.log('Player data:', playerData);
            await fetchTeamDetails(playerData.teamId);
        }
    } catch (error) {
        console.error('Error checking player in collection:', error);
    } finally {
        hideLoader();
    }
}

async function fetchTeamDetails(teamId) {
    try {
        const teamDocRef = doc(db, 'teams', teamId);
        const teamDoc = await getDoc(teamDocRef);

        if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            console.log('Team data:', teamData);
            populateTeamDetails(teamData);
            const teamContainer = document.getElementById('teamContainer');
            teamData.teamMembers.forEach((member) => { 
                teamContainer.innerHTML += `
                <div class="d-flex px-4 bg-white py-3 rounded-4 shadow-sm w-100">
                    <img src="./img/user.png" width="40px" alt="">
                    <div class="ms-3">
                    <p class="m-0 member-name">${member.name}</p>
                    <p class="m-0 fs-xsmall">${member.email}</p>
                    </div>
                </div>`;
            });
        } else {
            console.log('No such team found.');
        }
    } catch (error) {
        console.error('Error fetching team details:', error);
    }
}

function populateTeamDetails(teamData) {
    document.getElementById('teamName').innerHTML = `${teamData.teamName}`;
    document.getElementById('teamLead').textContent = teamData.teamLead;
    document.getElementById('teamScore').textContent = `🔥 ${teamData.teamScore}`;
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
    showLoader(); // Show loader on page load
    const loggedInEmail = getLoggedInUserEmail();
    checkPlayerInCollection(loggedInEmail);
});
