import firebase from './firebaseconfig.js';
import { 
    getFirestore, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(firebase);

const loader = document.getElementById('loader');

let lastFoundMarkerId = null;

async function fetchMarkers() {
    try {
        const markersCollection = collection(db, 'markers');
        const snapshot = await getDocs(markersCollection);

        if (snapshot.empty) {
            console.warn('No markers found in Firestore.');
            return [];
        }

        return snapshot.docs.map(doc => doc.data());
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

document.getElementById('logButton').addEventListener('click', () => {
    if (!lastFoundMarkerId) {
        return;
    }

    const modalBody = document.querySelector('#exampleModal .modal-body');

    modalBody.innerHTML = '';

    const markerName = capitalize(lastFoundMarkerId.replace('marker-', ''));

    modalBody.innerHTML = `
        <button type="button" class="btn-close d-block ms-auto fs-xsmall" data-bs-dismiss="modal" aria-label="Close"></button>
        <div class="d-flex justify-content-center align-items-center flex-column">
            <img src="./img/bolddy.png" class="ms-auto me-auto" height="200px" alt="">
            <p class="m-0 uncial-antiqua-regular fs-1 mt-2">${markerName}</p>
            <p class="m-0 fs-xsmall text-center w-75 mt-2 varela-regular">
                Boldy is a resilient Pokémon known for its unshakable determination and sturdy defense. With its bold attitude and rock-solid moves, it stands as a protector in any battle!
            </p>
        </div>
        <p class="m-0 text-center fw-bold fs-xsmall uncial-antiqua-regular mt-4 mb-2 w-50 ms-auto me-auto" style="color: red;">
            Ooh It was Captured by other before 😢
        </p>
    `;

    const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
    modal.show();
});

window.addEventListener('load', async () => {
    loader.classList.remove('d-none');
    // await populateARScene();
    addGlobalMarkerEventListener();

    const logButton = document.getElementById('logButton');
    logButton.addEventListener('click', () => {
        if (lastFoundMarkerId) {
            console.log(`Last found marker ID: ${lastFoundMarkerId}`);
        } else {
            console.log('No marker currently found.');
        }
    });
    loader.classList.add('d-none');
});
