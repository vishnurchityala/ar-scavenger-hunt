import firebase from './firebaseconfig.js';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(firebase);


async function populateTeamDetails() {
    const teamsCollection = collection(db, 'teams');
    const q = query(teamsCollection, orderBy('teamScore', 'desc'));
    const teamsSnapshot = await getDocs(q);
    const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Populating team details...');
    const container = document.getElementById('team-container');
    container.innerHTML = '';

    teamsList.forEach((team, index) => {
        console.log('Team:', team);
        const teamElement = document.createElement('div');
        teamElement.className = 'd-flex px-4 align-items-center justify-content-between bg-white py-3 rounded-4 mb-3 shadow-sm w-100';

        const teamInfo = document.createElement('div');
        teamInfo.className = 'd-flex gap-3 align-items-center justify-content-center';

        const teamImage = document.createElement('img');
        teamImage.width = 35;
        teamImage.src = index < 3 ? `img/${index + 1}-place.png` : 'img/user.png';
        teamImage.alt = '';

        const teamDetails = document.createElement('div');
        teamDetails.className = 'team-info';

        const teamName = document.createElement('p');
        teamName.className = 'm-0 team-name fw-bold';
        teamName.textContent = team.teamName;

        const teamLead = document.createElement('p');
        teamLead.className = 'm-0 team-lead';
        teamLead.textContent = team.teamLead;

        const teamScore = document.createElement('p');
        teamScore.className = 'm-0 fw-bold';
        teamScore.textContent = `🔥 ${team.teamScore}`;

        teamDetails.appendChild(teamName);
        teamDetails.appendChild(teamLead);
        teamInfo.appendChild(teamImage);
        teamInfo.appendChild(teamDetails);
        teamElement.appendChild(teamInfo);
        teamElement.appendChild(teamScore);
        container.appendChild(teamElement);
    });
    console.log('Team details populated successfully.');
}


populateTeamDetails();
