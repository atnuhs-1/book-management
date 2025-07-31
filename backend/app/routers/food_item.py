from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.food_item import FoodCategory
from app.schemas.food_item import FoodItemCreate, FoodItemRead
from app.crud import food_item as crud_food

router = APIRouter(prefix="/api", tags=["food_items"])

# ✅ POST /api/foods
@router.post("/foods", response_model=FoodItemRead)
def create_food(
    food: FoodItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.create_food_item(db, current_user.id, food)

# ✅ GET /api/me/foods
@router.get("/me/foods", response_model=list[FoodItemRead])
def get_my_foods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.get_food_items_by_user_id(db, current_user.id)

# ✅ GET /api/foods/by_category（← ⚠️ この順番が重要）
@router.get("/foods/by_category", response_model=list[FoodItemRead])
def get_foods_by_category(
    category: FoodCategory = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.get_food_items_by_category(db, current_user.id, category)

# ✅ GET /api/foods/expiring_soon
@router.get("/foods/expiring_soon", response_model=list[FoodItemRead])
def get_expiring_foods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = 3
):
    today = date.today()
    deadline = today + timedelta(days=days)
    return crud_food.get_expiring_food_items(db, current_user.id, today, deadline)

# ✅ GET /api/foods/categories
@router.get("/foods/categories", response_model=list[FoodCategory])
def get_used_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.get_used_categories(db, current_user.id)

# ✅ GET /api/foods/{food_id}
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

# ✅ PUT /api/foods/{food_id}
@router.put("/foods/{food_id}", response_model=FoodItemRead)
def update_food(
    food_id: int,
    food_update: FoodItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.update_food_item(db, food_id, food_update, current_user.id)

# ✅ DELETE /api/foods/{food_id}
@router.delete("/foods/{food_id}")
def delete_food(
    food_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.delete_food_item(db, food_id, current_user.id)
