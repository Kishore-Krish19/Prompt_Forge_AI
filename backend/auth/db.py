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
