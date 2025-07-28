from datetime import date

from pydantic import BaseModel


class EmergencyItemBase(BaseModel):
    name: str
    quantity: int
    expiration_date: date | None = None
    category: str | None = None
    location: str | None = None

class EmergencyItemCreate(EmergencyItemBase):
    pass

class EmergencyItemRead(EmergencyItemBase):
    id: int

    class Config:
        orm_mode = True
