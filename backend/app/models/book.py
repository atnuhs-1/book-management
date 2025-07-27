from sqlalchemy import Column, Integer, String, Date
from app.core.database import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    volume = Column(String)
    author = Column(String)
    publisher = Column(String)
    cover_image_url = Column(String)
    published_date = Column(Date)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key=True, index= )
    username = Column(String,nullable=False)
    email = Column(String, unique=True,nullable=False)

user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
user = relationship("User", back_populates="books")
