from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str 
    email: EmailStr
    password_hash: str 


class UserLogIn(BaseModel):

    email: str
    password_hash: str