import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# .envの読み込み
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# 環境変数からDATABASE_URL取得
DATABASE_URL = os.getenv("DATABASE_URL")

# エンジンとセッション定義
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
