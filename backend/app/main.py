import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import book, user, food_item  # ✅ 明示的にimport

# ルーターインポート
from app.routers import (
    user_router,
    book_router,
    recommendation_router,
    food_item_router
)
from app.routers import notification as notification_router

from app.services.notification.wishlist import start_scheduler

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Book Management API")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Book Management API"}

@app.get("/api/test")
async def test():
    return {"status": "ok", "message": "API is working"}

# ✅ ルーター登録（prefix整合）
app.include_router(user_router, prefix="/api/auth", tags=["auth"])
app.include_router(book_router, prefix="/api", tags=["books"])
app.include_router(recommendation_router, prefix="/api", tags=["recommendations"])
app.include_router(notification_router.router, prefix="/api", tags=["notifications"])
app.include_router(food_item_router, prefix="/api", tags=["food_items"])  # ✅ OK

@app.on_event("startup")
async def startup_event():
    start_scheduler()
