import asyncio
from datetime import date, timedelta

from app.core.database import SessionLocal
from app.crud.emergency import get_items_expiring_soon


async def start_expiration_check_loop():
    while True:
        db = SessionLocal()
        try:
            items = get_items_expiring_soon(db)  # ← ここで3日以内のすべてを取得
            if items:
                for item in items:
                    print(f"【通知】'{item.name}' の賞味期限が近づいています！（期限: {item.expiration_date}）")
            else:
                print("（通知なし）期限切れが近いアイテムはありません。")
        finally:
            db.close()

        await asyncio.sleep(86400)  # 本番では 86400（24時間）などに
