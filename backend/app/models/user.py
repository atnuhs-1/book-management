from app.core.database import Base
from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # ユーザが所有している本の一覧
    books = relationship("Book", back_populates="user", cascade="all, delete-orphan")
