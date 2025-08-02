import os
from datetime import date, timedelta
from urllib.parse import urlencode

import requests
from app.core.auth import get_current_user
from app.core.database import get_db
from app.crud import food_item as crud_food
from app.models.food_item import FoodCategory
from app.models.user import User
from app.schemas.food_item import (FoodItemCreate, FoodItemRead,
                                   FoodUsageRequest)
from app.services.hybrid_recipe import hybrid_recipe_suggestion
from app.services.recipe_chatgpt import \
    generate_recipe_focused_on_main_ingredient
from app.services.validate_category import validate_food_category  # ✅ 追加
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api", tags=["food_items"])

load_dotenv()  # 環境変数（.env）読み込み

# 📦 共通関数（JANコードからJANCODE APIを呼び出して1件取得）
def fetch_jancode_product(barcode: str) -> tuple[dict, str]:
    app_id = os.getenv("JANCODE_API_KEY")
    if not app_id:
        raise HTTPException(status_code=500, detail="APIキー未設定")

    url = "https://api.jancodelookup.com/"
    params = {
        "appId": app_id,
        "query": barcode,
        "hits": 1,
        "page": 1,
        "type": "code"
    }
    full_url = f"{url}?{urlencode(params)}"

    try:
        res = requests.get(url, params=params)
        res.raise_for_status()
        json_data = res.json()
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="外部API接続失敗")
    except ValueError:
        raise HTTPException(status_code=502, detail="APIレスポンスがJSONではありません")

    result = json_data.get("result") or json_data.get("product")

    if not result:
        raise HTTPException(status_code=404, detail={
            "message": "商品が見つかりません（API上）",
            "requested_url": full_url,
            "web_fallback_url": f"https://www.jancodelookup.com/code/{barcode}",
            "raw_api_response": json_data
        })

    return result[0], full_url


# ✅ 1. GET /api/foods/lookup → 商品情報のプレビュー
@router.get("/foods/lookup", summary="JANコードで商品情報を確認")
def preview_food_info(
    barcode: str = Query(..., min_length=8, max_length=13),
    current_user: User = Depends(get_current_user),
):
    item, full_url = fetch_jancode_product(barcode)
    details = item.get("ProductDetails", {})

    print("JAN APIからの単品容量:", details.get("単品容量"))

    # 数量の算出
    try:
        total_volume = int(details.get("内容量", "").replace("ml", "").replace("ML", "").strip())
    except:
        total_volume = None
    try:
        unit_volume = int(details.get("単品容量", "").replace("ml", "").replace("ML", "").strip())
    except:
        unit_volume = None
    try:
        quantity = int(details.get("単品（個装）入数", "").strip())
    except:
        quantity = None

    # 安全な計算
    if quantity is None:
        if total_volume is not None and unit_volume not in (None, 0):
            try:
                quantity = total_volume / unit_volume
            except ZeroDivisionError:
                quantity = 1
        else:
            quantity = 1

    return {
        "requested_url": full_url,
        "code": item.get("codeNumber"),
        "name": item.get("itemName"),
        "brand": item.get("brandName"),
        "maker": item.get("makerName"),
        "image_url": item.get("itemImageUrl"),
        "details": details,
        "calculated_quantity": quantity
    }


# ✅ 2. GET /api/foods/lookup_name → 商品名だけ取得
@router.get("/foods/lookup_name", summary="JANコードから商品名だけ取得")
def lookup_food_name(
    barcode: str = Query(..., min_length=8, max_length=13)
):
    item, full_url = fetch_jancode_product(barcode)
    return {
        "item_name": item.get("itemName", "名称不明"),
        "requested_url": full_url
    }


# ✅ POST /api/foods
@router.post("/foods", response_model=FoodItemRead)
def create_food(
    food: FoodItemCreate,
    force: bool = Query(False),  # ← ここに注目
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not validate_food_category(food.name, food.category.value):
        if not force:
            # 確認メッセージだけ返す（登録はまだしない）
            raise HTTPException(
                status_code=409,
                detail=f"{food.name}は{food.category.value}に分類されませんが、本当に追加してよろしいですか？"
            )
        # force=True のときだけ、強行して登録続行

    return crud_food.create_food_item(db, current_user.id, food)



# ✅ GET /api/me/foods
@router.get("/me/foods", response_model=list[FoodItemRead])
def get_my_foods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.get_food_items_by_user_id(db, current_user.id)


# ✅ GET /api/foods/by_category
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


# ✅ GET /api/foods/recipe_suggestions
@router.get("/foods/recipe_suggestions")
def get_hybrid_recipes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = 3
):
    today = date.today()
    deadline = today + timedelta(days=days)

    foods = crud_food.get_expiring_food_items(db, current_user.id, today, deadline)
    ingredients = [f.name for f in foods]

    return hybrid_recipe_suggestion(ingredients)


