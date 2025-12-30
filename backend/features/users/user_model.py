from pydantic import BaseModel, EmailStr, Field




class UserPatch(BaseModel):
    
    
    username: str 
    email: EmailStr

