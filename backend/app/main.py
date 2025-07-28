# backend/app/main.py

import os
from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine

# ✅ モデルのインポート（テーブル作成のために必要）
from app.models import user, book

# ✅ ルーターのインポート
from app.routers import user as user_router
from app.routers import book as book_router

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

# テストエンドポイント（動作確認用）
@app.get("/")
async def root():
    return {"message": "Book Management API"}

@app.get("/api/test")
async def test():
    return {"status": "ok", "message": "API is working"}

# ✅ 各ルーターを登録
app.include_router(user_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(book_router.router, prefix="/api", tags=["books"])
