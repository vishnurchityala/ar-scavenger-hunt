const eventDetails = document.getElementById('event-details');
const text = "JANUARY 23 - 3PM TO 4PM - ON CAMPUS";
let index = 0;
let isDeleting = false;
const speed = 100;

function adjustHTML() {
    if (window.innerWidth <= 600) {
        document.querySelector('.navbar').innerHTML = `
        <img width="40px" src="/img/Outlook-signatureI.png" alt="">
      <img width="40px" src="/img/bennett-logo-1.webp" alt="">
        `;

    } else {
        document.querySelector('.navbar').innerHTML = `
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

document.addEventListener("DOMContentLoaded", function () {
    function updateFields() {
        const selectValue = parseInt(document.getElementById("floatingSelect").value, 10);
        console.log("Dropdown value changed:", selectValue);

        const inputFieldsContainer = document.getElementById("inputFields");
        inputFieldsContainer.innerHTML = "";

        if (selectValue > 0) {
            for (let i = 1; i <= selectValue; i++) {
                const nameField = `
            <div class="input-group flex-nowrap mb-3">
              <span class="input-group-text">Member ${i} Name</span>
              <input type="text" class="form-control" placeholder="Enter name">
            </div>
          `;
                const emailField = `
            <div class="input-group flex-nowrap mb-3">
              <span class="input-group-text">Member ${i} Gmail</span>
              <input type="email" class="form-control" placeholder="Enter Gmail">
            </div>
          `;
                inputFieldsContainer.innerHTML += nameField + emailField;
            }
        }
    }

    document.getElementById("floatingSelect").addEventListener("change", updateFields);
});