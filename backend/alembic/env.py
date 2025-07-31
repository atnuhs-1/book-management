import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ✅ .env の読み込み
from dotenv import load_dotenv
load_dotenv()

# ✅ Base の読み込み（自分のモデル定義ファイルに合わせて修正）
from app.core.database import Base
from app.models import food_item, user  # 使用するすべてのモデルを import

# Alembic の設定オブジェクト取得
config = context.config

# ✅ .envから読み取ったDATABASE_URLで上書き
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

# ロギング設定
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ✅ モデルの metadata を設定（これでautogenerateが動作する）
target_metadata = Base.metadata

# ▼ offline mode（SQLファイル出力）
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

# ▼ online mode（実際にDBに適用）
def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()

# 実行
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
