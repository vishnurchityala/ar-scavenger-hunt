// Importing Firebase and Firestore functions
import firebase from './firebaseconfig.js'; // Import the initialized firebase app
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Initialize Firestore and Storage
const db = getFirestore(firebase);
const storage = getStorage(firebase);

// Function to upload a file to Firebase Storage
async function uploadFileToStorage(file, path) {
    try {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);  // Return the file URL after upload
    } catch (error) {
        throw new Error(`Failed to upload file to ${path}: ${error.message}`);
    }
}

// Function to save the marker data to Firestore
async function saveToFirestore(collectionName, docId, data) {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data);  // Save the document in Firestore
        console.log(`Document added to ${collectionName} with ID: ${docId}`);
    } catch (error) {
        throw new Error(`Failed to save document to Firestore: ${error.message}`);
    }
}

// Function to handle form submission
async function handleMarkerFormSubmission(event) {
    event.preventDefault();  // Prevent the default form submission behavior

    try {
        // Retrieve form data
        const markerName = document.getElementById('markerName').value;
        const description = document.getElementById('description').value;
        const patternFile = document.getElementById('patternFile').files[0];
        const objectFile = document.getElementById('objectFile').files[0];
        const pictureFile = document.getElementById('pictureFile').files[0];
        const rarity = document.getElementById('rarity').value;

        // Upload files to Firebase Storage concurrently using Promise.all
        const [patternUrl, objectUrl, pictureUrl] = await Promise.all([
            uploadFileToStorage(patternFile, `patterns/${markerName}.patt`),
            uploadFileToStorage(objectFile, `objects/${markerName}.glb`),
            uploadFileToStorage(pictureFile, `pictures/${markerName}.png`),
        ]);

        // Marker data to be saved in Firestore
        const markerData = {
            name: markerName,
            description: description,
            patternUrl: patternUrl,
            objectUrl: objectUrl,
            pictureUrl: pictureUrl,
            rarity: rarity,
            catched: false,  // Default value is false
            createdAt: new Date().toISOString(),
        };

        // Save the data in Firestore
        await saveToFirestore('markers', markerName, markerData);

        // Success message and form reset
        console.log('Marker successfully uploaded!');
        alert('Marker successfully uploaded!');
        document.getElementById('markerForm').reset();  // Reset form after submission
    } catch (error) {
        console.error('Error uploading marker:', error);
        alert(`Error uploading marker: ${error.message}`);  // Show error message if failed
    }
}

// Add event listener to handle form submission
document.getElementById('markerForm').addEventListener('submit', handleMarkerFormSubmission);
