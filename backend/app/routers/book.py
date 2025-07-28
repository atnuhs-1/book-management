from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.book import BookCreate, BookOut
from app.crud import book as crud_book
from app.services.google_books import fetch_book_info_by_isbn, search_books_by_title

router = APIRouter()

@router.post("/books", response_model=BookOut)
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    return crud_book.create_book(db, book)

@router.get("/books", response_model=list[BookOut])
def read_books(db: Session = Depends(get_db)):
    return crud_book.get_books(db)

@router.get("/fetch_book/{isbn}")
def fetch_book(isbn: str):
    book_info = fetch_book_info_by_isbn(isbn)
    if book_info:
        return book_info
    raise HTTPException(status_code=404, detail="本が見つかりませんでした")

@router.get("/search_book")
def search_book(title: str):
    return search_books_by_title(title)

@router.get("/users/{user_id}/books", response_model=list[BookOut])
def get_user_books(user_id: int, db: Session = Depends(get_db)):
    return crud_book.get_books_by_user_id(db, user_id)

@router.get("/books/{book_id}", response_model=BookOut)
def read_book(book_id: int, db: Session = Depends(get_db)):
    book = crud_book.get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
