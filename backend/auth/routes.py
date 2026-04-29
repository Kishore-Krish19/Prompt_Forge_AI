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
from utils.config import JWT_SECRET

router = APIRouter(prefix="/api/auth", tags=["auth"]) 

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

    user = await find_user_by_email(email)
    # If user exists do NOT send OTP here — instruct frontend to show options
    if user:
        return {
            "status": "EXISTS",
            "message": "User already exists. Please login or reset password."
        }

    # NEW USER: create and send OTP
    otp = "%06d" % random.randint(0, 999999)
    await create_user(email)
    await set_otp(email, otp, expiry_minutes=5)
    ok = send_otp_email(email, otp)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to send OTP")
    return {"status": "NEW", "message": "OTP sent successfully"}


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

    # Update or set the password for existing user
    await save_password(data.email.lower(), data.password)
    return {"message": "Password set successfully"}



@router.post("/reset-password-otp")
async def reset_password_otp(data: EmailIn):
    email = data.email.lower()

    user = await find_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = "%06d" % random.randint(0, 999999)
    await set_otp(email, otp, expiry_minutes=5)
    ok = send_otp_email(email, otp)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    return {"status": "RESET", "message": "OTP sent for password reset"}


@router.post("/login")
async def login(data: PasswordIn):
    user = await find_user_by_email(data.email.lower())
    
    # Check if user exists and has a password set
    if not user:
        raise HTTPException(status_code=404, detail="User does not exist.")
    
    if not user.get("password"):
        raise HTTPException(status_code=404, detail="User does not exist.")
    
    # Verify password
    if not verify_password(data.password, user.get("password")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    is_admin = user.get("is_admin", False) or (user.get("role") == "admin")
    payload = {
        "sub": user["email"],
        "role": "admin" if is_admin else user.get("role", "user"),
        "is_admin": is_admin,
        "iat": int(datetime.utcnow().timestamp())
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    return {"access_token": token, "token_type": "bearer", "is_admin": is_admin}
