# backend/app/crud.py

from sqlalchemy.orm import Session

from . import models, schemas


def create_book(db: Session, book: schemas.BookCreate):
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def get_books(db: Session):
    return db.query(models.Book).all()

def get_users_count(db: Session):
    return db.query(models.User).count()

def check_users_table_exists(db: Session):
    try:
        # usersテーブルの件数を取得してみる
        count = db.query(models.User).count()
        return {"exists": True, "count": count}
    except Exception as e:
        return {"exists": False, "error": str(e)}
