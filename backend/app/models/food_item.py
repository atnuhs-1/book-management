from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class FoodCategory(str, enum.Enum):
    FRESH = "生鮮食品"
    EMERGENCY = "非常食"
    BEVERAGES = "飲料"
    SEASONINGS = "調味料"
    FROZEN = "冷凍食品"
    SNACKS = "お菓子"

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(Enum(FoodCategory), nullable=False)
    quantity = Column(Integer, nullable=False)
    expiration_date = Column(Date, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="food_items")
