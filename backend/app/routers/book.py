# routers/book.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app import crud, schemas

router = APIRouter()

@router.post("/books", response_model=schemas.BookOut)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return crud.create_book(db, book)

@router.get("/books", response_model=list[schemas.BookOut])
def read_books(db: Session = Depends(get_db)):
    return crud.get_books(db)

@router.get("/fetch_book/{isbn}")
def fetch_book(isbn: str):
    from app.services.google_books import fetch_book_info_by_isbn
    book_info = fetch_book_info_by_isbn(isbn)
    if book_info:
        return book_info
    raise HTTPException(status_code=404, detail="本が見つかりませんでした")

@router.get("/search_book")
def search_book(title: str):
    from app.services.google_books import search_books_by_title
    return search_books_by_title(title)

@router.get("/users/{user_id}/books", response_model=list[schemas.BookOut])
def get_user_books(user_id: int, db: Session = Depends(get_db)):
    return crud.get_books_by_user_id(db, user_id)
