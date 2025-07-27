import os
from typing import Generator

from dotenv import load_dotenv
from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# .envの読み込み
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# 環境変数からDATABASE_URL取得
DATABASE_URL = os.getenv("DATABASE_URL")

# エンジンとセッション定義
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
