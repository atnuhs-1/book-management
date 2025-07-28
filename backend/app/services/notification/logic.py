from app.core.database import SessionLocal
from app.crud.emergency import get_items_expiring_in_days


def notify_upcoming_expiration():
    db = SessionLocal()
    try:
        items = get_items_expiring_in_days(db, days=3)
        for item in items:
            print(f"🔔 通知: 『{item.name}』が3日後に期限切れです！（{item.expiration_date}）")
            # 将来的に：Slack通知、メール送信に変更可
    finally:
        db.close()
