from app.core.auth import get_current_user
from app.core.database import get_db
from app.crud import book as crud_book
from app.models.user import User
from app.schemas.book import BookCreate, BookOut
from app.services.google_books import (fetch_book_info_by_isbn,
                                       search_books_by_title)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()

# 書籍の新規登録（ログイン必須・user_idを強制設定）
@router.post("/books", response_model=BookOut)
def create_book(
    book: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.create_book(db=db, book=book, user_id=current_user.id)

# 自分の書籍一覧取得
@router.get("/me/books", response_model=list[BookOut])
def get_my_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.get_books_by_user_id(db, current_user.id)

# 書籍詳細取得（所有者チェック付き）
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

# ISBNから書籍情報を取得（外部API）
@router.get("/fetch_book/{isbn}")
def fetch_book(isbn: str):
    book_info = fetch_book_info_by_isbn(isbn)
    if book_info:
        return book_info
    raise HTTPException(status_code=404, detail="本が見つかりませんでした")

# 書名から検索（外部API）
@router.get("/search_book")
def search_book(title: str):
    return search_books_by_title(title)

# @router.get("/books", response_model=list[BookOut])
# def read_books(db: Session = Depends(get_db)):
#     return crud_book.get_books(db)

# @router.get("/users/{user_id}/books", response_model=list[BookOut])
# def get_user_books(user_id: int, db: Session = Depends(get_db)):
#     return crud_book.get_books_by_user_id(db, user_id)
