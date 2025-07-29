from datetime import date
from pydantic import BaseModel
from typing import Optional
from enum import Enum as PyEnum # こっちもenum.EnumをPyEnumとして扱ってます


class BookStatusEnum(str, PyEnum):
    OWNED = "owned"
    WISHLIST = "wishlist"
    NOT_OWNED = "not_owned"

class BookBase(BaseModel):
    title: str
    volume: str
    author: str
    publisher: str
    cover_image_url: str
    published_date: date
    status: Optional[BookStatusEnum] = BookStatusEnum.OWNED

class BookUpdate(BaseModel):
    title: Optional[str] = None
    volume: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    cover_image_url: Optional[str] = None
    published_date: Optional[date] = None

class BookCreate(BookBase):
    pass  # user_id は除去！

class BookOut(BookBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
