from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.food_item import FoodItemCreate, FoodItemRead
from app.crud import food_item as crud_food
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

# ✅ prefix から "api" を除去
router = APIRouter(prefix="/food-items", tags=["food_items"])

@router.post("/", response_model=FoodItemRead)
def create_item(
    item: FoodItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.create_food_item(db, current_user.id, item)

@router.get("/", response_model=list[FoodItemRead])
def read_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.get_food_items_by_user_id(db, current_user.id)
