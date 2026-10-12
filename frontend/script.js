// ==================================================
// API
// ==================================================

const API_URL = "";

// Logged-in user information
let currentUser = null;

// SMART_HOSPITAL_AUTH_INTEGRATION
const hospitalOriginalFetch = window.fetch.bind(window);

window.fetch = function(input, init = {}) {
    const requestUrl = typeof input === "string" ? input : input.url;
    const pathname = new URL(requestUrl, window.location.origin).pathname;
    const token = localStorage.getItem("access_token");
    const headers = new Headers(
        init.headers || (input instanceof Request ? input.headers : undefined)
    );

    if (
        token &&
        pathname !== "/auth/login" &&
        pathname !== "/auth/signup"
    ) {
        headers.set("Authorization", "Bearer " + token);
    }

    return hospitalOriginalFetch(input, { ...init, headers });
};

document.addEventListener("DOMContentLoaded", async function() {
    const loginScreen = document.getElementById("loginScreen");
    const appShell = document.getElementById("appShell");
    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");
    const loginButton = document.getElementById("loginButton");

    function showLogin() {
        if (loginScreen) loginScreen.style.display = "flex";
        if (appShell) appShell.style.display = "none";
    }

    function showHospitalApp() {
        if (loginScreen) loginScreen.style.display = "none";
        if (appShell) appShell.style.display = "block";
    }

    showLogin();

    const savedToken = localStorage.getItem("access_token");
    if (savedToken) {
        try {
            const response = await fetch("/auth/me");
            if (response.ok) {
                currentUser = await response.json();
                console.log("Logged-in user:", currentUser);
                applyRoleNavigation();
                showHospitalApp();
            } else {
                localStorage.removeItem("access_token");
                currentUser = null;
            }
        } catch (error) {
            console.error("Session check failed:", error);
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            loginMessage.textContent = "";
            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";

            try {
                const response = await hospitalOriginalFetch("/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: document.getElementById("loginEmail").value.trim(),
                        password: document.getElementById("loginPassword").value
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.detail || "Login failed.");
                }

                localStorage.setItem("access_token", result.access_token);
                window.location.reload();
            } catch (error) {
                loginMessage.textContent =
                    error.message || "Server connection error.";
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = "Login";
            }
        });
    }
});



// ==================================================
// ROLE-BASED NAVIGATION
// ==================================================

function applyRoleNavigation() {
    if (currentUser == null || currentUser.role == null) return;

    const role = currentUser.role.toLowerCase();

    const permissions = {
        navDashboard: ['admin', 'doctor', 'receptionist'],
        navPatients: ['admin', 'doctor', 'receptionist'],
        navDoctors: ['admin', 'doctor'],
        navAppointments: ['admin', 'doctor', 'receptionist'],
        navPrescriptions: ['admin', 'doctor'],
        navDepartments: ['admin'],
        navMedicalRecords: ['admin', 'doctor'],
        navClinics: ['admin']
    };

    for (const [buttonId, allowedRoles] of Object.entries(permissions)) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.style.display = allowedRoles.includes(role) ? '' : 'none';
        }
    }
}

// ==================================================
// SECTION NAVIGATION
// ==================================================

function showSection(sectionId) {

    const sections = document.querySelectorAll("main > section");

    sections.forEach(function(section) {
        section.style.display = "none";
    });

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.style.display = "block";
    }
}


// ==================================================
// DASHBOARD
// ==================================================

async function loadDashboard() {

    try {

        const response = await fetch(API_URL + "/dashboard");
        const data = await response.json();

        document.getElementById("totalPatients").textContent =
            data.total_patients;

        document.getElementById("totalDoctors").textContent =
            data.total_doctors;

        document.getElementById("totalAppointments").textContent =
            data.total_appointments;

        document.getElementById("totalPrescriptions").textContent =
            data.total_prescriptions;

        document.getElementById("totalDepartments").textContent =
            data.total_departments;

        document.getElementById("totalMedicalRecords").textContent =
            data.total_medical_records;

        document.getElementById("totalClinics").textContent =
            data.total_clinics;

    } catch (error) {

        console.error("Dashboard Error:", error);

    }
}


