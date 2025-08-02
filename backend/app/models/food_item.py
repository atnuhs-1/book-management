from enum import Enum as PyEnum

from app.core.database import Base
from sqlalchemy import Column, Date
from sqlalchemy import Enum as SqlEnum
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from typing import Optional  # これが必要！


# ✅ 表示用に日本語、DBには日本語文字列を保存
class FoodCategory(PyEnum):
    FRESH = "生鮮食品"
    EMERGENCY = "非常食"
    BEVERAGES = "飲料"
    SEASONINGS = "調味料"
    FROZEN = "冷凍食品"
    SNACKS = "お菓子"
    # OTHER = "その他"

class QuantityUnit(PyEnum):
    GRAM = "g"
    PIECE = "個"

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, index=True)

    category = Column(
        SqlEnum(
            FoodCategory,
            name="foodcategory",  # DB上の型名
            values_callable=lambda enum_cls: [e.value for e in enum_cls]  # ✅ value を保存
        ),
        nullable=True #　とりあえず今は何も入れなくてもokということになっています。後で変えます
    )

    unit = Column(
        SqlEnum(
            QuantityUnit,
            name="quantityunit",
            values_callable=lambda enum_cls: [e.value for e in enum_cls]
        ),
        nullable=False
    )

    quantity = Column(Integer)
    expiration_date = Column(Date)

    user = relationship("User", back_populates="food_items")
