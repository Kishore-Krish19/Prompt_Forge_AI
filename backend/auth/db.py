from motor.motor_asyncio import AsyncIOMotorClient
import os

_client = None
db = None

def init_db(uri: str = None, db_name: str = None):
    global _client, db
    uri = uri or os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    db_name = db_name or os.environ.get("MONGODB_DB", "promptforge")
    _client = AsyncIOMotorClient(uri)
    db = _client[db_name]
    return db

def get_db():
    return db
