import firebase from './firebaseconfig.js';
import { 
    getFirestore, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(firebase);

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
            console.warn(`Missing URLs for marker ${marker.name}. Skipping marker.`);
            return;
        }

        const displayMarker = !marker.catched;

        const markerHTML = `
            <a-marker type="pattern" url="${marker.patternUrl}" visible="${displayMarker}" id="marker-${marker.name}">
                <a-entity gltf-model="${marker.objectUrl}" visible="${displayMarker}" id="object-${marker.name}" scale="2 2 2"></a-entity>
            </a-marker>
        `;
        arScene.innerHTML += markerHTML;

    });

    console.log('AR scene populated with markers:', markers);

    refreshARScene();
}

function refreshARScene() {
    const arScene = document.getElementById('arScene');
    const clonedScene = arScene.cloneNode(true); 
    arScene.parentNode.replaceChild(clonedScene, arScene);
    console.log('AR scene has been refreshed');
}

populateARScene();
