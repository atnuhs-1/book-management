# backend/app/main.py

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

# 自作モジュールのインポート
from . import models, schemas, crud
from .database import SessionLocal, engine

# 環境変数読み込み
load_dotenv()

# DBのテーブルを作成
models.Base.metadata.create_all(bind=engine)

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

# 🔽 ここから追加部分 🔽

# 書籍を登録（POST）
@app.post("/api/books", response_model=schemas.BookOut)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return crud.create_book(db, book)

# 書籍一覧を取得（GET）
@app.get("/api/books", response_model=list[schemas.BookOut])
def read_books(db: Session = Depends(get_db)):
    return crud.get_books(db)
