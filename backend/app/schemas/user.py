from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str

    class Config:
        orm_mode = True
        from_attributes = True  # ← これを追加！（Pydantic v2 対応）

class Token(BaseModel):
    access_token: str
    token_type: str

# ✅ 追加が必要な部分（Token + User情報を含む）
class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user: UserOut
