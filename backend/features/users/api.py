



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
    from main import database  # Import the singleton database object
    return database


from .user_model import UserPatch




from core.utils import get_current_user_id


@router.patch("/me")
async def update_user_account(
    user: UserPatch,
    user_id: int = Depends(get_current_user_id),
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
        "id": user_id
    }

    try:
        await database.execute(query=query, values=values)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Account updated successfully"}