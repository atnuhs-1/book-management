# app/services/hybrid_recipe.py

import os

import requests
from app.services.recipe_chatgpt import generate_recipe_with_chatgpt
from dotenv import load_dotenv

load_dotenv()
APP_ID = os.getenv("RAKUTEN_APP_ID")
SEARCH_URL = "https://app.rakuten.co.jp/services/api/Recipe/RecipeSearch/20170426"

def search_recipes_by_ingredients(ingredients: list[str]) -> list[dict]:
    if not ingredients:
        return []

    query = " ".join(ingredients[:2])  # 多すぎると楽天APIは400返す

    params = {
        "applicationId": APP_ID,
        "format": "json",
        "formatVersion": 2,
        "keyword": query,
        "hits": 5
    }

    try:
        res = requests.get(SEARCH_URL, params=params, timeout=10)
        res.raise_for_status()
        data = res.json()
    except Exception as e:
        print(f"🛑 Rakuten API Error: {e}")
        return []

    return [
        {
            "title": item["recipeTitle"],
            "url": item["recipeUrl"],
            "image": item["foodImageUrl"],
            "ingredients": item["recipeMaterial"]
        }
        for item in data.get("recipes", [])
    ]

def hybrid_recipe_suggestion(ingredients: list[str]) -> dict:
    rakuten_results = search_recipes_by_ingredients(ingredients)

    if rakuten_results:
        return {
            "source": "rakuten",
            "recipes": rakuten_results
        }

    gpt_result = generate_recipe_with_chatgpt(ingredients)
    return {
        "source": "chatgpt",
        "recipes": [gpt_result]
    }
