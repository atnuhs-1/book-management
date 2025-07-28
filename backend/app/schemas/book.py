from datetime import date
from pydantic import BaseModel

class BookBase(BaseModel):
    title: str
    volume: str
    author: str
    publisher: str
    cover_image_url: str
    published_date: date

class BookCreate(BookBase):
    pass  # user_id は除去！

class BookOut(BookBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
