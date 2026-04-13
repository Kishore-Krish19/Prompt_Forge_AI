from fastapi import APIRouter, Depends
from .middleware import require_admin, get_current_user
from .models import find_user_by_email
from .db import get_db


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users")
async def get_users(admin=Depends(require_admin)):
    # return only non-admin users
    db = get_db()
    cursor = db.users.find({"is_admin": {"$ne": True}}, {"password": 0, "otp": 0, "otpExpiry": 0})
    users = []
    async for u in cursor:
        users.append({
            "email": u.get("email"),
            "usage": u.get("usage", {}),
            "createdAt": u.get("createdAt")
        })
    return users


@router.get('/my-usage')
async def my_usage(user: dict = Depends(get_current_user)):
    # user is the JWT payload (contains sub/email)
    email = user.get('sub')
    if not email:
        return {"usage": {}}
    doc = await find_user_by_email(email)
    return doc.get('usage', {}) if doc else {}
