
# backend.features.auth.api

from fastapi import APIRouter,HTTPException,Depends 
from databases import Database

import os
from jose import jwt



router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)



from .auth_model import UserCreate,UserLogIn

from core.utils import hash_password,verify_password,create_access_token,get_current_user_id


# Dependency to get database
def get_database():
    from main import database  # Import the singleton database object
    return database



import uuid


@router.post("/register")
async def register_user(user: UserCreate,database: Database = Depends(get_database)):
    
    user_id = str(uuid.uuid4())

    password_hash = hash_password(user.password_hash)

    query = """
    INSERT INTO users (id,
        username, email, password_hash
    ) VALUES (:id,
        :username, :email, :password_hash
    )
    """
    
    values = {
        "id": user_id,
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
async def login_user(user: UserLogIn,database: Database = Depends(get_database)):
    query = "SELECT * FROM users WHERE email = :email"
    db_user = await database.fetch_one(query=query, values={"email": user.email})
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user.password_hash, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"user_id": db_user["id"]})
    
    return {"access_token": access_token, "token_type": "bearer"}







from fastapi.security import OAuth2PasswordRequestForm

@router.post("/authorized")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), database: Database = Depends(get_database)):
    # Use email instead of username
    query = "SELECT * FROM users WHERE email = :email"
    db_user = await database.fetch_one(query=query, values={"email": form_data.username})
    
    if not db_user or not verify_password(form_data.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"user_id": db_user["id"]})
    return {"access_token": access_token, "token_type": "bearer"}





@router.get("/me")
async def verify_user(user = Depends(get_current_user_id),database: Database = Depends(get_database)):

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"user": dict(user)}




