# backend/app/main.py

import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# ✅ 絶対インポートに修正
from app.models import user, book
from app.core.database import SessionLocal, engine, Base
from app.services.google_books import fetch_book_info_by_isbn, search_books_by_title
from app import schemas
from app import crud

# 環境変数読み込み
load_dotenv()

# DBのテーブルを作成
Base.metadata.create_all(bind=engine)

# FastAPIアプリ作成
app = FastAPI(title="Book Management API")

# CORS設定（ReactのVite devサーバー用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DBセッション取得用の依存関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ルート確認
@app.get("/")
async def root():
    return {"message": "Book Management API"}

# テストエンドポイント
@app.get("/api/test")
async def test():
    return {"status": "ok", "message": "API is working"}

# 🔽 Book関連エンドポイント 🔽

# 書籍を登録（POST）
@app.post("/api/books", response_model=schemas.BookOut)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return crud.create_book(db, book)

# 書籍一覧を取得（GET）
@app.get("/api/books", response_model=list[schemas.BookOut])
def read_books(db: Session = Depends(get_db)):
    return crud.get_books(db)

# ISBNから本の情報を取得
@app.get("/api/fetch_book/{isbn}")
def fetch_book(isbn: str):
    book_info = fetch_book_info_by_isbn(isbn)
    if book_info:
        return book_info
    return {"error": "本が見つかりませんでした"}

# タイトルから本の情報を取得
@app.get("/api/search_book")
def search_book(title: str):
    return search_books_by_title(title)

# 🔽 User関連エンドポイント 🔽

# usersテーブルの存在確認（GET）
@app.get("/api/users/check")
def check_users_table(db: Session = Depends(get_db)):
    return crud.check_users_table_exists(db)
