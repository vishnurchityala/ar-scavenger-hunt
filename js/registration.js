import firebase from './firebaseconfig.js';
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const db = getFirestore(firebase);

const eventDetails = document.getElementById('event-details');
const text = "JANUARY 23 - 3PM TO 4PM - ON CAMPUS";
let index = 0;
let isDeleting = false;
const speed = 100;

function adjustHTML() {
    const navbar = document.querySelector('.navbar');
    if (window.innerWidth <= 600) {
        navbar.innerHTML = `
            <img width="100px" src="/img/Outlook-signatureI.png" alt="">
            <img width="90px" src="/img/bennett-logo-1.webp" alt="">
        `;
    } else {
        navbar.innerHTML = `
            <img width="80px" src="/img/Outlook-signatureI.png" alt="">
            <img width="70px" src="/img/bennett-logo-1.webp" alt="">
        `;
    }
}

window.addEventListener('resize', adjustHTML);
adjustHTML();

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

function updateFields() {
    const selectValue = parseInt(document.getElementById("teamSize").value, 10);
    console.log("Dropdown value changed:", selectValue);

    const inputFieldsContainer = document.getElementById("inputFields");
    inputFieldsContainer.innerHTML = "";

    if (selectValue > 0) {
        for (let i = 1; i <= selectValue; i++) {
            inputFieldsContainer.innerHTML += `
                <div class="mt-3">
                    <p class="m-0 mb-2 ms-3 input-labels">Team Member ${i} Name</p>
                    <input type="text" id="teamMember${i}Name" class="form-control first-input px-3 py-2 rounded-pill border-teal-blue" placeholder="Team Member ${i} Name" aria-label="Team Member ${i} Name">
                </div>
                <div class="mt-3">
                    <p class="m-0 mb-2 ms-3 input-labels">Team Member ${i} Email</p>
                    <input type="email" id="teamMember${i}Email" class="form-control first-input px-3 py-2 rounded-pill border-teal-blue" placeholder="Team Member ${i} Email" aria-label="Team Member ${i} Email">
                </div>
            `;
        }
    }
}

document.getElementById("teamSize").addEventListener("change", updateFields);
async function handleSubmit(event) {
    event.preventDefault();

    const teamName = document.getElementById("teamName").value.trim();
    const teamSize = parseInt(document.getElementById("teamSize").value, 10);
    const teamMembers = [];

    for (let i = 1; i <= teamSize; i++) {
        const memberName = document.getElementById(`teamMember${i}Name`).value.trim();
        const memberEmail = document.getElementById(`teamMember${i}Email`).value.trim();

        if (!memberName || !memberEmail) {
            alert(`Please fill in all details for Team Member ${i}`);
            return;
        }

        teamMembers.push({ name: memberName, email: memberEmail });
    }

    const registrationData = {
        teamName,
        teamSize,
        teamMembers,
        teamScore: 0
    };

    console.log("Registration Data:", registrationData);

    try {
        const teamsCollection = collection(db, "teams");
        const teamsSnapshot = await getDocs(teamsCollection);
        const numberOfTeams = teamsSnapshot.size;

        if (!(numberOfTeams <= 2)) {
            alert("Registration limit reached. No more teams can be registered.");
            return;
        }

        const playersCollection = collection(db, "players");
        for (const member of teamMembers) {
            const playerDocRef = doc(playersCollection, member.email);
            const playerDoc = await getDoc(playerDocRef);

            if (playerDoc.exists()) {
                alert(`Email ${member.email} is already registered.`);
                return;
            }
        }

        await addDoc(teamsCollection, registrationData);

        for (const member of teamMembers) {
            const playerDocRef = doc(playersCollection, member.email);
            await setDoc(playerDocRef, { ...member, teamName });
        }

        alert("Registration successful!");
        document.getElementById("registrationForm").reset();
        document.getElementById("inputFields").innerHTML = "";
    } catch (error) {
        console.error("Error saving registration data: ", error);
        alert("Error saving registration data. Please try again.");
    }
}

document.getElementById("registrationForm").addEventListener("submit", handleSubmit);
