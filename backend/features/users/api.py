



from fastapi import APIRouter,HTTPException,Depends 
from databases import Database

import os
from jose import jwt



router = APIRouter(
    prefix="/users",
    tags=["User Account"]
)



# Dependency to get database
def get_database():
    from main import database  
    return database


from .user_model import UserPatch,UserImgPatch, UserPasswordPatch




from core.utils import get_current_user_id


@router.patch("/me")
async def update_user_account(
    user: UserPatch,
    current_user = Depends(get_current_user_id),
    database: Database = Depends(get_database)
):
    query = """
    UPDATE users
    SET username = :username,
        email = :email
    WHERE id = :id
    """

    values = {
        "username": user.username,
        "email": user.email,
        "id": current_user.id
    }

    try:
        await database.execute(query=query, values=values)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Account updated successfully"}





@router.patch("/me/img")
async def update_user_img( user: UserImgPatch,
    current_user  = Depends(get_current_user_id),
    database: Database = Depends(get_database)):

    query = """
    UPDATE users
    SET img_link = :img_link
    WHERE id = :id
    """

    values = {
        "img_link": user.img_link,
        "id": current_user.id
    }

    try:
        await database.execute(query=query, values=values)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Account updated successfully"}




from core.utils import verify_password, hash_password



@router.patch("/me/password")
async def password_change_user_account(
    user: UserPasswordPatch,
    current_user: str = Depends(get_current_user_id),
    database: Database = Depends(get_database)
):

    if not current_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.password_hash != user.old_password_hash:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Old password is incorrect")

    if user.new_password_hash != user.confirm_new_password_hash:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New passwords do not match")

    update_query = """
        UPDATE users 
        SET password_hash = :new_password, updated_at = CURRENT_TIMESTAMP 
        WHERE id = :id
    """
    await database.execute(update_query, values={"new_password": user.new_password_hash, "id": user_acc})

    return {"message": "Password updated successfully"}




@router.delete("/me")
async def delete_user_account(
    current_user  = Depends(get_current_user_id),
    database: Database = Depends(get_database)
):
    query = "DELETE FROM users WHERE id = :id"
    try:
        await database.execute(query=query, values={"id": current_user.id})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "User account deleted successfully"}
