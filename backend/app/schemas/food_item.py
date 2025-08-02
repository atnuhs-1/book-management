from datetime import date
from enum import Enum

from pydantic import BaseModel, Field, field_validator


# カテゴリ
class FoodCategory(str, Enum):
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

# ✅ 単位（新しく追加）
class QuantityUnit(str, Enum):
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

# ベーススキーマ
class FoodItemBase(BaseModel):
    name: str
    category: FoodCategory
    quantity: int = Field(..., description="1以上の数量を入力してください")
    unit: QuantityUnit  # ✅ 単位を追加
    expiration_date: date

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError("在庫はありません（quantityは1以上にしてください）")
        return v

# 作成用
class FoodItemCreate(FoodItemBase):
    pass

# 読み取り用
class FoodItemRead(FoodItemBase):
    id: int

    class Config:
        orm_mode = True

class FoodUsageRequest(BaseModel):
    used_quantity: int
