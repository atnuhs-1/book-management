from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.core.auth import create_access_token, verify_password, get_current_user
from app.core.database import get_db
from app.schemas.user import TokenWithUser, UserCreate, UserOut
from app.crud import user as crud_user
from app.models.user import User

router = APIRouter()

# ✅ 登録（ユーザー作成 + トークン + ユーザー情報）
@router.post("/register", response_model=TokenWithUser)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if crud_user.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")

    created_user = crud_user.create_user(db, user)
    token = create_access_token(data={"sub": created_user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.from_orm(created_user)
    }

# ✅ ログイン（認証 + トークン + ユーザー情報）
@router.post("/login", response_model=TokenWithUser)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_username(db, form_data.username)
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": db_user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.from_orm(db_user)
    }

# ✅ 現在のユーザー情報取得（認証必須）
@router.get("/me", response_model=UserOut)
def get_my_info(current_user: User = Depends(get_current_user)):
    return current_user
