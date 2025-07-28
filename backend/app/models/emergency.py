from app.core.database import Base
from sqlalchemy import Column, Date, Integer, String


class EmergencyItem(Base):
    __tablename__ = "emergency_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    expiration_date = Column(Date)
    category = Column(String)
    location = Column(String)
