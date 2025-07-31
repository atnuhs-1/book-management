# scripts/manual_notify.py

from app.services.notification.wishlist import notify_upcoming_books

if __name__ == "__main__":
    notify_upcoming_books()
    print("通知チェックを実行しました")
