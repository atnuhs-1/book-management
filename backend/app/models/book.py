from sqlalchemy import Column, Integer, String, Date, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from enum import Enum as PyEnum

# ✅ 標準的な大文字の属性名を維持
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

    # ✅ SQLAlchemyに値を使用するよう明示的に指定
    status = Column(
        SqlEnum(BookStatusEnum,
               name="bookstatusenum",
               values_callable=lambda x: [e.value for e in x]),
        default=BookStatusEnum.OWNED,
        nullable=False
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # リレーションシップ
    user = relationship("User", back_populates="books")
