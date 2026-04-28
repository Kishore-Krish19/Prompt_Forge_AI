from motor.motor_asyncio import AsyncIOMotorClient
from utils.config import MONGODB_URI, MONGODB_DB

_client = None
db = None

def init_db(uri: str = None, db_name: str = None):
    global _client, db
    uri = uri or MONGODB_URI or "mongodb://localhost:27017"
    db_name = db_name or MONGODB_DB or "promptforge"
    _client = AsyncIOMotorClient(uri)
    db = _client[db_name]
    return db

def get_db():
    return db


async def ensure_indexes():
    """Ensure indexes for usage_logs collection for analytics and performance."""
    if db is None:
        return
    # Index on userId, createdAt, and compound (userId, model)
    try:
        await db.usage_logs.create_index("userId")
        await db.usage_logs.create_index("createdAt")
        await db.usage_logs.create_index([("userId", 1), ("model", 1)])
    except Exception:
        # best-effort; don't crash startup if indexing fails
        pass
