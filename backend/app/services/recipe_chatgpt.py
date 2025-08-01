import json
import os
import random

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_recipe_with_chatgpt(ingredients: list[str]) -> dict:
    random.shuffle(ingredients)

    prompt = (
        f"以下のすべての食材をまんべんなく使って、複数の家庭料理に分けて提案してください。\n"
        f"1皿にこだわらず、主菜・副菜・汁物など自由に分けて構いません。\n"
        f"必要に応じて、玉ねぎ、人参、ネギ、醤油、みりん、酒、塩、こしょう、砂糖、ごま油などの"
        f"一般的な調味料や冷蔵庫にありそうな食材を補ってください。\n"
        f"奇抜な創作料理は避け、現実的で作りやすい内容にしてください。\n"
        f"作り方は不要で、出力は以下のJSON形式で返してください。\n"
        f"各料理の材料リストでは、材料名と分量を分けて記述し、"
        f"分量の単位は g, 個, 大さじ◯杯, 小さじ◯杯 など、すべて日本語で表記してください。\n\n"
        f'''出力形式：
{{
  "recipes": [
    {{
      "title": "料理名1",
      "ingredients": [
        {{
          "name": "食材名1",
          "amount": "分量1"
        }},
        {{
          "name": "食材名2",
          "amount": "分量2"
        }}
      ]
    }},
    {{
      "title": "料理名2",
      "ingredients": [
        ...
      ]
    }}
  ]
}}'''
        f"\n\n使用する食材：{', '.join(ingredients)}"
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "あなたは優秀な家庭料理アシスタントです。"},
            {"role": "user", "content": prompt},
        ],
    )

    content = response.choices[0].message.content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"error": "ChatGPTの出力がJSONとして読み取れませんでした", "raw": content}

def generate_recipe_focused_on_main_ingredient(food_name: str) -> dict:
    prompt = (
        f"次の食材「{food_name}」を主材料として必ず使い、現実的なレシピを1つ提案してください。\n"
        f"他の食材を追加しても構いません。\n"
        f"各材料には材料名と分量を分けて記述し、"
        f"分量の単位は g, 個, 大さじ◯杯, 小さじ◯杯 など、すべて日本語で表記してください。\n\n"
        f"出力は次のJSON形式で返してください：\n"
        f'''{{
  "title": "レシピ名",
  "ingredients": [
    {{
      "name": "食材名1",
      "amount": "分量1"
    }},
    {{
      "name": "食材名2",
      "amount": "分量2"
    }}
  ]
}}'''
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "あなたは優秀なレシピアシスタントです。"},
            {"role": "user", "content": prompt},
        ],
    )

    content = response.choices[0].message.content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"error": "ChatGPTの出力がJSONとして読み取れませんでした", "raw": content}
