import re
from datetime import datetime
from typing import List

from app.core.auth import get_current_user
from app.core.database import get_db
from app.crud import book as crud_book
from app.models.book import BookStatusEnum
from app.models.notification import Notification
from app.models.user import User
from app.schemas.book import BookCreate, BookOut, BookUpdate, ISBNRequest
from app.services.google_books import (fetch_book_info_by_isbn,
                                       search_books_by_title)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()

# 🔽 書籍登録（手動入力）
@router.post("/books", response_model=BookOut)
def create_book(
    book: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.create_book(db=db, book=book, user_id=current_user.id)

# 🔽 書籍登録（ISBN検索 + 自動登録）
@router.post("/books/register-by-isbn", response_model=BookOut)
def register_book_by_isbn(
    payload: ISBNRequest,  # ✅ 修正：型を明示して"additionalProp1"防止
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    isbn = payload.isbn
    if not isbn.isdigit():
        raise HTTPException(status_code=400, detail="有効なISBNではありません")

    book_info = fetch_book_info_by_isbn(isbn)
    if not book_info:
        raise HTTPException(status_code=404, detail=f"ISBN '{isbn}' の書籍情報が見つかりませんでした")

    # タイトルから巻数抽出
    def extract_volume(title: str) -> str | None:
        patterns = [
            r"[第\s]*([0-9０-９]{1,3})\s*巻",
            r"\(?第?([0-9０-９]{1,3})\)?\s*巻",
            r"([0-9０-９]{1,3})\s*巻",
            r"（?([0-9０-９]{1,3})）?",
        ]
        for pattern in patterns:
            match = re.search(pattern, title)
            if match:
                return match.group(1)
        return None

    volume = extract_volume(book_info["title"]) or ""

    # 日付変換（YYYY or YYYY-MM-DD）
    pub_date_str = book_info.get("published_date")
    try:
        if pub_date_str and len(pub_date_str) == 4:
            pub_date = datetime.strptime(pub_date_str, "%Y").date()
        elif pub_date_str:
            pub_date = datetime.strptime(pub_date_str, "%Y-%m-%d").date()
        else:
            pub_date = datetime(2000, 1, 1).date()
    except Exception:
        pub_date = datetime(2000, 1, 1).date()

    # Book登録
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
        genres = book_info.get("genres") or []
    )

    return crud_book.create_book(db=db, book=new_book, user_id=current_user.id)

# その他のエンドポイント（省略なし）

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

@router.get("/me/books/favorites", response_model=List[BookOut])
def get_favorite_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_book.get_favorite_books_by_user_id(db, current_user.id)

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

@router.patch("/books/{book_id}", response_model=BookOut)
def patch_book(
    book_id: int,
    update_data: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_book.update_book(db=db, book_id=book_id, update_data=update_data, user_id=current_user.id)

@router.put("/books/{book_id}/wishlist", response_model=BookOut)
def add_to_wishlist(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_book = crud_book.update_book_status_to_wishlist(db, book_id, current_user.id)
    if not updated_book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="本が見つかりません。"
        )
    return updated_book
