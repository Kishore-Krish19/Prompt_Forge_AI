from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
import random
import os
from datetime import datetime

from .models import (
    create_user, set_otp, verify_otp, find_user_by_email,
    set_password as save_password, verify_password
)
from .utils import send_otp_email
from .db import init_db
from jose import jwt

router = APIRouter(prefix="/api/auth", tags=["auth"]) 

JWT_SECRET = os.environ.get("JWT_SECRET", "devsecret")
JWT_ALGO = "HS256"


class EmailIn(BaseModel):
    email: EmailStr


class OTPIn(BaseModel):
    email: EmailStr
    otp: str


class PasswordIn(BaseModel):
    email: EmailStr
    password: str


@router.on_event("startup")
async def startup_db():
    init_db()


@router.post("/send-otp")
async def send_otp(data: EmailIn):
    email = data.email.lower()
    await create_user(email)
    otp = "%06d" % random.randint(0, 999999)
    await set_otp(email, otp, expiry_minutes=5)
    ok = send_otp_email(email, otp)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to send OTP")
    return {"status": "sent"}


@router.post("/verify-otp")
async def verify(data: OTPIn):
    ok = await verify_otp(data.email.lower(), data.otp)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"status": "verified"}


@router.post("/set-password")
async def set_pass(data: PasswordIn):
    user = await find_user_by_email(data.email.lower())
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await save_password(data.email.lower(), data.password)
    return {"status": "ok"}


@router.post("/login")
async def login(data: PasswordIn):
    user = await find_user_by_email(data.email.lower())
    if not user or not user.get("password"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(data.password, user.get("password")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    is_admin = user.get("is_admin", False) or (user.get("role") == "admin")
    payload = {
        "sub": user["email"],
        "role": "admin" if is_admin else user.get("role", "user"),
        "is_admin": is_admin,
        "iat": int(datetime.utcnow().timestamp())
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    return {"access_token": token, "token_type": "bearer", "is_admin": is_admin}
