# backend/app/routers/__init__.py

from .user import router as user_router
from .book import router as book_router
from .recommendation import router as recommendation_router  # ← 追加！

__all__ = ["user_router", "book_router", "recommendation_router"]
