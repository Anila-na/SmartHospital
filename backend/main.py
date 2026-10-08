from fastapi import FastAPI, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from backend.database import engine, get_db, Base
from backend.models import (
    Patient,
    Doctor,
    Appointment,
    Prescription,
    Department,
    MedicalRecord
)


# ==================================================
# CREATE FASTAPI APP
# ==================================================

app = FastAPI(title="Smart Hospital Management System")


# ==================================================
# CREATE DATABASE TABLES
# ==================================================

Base.metadata.create_all(bind=engine)


# ==================================================
# FRONTEND PATH
# ==================================================

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"


# ==================================================
# HOME PAGE
# ==================================================

@app.get("/")
def home():
    return FileResponse(
        str(FRONTEND_DIR / "index.html")
    )


# ==================================================
# FRONTEND CSS
# ==================================================

@app.get("/style.css")
def style():
    return FileResponse(
        str(FRONTEND_DIR / "style.css")
    )


# ==================================================
# FRONTEND JAVASCRIPT
# ==================================================

@app.get("/script.js")
def script():
    return FileResponse(
        str(FRONTEND_DIR / "script.js")
    )


# ==================================================
# DASHBOARD
# ==================================================

@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):

    return {
        "hospital": "Smart Hospital Management System",
        "total_patients": db.query(Patient).count(),
        "total_doctors": db.query(Doctor).count(),
        "total_appointments": db.query(Appointment).count(),
        "total_prescriptions": db.query(Prescription).count(),
        "total_departments": db.query(Department).count(),
        "total_medical_records": db.query(MedicalRecord).count()
    }


# ==================================================
# PATIENTS
# ==================================================

@app.post("/patients")
def add_patient(
    name: str,
    age: int,
    gender: str,
    disease: str,
    db: Session = Depends(get_db)
):

    patient = Patient(
        name=name,
        age=age,
        gender=gender,
        disease=disease
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return {
        "message": "Patient added successfully!",
        "patient_id": patient.id
    }


@app.get("/patients")
def get_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()


@app.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):

    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        return {
            "message": "Patient not found"
        }

    return patient


@app.put("/patients/{patient_id}")
def update_patient(
    patient_id: int,
    name: str,
    age: int,
    gender: str,
    disease: str,
    db: Session = Depends(get_db)
):

    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        return {
            "message": "Patient not found"
        }

    patient.name = name
    patient.age = age
    patient.gender = gender
    patient.disease = disease

    db.commit()
    db.refresh(patient)

    return {
        "message": "Patient updated successfully!",
        "patient_id": patient.id
    }


@app.delete("/patients/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):

    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        return {
            "message": "Patient not found"
        }

    db.delete(patient)
    db.commit()

    return {
        "message": "Patient deleted successfully!",
        "patient_id": patient_id
    }


# ==================================================
# DOCTORS
# ==================================================

@app.post("/doctors")
def add_doctor(
    name: str,
    specialization: str,
    phone: str,
    db: Session = Depends(get_db)
):

    doctor = Doctor(
        name=name,
        specialization=specialization,
        phone=phone
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return {
        "message": "Doctor added successfully!",
        "doctor_id": doctor.id
    }


@app.get("/doctors")
def get_doctors(db: Session = Depends(get_db)):
    return db.query(Doctor).all()


@app.put("/doctors/{doctor_id}")
def update_doctor(
    doctor_id: int,
    name: str,
    specialization: str,
    phone: str,
    db: Session = Depends(get_db)
):

    doctor = db.query(Doctor).filter(
        Doctor.id == doctor_id
    ).first()

    if not doctor:
        return {
            "message": "Doctor not found"
        }

    doctor.name = name
    doctor.specialization = specialization
    doctor.phone = phone

    db.commit()
    db.refresh(doctor)

    return {
        "message": "Doctor updated successfully!",
        "doctor_id": doctor.id
    }


@app.delete("/doctors/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db)
):

    doctor = db.query(Doctor).filter(
        Doctor.id == doctor_id
    ).first()

    if not doctor:
        return {
            "message": "Doctor not found"
        }

    db.delete(doctor)
    db.commit()

    return {
        "message": "Doctor deleted successfully!",
        "doctor_id": doctor_id
    }


# ==================================================
# APPOINTMENTS
# ==================================================

@app.post("/appointments")
def add_appointment(
    patient_id: int,
    doctor_id: int,
    date: str,
    time: str,
    reason: str,
    db: Session = Depends(get_db)
):

    appointment = Appointment(
        patient_id=patient_id,
        doctor_id=doctor_id,
        date=date,
        time=time,
        reason=reason
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment booked successfully!",
        "appointment_id": appointment.id
    }


@app.get("/appointments")
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).all()


@app.put("/appointments/{appointment_id}")
def update_appointment(
    appointment_id: int,
    patient_id: int,
    doctor_id: int,
    date: str,
    time: str,
    reason: str,
    db: Session = Depends(get_db)
):

    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        return {
            "message": "Appointment not found"
        }

    appointment.patient_id = patient_id
    appointment.doctor_id = doctor_id
    appointment.date = date
    appointment.time = time
    appointment.reason = reason

    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment updated successfully!",
        "appointment_id": appointment.id
    }


