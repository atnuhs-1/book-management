from pydantic import BaseModel
from datetime import date
from enum import Enum

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
    quantity: int
    expiration_date: date

class FoodItemCreate(FoodItemBase):
    pass

class FoodItemRead(FoodItemBase):
    id: int

    class Config:
        orm_mode = True
