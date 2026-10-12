from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from backend.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    disease = Column(String, nullable=False)
    clinic_id = Column(Integer, nullable=True)


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    clinic_id = Column(Integer, nullable=True)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    clinic_id = Column(Integer, nullable=True)


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)
    medicine = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    instructions = Column(String, nullable=False)
    clinic_id = Column(Integer, nullable=True)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    head_doctor = Column(String, nullable=False)
    clinic_id = Column(Integer, nullable=True)


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)
    diagnosis = Column(String, nullable=False)
    symptoms = Column(String, nullable=False)
    treatment = Column(String, nullable=False)
    record_date = Column(String, nullable=False)
    clinic_id = Column(Integer, nullable=True)

class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="Admin")
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
