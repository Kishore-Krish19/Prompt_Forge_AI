from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict
from datetime import datetime, timedelta
from passlib.context import CryptContext
from .db import get_db
from bson.objectid import ObjectId

pwd_ctx = CryptContext(schemes=["argon2"], deprecated="auto")


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)


class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    email: EmailStr
    password: Optional[str] = None
    isVerified: bool = False
    otp: Optional[str] = None
    otpExpiry: Optional[datetime] = None
    usage: Dict[str, int] = Field(default_factory=lambda: {"gpt": 0, "claude": 0, "gemini": 0})
    role: str = "user"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


async def find_user_by_email(email: str):
    db = get_db()
    if db is None:
        return None
    doc = await db.users.find_one({"email": email.lower()})
    return doc


async def create_user(email: str):
    db = get_db()
    doc = {
        "email": email.lower(),
        "isVerified": False,
        "is_admin": False,
        "usage": {"gpt": 0, "claude": 0, "gemini": 0},
        "role": "user",
        "createdAt": datetime.utcnow()
    }
    await db.users.update_one({"email": email.lower()}, {"$setOnInsert": doc}, upsert=True)
    return await find_user_by_email(email)

def hash_password(password: str):
    print("Using ARGON2 hashing")
    return pwd_ctx.hash(password)

def verify_password(password, hashed):
    return pwd_ctx.verify(password, hashed)


async def set_otp(email: str, otp: str, expiry_minutes: int = 5):
    db = get_db()
    expiry = datetime.utcnow() + timedelta(minutes=expiry_minutes)
    res = await db.users.update_one({"email": email.lower()}, {
        "$set": {"otp": otp, "otpExpiry": expiry}
    }, upsert=True)
    return res


async def verify_otp(email: str, otp: str):
    db = get_db()
    doc = await db.users.find_one({"email": email.lower()})
    if not doc:
        return False
    if doc.get("otp") != otp:
        return False
    expiry = doc.get("otpExpiry")
    from datetime import datetime
    if not expiry or expiry < datetime.utcnow():
        return False
    await db.users.update_one({"email": email.lower()}, {"$set": {"isVerified": True}, "$unset": {"otp": "", "otpExpiry": ""}})
    return True


async def set_password(email: str, password: str):
    db = get_db()
    hashed = hash_password(password)
    await db.users.update_one({"email": email.lower()}, {"$set": {"password": hashed, "isVerified": True}})
    print("Password length:", len(password))
    return await find_user_by_email(email)


async def increment_usage(email: str, provider: str):
    db = get_db()
    field = f"usage.{provider}"
    await db.users.update_one({"email": email.lower()}, {"$inc": {field: 1}})


async def list_users():
    db = get_db()
    cursor = db.users.find({}, {"password": 0, "otp": 0, "otpExpiry": 0})
    users = []
    async for u in cursor:
        users.append(u)
    return users
