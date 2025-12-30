from pydantic import BaseModel, EmailStr, Field




class UserPatch(BaseModel):
    
    
    username: str 
    email: EmailStr



class UserImgPatch(BaseModel):
    
    img_link:str