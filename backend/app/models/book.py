from sqlalchemy import Column, Integer, String, Date,ForeignKey,Enum as SqlEnum #代わりにsqlalchemy.enumをSqlEnumとしています
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import User
from enum import Enum as PyEnum # enum.EnumをPyEnumとして扱ってます

# ステータス用の列挙型
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
    # ユーザと紐づけるようの外部キー

# status の行だけ修正
status = Column(SqlEnum(BookStatusEnum, name="bookstatusenum"), default=BookStatusEnum.OWNED, nullable=False)
user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
user = relationship("User", back_populates="books")
