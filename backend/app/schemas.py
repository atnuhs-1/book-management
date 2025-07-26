# backend/app/schemas.py

from pydantic import BaseModel
from datetime import date

class BookBase(BaseModel):
    title: str
    volume: str
    author: str
    publisher: str
    cover_image_url: str
    published_date: date

class BookCreate(BookBase):
    pass

class BookOut(BookBase):
    id: int

    class Config:
        orm_mode = True  # SQLAlchemyモデル → Pydantic変換に必要
