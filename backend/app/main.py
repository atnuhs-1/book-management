import os

from app.core.database import Base, engine
from app.models import book, food_item, user
# ルーターインポート
from app.routers import food_item  # ✅ モジュールとしてimport
from app.routers import book_router
from app.routers import notification as notification_router
from app.routers import recommendation_router, user_router
from app.services.notification.wishlist import start_scheduler
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 環境変数 & DB初期化
load_dotenv()
Base.metadata.create_all(bind=engine)

# FastAPIアプリ作成
app = FastAPI(title="Book Management API")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

# FastAPIアプリ作成
app = FastAPI(title="Book Management API")

# ngrok warning 回避ミドルウェア
@app.middleware("http")
async def add_ngrok_skip_header(request: Request, call_next):
    response = await call_next(request)
    # ngrok warning を回避するヘッダーを追加
    response.headers["ngrok-skip-browser-warning"] = "any"
    return response

# CORS設定 - 本番環境対応
def get_cors_origins():
    """環境に応じてCORSオリジンを取得"""
    base_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://localhost:5173",
    ]

    # 環境変数から追加のオリジンを取得
    cors_origins_env = os.getenv("CORS_ORIGINS", "")
    if cors_origins_env:
        # 複数のオリジンをサポート、末尾の/を削除
        additional_origins = [
            origin.strip().rstrip('/')
            for origin in cors_origins_env.split(",")
            if origin.strip()
        ]
        base_origins.extend(additional_origins)

    # 本番環境の場合は確実にVercel URLを追加
    if os.getenv("ENVIRONMENT") == "production":
        base_origins.extend([
            "https://libreats.vercel.app",  # 実際のVercel URL
            "https://*.vercel.app",         # Vercel全般
        ])

    # 重複削除
    return list(set(base_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# テストルート
@app.get("/")
async def root():
    return {"message": "Book Management API", "environment": os.getenv("ENVIRONMENT", "development")}

@app.get("/api/test")
async def test():
    return {"status": "ok", "message": "API is working"}

@app.get("/api/health")
async def health_check():
    """ヘルスチェック用エンドポイント"""
    return {
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "cors_origins": get_cors_origins()
    }

# ルーター登録
app.include_router(user_router, prefix="/api/auth", tags=["auth"])
app.include_router(book_router, prefix="/api", tags=["books"])
app.include_router(recommendation_router, prefix="/api", tags=["recommendations"])
app.include_router(notification_router.router, prefix="/api", tags=["notifications"])
app.include_router(food_item.router)  # ✅ prefix & tags は food_item.py 側に記述済み

# スケジューラー起動
@app.on_event("startup")
async def startup_event():
    start_scheduler()
