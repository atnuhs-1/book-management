import os
from openai import OpenAI
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.core.database import get_db
from app.models.book import Book
from app.models.user import User
from app.core.auth import get_current_user  # JWT認証からユーザーを取得

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter()

@router.get("/recommendations/")
def recommend_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ログイン中のユーザーが登録した本を取得
    books = db.query(Book).filter(Book.user_id == current_user.id).limit(10).all()

    if not books:
        raise HTTPException(status_code=404, detail="あなたの本のデータが見つかりません")

    book_list = "\n".join(
        [f"{b.title} by {b.author} ({b.publisher}, {b.published_date})" for b in books]
    )

    prompt = f"""
以下は「{current_user.username}」さんが登録した書籍リストです。
これをもとに、似た傾向でおすすめの本を3冊、理由付きで紹介してください。

{book_list}
"""

    try:
        chat_completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        recommendation = chat_completion.choices[0].message.content.strip()
        return {"recommendations": recommendation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
