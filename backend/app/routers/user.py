from app.core.auth import (create_access_token, get_current_user,
                           get_password_hash, verify_password)
from app.core.database import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.user import (ChangePasswordRequest, TokenWithUser,
                              UpdateUserRequest, UserCreate, UserOut)
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

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

@router.put("/users/me")
def update_user_info(
    update: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    if update.username:
        user.username = update.username
    if update.email:
        user.email = update.email
    if update.full_name:
        user.full_name = update.full_name

    db.commit()
    db.refresh(user)

    return {
        "message": "ユーザー情報を更新しました",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
        },
    }


# app/routers/user.py
@router.put("/users/me/password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 現在のパスワードが一致するか確認
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="現在のパスワードが間違っています"
        )

    # 新しいパスワードを保存
    current_user.hashed_password = get_password_hash(request.new_password)
    db.commit()

    return {"message": "パスワードを変更しました"}
