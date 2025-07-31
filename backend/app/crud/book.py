from datetime import date, timedelta

from app.models.book import Book, BookStatusEnum
from app.schemas.book import BookCreate, BookUpdate
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.services.google_books import fetch_book_info_by_isbn


def create_book(db: Session, book: BookCreate, user_id: int) -> Book:
    genres = []

    # Step 1: isbn からジャンル補完
    if book.isbn:
        book_info = fetch_book_info_by_isbn(book.isbn)
        if book_info and book_info.get("genres"):
            genres = book_info["genres"]

    # Step 2: 手入力があればそちらを使用
    if not genres and book.genres:
        genres = book.genres
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

from datetime import datetime

from pytz import timezone


def get_books_releasing_tomorrow(db: Session):
    jst = timezone("Asia/Tokyo")
    today = datetime.now(jst).date()
    tomorrow = today + timedelta(days=1)
    print(f"🕒 TODAY: {today} / TOMORROW: {tomorrow}")

    books = db.query(Book).filter(Book.published_date == tomorrow).all()
    print(f"📚 FOUND BOOKS: {[book.title for book in books]}")
    return books

# 追加：お気に入りの書籍だけ取得
def get_favorite_books_by_user_id(db: Session, user_id: int):
    return (
        db.query(Book)
        .filter(Book.user_id == user_id, Book.is_favorite == True)
        .all()
    )

def update_book_status_to_wishlist(db: Session, title: str, user_id: int):
    book = db.query(Book).filter(Book.title == title, Book.user_id == user_id).first()
    if not book:
        return {"success": False, "reason": "not_found"}

    if book.status == "owned":
        return {"success": False, "reason": "already_owned"}

    book.status = "wishlist"
    db.commit()
    db.refresh(book)
    return {"success": True, "book": book}
