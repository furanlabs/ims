
# backend.features.users.api

from fastapi import APIRouter,HTTPException,Depends
from databases import Database
from dotenv import load_dotenv
import os
from jose import jwt

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
database = Database(DATABASE_URL)


router = APIRouter(
    prefix="/users",
    tags=["users"]
)



from .user_model import UserCreate,UserLogIn

from core.utils import hash_password,verify_password,create_access_token,get_current_user_id

@router.post("/register")
async def register_user(user: UserCreate):
    
    
    password_hash = hash_password(user.password_hash)


    
    query = """
    INSERT INTO users (
        username, email, password_hash
    ) VALUES (
        :username, :email, :password_hash
    )
    """
    
    values = {
        "username": user.username,
        "email": user.email,
        "password_hash": password_hash
    }

    try:
        await database.execute(query=query, values=values)
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Username or email already exists")
        else:
            raise e

    return {"message": "User registered successfully"}




@router.post("/login")
async def login_user(user: UserLogIn):
    query = "SELECT * FROM users WHERE email = :email"
    db_user = await database.fetch_one(query=query, values={"email": user.email})
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user.password_hash, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"user_id": db_user["id"]})
    
    return {"access_token": access_token, "token_type": "bearer"}




@router.get("/me")
async def verify_user(user_id = Depends(get_current_user_id)):

    query = "SELECT id, username, email FROM users WHERE id = :id"
    user = await database.fetch_one(query=query, values={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"user": dict(user)}


