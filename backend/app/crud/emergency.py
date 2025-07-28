from datetime import date, timedelta

from app.models.emergency import EmergencyItem
from app.schemas.emergency import EmergencyItemCreate
from sqlalchemy.orm import Session


def get_items(db: Session):
    return db.query(EmergencyItem).all()

def create_item(db: Session, item: EmergencyItemCreate):
    db_item = EmergencyItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_items_expiring_soon(db: Session, days: int = 7):
    today = date.today()
    limit_date = today + timedelta(days=days)
    return db.query(EmergencyItem).filter(
        EmergencyItem.expiration_date != None,
        EmergencyItem.expiration_date <= limit_date
    ).all()

def get_items_expiring_in_days(db: Session, days: int = 3):
    target_date = date.today() + timedelta(days=days)
    return db.query(EmergencyItem).filter(
        EmergencyItem.expiration_date == target_date
    ).all()
