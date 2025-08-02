import re
from datetime import datetime
from typing import List

from app.core.auth import get_current_user
from app.core.database import get_db
from app.crud import book as crud_book
from app.models.book import Book, BookStatusEnum
from app.models.user import User
from app.schemas.book import BookCreate, BookOut, BookUpdate, ISBNRequest
from app.services.google_books import (ensure_isbn_or_raise,
                                       fetch_book_info_by_isbn,
                                       normalize_title, search_books_by_title,
                                       search_books_by_title_rakuten)
from app.services.utils import extract_volume, parse_published_date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/books", response_model=BookOut)
def create_book(
    book: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.create_book(db=db, book=book, user_id=current_user.id)


@router.post("/books/register-by-isbn", response_model=BookOut)
def register_book_by_isbn(
    payload: ISBNRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book_data = {"isbn": payload.isbn}
    try:
        isbn = ensure_isbn_or_raise(book_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    book_info = fetch_book_info_by_isbn(isbn)
    if not book_info:
        raise HTTPException(status_code=404, detail=f"ISBN '{isbn}' の書籍情報が見つかりませんでした")

    existing_book = db.query(Book).filter(Book.isbn == isbn, Book.user_id == current_user.id).first()
    if existing_book:
        if existing_book.status == BookStatusEnum.OWNED:
            raise HTTPException(status_code=400, detail="すでに所持しています。")
        existing_book.status = BookStatusEnum.OWNED
        db.commit()
        db.refresh(existing_book)
        return existing_book

    volume = extract_volume(book_info["title"]) or ""
    pub_date = parse_published_date(book_info.get("published_date"))
    author = ", ".join(book_info.get("authors", [])) if isinstance(book_info.get("authors"), list) else book_info.get("authors", "")

    new_book = BookCreate(
        title=book_info["title"],
        volume=volume,
        author=author,
        publisher=book_info.get("publisher", ""),
        cover_image_url=book_info.get("cover_image_url", ""),
        published_date=pub_date,
        status=BookStatusEnum.OWNED,
        isbn=isbn,
        is_favorite=False,
        genres=book_info.get("genres", [])
    )

    return crud_book.create_book(db=db, book=new_book, user_id=current_user.id)

@router.post("/books/register-by-title", response_model=BookOut)
def register_book_by_title(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ タイトル検索（Google Books）
    books = search_books_by_title(title)
    if not books:
        raise HTTPException(status_code=404, detail=f"Google Booksに '{title}' の書籍が見つかりませんでした")

    # ✅ 最初の検索結果を採用（候補数が多ければ拡張可）
    book_data = books[0]

    # ✅ ISBN補完（必要であれば楽天APIを使用）
    try:
        isbn = ensure_isbn_or_raise(book_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # ✅ 既存書籍の確認
    existing_book = db.query(Book).filter(
        Book.isbn == isbn,
        Book.user_id == current_user.id
    ).first()

    if existing_book:
        if existing_book.status == BookStatusEnum.OWNED:
            raise HTTPException(status_code=400, detail="すでに所持しています。")
        elif existing_book.status in [BookStatusEnum.WISHLIST, BookStatusEnum.NOT_OWNED]:
            existing_book.status = BookStatusEnum.OWNED
            db.commit()
            db.refresh(existing_book)
            return existing_book

    # ✅ 新規登録
    volume = extract_volume(book_data["title"]) or ""
    pub_date = parse_published_date(book_data.get("published_date"))

    raw_authors = book_data.get("authors")
    if isinstance(raw_authors, list):
        author = ", ".join(raw_authors)
    else:
        author = raw_authors or ""

    new_book = BookCreate(
        title=book_data["title"],
        volume=volume,
        author=author,
        publisher=book_data.get("publisher", "") or "",
        cover_image_url=book_data.get("cover_image_url", "") or "https://example.com/default_cover.png",
        published_date=pub_date,
        status=BookStatusEnum.OWNED,
        isbn=isbn,
        is_favorite=False,
        genres=book_data.get("genres") or []
    )

    return crud_book.create_book(db=db, book=new_book, user_id=current_user.id)


@router.post("/books/wishlist-register", response_model=BookOut)
def register_to_wishlist(
    book_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        isbn = ensure_isbn_or_raise(book_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    existing_book = db.query(Book).filter(Book.isbn == isbn, Book.user_id == current_user.id).first()
    if existing_book:
        if existing_book.status == BookStatusEnum.OWNED:
            raise HTTPException(status_code=400, detail="すでに所持しています。")
        if existing_book.status == BookStatusEnum.WISHLIST:
            raise HTTPException(status_code=400, detail="すでにウィッシュリストに追加されています。")
        existing_book.status = BookStatusEnum.WISHLIST
        db.commit()
        db.refresh(existing_book)
        return existing_book

    volume = extract_volume(book_data.get("title", "")) or ""
    pub_date = parse_published_date(book_data.get("published_date"))
    author = ", ".join(book_data.get("authors", []))

    new_book = Book(
        title=book_data.get("title", ""),
        volume=volume,
        author=author,
        publisher=book_data.get("publisher", ""),
        cover_image_url=book_data.get("cover_image_url", ""),
        published_date=pub_date,
        status=BookStatusEnum.WISHLIST,
        is_favorite=False,
        user_id=current_user.id,
        genres=book_data.get("genres", []),
        isbn=isbn
    )

    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book


@router.get("/me/books", response_model=List[BookOut])
def get_my_books(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_book.get_books_by_user_id_and_status(db, current_user.id, BookStatusEnum.OWNED)


def isbn13_to_isbn10(isbn13: str) -> str | None:
    if not isbn13.startswith("978") or len(isbn13) != 13 or not isbn13.isdigit():
        return None

    core = isbn13[3:-1]
    total = sum((10 - i) * int(digit) for i, digit in enumerate(core))
    remainder = 11 - (total % 11)
    check_digit = 'X' if remainder == 10 else str(remainder % 11)
    return core + check_digit

@router.get("/me/wishlist", response_model=List[BookOut])
def get_my_wishlist(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    books = crud_book.get_books_by_user_id_and_status(db, current_user.id, BookStatusEnum.WISHLIST)
    for book in books:
        isbn10 = isbn13_to_isbn10(book.isbn)
        book.amazon_url = f"https://www.amazon.co.jp/dp/{isbn10}" if isbn10 else None
    return books


@router.get("/me/books/favorites", response_model=List[BookOut])
def get_favorite_books(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_book.get_favorite_books_by_user_id(db, current_user.id)


@router.get("/search_book")
def search_book(title: str):
    return search_books_by_title(title)


@router.get("/books/search_rakuten")
def search_books_rakuten(title: str = Query(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return search_books_by_title_rakuten(title)


@router.get("/books/{book_id}", response_model=BookOut)
def read_book(book_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
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


@router.put("/books/isbn/{isbn}", response_model=BookOut)
def update_book_by_isbn(isbn: str, update_data: BookUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    book = db.query(Book).filter(Book.isbn == isbn, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="指定されたISBNの本が見つかりません。")
    return crud_book.update_book(db=db, book_id=book.id, update_data=update_data, user_id=current_user.id)


@router.patch("/books/isbn/{isbn}", response_model=BookOut)
def patch_book_by_isbn(isbn: str, update_data: BookUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    book = db.query(Book).filter(Book.isbn == isbn, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="指定されたISBNの本が見つかりません。")
    return crud_book.update_book(db=db, book_id=book.id, update_data=update_data, user_id=current_user.id)


@router.delete("/books/isbn/{isbn}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book_by_isbn(isbn: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    book = db.query(Book).filter(Book.isbn == isbn, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="本が見つかりませんでした")
    db.delete(book)
    db.commit()


# ✅ PATCH: お気に入りトグル（ISBN指定）
@router.patch("/books/favorite/isbn/{isbn}", response_model=BookOut)
def toggle_favorite_by_isbn(
    isbn: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book = db.query(Book).filter(
        Book.isbn == isbn,
        Book.user_id == current_user.id
    ).first()

    if not book:
        raise HTTPException(status_code=404, detail="本が見つかりませんでした")
    if book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="この書籍にはアクセスできません")
    if book.status == BookStatusEnum.NOT_OWNED:
        raise HTTPException(status_code=400, detail="所持もウィッシュリストにも追加されていません")

    # ✅ is_favorite をトグル（反転）
    book.is_favorite = not book.is_favorite
    db.commit()
    db.refresh(book)
    return book


# ✅ PATCH: お気に入りトグル（book_id指定）
@router.patch("/books/favorite/{book_id}", response_model=BookOut)
def toggle_favorite_by_book_id(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    book = db.query(Book).filter(
        Book.id == book_id,
        Book.user_id == current_user.id
    ).first()

    if not book:
        raise HTTPException(status_code=404, detail="本が見つかりませんでした")
    if book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="この書籍にはアクセスできません")
    if book.status == BookStatusEnum.NOT_OWNED:
        raise HTTPException(status_code=400, detail="所持もウィッシュリストにも追加されていません")

    # ✅ is_favorite をトグル
    book.is_favorite = not book.is_favorite
    db.commit()
    db.refresh(book)
    return book


@router.put("/books/{book_id}", response_model=BookOut)
def update_my_book(book_id: int, update_data: BookUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_book.update_book(db=db, book_id=book_id, update_data=update_data, user_id=current_user.id)


@router.patch("/books/{book_id}", response_model=BookOut)
def patch_book(book_id: int, update_data: BookUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_book.update_book(db=db, book_id=book_id, update_data=update_data, user_id=current_user.id)


@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    book = crud_book.get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="本が見つかりませんでした")
    if book.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="この書籍にはアクセスできません")
    db.delete(book)
    db.commit()


@router.put("/books/{title}/wishlist", response_model=BookOut)
def add_to_wishlist(title: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated_book = crud_book.update_book_status_to_wishlist(db, title, current_user.id)
    if not updated_book:
        raise HTTPException(status_code=404, detail="本が見つかりません。")
    return updated_book