// ==================================================
// PATIENTS
// ==================================================

async function addPatient(event) {

    event.preventDefault();

    const name = document.getElementById("patientName").value;
    const age = document.getElementById("patientAge").value;
    const gender = document.getElementById("patientGender").value;
    const disease = document.getElementById("patientDisease").value;

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

        const message = document.getElementById("patientMessage");

        if (response.ok) {

            message.textContent =
                "✅ Patient added successfully!";

            document.getElementById("patientForm").reset();

            loadPatients();
            loadAppointmentOptions();
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


async function loadPatients() {

    const patientsList =
        document.getElementById("patientsList");

    if (!patientsList) return;

    try {

        const response =
            await fetch(API_URL + "/patients");

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
                            onclick="editPatient(${patient.id})">
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deletePatient(${patient.id})">
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


async function editPatient(patientId) {

    const name = prompt("Enter patient name:");
    if (name === null) return;

    const age = prompt("Enter patient age:");
    if (age === null) return;

    const gender = prompt("Enter gender (Male/Female):");
    if (gender === null) return;

    const disease = prompt("Enter disease:");
    if (disease === null) return;

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


async function deletePatient(patientId) {

    const confirmDelete =
        confirm("Are you sure you want to delete this patient?");

    if (!confirmDelete) return;

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
            loadAppointmentOptions();
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
// DOCTORS
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
            loadAppointmentOptions();
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


async function loadDoctors() {

    const doctorsList =
        document.getElementById("doctorsList");

    if (!doctorsList) return;

    try {

        const response =
            await fetch(API_URL + "/doctors");

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
                        <th>Action</th>
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
                    <td>
                        <button
                            class="edit-btn"
                            onclick="editDoctor(${doctor.id})">
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteDoctor(${doctor.id})">
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

        doctorsList.innerHTML = html;

    } catch (error) {

        console.error("Doctors Error:", error);

        doctorsList.innerHTML =
            "<p>❌ Unable to load doctors.</p>";

    }
}


async function editDoctor(doctorId) {

    const name = prompt("Enter doctor name:");
    if (name === null) return;

    const specialization =
        prompt("Enter specialization:");

    if (specialization === null) return;

    const phone = prompt("Enter phone number:");
    if (phone === null) return;

    const params = new URLSearchParams({
        name: name,
        specialization: specialization,
        phone: phone
    });

    try {

        const response = await fetch(
            API_URL +
            "/doctors/" +
            doctorId +
            "?" +
            params.toString(),
            {
                method: "PUT"
            }
        );

        if (response.ok) {

            alert("✅ Doctor updated successfully!");

            loadDoctors();
            loadAppointmentOptions();
            loadDashboard();

        } else {

            alert("❌ Failed to update doctor.");

        }

    } catch (error) {

        console.error("Edit Doctor Error:", error);

        alert("❌ Server connection error.");

    }
}


async function deleteDoctor(doctorId) {

    const confirmDelete =
        confirm("Are you sure you want to delete this doctor?");

    if (!confirmDelete) return;

    try {

        const response = await fetch(
            API_URL + "/doctors/" + doctorId,
            {
                method: "DELETE"
            }
        );

        if (response.ok) {

            alert("✅ Doctor deleted successfully!");

            loadDoctors();
            loadAppointmentOptions();
            loadDashboard();

        } else {

            alert("❌ Failed to delete doctor.");

        }

    } catch (error) {

        console.error("Delete Doctor Error:", error);

        alert("❌ Server connection error.");

    }
}


// ==================================================
// APPOINTMENTS
// ==================================================

async function loadAppointmentOptions() {

    const patientSelect =
        document.getElementById("appointmentPatient");

    const doctorSelect =
        document.getElementById("appointmentDoctor");

    if (!patientSelect || !doctorSelect) return;

    try {

        const patientResponse =
            await fetch(API_URL + "/patients");

        const patients =
            await patientResponse.json();

        patientSelect.innerHTML =
            '<option value="">Select Patient</option>';

        patients.forEach(function(patient) {

            patientSelect.innerHTML += `
                <option value="${patient.id}">
                    ${patient.name}
                </option>
            `;

        });


        const doctorResponse =
            await fetch(API_URL + "/doctors");

        const doctors =
            await doctorResponse.json();

        doctorSelect.innerHTML =
            '<option value="">Select Doctor</option>';

        doctors.forEach(function(doctor) {

            doctorSelect.innerHTML += `
                <option value="${doctor.id}">
                    ${doctor.name} - ${doctor.specialization}
                </option>
            `;

        });

    } catch (error) {

        console.error(
            "Appointment Options Error:",
            error
        );

    }
}


async function addAppointment(event) {

    event.preventDefault();

    const patientId =
        document.getElementById("appointmentPatient").value;

    const doctorId =
        document.getElementById("appointmentDoctor").value;

    const date =
        document.getElementById("appointmentDate").value;

    const time =
        document.getElementById("appointmentTime").value;

    const reason =
        document.getElementById("appointmentReason").value;

    const params = new URLSearchParams({
        patient_id: patientId,
        doctor_id: doctorId,
        date: date,
        time: time,
        reason: reason
    });

    try {

        const response = await fetch(
            API_URL + "/appointments?" + params.toString(),
            {
                method: "POST"
            }
        );

        const message =
            document.getElementById("appointmentMessage");

        if (response.ok) {

            message.textContent =
                "✅ Appointment booked successfully!";

            document.getElementById("appointmentForm").reset();

            loadAppointments();
            loadAppointmentOptions();
            loadDashboard();

        } else {

            message.textContent =
                "❌ Failed to book appointment.";

        }

    } catch (error) {

        console.error("Appointment Error:", error);

        document.getElementById("appointmentMessage").textContent =
            "❌ Server connection error.";

    }
}


async function loadAppointments() {

    const appointmentsList =
        document.getElementById("appointmentsList");

    if (!appointmentsList) return;

    try {

        const response =
            await fetch(API_URL + "/appointments");

        const appointments =
            await response.json();

        if (appointments.length === 0) {

            appointmentsList.innerHTML =
                "<p>No appointments found.</p>";

            return;
        }

        let html = `
            <table class="patient-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Patient ID</th>
                        <th>Doctor ID</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Reason</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        appointments.forEach(function(appointment) {

            html += `
                <tr>
                    <td>${appointment.id}</td>
                    <td>${appointment.patient_id}</td>
                    <td>${appointment.doctor_id}</td>
                    <td>${appointment.date}</td>
                    <td>${appointment.time}</td>
                    <td>${appointment.reason}</td>
                    <td>
                        <button
                            class="edit-btn"
                            onclick="editAppointment(${appointment.id})">
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteAppointment(${appointment.id})">
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

        appointmentsList.innerHTML = html;

    } catch (error) {

        console.error("Appointments Error:", error);

        appointmentsList.innerHTML =
            "<p>❌ Unable to load appointments.</p>";

    }
}


async function editAppointment(appointmentId) {

    const patientId =
        prompt("Enter Patient ID:");

    if (patientId === null) return;

    const doctorId =
        prompt("Enter Doctor ID:");

    if (doctorId === null) return;

    const date =
        prompt("Enter appointment date:");

    if (date === null) return;

    const time =
        prompt("Enter appointment time:");

    if (time === null) return;

    const reason =
        prompt("Enter appointment reason:");

    if (reason === null) return;

    const params = new URLSearchParams({
        patient_id: patientId,
        doctor_id: doctorId,
        date: date,
        time: time,
        reason: reason
    });

    try {

        const response = await fetch(
            API_URL +
            "/appointments/" +
            appointmentId +
            "?" +
            params.toString(),
            {
                method: "PUT"
            }
        );

        if (response.ok) {

            alert("✅ Appointment updated successfully!");

            loadAppointments();
            loadDashboard();

        } else {

            alert("❌ Failed to update appointment.");

        }

    } catch (error) {

        console.error("Edit Appointment Error:", error);

        alert("❌ Server connection error.");

    }
}


async function deleteAppointment(appointmentId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this appointment?"
        );

    if (!confirmDelete) return;

    try {

        const response = await fetch(
            API_URL + "/appointments/" + appointmentId,
            {
                method: "DELETE"
            }
        );

        if (response.ok) {

            alert("✅ Appointment deleted successfully!");

            loadAppointments();
            loadDashboard();

        } else {

            alert("❌ Failed to delete appointment.");

        }

    } catch (error) {

        console.error("Delete Appointment Error:", error);

        alert("❌ Server connection error.");

    }
}


// ==================================================
// START APPLICATION
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (localStorage.getItem("access_token")) {
            loadDashboard();
            loadPatients();
            loadDoctors();
            loadAppointmentOptions();
            loadAppointments();
        }


        const patientForm =
            document.getElementById("patientForm");

        if (patientForm) {

            patientForm.addEventListener(
                "submit",
                addPatient
            );

        }


        const doctorForm =
            document.getElementById("doctorForm");

        if (doctorForm) {

            doctorForm.addEventListener(
                "submit",
                addDoctor
            );

        }


        const appointmentForm =
            document.getElementById("appointmentForm");

        if (appointmentForm) {

            appointmentForm.addEventListener(
                "submit",
                addAppointment
            );

        }

    }
);

async function addPrescription(event) {
    event.preventDefault();

    const patientId = document.getElementById("prescriptionPatientId").value;
    const doctorId = document.getElementById("prescriptionDoctorId").value;
    const medicine = document.getElementById("prescriptionMedicine").value;
    const dosage = document.getElementById("prescriptionDosage").value;
    const duration = document.getElementById("prescriptionDuration").value;
    const instructions = document.getElementById("prescriptionInstructions").value;

    const params = new URLSearchParams({
        patient_id: patientId,
        doctor_id: doctorId,
        medicine: medicine,
        dosage: dosage,
        duration: duration,
        instructions: instructions
    });

    const response = await fetch("/prescriptions", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    });

    const data = await response.json();

    document.getElementById("prescriptionMessage").textContent =
        data.message || "Prescription added successfully!";

    if (response.ok) {
        document.getElementById("prescriptionForm").reset();
        loadPrescriptions();
    }
}

async function loadPrescriptions() {
    const response = await fetch(API_URL + "/prescriptions");
    const prescriptions = await response.json();
    const list = document.getElementById("prescriptionsList");

    if (!list) return;

    if (!response.ok || !Array.isArray(prescriptions)) {
        list.innerHTML = "<p>Could not load prescriptions.</p>";
        return;
    }

    if (prescriptions.length === 0) {
        list.innerHTML = "<p>No prescriptions found.</p>";
        return;
    }

    list.innerHTML = `
        <table class="patient-table">
            <tr>
                <th>ID</th><th>Patient ID</th><th>Doctor ID</th>
                <th>Medicine</th><th>Dosage</th><th>Duration</th>
                <th>Instructions</th><th>Actions</th>
            </tr>
            ${prescriptions.map(p => `
                <tr>
                    <td>${p.id}</td><td>${p.patient_id}</td>
                    <td>${p.doctor_id}</td><td>${p.medicine}</td>
                    <td>${p.dosage}</td><td>${p.duration}</td>
                    <td>${p.instructions}</td>
                    <td>
                        <button type="button" onclick="editPrescription(${p.id})">Edit</button>
                        <button type="button" onclick="deletePrescription(${p.id})">Delete</button>
                    </td>
                </tr>
            `).join("")}
        </table>`;
}

async function editPrescription(id) {
    try {
        const response = await fetch(API_URL + "/prescriptions");
        const prescriptions = await response.json();
        const p = prescriptions.find(item => item.id === id);

        if (!p) {
            alert("Prescription not found.");
            return;
        }

        const patient_id = prompt("Patient ID:", p.patient_id);
        if (patient_id === null) return;
        const doctor_id = prompt("Doctor ID:", p.doctor_id);
        if (doctor_id === null) return;
        const medicine = prompt("Medicine:", p.medicine);
        if (medicine === null) return;
        const dosage = prompt("Dosage:", p.dosage);
        if (dosage === null) return;
        const duration = prompt("Duration:", p.duration);
        if (duration === null) return;
        const instructions = prompt("Instructions:", p.instructions);
        if (instructions === null) return;

        if (!patient_id.trim() || !doctor_id.trim() ||
            !medicine.trim() || !dosage.trim() ||
            !duration.trim() || !instructions.trim() ||
            !Number.isInteger(Number(patient_id)) ||
            !Number.isInteger(Number(doctor_id))) {
            alert("Please enter valid IDs and complete all fields.");
            return;
        }

        const updated = await fetch(API_URL + "/prescriptions/" + id, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                patient_id: Number(patient_id),
                doctor_id: Number(doctor_id),
                medicine: medicine.trim(),
                dosage: dosage.trim(),
                duration: duration.trim(),
                instructions: instructions.trim(),
                clinic_id: p.clinic_id
            })
        });

        const result = await updated.json();
        if (!updated.ok) throw new Error(result.detail || "Update failed");

        alert("Prescription updated successfully!");
        await loadPrescriptions();
    } catch (error) {
        alert("Update failed: " + error.message);
    }
}

