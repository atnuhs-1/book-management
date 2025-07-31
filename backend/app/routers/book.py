from typing import List

from app.core.auth import get_current_user
from app.core.database import get_db
from app.crud import book as crud_book
from app.models.book import BookStatusEnum
from app.models.notification import Notification
from app.models.user import User
from app.schemas.book import BookCreate, BookOut, BookUpdate
from app.services.google_books import (fetch_book_info_by_isbn,
                                       search_books_by_title)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/books", response_model=BookOut)
def create_book(
    book: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.create_book(db=db, book=book, user_id=current_user.id)

from app.models.book import BookStatusEnum  # 必要


@router.get("/me/books", response_model=list[BookOut])
def get_my_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.get_books_by_user_id_and_status(
        db=db,
        user_id=current_user.id,
        status=BookStatusEnum.OWNED
    )

@router.get("/me/wishlist", response_model=list[BookOut])
def get_my_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.get_books_by_user_id_and_status(
        db, user_id=current_user.id, status=BookStatusEnum.WISHLIST
    )

@router.get("/books/{book_id}", response_model=BookOut)
def read_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book = crud_book.get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="この書籍にはアクセスできません")
    return book

@router.get("/fetch_book/{isbn}")
def fetch_book(isbn: str):
    book_info = fetch_book_info_by_isbn(isbn)
    if book_info:
        return book_info
    raise HTTPException(status_code=404, detail="本が見つかりませんでした")

@router.get("/search_book")
def search_book(title: str):
    return search_books_by_title(title)

@router.put("/books/{book_id}", response_model=BookOut)
def update_my_book(
    book_id: int,
    update_data: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.update_book(db=db, book_id=book_id, update_data=update_data, user_id=current_user.id)
