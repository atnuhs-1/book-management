from sqlalchemy.orm import Session
from app.models.user import User

def get_users_count(db: Session):
    return db.query(User).count()

def check_users_table_exists(db: Session):
    try:
        count = db.query(User).count()
        return {"exists": True, "count": count}
    except Exception as e:
        return {"exists": False, "error": str(e)}
