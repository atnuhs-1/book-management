from enum import Enum as PyEnum

from app.core.database import Base
from sqlalchemy import Column, Date
from sqlalchemy import Enum as SqlEnum
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import relationship


# ✅ 表示用に日本語、DBには日本語文字列を保存
class FoodCategory(PyEnum):
    # 生鮮食品（細分化）
    VEGETABLES = "野菜・きのこ類"
    FRUITS = "果物"
    MEAT = "精肉"
    SEAFOOD = "魚介類"
    DAIRY_EGGS = "卵・乳製品"

    # 加工食品
    FROZEN = "冷凍食品"
    CANNED_RETORT = "レトルト・缶詰"
    PROCESSED_MEAT = "ハム・ソーセージ類"
    SIDE_DISH = "惣菜"

    # その他食品
    SNACKS = "お菓子"
    STAPLE = "米、パン、麺"
    SEASONING = "調味料"

    # 飲料
    BEVERAGES = "飲料"
    OTHER = "その他"

class QuantityUnit(PyEnum):
    GRAM = "g"
    KILOGRAM = "kg"
    LITER = "L"
    MILLILITER = "ml"
    PIECE = "個"
    BOTTLE = "本"
    BAG = "袋"
    CAN = "缶"
    BOX = "箱"
    PACK = "パック"

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
        nullable=False
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
