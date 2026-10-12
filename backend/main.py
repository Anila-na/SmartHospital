from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from backend.database import engine, get_db, Base
from backend.auth import router as auth_router, get_current_user
from backend.models import (
    Patient,
    Doctor,
    Appointment,
    Prescription,
    Department,
    MedicalRecord,
    Clinic,
    User,
)


# ==================================================
# CREATE FASTAPI APP
# ==================================================

def require_role(user: User, allowed_roles: list[str]) -> None:
    if user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Aapko is action ki permission nahi hai")


app = FastAPI(title="Smart Hospital Management System")
app.include_router(auth_router)


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
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    clinic_id = current_user.clinic_id

    return {
        "hospital": "Smart Hospital Management System",
        "total_patients": db.query(Patient).filter(Patient.clinic_id == clinic_id).count(),
        "total_doctors": db.query(Doctor).filter(Doctor.clinic_id == clinic_id).count(),
        "total_appointments": db.query(Appointment).filter(Appointment.clinic_id == clinic_id).count(),
        "total_prescriptions": db.query(Prescription).filter(Prescription.clinic_id == clinic_id).count(),
        "total_departments": db.query(Department).filter(Department.clinic_id == clinic_id).count(),
        "total_medical_records": db.query(MedicalRecord).filter(MedicalRecord.clinic_id == clinic_id).count(),
        "total_clinics": db.query(Clinic).filter(Clinic.id == clinic_id).count()
    }

# PATIENTS
# ==================================================

@app.post("/patients")
def add_patient(
    name: str,
    age: int,
    gender: str,
    disease: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin", "Receptionist"])

    patient = Patient(
        name=name,
        age=age,
        gender=gender,
        disease=disease,
        clinic_id=current_user.clinic_id
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return {
        "message": "Patient added successfully!",
        "patient_id": patient.id
    }


@app.get("/patients")
def get_patients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Patient).filter(
        Patient.clinic_id == current_user.clinic_id
    ).all()


@app.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.clinic_id == current_user.clinic_id
    ).first()

    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    return patient


@app.put("/patients/{patient_id}")
def update_patient(
    patient_id: int,
    name: str,
    age: int,
    gender: str,
    disease: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin", "Receptionist"])

    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.clinic_id == current_user.clinic_id
    ).first()

    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.clinic_id == current_user.clinic_id
    ).first()

    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    doctor = Doctor(
        name=name,
        specialization=specialization,
        phone=phone,
        clinic_id=current_user.clinic_id
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return {
        "message": "Doctor added successfully!",
        "doctor_id": doctor.id
    }


@app.get("/doctors")
def get_doctors(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Doctor).filter(Doctor.clinic_id == current_user.clinic_id)
    return query.all()


@app.put("/doctors/{doctor_id}")
def update_doctor(
    doctor_id: int,
    name: str,
    specialization: str,
    phone: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    doctor = db.query(Doctor).filter(
        Doctor.id == doctor_id,
        Doctor.clinic_id == current_user.clinic_id
    ).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found in your clinic")

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    doctor = db.query(Doctor).filter(
        Doctor.id == doctor_id,
        Doctor.clinic_id == current_user.clinic_id
    ).first()

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found in your clinic"
        )

    db.delete(doctor)
    db.commit()

    return {
        "message": "Doctor deleted successfully!",
        "doctor_id": doctor_id
    }


# ==================================================
# APPOINTMENTS
# ==================================================

def validate_appointment_clinic(
    patient_id: int,
    doctor_id: int,
    current_user: User,
    db: Session
) -> None:
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.clinic_id == current_user.clinic_id
    ).first()

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found in your clinic"
        )

    doctor = db.query(Doctor).filter(
        Doctor.id == doctor_id,
        Doctor.clinic_id == current_user.clinic_id
    ).first()

    if doctor is None:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found in your clinic"
        )


