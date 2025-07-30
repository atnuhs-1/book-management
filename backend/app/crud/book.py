from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.book import Book, BookStatusEnum
from app.schemas.book import BookCreate, BookUpdate

def create_book(db: Session, book: BookCreate, user_id: int) -> Book:
    db_book = Book(**book.dict(), user_id=user_id)
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def get_books_by_user_id(db: Session, user_id: int) -> list[Book]:
    return db.query(Book).filter(Book.user_id == user_id).all()

def get_book_by_id(db: Session, book_id: int) -> Book | None:
    return db.query(Book).filter(Book.id == book_id).first()

def update_book(db: Session, book_id: int, update_data: BookUpdate, user_id: int) -> Book:
    db_book = db.query(Book).filter(Book.id == book_id, Book.user_id == user_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="書籍が見つかりません")

    update_fields = update_data.dict(exclude_unset=True)
    for key, value in update_fields.items():
        setattr(db_book, key, value)

    db.commit()
    db.refresh(db_book)
    return db_book

def get_books_by_user_id_and_status(db: Session, user_id: int, status: BookStatusEnum) -> list[Book]:
    return db.query(Book).filter(
        Book.user_id == user_id,
        Book.status == status
    ).all()
