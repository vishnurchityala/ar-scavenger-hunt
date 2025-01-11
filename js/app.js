// Import Firebase and Firestore functions
import firebase from './firebaseconfig.js'; // Import the initialized Firebase app
import { 
    getFirestore, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore(firebase);

// Function to fetch markers from Firestore
async function fetchMarkers() {
    try {
        const markersCollection = collection(db, 'markers'); // Reference to 'markers' collection
        const snapshot = await getDocs(markersCollection);   // Fetch all documents in the collection
        
        // If no markers found, log it and return an empty array
        if (snapshot.empty) {
            console.warn('No markers found in Firestore.');
            return [];
        }
        
        return snapshot.docs.map(doc => doc.data());         // Map to an array of marker data
    } catch (error) {
        console.error('Error fetching markers:', error);
        alert('Failed to load markers: ' + error.message);
        return [];
    }
}

// Function to populate AR scene with markers using string methods
async function populateARScene() {
    const markers = await fetchMarkers(); // Fetch markers from Firestore
    const arScene = document.getElementById('arScene'); // Get the AR scene element
    
    if (!arScene) {
        console.error('AR scene element not found.');
        return;
    }

    // Ensure there are markers to display
    if (markers.length === 0) {
        console.log('No markers available to display in the AR scene.');
        return;
    }

    // Loop through the fetched markers and create AR marker elements
    markers.forEach(marker => {
        // Check if marker URLs exist
        if (!marker.patternUrl || !marker.objectUrl) {
            console.warn(`Missing URLs for marker ${marker.name}. Skipping marker.`);
            return;
        }

        // Create the marker HTML string using template literals
        const markerHTML = `
            <a-marker type="pattern" url="${marker.patternUrl}">
                <a-entity gltf-model="${marker.objectUrl}" scale="3 3 3"></a-entity>
            </a-marker>
        `;

        // Append the marker HTML string to the AR scene
        arScene.innerHTML += markerHTML;  // Append the string of marker HTML to the scene
    });

    console.log('AR scene populated with markers:', markers);

    // Refresh the <a-scene> by removing and re-adding it
    refreshARScene();
}

// Function to refresh the <a-scene>
function refreshARScene() {
    const arScene = document.getElementById('arScene');
    
    // Clone the scene element to reset and re-render
    const clonedScene = arScene.cloneNode(true); 
    
    // Replace the old scene with the cloned scene
    arScene.parentNode.replaceChild(clonedScene, arScene);

    console.log('AR scene has been refreshed');
}

// Call the function to populate the AR scene
populateARScene();
