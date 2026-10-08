const API_URL = "http://127.0.0.1:8000";


// ==================================================
// SECTION NAVIGATION
// ==================================================

function showSection(sectionId) {

    const sections = document.querySelectorAll(".section");

    sections.forEach(function(section) {
        section.classList.remove("active");
    });

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active");
    }
}


// ==================================================
// LOAD DASHBOARD
// ==================================================

async function loadDashboard() {

    try {

        const response = await fetch(API_URL + "/dashboard");

        if (!response.ok) {
            throw new Error("Dashboard request failed");
        }

        const data = await response.json();

        document.getElementById("patientsCount").textContent =
            data.total_patients;

        document.getElementById("doctorsCount").textContent =
            data.total_doctors;

        document.getElementById("appointmentsCount").textContent =
            data.total_appointments;

        document.getElementById("prescriptionsCount").textContent =
            data.total_prescriptions;

        document.getElementById("departmentsCount").textContent =
            data.total_departments;

        document.getElementById("recordsCount").textContent =
            data.total_medical_records;

    } catch (error) {

        console.error("Dashboard Error:", error);

    }
}


// ==================================================
// ADD PATIENT
// ==================================================

async function addPatient(event) {

    event.preventDefault();

    const name =
        document.getElementById("patientName").value;

    const age =
        document.getElementById("patientAge").value;

    const gender =
        document.getElementById("patientGender").value;

    const disease =
        document.getElementById("patientDisease").value;

    const params = new URLSearchParams({
        name: name,
        age: age,
        gender: gender,
        disease: disease
    });

    try {

        const response = await fetch(
            API_URL + "/patients?" + params.toString(),
            {
                method: "POST"
            }
        );

        const message =
            document.getElementById("patientMessage");

        if (response.ok) {

            message.textContent =
                "✅ Patient added successfully!";

            document.getElementById("patientForm").reset();

            loadPatients();

            loadDashboard();

        } else {

            message.textContent =
                "❌ Failed to add patient.";

        }

    } catch (error) {

        console.error("Patient Error:", error);

        document.getElementById("patientMessage").textContent =
            "❌ Server connection error.";

    }
}


// ==================================================
// LOAD PATIENTS
// ==================================================

async function loadPatients() {

    const patientsList =
        document.getElementById("patientsList");

    if (!patientsList) {
        return;
    }

    try {

        const response =
            await fetch(API_URL + "/patients");

        if (!response.ok) {
            throw new Error("Patients request failed");
        }

        const patients =
            await response.json();

        if (patients.length === 0) {

            patientsList.innerHTML =
                "<p>No patients found.</p>";

            return;
        }

        let html = `
            <table class="patient-table">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Disease</th>
                        <th>Action</th>
                    </tr>

                </thead>

                <tbody>
        `;

        patients.forEach(function(patient) {

            html += `
                <tr>

                    <td>${patient.id}</td>

                    <td>${patient.name}</td>

                    <td>${patient.age}</td>

                    <td>${patient.gender}</td>

                    <td>${patient.disease}</td>

                    <td>

                        <button
                            class="edit-btn"
                            onclick="editPatient(${patient.id})"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deletePatient(${patient.id})"
                        >
                            🗑️ Delete
                        </button>

                    </td>

                </tr>
            `;

        });

        html += `
                </tbody>

            </table>
        `;

        patientsList.innerHTML = html;

    } catch (error) {

        console.error("Patients Error:", error);

        patientsList.innerHTML =
            "<p>❌ Unable to load patients.</p>";

    }
}


// ==================================================
// EDIT PATIENT
// ==================================================

async function editPatient(patientId) {

    const name =
        prompt("Enter patient name:");

    if (name === null) {
        return;
    }

    const age =
        prompt("Enter patient age:");

    if (age === null) {
        return;
    }

    const gender =
        prompt("Enter gender (Male/Female):");

    if (gender === null) {
        return;
    }

    const disease =
        prompt("Enter disease:");

    if (disease === null) {
        return;
    }

    const params = new URLSearchParams({
        name: name,
        age: age,
        gender: gender,
        disease: disease
    });

    try {

        const response = await fetch(
            API_URL +
            "/patients/" +
            patientId +
            "?" +
            params.toString(),
            {
                method: "PUT"
            }
        );

        if (response.ok) {

            alert("✅ Patient updated successfully!");

            loadPatients();

            loadDashboard();

        } else {

            alert("❌ Failed to update patient.");

        }

    } catch (error) {

        console.error("Edit Patient Error:", error);

        alert("❌ Server connection error.");

    }
}


// ==================================================
// DELETE PATIENT
// ==================================================

