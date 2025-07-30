from .book import router as book_router
from .emergency import router as emergency
from .user import router as user_router
from .recommendation import router as recommendation_router  # ← 追加！

__all__ = ["user_router", "book_router", "recommendation_router"]
