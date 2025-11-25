from django.conf import settings
from pymongo import MongoClient

def get_mongo_db():
    client = MongoClient(
        host=settings.MONGO_HOST,
        port=settings.MONGO_PORT
    )
    return client[settings.MONGO_DB_NAME]

def get_comments_collection():
    db = get_mongo_db()
    return db['comments']

def get_media_collection():
    db = get_mongo_db()
    return db['media']
