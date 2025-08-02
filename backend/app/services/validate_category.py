# app/services/validate_category.py

import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def validate_food_category(food_name: str, category: str) -> bool:
    prompt = (
        f"食材「{food_name}」が「{category}」カテゴリに分類されるのは妥当かを判断してください。\n"
        f"カテゴリ一覧は以下です：\n"
        f"- 野菜・きのこ類\n"
        f"- 果物\n"
        f"- 精肉\n"
        f"- 魚介類\n"
        f"- 卵・乳製品\n"
        f"- 冷凍食品\n"
        f"- レトルト・缶詰\n"
        f"- ハム・ソーセージ類\n"
        f"- 惣菜\n"
        f"- お菓子\n"
        f"- 米、パン、麺\n"
        f"- 調味料\n"
        f"- 飲料\n"
        f"「はい」または「いいえ」で答えてください。"
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "あなたは食品のカテゴリ判定を行うアシスタントです。"},
            {"role": "user", "content": prompt},
        ]
    )

    answer = response.choices[0].message.content.strip().lower()
    return "はい" in answer
