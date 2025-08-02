import os

from itsdangerous import URLSafeTimedSerializer

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")

def generate_reset_token(email: str) -> str:
    s = URLSafeTimedSerializer(SECRET_KEY)
    return s.dumps(email, salt="reset-password")

def verify_reset_token(token: str, max_age=3600) -> str | None:
    s = URLSafeTimedSerializer(SECRET_KEY)
    try:
        return s.loads(token, salt="reset-password", max_age=max_age)
    except Exception:
        return None
