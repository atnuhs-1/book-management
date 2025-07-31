from datetime import datetime

from app.core.database import SessionLocal
from app.crud.book import get_books_releasing_tomorrow
from app.models.notification import Notification
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from pytz import timezone


def notify_upcoming_books():
    db = SessionLocal()
    try:
        books = get_books_releasing_tomorrow(db)
        for book in books:
            message = f"明日『{book.title}』が発売されます！"

            # すでに同じ通知があるかチェック
            exists = db.query(Notification).filter(
                Notification.user_id == book.user_id,
                Notification.message == message
            ).first()

            if not exists:
                # 通知を新規作成（未読）
                notification = Notification(
                    user_id=book.user_id,
                    message=message,
                    created_at=datetime.now(),
                    is_read=False
                )
                db.add(notification)
            else:
                # 通知がすでにある場合は既読化して通知済みにする
                exists.is_read = True

        db.commit()
    finally:
        db.close()

def start_scheduler():
    scheduler = AsyncIOScheduler(timezone=timezone("Asia/Tokyo"))
    scheduler.add_job(
        notify_upcoming_books,
        trigger="cron",
        hour=0,
        minute=0
    )
    scheduler.start()
