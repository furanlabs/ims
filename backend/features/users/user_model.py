from pydantic import BaseModel, EmailStr, Field




class UserPatch(BaseModel):
    
    
    username: str 
    email: EmailStr



class UserImgPatch(BaseModel):
    
    img_link:str




class UserPasswordPatch(BaseModel):

    old_password_hash: str
    new_password_hash: str
    confirm_new_password_hash: str
