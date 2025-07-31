# app/services/recipe_chatgpt.py

import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_recipe_with_chatgpt(ingredients: list[str]) -> str:
    prompt = (
        f"以下の賞味期限が近い食材を優先的に使った、現実的な家庭料理レシピを1つ提案してください。\n"
        f"必要に応じて、冷蔵庫によくある野菜や調味料（例：玉ねぎ、人参、ネギ、醤油、みりん、酒、塩、こしょう、砂糖、ごま油 など）を補って構いません。\n"
        f"実在しない奇抜な料理や過剰に創作的な料理は避けてください。\n"
        f"出力にはレシピ名と材料リストのみを記載し、作り方や手順は省略してください。\n"
        f"材料リストには、具体的な調味料も含めてください。\n\n"
        f"【賞味期限が近い食材】：{', '.join(ingredients)}\n\n"
        f"出力形式：\n"
        f"レシピ名：〇〇\n"
        f"材料：〇〇、〇〇、〇〇…"
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "あなたは優秀な家庭料理アシスタントです。"},
            {"role": "user", "content": prompt},
        ],
    )

    return response.choices[0].message.content

def generate_recipe_focused_on_main_ingredient(food_name: str) -> str:
    prompt = (
      f"以下の食材「{food_name}」を**主な材料として必ず使って**、"
      f"実在しない奇抜な料理や過剰に創作的な料理は避けてください。\n"
      f"他の食材を追加してもよいので1つのレシピを日本語で提案してください。"
      f"レシピ名と材料のみを箇条書きで出力してください。"
      f"出力にはレシピ名と材料リストのみを記載し、作り方や手順は省略してください。\n"
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "あなたは優秀なレシピアシスタントです。"},
            {"role": "user", "content": prompt},
        ],
    )

    return response.choices[0].message.content
