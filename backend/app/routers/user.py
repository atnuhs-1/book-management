from app.core.auth import (create_access_token, get_current_user,
                           get_password_hash, verify_password)
from app.core.database import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.user import (ChangePasswordRequest, PasswordResetConfirm,
                              PasswordResetRequest, TokenWithUser,
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

from app.core.auth import get_password_hash  # ← これでハッシュ関数共通化
from app.core.email import send_reset_email
from app.crud.user import get_user_by_email
from app.utils.token import generate_reset_token, verify_reset_token


@router.post("/request-password-reset")
async def request_password_reset(data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    token = generate_reset_token(user.email)
    await send_reset_email(user.email, token)
    return {"message": "パスワードリセットリンクを送信しました"}

@router.post("/reset-password")
def reset_password(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    email = verify_reset_token(data.token)
    if not email:
        raise HTTPException(status_code=400, detail="無効または期限切れのトークンです")

    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "パスワードが正常にリセットされました"}
