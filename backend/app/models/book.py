from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum as SqlEnum, Boolean,JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from enum import Enum as PyEnum

# ✅ 小文字の値を使うEnum（DBにも小文字で保存される）
class BookStatusEnum(PyEnum):
    OWNED = "owned"
    WISHLIST = "wishlist"
    NOT_OWNED = "not_owned"

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    volume = Column(String)
    author = Column(String)
    publisher = Column(String)
    cover_image_url = Column(String)
    published_date = Column(Date)

    status = Column(
        SqlEnum(
            BookStatusEnum,
            name="bookstatusenum",  # PostgreSQL上のEnum型名
            values_callable=lambda enum_cls: [e.value for e in enum_cls]  # DBに小文字で保存
        ),
        default=BookStatusEnum.OWNED,
        nullable=False
    )

    is_favorite = Column(Boolean, nullable=False, default=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="books")
    genres = Column(JSON, nullable=False, default=[])
    isbn = Column(String(13), nullable=True, unique=False) # いるかわからん。いらんかったら消して
