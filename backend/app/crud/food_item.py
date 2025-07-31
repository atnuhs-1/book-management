from sqlalchemy.orm import Session
from app.models.food_item import FoodItem
from app.schemas.food_item import FoodItemCreate

def create_food_item(db: Session, user_id: int, item: FoodItemCreate):
    db_item = FoodItem(**item.dict(), user_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_food_items_by_user_id(db: Session, user_id: int):
    return db.query(FoodItem).filter(FoodItem.user_id == user_id).all()
