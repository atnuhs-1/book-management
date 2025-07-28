from app.core.database import get_db
from app.crud import emergency as crud_emergency
from app.schemas.emergency import EmergencyItemCreate, EmergencyItemRead
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/emergency", tags=["emergency"])

@router.get("/", response_model=list[EmergencyItemRead])
def read_items(db: Session = Depends(get_db)):
    return crud_emergency.get_items(db)

@router.post("/", response_model=EmergencyItemRead)
def create_item(item: EmergencyItemCreate, db: Session = Depends(get_db)):
    return crud_emergency.create_item(db, item)

@router.get("/expiring", response_model=list[EmergencyItemRead])
def read_items_expiring_soon(
    days: int = Query(7, description="何日以内に期限が切れるか"),
    db: Session = Depends(get_db)
):
    return crud_emergency.get_items_expiring_soon(db, days)
