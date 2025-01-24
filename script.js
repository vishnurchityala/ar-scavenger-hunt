import firebase from './js/firebaseconfig.js';
import { 
    getFirestore, 
    collection,
    getDocs 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { utils, writeFile } from 'xlsx';

const db = getFirestore(firebase);

async function exportTeamsToExcel() {
    const teamsCollection = collection(db, 'teams');
    const teamsSnapshot = await getDocs(teamsCollection);
    const teamsData = teamsSnapshot.docs.map(doc => doc.data());

    const worksheet = utils.json_to_sheet(teamsData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Teams');

    writeFile(workbook, 'teams.xlsx');
}

exportTeamsToExcel().catch(console.error);