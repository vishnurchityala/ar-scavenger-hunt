import firebase from './firebaseconfig.js';
import { 
    getFirestore, 
    doc,
    setDoc  
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const db = getFirestore(firebase);
const storage = getStorage(firebase);

async function uploadFileToStorage(file, path) {
    try {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    } catch (error) {
        throw new Error(`Failed to upload file to ${path}: ${error.message}`);
    }
}

async function saveToFirestore(collectionName, docId, data) {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data);
        console.log(`Document added to ${collectionName} with ID: ${docId}`);
    } catch (error) {
        throw new Error(`Failed to save document to Firestore: ${error.message}`);
    }
}

function getCountByRarity(rarity) {
    switch (rarity) {
        case 'legendary':
            return 2;
        case 'rare':
            return 3;
        case 'uncommon':
            return 4;
        case 'common':
            return 5;
        default:
            return 0;
    }
}

async function handleMarkerFormSubmission(event) {
    event.preventDefault();

    try {
        const markerName = document.getElementById('markerName').value;
        const patternFile = document.getElementById('patternFile').files[0];
        const objectFile = document.getElementById('objectFile').files[0];
        const pictureFile = document.getElementById('pictureFile').files[0];
        const rarity = document.getElementById('rarity').value;

        const [patternUrl, objectUrl, pictureUrl] = await Promise.all([
            uploadFileToStorage(patternFile, `patterns/${markerName}.patt`),
            uploadFileToStorage(objectFile, `objects/${markerName}.glb`),
            uploadFileToStorage(pictureFile, `pictures/${markerName}.png`),
        ]);

        const markerData = {
            name: markerName,
            patternUrl: patternUrl,
            objectUrl: objectUrl,
            pictureUrl: pictureUrl,
            rarity: rarity,
            count: getCountByRarity(rarity),
            catched: false,
            createdAt: new Date().toISOString(),
        };

        await saveToFirestore('markers', markerName, markerData);

        console.log('Marker successfully uploaded!');
        alert('Marker successfully uploaded!');
        document.getElementById('markerForm').reset();
    } catch (error) {
        console.error('Error uploading marker:', error);
        alert(`Error uploading marker: ${error.message}`);
    }
}

document.getElementById('markerForm').addEventListener('submit', handleMarkerFormSubmission);