@app.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):

    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        return {
            "message": "Appointment not found"
        }

    db.delete(appointment)
    db.commit()

    return {
        "message": "Appointment deleted successfully!",
        "appointment_id": appointment_id
    }


# ==================================================
# PRESCRIPTIONS
# ==================================================

@app.post("/prescriptions")
def add_prescription(
    patient_id: int,
    doctor_id: int,
    medicine: str,
    dosage: str,
    duration: str,
    instructions: str,
    db: Session = Depends(get_db)
):

    prescription = Prescription(
        patient_id=patient_id,
        doctor_id=doctor_id,
        medicine=medicine,
        dosage=dosage,
        duration=duration,
        instructions=instructions
    )

    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    return {
        "message": "Prescription added successfully!",
        "prescription_id": prescription.id
    }


@app.get("/prescriptions")
def get_prescriptions(db: Session = Depends(get_db)):
    return db.query(Prescription).all()


# ==================================================
# DEPARTMENTS
# ==================================================

@app.post("/departments")
def add_department(
    name: str,
    location: str,
    head_doctor: str,
    db: Session = Depends(get_db)
):

    department = Department(
        name=name,
        location=location,
        head_doctor=head_doctor
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return {
        "message": "Department added successfully!",
        "department_id": department.id
    }


@app.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


# ==================================================
# MEDICAL RECORDS
# ==================================================

@app.post("/medical-records")
def add_medical_record(
    patient_id: int,
    doctor_id: int,
    diagnosis: str,
    symptoms: str,
    treatment: str,
    record_date: str,
    db: Session = Depends(get_db)
):

    record = MedicalRecord(
        patient_id=patient_id,
        doctor_id=doctor_id,
        diagnosis=diagnosis,
        symptoms=symptoms,
        treatment=treatment,
        record_date=record_date
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "message": "Medical record added successfully!",
        "record_id": record.id
    }


@app.get("/medical-records")
def get_medical_records(db: Session = Depends(get_db)):
    return db.query(MedicalRecord).all()


# ==================================================
# SMART HOSPITAL CHATBOT
# ==================================================

@app.get("/chatbot")
def chatbot(
    message: str,
    db: Session = Depends(get_db)
):

    user_message = message.lower().strip()

    # Greeting
    if "hello" in user_message or "hi" in user_message:
        reply = (
            "Hello! 👋 Welcome to Smart Hospital. "
            "How can I help you?"
        )

    # Hospital
    elif "hospital" in user_message:
        reply = (
            "🏥 Welcome to Smart Hospital Management System. "
            "I can help you with doctors, patients, appointments, "
            "prescriptions, departments and medical records."
        )

    # Doctors
    elif "doctor" in user_message:
        total_doctors = db.query(Doctor).count()

        reply = (
            f"👨‍⚕️ There are currently "
            f"{total_doctors} doctors registered in the hospital."
        )

    # Patients
    elif "patient" in user_message:
        total_patients = db.query(Patient).count()

        reply = (
            f"👤 There are currently "
            f"{total_patients} patients registered in the system."
        )

    # Appointments
    elif "appointment" in user_message:
        total_appointments = db.query(Appointment).count()

        reply = (
            f"📅 There are currently "
            f"{total_appointments} appointments in the system."
        )

    # Prescriptions
    elif (
        "prescription" in user_message
        or "medicine" in user_message
    ):
        total_prescriptions = db.query(Prescription).count()

        reply = (
            f"💊 There are currently "
            f"{total_prescriptions} prescriptions in the system."
        )

    # Departments
    elif "department" in user_message:
        total_departments = db.query(Department).count()

        reply = (
            f"🏢 The hospital currently has "
            f"{total_departments} departments."
        )

    # Medical Records
    elif (
        "record" in user_message
        or "medical history" in user_message
    ):
        total_records = db.query(MedicalRecord).count()

        reply = (
            f"📋 There are currently "
            f"{total_records} medical records in the system."
        )

    # Thanks
    elif "thank" in user_message:
        reply = (
            "You're welcome! 😊 "
            "I'm always here to help."
        )

    # Goodbye
    elif "bye" in user_message:
        reply = (
            "Goodbye! 👋 Have a healthy day."
        )

    # Unknown question
    else:
        reply = (
            "🤖 I'm sorry, I didn't understand that. "
            "You can ask me about doctors, patients, "
            "appointments, prescriptions, departments "
            "or medical records."
        )

    return {
        "reply": reply
    }