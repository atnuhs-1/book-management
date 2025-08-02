from datetime import date
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum as PyEnum  # enum.Enum を別名で使用

# ✅ Enum 定義（str 継承でJSON互換）
class BookStatusEnum(str, PyEnum):
    OWNED = "owned"
    WISHLIST = "wishlist"
    NOT_OWNED = "not_owned"

# ✅ 共通の基本フィールド（空文字・空リストで一旦からOKな設計）
class BookBase(BaseModel):
    title: str = ""
    volume: str = ""
    author: str = ""
    publisher: Optional[str] = ""
    cover_image_url: Optional[str] = ""
    published_date: Optional[date] = None
    status: Optional[BookStatusEnum] = BookStatusEnum.OWNED
    is_favorite: bool = False
    isbn: Optional[str] = ""
    genres: List[str] = []

# ✅ 登録用（user_idはサーバー側で付与）
class BookCreate(BookBase):
    pass

# ✅ 更新用（すべてOptional）※ PATCH対応
class BookUpdate(BaseModel):
    title: Optional[str] = None
    volume: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    cover_image_url: Optional[str] = None
    published_date: Optional[date] = None
    status: Optional[BookStatusEnum] = None
    is_favorite: Optional[bool] = None
    genres: Optional[List[str]] = None
    isbn13: Optional[str] = None  # ← ISBN形式統一用の補助欄なら任意で

# schemas/book.py
class BookOut(BookBase):
    id: int
    user_id: int
    amazon_url: Optional[str] = None  # ✅ 追加

    class Config:
        orm_mode = True

# ✅ ISBNだけ受け取るAPIリクエスト用
class ISBNRequest(BaseModel):
    isbn: str
