// ==================================================
// API
// ==================================================

const API_URL = "";


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

        loadDashboard();
        loadPatients();
        loadDoctors();
        loadAppointmentOptions();
        loadAppointments();


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
    const response = await fetch("/prescriptions");
    const prescriptions = await response.json();

    const list = document.getElementById("prescriptionsList");

    if (!list) return;

    if (prescriptions.length === 0) {
        list.innerHTML = "<p>No prescriptions found.</p>";
        return;
    }

    list.innerHTML = `
        <table class="patient-table">
            <tr>
                <th>ID</th>
                <th>Patient ID</th>
                <th>Doctor ID</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Duration</th>
                <th>Instructions</th>
            </tr>
            ${prescriptions.map(function(p) {
                return `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.patient_id}</td>
                        <td>${p.doctor_id}</td>
                        <td>${p.medicine}</td>
                        <td>${p.dosage}</td>
                        <td>${p.duration}</td>
                        <td>${p.instructions}</td>
                    </tr>
                `;
            }).join("")}
        </table>
    `;
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
            </tr>

            ${departments.map(function(d) {
                return `
                    <tr>
                        <td>${d.id}</td>
                        <td>${d.name}</td>
                        <td>${d.location}</td>
                        <td>${d.head_doctor}</td>
                    </tr>
                `;
            }).join("")}
        </table>
    `;
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

    if (records.length === 0) {
        list.innerHTML = "<p>No medical records found.</p>";
        return;
    }

    list.innerHTML = `
        <table class="patient-table">
            <tr>
                <th>ID</th>
                <th>Patient ID</th>
                <th>Doctor ID</th>
                <th>Diagnosis</th>
                <th>Symptoms</th>
                <th>Treatment</th>
                <th>Date</th>
            </tr>

            ${records.map(function(r) {
                return `
                    <tr>
                        <td>${r.id}</td>
                        <td>${r.patient_id}</td>
                        <td>${r.doctor_id}</td>
                        <td>${r.diagnosis}</td>
                        <td>${r.symptoms}</td>
                        <td>${r.treatment}</td>
                        <td>${r.record_date}</td>
                    </tr>
                `;
            }).join("")}
        </table>
    `;
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

