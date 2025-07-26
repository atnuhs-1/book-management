# backend/app/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# .envの読み込み
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# 環境変数からDATABASE_URL取得
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app/books.db")

# SQLiteの場合は特別な接続引数が必要
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# エンジンとセッション定義
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