async function deletePatient(patientId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this patient?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            API_URL + "/patients/" + patientId,
            {
                method: "DELETE"
            }
        );

        if (response.ok) {

            alert("✅ Patient deleted successfully!");

            loadPatients();

            loadDashboard();

        } else {

            alert("❌ Failed to delete patient.");

        }

    } catch (error) {

        console.error("Delete Patient Error:", error);

        alert("❌ Server connection error.");

    }
}


// ==================================================
// ADD DOCTOR
// ==================================================

async function addDoctor(event) {

    event.preventDefault();

    const name =
        document.getElementById("doctorName").value;

    const specialization =
        document.getElementById("doctorSpecialization").value;

    const phone =
        document.getElementById("doctorPhone").value;

    const params = new URLSearchParams({
        name: name,
        specialization: specialization,
        phone: phone
    });

    try {

        const response = await fetch(
            API_URL + "/doctors?" + params.toString(),
            {
                method: "POST"
            }
        );

        const message =
            document.getElementById("doctorMessage");

        if (response.ok) {

            message.textContent =
                "✅ Doctor added successfully!";

            document.getElementById("doctorForm").reset();

            loadDoctors();

            loadDashboard();

        } else {

            message.textContent =
                "❌ Failed to add doctor.";

        }

    } catch (error) {

        console.error("Doctor Error:", error);

        document.getElementById("doctorMessage").textContent =
            "❌ Server connection error.";

    }
}


// ==================================================
// LOAD DOCTORS
// ==================================================

async function loadDoctors() {

    const doctorsList =
        document.getElementById("doctorsList");

    if (!doctorsList) {
        return;
    }

    try {

        const response =
            await fetch(API_URL + "/doctors");

        if (!response.ok) {
            throw new Error("Doctors request failed");
        }

        const doctors =
            await response.json();

        if (doctors.length === 0) {

            doctorsList.innerHTML =
                "<p>No doctors found.</p>";

            return;
        }

        let html = `
            <table class="patient-table">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Specialization</th>
                        <th>Phone</th>
                    </tr>

                </thead>

                <tbody>
        `;

        doctors.forEach(function(doctor) {

            html += `
                <tr>

                    <td>${doctor.id}</td>

                    <td>${doctor.name}</td>

                    <td>${doctor.specialization}</td>

                    <td>${doctor.phone}</td>

                </tr>
            `;

        });

        html += `
                </tbody>

            </table>
        `;

        doctorsList.innerHTML = html;

    } catch (error) {

        console.error("Doctors Error:", error);

        doctorsList.innerHTML =
            "<p>❌ Unable to load doctors.</p>";

    }
}


// ==================================================
// CHATBOT - OPEN / CLOSE
// ==================================================

function toggleChatbot() {

    const chatbotBox =
        document.getElementById("chatbotBox");

    if (!chatbotBox) {
        return;
    }

    chatbotBox.classList.toggle("active");
}


// ==================================================
// CHATBOT - SEND MESSAGE
// ==================================================

async function sendChatMessage() {

    const input =
        document.getElementById("chatbotInput");

    const messages =
        document.getElementById("chatbotMessages");

    if (!input || !messages) {
        return;
    }

    const message =
        input.value.trim();

    if (message === "") {
        return;
    }


    // USER MESSAGE

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "user-message";

    userMessage.textContent =
        message;

    messages.appendChild(userMessage);


    // CLEAR INPUT

    input.value = "";


    // SCROLL DOWN

    messages.scrollTop =
        messages.scrollHeight;


    try {

        const response = await fetch(
            API_URL +
            "/chatbot?message=" +
            encodeURIComponent(message)
        );


        if (!response.ok) {
            throw new Error("Chatbot request failed");
        }


        const data =
            await response.json();


        // BOT MESSAGE

        const botMessage =
            document.createElement("div");

        botMessage.className =
            "bot-message";

        botMessage.textContent =
            data.reply;


        messages.appendChild(botMessage);


        // SCROLL DOWN

        messages.scrollTop =
            messages.scrollHeight;


    } catch (error) {

        console.error(
            "Chatbot Error:",
            error
        );


        const errorMessage =
            document.createElement("div");

        errorMessage.className =
            "bot-message";

        errorMessage.textContent =
            "❌ Sorry, I cannot connect to the hospital server right now.";


        messages.appendChild(
            errorMessage
        );


        messages.scrollTop =
            messages.scrollHeight;
    }
}


// ==================================================
// START APPLICATION
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadDashboard();

        loadPatients();

        loadDoctors();


        // PATIENT FORM

        const patientForm =
            document.getElementById("patientForm");

        if (patientForm) {

            patientForm.addEventListener(
                "submit",
                addPatient
            );

        }


        // DOCTOR FORM

        const doctorForm =
            document.getElementById("doctorForm");

        if (doctorForm) {

            doctorForm.addEventListener(
                "submit",
                addDoctor
            );

        }

    }
);