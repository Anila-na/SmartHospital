from pathlib import Path

p = Path("backend/main.py")
s = p.read_text(encoding="utf-8")

old = '''@app.post("/medical-records")
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
    return db.query(MedicalRecord).all()'''

new = '''@app.post("/medical-records")
def add_medical_record(
    patient_id: int,
    doctor_id: int,
    diagnosis: str,
    symptoms: str,
    treatment: str,
    record_date: str,
    clinic_id: int | None = None,
    db: Session = Depends(get_db)
):
    record = MedicalRecord(
        patient_id=patient_id,
        doctor_id=doctor_id,
        diagnosis=diagnosis,
        symptoms=symptoms,
        treatment=treatment,
        record_date=record_date,
        clinic_id=clinic_id
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "message": "Medical record added successfully!",
        "record_id": record.id
    }


@app.get("/medical-records")
def get_medical_records(clinic_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(MedicalRecord)
    if clinic_id is not None:
        query = query.filter(MedicalRecord.clinic_id == clinic_id)
    return query.all()'''

if old not in s:
    raise SystemExit("Existing API match nahi hui. main.py change nahi hui.")

p.write_text(s.replace(old, new, 1), encoding="utf-8")
print("Medical Records API updated successfully.")
