import firebase from './firebaseconfig.js';
import { 
    getFirestore, 
    collection, 
    getDoc,
    doc,updateDoc,
    getDocs 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const db = getFirestore(firebase);
const auth = getAuth(firebase);

const loader = document.getElementById('loader');
let lastFoundMarkerId = null;
let teamId = null; // Variable to store team ID

async function fetchMarkers() {
    try {
        const markersCollection = collection(db, 'markers');
        const snapshot = await getDocs(markersCollection);

        if (snapshot.empty) {
            console.warn('No markers found in Firestore.');
            return [];
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching markers:', error);
        alert('Failed to load markers: ' + error.message);
        return [];
    }
}

async function populateARScene() {
    const markers = await fetchMarkers();
    const arScene = document.getElementById('arScene');

    if (!arScene) {
        console.error('AR scene element not found.');
        return;
    }

    if (markers.length === 0) {
        console.log('No markers available to display in the AR scene.');
        return;
    }

    markers.forEach(marker => {
        if (!marker.patternUrl || !marker.objectUrl) {
            console.warn(`Invalid marker configuration for ${marker.name}. Skipping.`);
            return;
        }

        const displayMarker = !marker.catched;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <a-marker 
                type="pattern" 
                url="${marker.patternUrl}" 
                visible="${displayMarker}" 
                id="marker-${marker.name}" 
                emitevents="true">
                <a-entity 
                    gltf-model="${marker.objectUrl}" 
                    visible="${displayMarker}" 
                    id="object-${marker.name}" 
                    scale="2 2 2">
                </a-entity>
            </a-marker>
        `;

        const markerElement = wrapper.firstElementChild;

        arScene.appendChild(markerElement);
    });

    console.log('AR scene populated with markers:', markers);

    refreshARScene();
}

function refreshARScene() {
    const arScene = document.getElementById('arScene');
    if (!arScene) return;

    const clonedScene = arScene.cloneNode(true);
    arScene.parentNode.replaceChild(clonedScene, arScene);
    console.log('AR scene has been refreshed');
}

function addGlobalMarkerEventListener() {
    const arScene = document.getElementById('arScene');
    if (!arScene) return;

    arScene.addEventListener('markerFound', (event) => {
        const markerId = event.target.id;
        console.log(`Marker found: ${markerId}`);
        lastFoundMarkerId = markerId;
    });

    arScene.addEventListener('markerLost', (event) => {
        const markerId = event.target.id;
        lastFoundMarkerId = null;
    });
}

function updateGameTime() {
    const gameTimeElement = document.getElementById('game-time');
    if (!gameTimeElement) return;

    setInterval(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        gameTimeElement.textContent = `${formattedHours}:${formattedMinutes} ${ampm}`;
    }, 1000);
}

updateGameTime();

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function updateTeamScore() {
    console.log(teamId );
    const teamScoreElement = document.getElementById('teamScore');
    if (!teamScoreElement || !teamId) return;

    try {
        const teamDoc = await getDoc(doc(db, 'teams', teamId));
        if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            teamScoreElement.textContent = `🔥  ${teamData.teamScore}`;
        } else {
            console.error('Team not found in Firestore.');
        }
    } catch (error) {
        console.error('Error fetching team score:', error);
    }
}


document.getElementById('logButton').addEventListener('click', async () => {
    if (!lastFoundMarkerId) {
        return;
    }

    loader.classList.remove('d-none');

    const markerId = lastFoundMarkerId.replace('marker-', '');
    const markerDoc = await getDoc(doc(db, 'markers', markerId));

    if (!markerDoc.exists()) {
        console.error('Marker not found in Firestore.');
        loader.classList.add('d-none');
        return;
    }

    const markerData = markerDoc.data();
    const markerName = capitalize(markerData.name);
    console.log(`Marker rarity: ${markerData.rarity}`);

    const rarityPoints = {
        common: 5,
        uncommon: 15,
        rare: 25,
        legendary: 40
    };

    const points = rarityPoints[markerData.rarity] || 0;

    const teamDocRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(teamDocRef);
    if (!teamDoc.exists()) {
        console.error('Team not found in Firestore.');
        loader.classList.add('d-none');
        return;
    }

    const teamData = teamDoc.data();
    const capturedMarkers = teamData.capturedMarkers || [];

    const modalBody = document.querySelector('#exampleModal .modal-body');
    modalBody.innerHTML = '';

    let captureMessage;
    if (capturedMarkers.includes(markerId)) {
        captureMessage = 'Marker already captured by your team.';
    } else if (markerData.count <= 0) {
        captureMessage = 'Ooh It was Captured by others before 😢';
    } else {
        captureMessage = `Congratulations! You captured it and earned ${points} points! 🎉`;
        const newCount = markerData.count - 1;
        await updateDoc(doc(db, 'markers', markerId), { 
            catched: newCount === 0, 
            count: newCount 
        });

        const newScore = (teamData.teamScore || 0) + points;
        capturedMarkers.push(markerId);
        await updateDoc(teamDocRef, { 
            teamScore: newScore, 
            capturedMarkers: capturedMarkers 
        });

        // Update the team score on the UI
        const teamScoreElement = document.getElementById('teamScore');
        if (teamScoreElement) {
            teamScoreElement.textContent = `🔥  ${newScore}`;
        }
    }

    modalBody.innerHTML = `
        <button type="button" class="btn-close d-block ms-auto fs-xsmall" data-bs-dismiss="modal" aria-label="Close"></button>
        <div class="d-flex justify-content-center align-items-center flex-column">
            <img src="${markerData.pictureUrl}" class="ms-auto me-auto" height="200px" alt="">
            <p class="m-0 uncial-antiqua-regular fs-1 mt-2">${capitalize(markerName)}</p>
            <p class="m-0 fs-xsmall text-center w-75 mt-2 varela-regular">
                Rarity:  ${capitalize(markerData.rarity || 'unknown')}
            </p>
        </div>
        <p class="m-0 text-center fw-bold fs-xsmall uncial-antiqua-regular mt-4 mb-2 w-50 ms-auto me-auto" style="color: red;">
            ${captureMessage}
        </p>
    `;

    const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
    modal.show();

    loader.classList.add('d-none');
});


window.addEventListener('load', async () => {

    loader.classList.remove('d-none');

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.error('No user is logged in.');
            alert('Please log in to play the game.');
            loader.classList.add('d-none');
            return;
        }

        const userEmail = user.email;
        const playerDoc = await getDoc(doc(db, 'players', userEmail));

        if (!playerDoc.exists()) {
            console.error('Player not found in Firestore.');
            alert('Player not found. Please register to play the game.');
            loader.classList.add('d-none');
            return;
        }

        teamId = playerDoc.data().teamId; // Set the team ID
        // await populateARScene();
        addGlobalMarkerEventListener();

        loader.classList.add('d-none');
        updateTeamScore();
        console.log('Loading AR game...');
        console.log(teamId);
        console.log(user.email);
    });

});
