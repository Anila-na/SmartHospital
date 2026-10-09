from pathlib import Path

p = Path("backend/main.py")
s = p.read_text(encoding="utf-8")

old = '''@app.post("/prescriptions")
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
    return db.query(Prescription).all()'''

new = '''@app.post("/prescriptions")
def add_prescription(
    patient_id: int,
    doctor_id: int,
    medicine: str,
    dosage: str,
    duration: str,
    instructions: str,
    clinic_id: int | None = None,
    db: Session = Depends(get_db)
):
    prescription = Prescription(
        patient_id=patient_id,
        doctor_id=doctor_id,
        medicine=medicine,
        dosage=dosage,
        duration=duration,
        instructions=instructions,
        clinic_id=clinic_id
    )

    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    return {
        "message": "Prescription added successfully!",
        "prescription_id": prescription.id
    }


@app.get("/prescriptions")
def get_prescriptions(clinic_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Prescription)
    if clinic_id is not None:
        query = query.filter(Prescription.clinic_id == clinic_id)
    return query.all()'''

if old not in s:
    raise SystemExit("Existing API match nahi hui. main.py change nahi hui.")

p.write_text(s.replace(old, new, 1), encoding="utf-8")
print("Prescription API updated successfully.")