# ✅ GET /api/foods/recipe_by_main_food
@router.get("/foods/recipe_by_main_food")
def get_recipe_by_main_food(
    food_name: str = Query(..., description="主材料とする食材名"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    deadline = today + timedelta(days=3)
    expiring_foods = crud_food.get_expiring_food_items(db, current_user.id, today, deadline)

    if food_name not in [item.name for item in expiring_foods]:
        raise HTTPException(status_code=404, detail="その食材は期限が近いものとして登録されていません")

    return {
        "source": "chatgpt",
        "recipes": [generate_recipe_focused_on_main_ingredient(food_name)]
    }


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

@router.post("/foods/{food_id}/use")
def use_food(
    food_id: int,
    data: FoodUsageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    used_quantity = data.used_quantity
    food = crud_food.get_food_item_by_id(db, food_id)

    if not food or food.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="食材が見つかりません")

    if used_quantity <= 0:
        raise HTTPException(status_code=400, detail="使用量は1以上で指定してください")

    if food.quantity < used_quantity:
        raise HTTPException(status_code=400, detail="使用量が在庫を超えています")

    food.quantity -= used_quantity

    if food.quantity == 0:
        db.delete(food)
        db.commit()
        return {"message": f"{food.name} をすべて使い切りました。"}

    db.commit()
    db.refresh(food)
    return {
        "message": f"{food.name} を {used_quantity}{food.unit.value} 使用しました。残量: {food.quantity}{food.unit.value}",
        "remaining_quantity": food.quantity
    }




# ✅ PUT /api/foods/{food_id}
@router.put("/foods/{food_id}", response_model=FoodItemRead)
def update_food(
    food_id: int,
    food_update: FoodItemCreate,
    force: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not validate_food_category(food_update.name, food_update.category.value):
        if not force:
            raise HTTPException(
                status_code=409,
                detail=f"{food_update.name}は{food_update.category.value}に分類されませんが、本当に変更してよろしいですか？"
            )
        # force=True の場合は続行

    return crud_food.update_food_item(db, food_id, food_update, current_user.id)



# ✅ DELETE /api/foods/{food_id}
@router.delete("/foods/{food_id}")
def delete_food(
    food_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_food.delete_food_item(db, food_id, current_user.id)


@router.get("/foods/{food_id}/stock_quantity")
def get_stock_quantity(
    food_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food = crud_food.get_food_item_by_id(db, food_id)
    if not food or food.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="食材が見つかりません")

    return {"quantity": food.quantity}

@router.post("/foods/from_barcode_auto", summary="JANコードから食品登録（自動数量・単位）")
def register_food_auto(
    barcode: str = Query(..., min_length=8, max_length=13),
    category: FoodCategory = Query(..., description="カテゴリを明示的に指定（例: 飲料）"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 🔍 商品情報取得
    item, _ = fetch_jancode_product(barcode)
    from app.crud.food_item import extract_quantity_and_unit

    quantity, unit = extract_quantity_and_unit(item.get("ProductDetails", {}))
    food_name = item.get("itemName", "名称不明")

    # ✅ OpenAIでカテゴリの妥当性をチェック
    if not validate_food_category(food_name, category.value):
        raise HTTPException(
            status_code=400,
            detail=f"「{food_name}」は「{category.value}」に分類されません"
        )

    # ✅ 登録処理
    food = FoodItemCreate(
        name=food_name,
        category=category,
        quantity=quantity,
        unit=unit,
        expiration_date=date.today() + timedelta(days=30)
    )

    return crud_food.create_food_item(db, current_user.id, food)

@router.get("/foods/{food_id}/days_left", summary="賞味期限までの日数を取得")
def get_days_until_expiration(
    food_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food = crud_food.get_food_item_by_id(db, food_id)

    if not food or food.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="食材が見つかりません")

    today = date.today()
    days_left = (food.expiration_date - today).days

    return {
        "food_name": food.name,
        "expiration_date": food.expiration_date,
        "days_left": days_left
    }
