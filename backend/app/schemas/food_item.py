from datetime import date
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class FoodCategory(str, Enum):
    FRESH = "生鮮食品"
    EMERGENCY = "非常食"
    BEVERAGES = "飲料"
    SEASONINGS = "調味料"
    FROZEN = "冷凍食品"
    SNACKS = "お菓子"


class FoodItemBase(BaseModel):
    name: str
    category: FoodCategory
    quantity: int = Field(..., description="1以上の数量を入力してください")
    expiration_date: date

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError("在庫はありません（quantityは1以上にしてください）")
        return v

class FoodItemCreate(FoodItemBase):
    pass

class FoodItemRead(FoodItemBase):
    id: int

    class Config:
        orm_mode = True
