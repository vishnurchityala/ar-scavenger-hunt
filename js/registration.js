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
const text = "JANUARY 23 - 7PM TO 8PM - ON CAMPUS";
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

    const loader = document.getElementById("loader");
    loader.classList.remove("d-none");

    const teamName = document.getElementById("teamName").value.trim();
    const teamSize = parseInt(document.getElementById("teamSize").value, 10);
    const teamLead = document.getElementById("teamLead").value.trim();
    const teamMembers = [];

    for (let i = 1; i <= teamSize; i++) {
        const memberName = document.getElementById(`teamMember${i}Name`).value.trim();
        const memberEmail = document.getElementById(`teamMember${i}Email`).value.trim();

        if (!memberName || !memberEmail) {
            alert(`Please fill in all details for Team Member ${i}`);
            loader.classList.add("d-none");
            return;
        }

        if (!memberEmail.endsWith("@gmail.com")) {
            alert(`Only @gmail.com email addresses are allowed for Team Member ${i}`);
            loader.classList.add("d-none");
            return;
        }

        teamMembers.push({ name: memberName, email: memberEmail });
    }

    const registrationData = {
        teamName,
        teamSize,
        teamLead,
        teamMembers,
        teamScore: 0
    };

    console.log("Registration Data:", registrationData);

    try {
        const teamsCollection = collection(db, "teams");
        const teamDocRef = doc(teamsCollection, teamName);
        const teamDoc = await getDoc(teamDocRef);

        if (teamDoc.exists()) {
            alert("Team name already exists. Please choose a different team name.");
            loader.classList.add("d-none");
            return;
        }

        const teamsSnapshot = await getDocs(teamsCollection);
        const numberOfTeams = teamsSnapshot.size;

        if (!(numberOfTeams <= 101)) {
            alert("Registration limit reached. No more teams can be registered.");
            loader.classList.add("d-none");
            return;
        }

        await setDoc(teamDocRef, registrationData);

        const playersCollection = collection(db, "players");
        for (const member of teamMembers) {
            const playerDocRef = doc(playersCollection, member.email);
            const playerDoc = await getDoc(playerDocRef);

            if (playerDoc.exists()) {
                alert(`Email ${member.email} is already registered.`);
                loader.classList.add("d-none");
                return;
            }

            await setDoc(playerDocRef, { ...member, teamId: teamName });
        }

        alert("Registration successful!");
        document.getElementById("registrationForm").reset();
        document.getElementById("inputFields").innerHTML = "";
    } catch (error) {
        console.error("Error saving registration data: ", error);
        alert("Error saving registration data. Please try again.");
    } finally {
        loader.classList.add("d-none");
    }
}

document.getElementById("registrationForm").addEventListener("submit", handleSubmit);
