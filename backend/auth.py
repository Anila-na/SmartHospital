import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Clinic, User

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY .env file mein configured nahi hai")

ALGORITHM = "HS256"
TOKEN_MINUTES = 60

router = APIRouter(prefix="/auth", tags=["Authentication"])
password_hash = PasswordHash.recommended()
bearer = HTTPBearer()


class SignupRequest(BaseModel):
    clinic_name: str = Field(min_length=2, max_length=150)
    full_name: str = Field(min_length=2, max_length=150)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    clinic_address: str = Field(default="", max_length=250)
    clinic_phone: str = Field(default="", max_length=40)


class LoginRequest(BaseModel):
    email: str
    password: str


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "clinic_id": user.clinic_id,
        "role": user.role,
        "iat": now,
        "exp": now + timedelta(minutes=TOKEN_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/signup", status_code=201)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()

    if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        raise HTTPException(status_code=400, detail="Valid email address enter karein")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Is email ka account pehle se mojood hai")

    clinic = Clinic(
        name=data.clinic_name.strip(),
        address=data.clinic_address.strip() or None,
        phone=data.clinic_phone.strip() or None,
    )

    try:
        db.add(clinic)
        db.flush()

        user = User(
            full_name=data.full_name.strip(),
            email=email,
            hashed_password=password_hash.hash(data.password),
            role="Admin",
            clinic_id=clinic.id,
            is_active=True,
            created_at=datetime.now(timezone.utc),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        db.refresh(clinic)
    except Exception:
        db.rollback()
        raise

    return {
        "message": "Clinic aur Admin account successfully create ho gaye",
        "clinic_id": clinic.id,
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not password_hash.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ya password ghalat hai")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivate hai")

    return {
        "access_token": create_access_token(user),
        "token_type": "bearer",
        "expires_in": TOKEN_MINUTES * 60,
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        user_id = int(payload.get("sub", ""))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Login token invalid ya expire ho gaya")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Account available nahi hai")

    return user


class StaffCreateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(min_length=1, max_length=30)


@router.post("/staff", status_code=201)
def create_staff(data: StaffCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Sirf Admin staff accounts create kar sakta hai")

    role = data.role.strip().title()
    if role not in ["Doctor", "Receptionist"]:
        raise HTTPException(status_code=400, detail="Role sirf Doctor ya Receptionist ho sakta hai")

    email = data.email.strip().lower()
    if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        raise HTTPException(status_code=400, detail="Valid email address enter karein")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Is email ka account pehle se mojood hai")

    user = User(full_name=data.full_name.strip(), email=email, hashed_password=password_hash.hash(data.password), role=role, clinic_id=current_user.clinic_id, is_active=True, created_at=datetime.now(timezone.utc))
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise

    return {"message": "Staff account successfully create ho gaya", "user_id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role, "clinic_id": user.clinic_id}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "clinic_id": user.clinic_id,
    }
