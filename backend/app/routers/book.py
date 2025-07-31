import re
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.crud import book as crud_book
from app.models.book import Book, BookStatusEnum
from app.models.notification import Notification
from app.models.user import User
from app.schemas.book import BookCreate, BookOut, BookUpdate, ISBNRequest
from app.services.utils import extract_volume, parse_published_date
from app.services.google_books import (
    fetch_book_info_by_isbn,
    search_books_by_title,
    search_books_by_title_rakuten,
    normalize_title,
)

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
    isbn = payload.isbn
    if not isbn.isdigit():
        raise HTTPException(status_code=400, detail="有効なISBNではありません")

    book_info = fetch_book_info_by_isbn(isbn)
    if not book_info:
        raise HTTPException(status_code=404, detail=f"ISBN '{isbn}' の書籍情報が見つかりませんでした")

    volume = extract_volume(book_info["title"]) or ""
    pub_date_str = book_info.get("published_date")
    pub_date = parse_published_date(pub_date_str)
    genres = book_info.get("categories") or []

    new_book = BookCreate(
        title=book_info["title"],
        volume=volume,
        author=", ".join(book_info.get("authors") or []),
        publisher=book_info.get("publisher", "") or "",
        cover_image_url=book_info.get("cover_image_url", "") or "https://msp.c.yimg.jp/images/v2/FUTi93tXq405grZVGgDqGxFd07OLhx_m__6r2FpK2Um4tuuTp9RnKlnMuBJBv3Gdy4iZTldufLUyozbcCsSNUUE_iB1EInDgaZAMBGMmvZ7viMxLW7VaxnTNc7LZcvKO3xizbs_ovgVJkkmIP9y0ID-iWtqDwjQrm31HjeQnA0LfHFadohvEGY2xDtza2Vck1BCKZoADOcAld3yzXRTgdHLcTdqSVSsIZXoYyf16iviAQoZS0yY8OiztkD6wFCZDpp4QeLJJv_8FCsuGuzwPF6DwLtWor8vl9ORLFPI_f3jU_T57C0pg4bIyWBt-xiQ-PdtoNor6gMe7lVKlioFR9pMbED6p8XCno56zkwyuqYbRvef8_vF-QdW36RHZJjeg8o6zQcPYl1uIAxkvjQDVUg==/noimage_E38392E3829AE382AFE38388-760x460.png",
        published_date=pub_date,
        status=BookStatusEnum.OWNED,
        isbn=isbn,
        is_favorite=False,
        genres=book_info.get("genres") or []
    )

    return crud_book.create_book(db=db, book=new_book, user_id=current_user.id)


@router.post("/books/wishlist-register", response_model=BookOut)
def register_to_wishlist(
    book_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    title = book_data.get("title")
    authors = book_data.get("authors", [])
    publisher = book_data.get("publisher", "")
    cover_image_url = book_data.get("cover_image_url", "")
    published_date_str = book_data.get("published_date")
    genres = book_data.get("genres", [])
    isbn = book_data.get("isbn")

    if not isbn:
        rakuten_results = search_books_by_title_rakuten(title)
        matched = next(
            (item for item in rakuten_results
             if normalize_title(item["title"]) == normalize_title(title)),
            None
        )
        if not matched:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="ISBNが見つかりませんでした（楽天Booksでも補完できませんでした）"
            )
        isbn = matched.get("isbn")

    existing_book = db.query(Book).filter(
        Book.isbn == isbn,
        Book.user_id == current_user.id
    ).first()

    if existing_book:
        if existing_book.status == BookStatusEnum.OWNED:
            raise HTTPException(status_code=400, detail="すでに所持しています。")
        elif existing_book.status == BookStatusEnum.WISHLIST:
            raise HTTPException(status_code=400, detail="すでにウィッシュリストに追加されています。")
        elif existing_book.status == BookStatusEnum.NOT_OWNED:
            existing_book.status = BookStatusEnum.WISHLIST
            db.commit()
            db.refresh(existing_book)
            return existing_book

    volume = extract_volume(title) or ""
    pub_date = parse_published_date(published_date_str)

    new_book = Book(
        title=title,
        volume=volume,
        author=", ".join(authors),
        publisher=publisher,
        cover_image_url=cover_image_url,
        published_date=pub_date,
        status=BookStatusEnum.WISHLIST,
        is_favorite=False,
        user_id=current_user.id,
        genres=genres,
        isbn=isbn
    )

    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book


@router.get("/me/books", response_model=List[BookOut])
def get_my_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.get_books_by_user_id_and_status(
        db=db,
        user_id=current_user.id,
        status=BookStatusEnum.OWNED
    )


@router.get("/me/wishlist", response_model=List[BookOut])
def get_my_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.get_books_by_user_id_and_status(
        db, user_id=current_user.id, status=BookStatusEnum.WISHLIST
    )


@router.get("/me/books/favorites", response_model=List[BookOut])
def get_favorite_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_book.get_favorite_books_by_user_id(db, current_user.id)


@router.get("/search_book")
def search_book(title: str):
    return search_books_by_title(title)


@router.get("/books/search_rakuten")
def search_books_rakuten(
    title: str = Query(..., description="検索タイトル"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return search_books_by_title_rakuten(title)


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


@router.put("/books/{book_id}", response_model=BookOut)
def update_my_book(
    book_id: int,
    update_data: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.update_book(db=db, book_id=book_id, update_data=update_data, user_id=current_user.id)


@router.patch("/books/{book_id}", response_model=BookOut)
def patch_book(
    book_id: int,
    update_data: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.update_book(db=db, book_id=book_id, update_data=update_data, user_id=current_user.id)


@router.put("/books/{title}/wishlist", response_model=BookOut)
def add_to_wishlist(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_book = crud_book.update_book_status_to_wishlist(db, title, current_user.id)
    if not updated_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="本が見つかりません。"
        )
    return updated_book
