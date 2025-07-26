# 📚 書籍管理PWA

バーコード読み取り機能付きの書籍管理アプリケーション

## ✨ 主要機能

- 📱 **PWA対応** - スマホアプリのような体験
- 📷 **バーコード読み取り** - 簡単書籍登録
- 🔍 **OCRレシート読み取り** - 購入記録の自動化
- 📚 **書籍ステータス管理** - 積読、読了等の管理
- 📊 **読書統計** - 読書データの可視化
- 🔒 **ユーザー認証** - 個人データの保護

## 🛠️ 技術スタック

### フロントエンド
- **React 19** + **Vite** + **TypeScript**
- **PWA** (vite-plugin-pwa)
- **Tailwind CSS** - スタイリング

### バックエンド
- **FastAPI** + **Poetry**
- **Python 3.12**
- **PostgreSQL** - データベース

### インフラ・開発環境
- **Docker** + **Docker Compose**

### 外部API
- **Google Books API** - 書籍情報取得

## 🚀 開発環境セットアップ

### 🔧 初回セットアップ

1. **リポジトリクローン**
   ```bash
   git clone https://github.com/atnuhs-1/book-management.git
   cd book-management-pwa
   ```

2. **環境変数設定**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Docker環境構築**
   ```bash
   # 初回ビルド（時間がかかります）
   docker-compose up -d --build
   ```

4. **動作確認**
   - フロントエンド: http://localhost:5173
   - バックエンドAPI: http://localhost:8000
   - API仕様書: http://localhost:8000/docs

### 📝 日常の開発コマンド

```bash
# 開発サーバー起動
make up

# 開発サーバー停止
make down

# ログ確認
make logs

# バックエンドコンテナに接続
make backend

# フロントエンドコンテナに接続
make frontend

# 再ビルド
make build
```


## 👥 チーム開発ルール

### 🌿 ブランチ戦略（GitHub Flow）

```
main ←─── feature/book-registration
  ↑
  ├─── feature/barcode-scanner
  ├─── feature/user-auth
  └─── bugfix/api-error-handling
```

### ブランチ命名規則

- `feature/機能名` - 新機能開発
- `bugfix/修正内容` - バグ修正
- `hotfix/緊急修正` - 本番緊急修正
- `docs/ドキュメント名` - ドキュメント更新

**例:**
```bash
feature/book-registration
feature/barcode-scanner
bugfix/login-validation
docs/api-specification
```

### 🔄 開発フロー

1. **ブランチ作成**
   ```bash
   git switch main
   git pull origin main
   git switch -c feature/機能名
   ```
2. **開発・コミット**
   ```bash
   git add .
   git commit -m "feat: バーコード読み取り機能を追加"
   ```
3. **プッシュ・PR作成**
   ```bash
   git push origin feature/機能名
   ```

4. **プルリクエスト**
5. **コードレビュー**
6. **マージ**

### 📝 コミットメッセージ規約

**Prefix一覧:**
- `feat` - 新機能
- `fix` - バグ修正
- `docs` - ドキュメント
- `style` - スタイル修正
- `refactor` - リファクタリング
- `test` - テスト追加
- `chore` - その他

**例:**
```bash
feat: バーコード読み取り機能を追加
```

## 📁 プロジェクト構造

```
book-management-pwa/
├── 📄 compose.yml              # Docker構成
├── 📄 Makefile                # 開発用コマンド
├── 📄 README.md              # このファイル
├── 📄 .gitignore
├── 🔧 backend/               # バックエンド
│   ├── 🐳 Dockerfile
│   ├── 📦 pyproject.toml     # Python依存関係
│   ├── 🔒 .env               # 環境変数
│   └── 📂 app/
│       ├── main.py           # FastAPIアプリ
│       ├── models.py         # データモデル
│       ├── api/              # APIルート
│       └── services/         # ビジネスロジック
└── 🎨 frontend/              # フロントエンド
    ├── 🐳 Dockerfile
    ├── 📦 package.json       # Node.js依存関係
    ├── ⚙️ vite.config.ts     # Vite設定
    ├── 📄 tsconfig.json      # TypeScript設定
    └── 📂 src/
        ├── App.tsx           # メインコンポーネント
        ├── components/       # Reactコンポーネント
        └── services/         # API通信
```