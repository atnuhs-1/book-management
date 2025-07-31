from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.schemas.food_item import FoodItemCreate, FoodItemRead
from app.crud import food_item as crud_food

router = APIRouter(prefix="/api", tags=["food_items"])

@router.post("/foods", response_model=FoodItemRead)
def create_food(
    food: FoodItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.create_food_item(db, current_user.id, food)

@router.get("/me/foods", response_model=list[FoodItemRead])
def get_my_foods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.get_food_items_by_user_id(db, current_user.id)

@router.get("/foods/{food_id}", response_model=FoodItemRead)
def get_food(
    food_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food = crud_food.get_food_item_by_id(db, food_id)
    if not food or food.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Food not found")
    return food

@router.put("/foods/{food_id}", response_model=FoodItemRead)
def update_food(
    food_id: int,
    food_update: FoodItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.update_food_item(db, food_id, food_update, current_user.id)

@router.delete("/foods/{food_id}")
def delete_food(
    food_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.delete_food_item(db, food_id, current_user.id)