async function deletePrescription(id) {
    if (!confirm("Delete prescription #" + id + "?")) return;

    try {
        const response = await fetch(API_URL + "/prescriptions/" + id, {
            method: "DELETE"
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Delete failed");

        alert("Prescription deleted successfully!");
        await loadPrescriptions();
    } catch (error) {
        alert("Delete failed: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const prescriptionForm = document.getElementById("prescriptionForm");

    if (prescriptionForm) {
        prescriptionForm.addEventListener("submit", addPrescription);
        loadPrescriptions();
    }
});


async function addDepartment(event) {
    event.preventDefault();

    const name = document.getElementById("departmentName").value;
    const location = document.getElementById("departmentLocation").value;
    const headDoctor = document.getElementById("departmentHead").value;

    const params = new URLSearchParams({
        name: name,
        location: location,
        head_doctor: headDoctor
    });

    const response = await fetch("/departments", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    });

    const data = await response.json();

    document.getElementById("departmentMessage").textContent =
        data.message || "Department added successfully!";

    if (response.ok) {
        document.getElementById("departmentForm").reset();
        loadDepartments();
    }
}

async function loadDepartments() {
    const response = await fetch("/departments");
    const departments = await response.json();
    const list = document.getElementById("departmentsList");

    if (!list) return;

    if (departments.length === 0) {
        list.innerHTML = "<p>No departments found.</p>";
        return;
    }

    list.innerHTML = `
        <table class="patient-table">
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Head Doctor</th>
                <th>Actions</th>
            </tr>
            ${departments.map(d => `
                <tr>
                    <td>${d.id}</td>
                    <td>${d.name}</td>
                    <td>${d.location}</td>
                    <td>${d.head_doctor}</td>
                    <td>
                        <button type="button" onclick="editDepartment(${d.id})">Edit</button>
                        <button type="button" onclick="deleteDepartment(${d.id})">Delete</button>
                    </td>
                </tr>
            `).join("")}
        </table>
    `;
}

async function editDepartment(id) {
    try {
        const response = await fetch("/departments");
        const departments = await response.json();
        const d = departments.find(item => item.id === id);
        if (!d) return alert("Department not found.");

        const name = prompt("Department name:", d.name);
        if (name === null) return;
        const location = prompt("Department location:", d.location);
        if (location === null) return;
        const headDoctor = prompt("Head doctor's name:", d.head_doctor);
        if (headDoctor === null) return;

        if (!name.trim() || !location.trim() || !headDoctor.trim()) {
            return alert("All fields are required.");
        }

        const result = await fetch(`/departments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name.trim(),
                location: location.trim(),
                head_doctor: headDoctor.trim(),
                clinic_id: d.clinic_id ?? null
            })
        });

        if (!result.ok) throw new Error("Update failed");
        alert("Department updated successfully!");
        await loadDepartments();
    } catch (error) {
        console.error(error);
        alert("Could not update department.");
    }
}

async function deleteDepartment(id) {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
        const result = await fetch(`/departments/${id}`, {
            method: "DELETE"
        });
        if (!result.ok) throw new Error("Delete failed");
        alert("Department deleted successfully!");
        await loadDepartments();
    } catch (error) {
        console.error(error);
        alert("Could not delete department.");
    }
}

document.addEventListener("DOMContentLoaded", function() {

    const departmentForm =
        document.getElementById("departmentForm");

    if (departmentForm) {
        departmentForm.addEventListener(
            "submit",
            addDepartment
        );

        loadDepartments();
    }

});


async function addMedicalRecord(event) {
    event.preventDefault();

    const patientId = document.getElementById("recordPatientId").value;
    const doctorId = document.getElementById("recordDoctorId").value;
    const diagnosis = document.getElementById("recordDiagnosis").value;
    const symptoms = document.getElementById("recordSymptoms").value;
    const treatment = document.getElementById("recordTreatment").value;
    const recordDate = document.getElementById("recordDate").value;

    const params = new URLSearchParams({
        patient_id: patientId,
        doctor_id: doctorId,
        diagnosis: diagnosis,
        symptoms: symptoms,
        treatment: treatment,
        record_date: recordDate
    });

    const response = await fetch("/medical-records", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
    });

    const data = await response.json();

    document.getElementById("recordMessage").textContent =
        data.message || "Medical record added successfully!";

    if (response.ok) {
        document.getElementById("recordForm").reset();
        loadMedicalRecords();
    }
}

async function loadMedicalRecords() {
    const response = await fetch("/medical-records");
    const records = await response.json();
    const list = document.getElementById("recordsList");

    if (!list) return;

    if (!response.ok || !Array.isArray(records)) {
        list.innerHTML = "<p>Could not load medical records.</p>";
        return;
    }

    if (records.length === 0) {
        list.innerHTML = "<p>No medical records found.</p>";
        return;
    }

    list.innerHTML = `
        <table class="patient-table">
            <tr>
                <th>ID</th><th>Patient ID</th><th>Doctor ID</th>
                <th>Diagnosis</th><th>Symptoms</th><th>Treatment</th>
                <th>Date</th><th>Actions</th>
            </tr>
            ${records.map(r => `
                <tr>
                    <td>${r.id}</td><td>${r.patient_id}</td>
                    <td>${r.doctor_id}</td><td>${r.diagnosis}</td>
                    <td>${r.symptoms}</td><td>${r.treatment}</td>
                    <td>${r.record_date}</td>
                    <td>
                        <button type="button" onclick="editMedicalRecord(${r.id})">Edit</button>
                        <button type="button" onclick="deleteMedicalRecord(${r.id})">Delete</button>
                    </td>
                </tr>
            `).join("")}
        </table>`;
}

async function editMedicalRecord(id) {
    try {
        const response = await fetch("/medical-records");
        const records = await response.json();
        const r = records.find(item => item.id === id);

        if (!r) {
            alert("Medical record not found.");
            return;
        }

        const patient_id = prompt("Patient ID:", r.patient_id);
        if (patient_id === null) return;
        const doctor_id = prompt("Doctor ID:", r.doctor_id);
        if (doctor_id === null) return;
        const diagnosis = prompt("Diagnosis:", r.diagnosis);
        if (diagnosis === null) return;
        const symptoms = prompt("Symptoms:", r.symptoms);
        if (symptoms === null) return;
        const treatment = prompt("Treatment:", r.treatment);
        if (treatment === null) return;
        const record_date = prompt("Record date:", r.record_date);
        if (record_date === null) return;

        if (!patient_id.trim() || !doctor_id.trim() ||
            !diagnosis.trim() || !symptoms.trim() ||
            !treatment.trim() || !record_date.trim() ||
            !Number.isInteger(Number(patient_id)) ||
            !Number.isInteger(Number(doctor_id))) {
            alert("Please enter valid IDs and complete all fields.");
            return;
        }

        const updated = await fetch(`/medical-records/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                patient_id: Number(patient_id),
                doctor_id: Number(doctor_id),
                diagnosis: diagnosis.trim(),
                symptoms: symptoms.trim(),
                treatment: treatment.trim(),
                record_date: record_date.trim(),
                clinic_id: r.clinic_id
            })
        });

        const result = await updated.json();
        if (!updated.ok) throw new Error(result.detail || "Update failed");

        alert("Medical record updated successfully!");
        await loadMedicalRecords();
    } catch (error) {
        alert("Update failed: " + error.message);
    }
}

