# backend/app/main.py

import asyncio
import os

from app.core.database import Base, engine
# モデルを明示的にインポート（テーブル作成のため）
from app.models import book, user
# ルーターのインポート
from app.routers.book import router as book_router
from app.routers.emergency import router as emergency_router
from app.routers.user import router as user_router
from app.services.notification.scheduler import start_expiration_check_loop
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 環境変数読み込み
load_dotenv()

# DBのテーブルを作成（models 読み込み済みなので Base.metadata に反映される）
Base.metadata.create_all(bind=engine)

# FastAPIアプリケーションの作成
app = FastAPI(title="Book Management API")

# CORS設定（React/Vite用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 必要に応じて環境変数化もOK
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# テスト用ルート
@app.get("/")
async def root():
    return {"message": "Book Management API"}

@app.get("/api/test")
async def test():
    return {"status": "ok", "message": "API is working"}

# ルーターの登録
app.include_router(user_router, prefix="/api/auth", tags=["auth"])
app.include_router(book_router, prefix="/api", tags=["books"])
app.include_router(emergency_router)

#start_expiration_check_loop()

from app.services.notification.scheduler import start_expiration_check_loop


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_expiration_check_loop())
