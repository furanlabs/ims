# backend/main.py

from fastapi import FastAPI, status
from databases import Database
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
    
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
database = Database(DATABASE_URL)

app = FastAPI(title="Simple IMS API")
# Allow all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <- allow all origins
    allow_credentials=True,
    allow_methods=["*"],   # <- allow all HTTP methods
    allow_headers=["*"],   # <- allow all headers
)

from database.schema import entity
from features.auth.api import router as auth_router  # Import router only

# Register router ONCE, with prefix
app.include_router(auth_router, prefix="/api")



from features.users.api import router as users_router
app.include_router(users_router, prefix="/api")
















@app.on_event("startup")
async def startup():
    await database.connect()
    await entity.users(database)
    await entity.products(database)

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/health", status_code=status.HTTP_200_OK)
async def health():
    return {"status": "ok"}