async function deleteMedicalRecord(id) {
    if (!confirm("Delete medical record #" + id + "?")) return;

    try {
        const response = await fetch(`/medical-records/${id}`, {
            method: "DELETE"
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Delete failed");

        alert("Medical record deleted successfully!");
        await loadMedicalRecords();
    } catch (error) {
        alert("Delete failed: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", function() {

    const recordForm =
        document.getElementById("recordForm");

    if (recordForm) {
        recordForm.addEventListener(
            "submit",
            addMedicalRecord
        );

        loadMedicalRecords();
    }

});


/* ================= CHATBOT ================= */

function toggleChatbot() {
    const chatbotBox = document.getElementById("chatbotBox");

    if (!chatbotBox) {
        return;
    }

    chatbotBox.classList.toggle("active");
}

async function sendChatMessage() {
    const input = document.getElementById("chatbotInput");
    const messages = document.getElementById("chatbotMessages");

    if (!input || !messages) {
        return;
    }

    const message = input.value.trim();

    if (message === "") {
        return;
    }

    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = message;

    messages.appendChild(userMessage);
    input.value = "";

    messages.scrollTop = messages.scrollHeight;

    try {
        const response = await fetch(
            "http://127.0.0.1:8000/chatbot?message=" +
            encodeURIComponent(message)
        );

        if (!response.ok) {
            throw new Error("Chatbot request failed");
        }

        const data = await response.json();

        const botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        botMessage.textContent = data.reply;

        messages.appendChild(botMessage);
        messages.scrollTop = messages.scrollHeight;

    } catch (error) {
        console.error("Chatbot Error:", error);

        const errorMessage = document.createElement("div");
        errorMessage.className = "bot-message";
        errorMessage.textContent =
            "❌ Sorry, I cannot connect to the hospital server.";

        messages.appendChild(errorMessage);
        messages.scrollTop = messages.scrollHeight;
    }
}

// Load registered patients and doctors for prescriptions
async function loadPrescriptionOptions() {
    const patientSelect = document.getElementById("prescriptionPatientId");
    const doctorSelect = document.getElementById("prescriptionDoctorId");

    if (!patientSelect || !doctorSelect) return;

    try {
        const patientResponse = await fetch(API_URL + "/patients");
        const patients = await patientResponse.json();

        patientSelect.innerHTML = '<option value="">Select Patient</option>';

        patients.forEach(function(patient) {
            patientSelect.innerHTML += `
                <option value="${patient.id}">${patient.name}</option>
            `;
        });

        const doctorResponse = await fetch(API_URL + "/doctors");
        const doctors = await doctorResponse.json();

        doctorSelect.innerHTML = '<option value="">Select Doctor</option>';

        doctors.forEach(function(doctor) {
            doctorSelect.innerHTML += `
                <option value="${doctor.id}">
                    ${doctor.name} - ${doctor.specialization}
                </option>
            `;
        });

    } catch (error) {
        console.error("Prescription Options Error:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadPrescriptionOptions);

// CLINICS MANAGEMENT
document.addEventListener("DOMContentLoaded", function () {
    const clinicForm = document.getElementById("clinicForm");
    const clinicsList = document.getElementById("clinicsList");
    const clinicMessage = document.getElementById("clinicMessage");

    if (!clinicForm || !clinicsList) return;

    async function loadClinics() {
        try {
            const response = await fetch(API_URL + "/clinics");
            if (!response.ok) throw new Error("Could not load clinics");
            const clinics = await response.json();
            clinicsList.replaceChildren();

            if (clinics.length === 0) {
                clinicsList.textContent = "No clinics registered yet.";
                return;
            }

            clinics.forEach(function (clinic) {
                const item = document.createElement("div");
                const title = document.createElement("h4");
                const address = document.createElement("p");
                const phone = document.createElement("p");

                title.textContent = clinic.name;
                address.textContent = "Address: " + (clinic.address || "Not provided");
                phone.textContent = "Phone: " + (clinic.phone || "Not provided");

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => editClinic(clinic));

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => deleteClinic(clinic.id));

                item.append(title, address, phone, editButton, deleteButton);
                clinicsList.appendChild(item);
            });
        } catch (error) {
            clinicsList.textContent = "Unable to load clinics. Please check the server.";
            console.error(error);
        }
    }

    async function editClinic(clinic) {
        const name = prompt("Clinic name:", clinic.name);
        if (name === null) return;
        const address = prompt("Clinic address:", clinic.address || "");
        if (address === null) return;
        const phone = prompt("Clinic phone:", clinic.phone || "");
        if (phone === null) return;

        if (!name.trim()) {
            alert("Clinic name is required.");
            return;
        }

        try {
            const response = await fetch(API_URL + "/clinics/" + clinic.id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    address: address.trim() || null,
                    phone: phone.trim() || null
                })
            });
            if (!response.ok) throw new Error("Could not update clinic");
            alert("Clinic updated successfully!");
            await loadClinics();
        } catch (error) {
            alert("Error: " + error.message);
        }
    }

    async function deleteClinic(id) {
        if (!confirm("Are you sure you want to delete this clinic?")) return;
        try {
            const response = await fetch(API_URL + "/clinics/" + id, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Could not delete clinic");
            alert("Clinic deleted successfully!");
            await loadClinics();
        } catch (error) {
            alert("Error: " + error.message);
        }
    }

    clinicForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const clinic = {
            name: document.getElementById("clinicName").value.trim(),
            address: document.getElementById("clinicAddress").value.trim(),
            phone: document.getElementById("clinicPhone").value.trim()
        };

        try {
            const response = await fetch(API_URL + "/clinics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clinic)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.detail || "Could not save clinic");
            }

            clinicMessage.textContent = "Clinic added successfully!";
            clinicForm.reset();
            await loadClinics();
        } catch (error) {
            clinicMessage.textContent = "Error: " + error.message;
        }
    });

    loadClinics();
});


// SMART HOSPITAL LOGOUT
document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("access_token");
            window.location.reload();
        });
    }
});
