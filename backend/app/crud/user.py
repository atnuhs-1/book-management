from app.core.auth import hash_password
from app.core.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate
from passlib.context import CryptContext
from sqlalchemy.orm import Session


def get_users_count(db: Session):
    return db.query(User).count()

def check_users_table_exists(db: Session):
    try:
        count = db.query(User).count()
        return {"exists": True, "count": count}
    except Exception as e:
        return {"exists": False, "error": str(e)}

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_pw = hash_password(user.password)
    new_user = User(email=user.email, username=user.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
