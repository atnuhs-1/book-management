from datetime import date
from pydantic import BaseModel
from typing import Optional
from enum import Enum as PyEnum  # enum.Enum を別名で使用

# ✅ Enum 定義（str 継承でJSON互換）
class BookStatusEnum(str, PyEnum):
    OWNED = "owned"
    WISHLIST = "wishlist"
    NOT_OWNED = "not_owned"

# ✅ 共通の基本フィールド
class BookBase(BaseModel):
    title: str
    volume: str
    author: str
    publisher: Optional[str] = ""         # ✅ NoneでもOK、デフォルトは空文字
    cover_image_url: Optional[str] = ""   # ✅ NoneでもOK、デフォルトは空文字
    published_date: date
    status: Optional[BookStatusEnum] = BookStatusEnum.OWNED

# ✅ 登録用（user_idはサーバー側で付与）
class BookCreate(BookBase):
    pass

# ✅ レスポンス用（IDとuser_id付き）
class BookOut(BookBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class ISBNRequest(BaseModel):
    isbn: str

# ✅ 更新用（すべてOptional）
class BookUpdate(BaseModel):
    title: Optional[str] = None
    volume: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    cover_image_url: Optional[str] = None
    published_date: Optional[date] = None
    status: Optional[BookStatusEnum] = None
