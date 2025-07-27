from sqlalchemy import Column, Integer, String, Date,ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import User

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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="books")
