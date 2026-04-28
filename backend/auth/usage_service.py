from datetime import datetime
from bson.objectid import ObjectId
from .db import get_db
import logging

logger = logging.getLogger("usage_service")


async def track_usage(user_identifier, model: str, tokens: int = 0, endpoint: str = None, response_time_ms: int = None):
    """Insert a usage log and atomically increment the user's usage counter.

    user_identifier may be an email (str) or an ObjectId/str id.
    """
    db = get_db()
    if db is None:
        return

    # Resolve user id and user doc
    user_id = None
    user_doc = None
    if isinstance(user_identifier, ObjectId):
        user_id = user_identifier
        user_doc = await db.users.find_one({"_id": user_id})
    else:
        # If string, try to treat as ObjectId first
        try:
            tmp_id = ObjectId(str(user_identifier))
            user_doc = await db.users.find_one({"_id": tmp_id})
            if user_doc:
                user_id = tmp_id
        except Exception:
            # treat as email
            user_doc = await db.users.find_one({"email": str(user_identifier).lower()})
            if user_doc:
                user_id = user_doc.get("_id")

    logger.info(f"Resolved user_id={user_id} for identifier={user_identifier}")
    logger.debug(f"User doc: {user_doc}")

    # Normalize model key (map synonyms -> canonical keys)
    model_key = None
    if model:
        m = str(model).lower()
        # canonical mapping
        canonical = {
            'groq': 'groq',
            'gemini': 'gemini',
            'qwen': 'qwen',
            'gpt': 'gpt',
            'claude': 'claude',
            # frontend may send 'huggingface' for Qwen model; normalize to 'qwen'
            'huggingface': 'qwen'
        }
        # try direct mapping or fallback to raw lower string
        model_key = canonical.get(m, m)

    # Prepare usage log doc
    log_doc = {
        "userId": user_id,
        "model": model_key or model,
        "endpoint": endpoint,
        "tokens": int(tokens) if tokens is not None else 0,
        "responseTimeMs": int(response_time_ms) if response_time_ms is not None else None,
        "createdAt": datetime.utcnow()
    }

    response = {"user_id": str(user_id) if user_id else None, "insert_result": None, "update_result": None}

    # Insert log (best-effort) and return results for verification
    try:
        insert_res = await db.usage_logs.insert_one(log_doc)
        response["insert_result"] = {"inserted_id": str(insert_res.inserted_id)}
        logger.info(f"Inserted usage log for user {user_id} model={model_key}")
    except Exception:
        logger.exception("Failed inserting usage log")

    # Increment user's usage counter using $inc for atomic update
    if user_id is not None and model_key:
        # Ensure usage field exists (do not create a new user)
        try:
            await db.users.update_one({"_id": user_id, "usage": {"$exists": False}}, {"$set": {"usage": {}}})
        except Exception:
            logger.exception("Failed to ensure usage field exists")

        # field name e.g. usage.gpt-4o
        field = f"usage.{model_key}"
        try:
            # MODIFY THIS LINE: increment by extracted tokens, fallback to 1 request unit.
            update_res = await db.users.update_one({"_id": user_id}, {"$inc": {field: tokens if tokens > 0 else 1}})
            # Motor's UpdateResult exposes matched_count and modified_count
            response["update_result"] = {"matched_count": getattr(update_res, "matched_count", None), "modified_count": getattr(update_res, "modified_count", None)}
            if response["update_result"]["modified_count"]:
                logger.info(f"Incremented usage.{model_key} for user {user_id}")
        except Exception:
            logger.exception("Failed to increment user usage")

    return response
