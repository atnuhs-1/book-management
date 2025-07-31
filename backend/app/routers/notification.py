# app/routers/notification.py

from typing import List

from app.core.database import get_db
from app.models.notification import Notification
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()

from datetime import date

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.notification import Notification
from app.models.user import User
from fastapi import Depends

# @router.get("/notifications", response_model=List[str])
# def get_notifications(user_id: int, db: Session = Depends(get_db)):
#     today = date.today()

#     notifications = db.query(Notification).filter(
#         Notification.user_id == user_id,
#         Notification.is_read == False,
#         Notification.created_at >= today  # 今日以降に作成された通知だけ
#     ).order_by(Notification.created_at.desc()).all()

#     return [n.message for n in notifications]


@router.get("/notifications", response_model=List[str])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 🔐 これが鍵の正体！
):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).order_by(Notification.created_at.desc()).all()

    return [n.message for n in notifications]