@app.post("/appointments")
def add_appointment(
    patient_id: int,
    doctor_id: int,
    date: str,
    time: str,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])
    validate_appointment_clinic(patient_id, doctor_id, current_user, db)

    appointment = Appointment(
        patient_id=patient_id,
        doctor_id=doctor_id,
        date=date,
        time=time,
        reason=reason,
        clinic_id=current_user.clinic_id
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment booked successfully!",
        "appointment_id": appointment.id
    }


@app.get("/appointments")
def get_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Appointment).filter(
        Appointment.clinic_id == current_user.clinic_id
    ).all()


@app.put("/appointments/{appointment_id}")
def update_appointment(
    appointment_id: int,
    patient_id: int,
    doctor_id: int,
    date: str,
    time: str,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])
    validate_appointment_clinic(patient_id, doctor_id, current_user, db)

    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.clinic_id == current_user.clinic_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found in your clinic"
        )

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.clinic_id == current_user.clinic_id
    ).first()

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found in your clinic"
        )

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    prescription = Prescription(
        patient_id=patient_id,
        doctor_id=doctor_id,
        medicine=medicine,
        dosage=dosage,
        duration=duration,
        instructions=instructions,
        clinic_id=current_user.clinic_id
    )

    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    return {
        "message": "Prescription added successfully!",
        "prescription_id": prescription.id
    }


@app.get("/prescriptions")
def get_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Prescription).filter(
        Prescription.clinic_id == current_user.clinic_id
    ).all()


@app.put("/prescriptions/{prescription_id}")
def update_prescription(
    prescription_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.clinic_id == current_user.clinic_id
    ).first()

    if not prescription:
        raise HTTPException(
            status_code=404,
            detail="Prescription not found in your clinic"
        )

    for field in [
        "patient_id", "doctor_id", "medicine",
        "dosage", "duration", "instructions"
    ]:
        if field in data:
            setattr(prescription, field, data[field])

    db.commit()
    db.refresh(prescription)

    return {
        "message": "Prescription updated successfully!",
        "prescription_id": prescription.id
    }


@app.delete("/prescriptions/{prescription_id}")
def delete_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    prescription = db.query(Prescription).filter(
        Prescription.id == prescription_id,
        Prescription.clinic_id == current_user.clinic_id
    ).first()

    if prescription is None:
        raise HTTPException(
            status_code=404,
            detail="Prescription not found in your clinic"
        )

    db.delete(prescription)
    db.commit()

    return {"message": "Prescription deleted successfully!"}


# ==================================================
# DEPARTMENTS
# ==================================================

