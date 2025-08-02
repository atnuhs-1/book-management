from datetime import date

from app.models.food_item import FoodCategory, FoodItem
from app.schemas.food_item import FoodItemCreate
from fastapi import HTTPException
from sqlalchemy.orm import Session
import re

def extract_quantity_and_unit(product_details: dict) -> tuple[int, str]:
    try:
        # 優先：単品（個装）入数
        if "単品（個装）入数" in product_details:
            count_str = product_details.get("単品（個装）入数", "").strip()
            if count_str.isdigit():
                return (int(count_str), "個")

        # 次点：単品容量（例：500ml, 200gなど）
        unit_str = product_details.get("単品容量", "").strip()
        match = re.match(r"(\d+)([a-zA-Zぁ-んァ-ンーａ-ｚＡ-Ｚｱ-ﾝﾞﾟ]+)", unit_str)
        if match:
            amount = int(match.group(1))
            unit = match.group(2)
            return (amount, unit)

    except Exception:
        pass

    return (1, "個")  # fallback


def create_food_item(db: Session, user_id: int, item: FoodItemCreate):
    db_item = FoodItem(**item.dict(), user_id=user_id)  # ✅ unitも含まれている
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_food_items_by_user_id(db: Session, user_id: int):
    return db.query(FoodItem).filter(FoodItem.user_id == user_id).all()

def get_food_item_by_id(db: Session, food_id: int):
    return db.query(FoodItem).filter(FoodItem.id == food_id).first()

def update_food_item(db: Session, food_id: int, item: FoodItemCreate, user_id: int):
    db_item = get_food_item_by_id(db, food_id)
    if not db_item or db_item.user_id != user_id:
        raise HTTPException(status_code=404, detail="Food not found")
    for field, value in item.dict().items():  # ✅ unit も更新される
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_food_item(db: Session, food_id: int, user_id: int):
    db_item = get_food_item_by_id(db, food_id)
    if not db_item or db_item.user_id != user_id:
        raise HTTPException(status_code=404, detail="Food not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Food deleted"}

def get_expiring_food_items(db: Session, user_id: int, today: date, deadline: date):
    return db.query(FoodItem).filter(
        FoodItem.user_id == user_id,
        FoodItem.expiration_date >= today,
        FoodItem.expiration_date <= deadline
    ).order_by(FoodItem.expiration_date.asc()).all()

def get_used_categories(db: Session, user_id: int):
    results = db.query(FoodItem.category).filter(
        FoodItem.user_id == user_id
    ).distinct().all()
    return [r[0] for r in results]

def get_food_items_by_category(db: Session, user_id: int, category: FoodCategory):
    return db.query(FoodItem).filter(
        FoodItem.user_id == user_id,
        FoodItem.category == category
    ).order_by(FoodItem.expiration_date.asc()).all()
