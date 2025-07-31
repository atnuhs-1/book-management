from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.schemas.food_item import FoodItemCreate
from datetime import date
from app.models.food_item import FoodItem, FoodCategory  # ✅ 追加

def create_food_item(db: Session, user_id: int, item: FoodItemCreate):
    db_item = FoodItem(**item.dict(), user_id=user_id)
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
    for field, value in item.dict().items():
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