@app.post("/departments")
def add_department(
    name: str,
    location: str,
    head_doctor: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    department = Department(
        name=name,
        location=location,
        head_doctor=head_doctor,
        clinic_id=current_user.clinic_id
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return {
        "message": "Department added successfully!",
        "department_id": department.id
    }


@app.get("/departments")
def get_departments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Department).filter(
        Department.clinic_id == current_user.clinic_id
    ).all()


# ==================================================

@app.post("/medical-records")
def add_medical_record(
    patient_id: int,
    doctor_id: int,
    diagnosis: str,
    symptoms: str,
    treatment: str,
    record_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    record = MedicalRecord(
        patient_id=patient_id,
        doctor_id=doctor_id,
        diagnosis=diagnosis,
        symptoms=symptoms,
        treatment=treatment,
        record_date=record_date,
        clinic_id=current_user.clinic_id
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "message": "Medical record added successfully!",
        "record_id": record.id
    }


@app.get("/medical-records")
def get_medical_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(MedicalRecord).filter(
        MedicalRecord.clinic_id == current_user.clinic_id
    ).all()


@app.put("/medical-records/{record_id}")
def update_medical_record(
    record_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.clinic_id == current_user.clinic_id
    ).first()

    if record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")

    allowed_fields = [
        "patient_id", "doctor_id", "diagnosis",
        "symptoms", "treatment", "record_date"
    ]

    for field in allowed_fields:
        if field in data:
            setattr(record, field, data[field])

    db.commit()
    db.refresh(record)

    return {
        "message": "Medical record updated successfully!",
        "record": {
            "id": record.id,
            "patient_id": record.patient_id,
            "doctor_id": record.doctor_id,
            "diagnosis": record.diagnosis,
            "symptoms": record.symptoms,
            "treatment": record.treatment,
            "record_date": record.record_date,
            "clinic_id": record.clinic_id
        }
    }


@app.delete("/medical-records/{record_id}")
def delete_medical_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.clinic_id == current_user.clinic_id
    ).first()

    if record is None:
        raise HTTPException(status_code=404, detail="Medical record not found")

    db.delete(record)
    db.commit()

    return {"message": "Medical record deleted successfully!"}


# ==================================================
# SMART HOSPITAL CHATBOT
# ==================================================

@app.get("/chatbot")
def chatbot(
    message: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_message = message.lower().strip()
    clinic_id = current_user.clinic_id

    if "hello" in user_message or user_message == "hi":
        reply = "Hello! Welcome to Smart Hospital. How can I help you?"

    elif "hospital" in user_message:
        reply = "Welcome to Smart Hospital Management System. I can help with doctors, patients, appointments, prescriptions, departments and medical records."

    elif "doctor" in user_message:
        total = db.query(Doctor).filter(Doctor.clinic_id == clinic_id).count()
        reply = f"There are currently {total} doctors in your clinic."

    elif "patient" in user_message:
        total = db.query(Patient).filter(Patient.clinic_id == clinic_id).count()
        reply = f"There are currently {total} patients in your clinic."

    elif "appointment" in user_message:
        total = db.query(Appointment).filter(Appointment.clinic_id == clinic_id).count()
        reply = f"There are currently {total} appointments in your clinic."

    elif "prescription" in user_message or "medicine" in user_message:
        total = db.query(Prescription).filter(Prescription.clinic_id == clinic_id).count()
        reply = f"There are currently {total} prescriptions in your clinic."

    elif "clinic" in user_message:
        clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
        if clinic:
            reply = f"Your clinic is {clinic.name}."
        else:
            reply = "Your clinic could not be found."

    elif "department" in user_message:
        total = db.query(Department).filter(Department.clinic_id == clinic_id).count()
        reply = f"Your clinic currently has {total} departments."

    elif "record" in user_message or "medical history" in user_message:
        total = db.query(MedicalRecord).filter(MedicalRecord.clinic_id == clinic_id).count()
        reply = f"There are currently {total} medical records in your clinic."

    elif "thank" in user_message:
        reply = "You're welcome! I'm always here to help."

    elif "bye" in user_message:
        reply = "Goodbye! Have a healthy day."

    else:
        reply = "I'm sorry, I didn't understand. You can ask about doctors, patients, appointments, prescriptions, departments or medical records."

    return {"reply": reply}
# ==================================================
# CLINIC APIs
# ==================================================

from fastapi import HTTPException
from pydantic import BaseModel


class ClinicCreate(BaseModel):
    name: str
    address: str | None = None
    phone: str | None = None


@app.post("/clinics")
def create_clinic(
    clinic_data: ClinicCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    # Signup already creates a clinic for each new Admin.
    # Do not create extra clinics through this endpoint.
    raise HTTPException(
        status_code=403,
        detail="Clinic signup ke zariye create karein"
    )


@app.get("/clinics")
def get_clinics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Clinic).filter(
        Clinic.id == current_user.clinic_id
    ).all()


@app.put("/clinics/{clinic_id}")
def update_clinic(
    clinic_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    clinic = db.query(Clinic).filter(
        Clinic.id == clinic_id,
        Clinic.id == current_user.clinic_id
    ).first()

    if clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")

    for field in ["name", "address", "phone"]:
        if field in data:
            setattr(clinic, field, data[field])

    db.commit()
    db.refresh(clinic)
    return {"message": "Clinic updated successfully!"}


@app.delete("/clinics/{clinic_id}")
def delete_clinic(
    clinic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["Admin"])

    # Prevent accidental deletion of a clinic and its related data.
    raise HTTPException(
        status_code=403,
        detail="Clinic deletion is disabled to protect hospital data"
    )
