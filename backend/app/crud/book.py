from sqlalchemy.orm import Session
from app.models.book import Book
from app.schemas.book import BookCreate

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

# def get_books(db: Session):
#     return db.query(Book).all()
