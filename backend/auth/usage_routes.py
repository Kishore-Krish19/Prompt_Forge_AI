from fastapi import APIRouter, Depends
from .middleware import get_current_user, require_admin
from .models import find_user_by_email
from .db import get_db
from typing import Dict

router = APIRouter(prefix="/api", tags=["usage"])


@router.get("/usage")
async def get_my_usage(user: dict = Depends(get_current_user)):
    email = user.get("sub")
    if not email:
        return {"usage": {}}
    doc = await find_user_by_email(email)
    return {"usage": doc.get("usage", {}) if doc else {}}


@router.get("/admin/usage")
async def admin_usage(admin=Depends(require_admin)):
    db = get_db()
    # Total requests per model
    model_aggr = db.usage_logs.aggregate([
        {"$group": {"_id": "$model", "count": {"$sum": 1}}}
    ])
    model_totals = {}
    async for m in model_aggr:
        model_totals[m.get("_id")] = m.get("count", 0)

    # Total requests per user (with email)
    user_aggr = db.usage_logs.aggregate([
        {"$group": {"_id": "$userId", "count": {"$sum": 1}}},
        {"$lookup": {"from": "users", "localField": "_id", "foreignField": "_id", "as": "user"}},
        {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
        {"$project": {"userId": "$_id", "count": 1, "email": "$user.email"}}
    ])

    user_totals = []
    async for u in user_aggr:
        user_totals.append({"userId": str(u.get("userId")), "email": u.get("email"), "count": u.get("count", 0)})

    return {"perModel": model_totals, "perUser": user_totals}
