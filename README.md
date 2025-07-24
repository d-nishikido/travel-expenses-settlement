# 出張精算システム (Travel Expenses Settlement System)

社内利用の出張精算Webシステム

## 技術スタック

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Development**: Docker + Docker Compose
- **Package Manager**: pnpm

## 開発環境のセットアップ

### 前提条件

- Docker & Docker Compose
- Node.js 18以上
- pnpm 8以上

### 環境構築

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd travel-expenses-settlement
   ```

2. **環境変数の設定**
   ```bash
   cp .env.example .env
   ```

3. **依存関係のインストール**
   ```bash
   pnpm install
   ```

4. **Docker環境の起動**
   ```bash
   docker-compose up -d
   ```

### 開発用コマンド

```bash
# 開発環境の起動
docker-compose up -d

# 開発サーバーの起動（ローカル）
pnpm run dev

# ビルド
pnpm run build

# テスト実行
pnpm run test

# リント
pnpm run lint

# 型チェック
pnpm run typecheck

# フォーマット
pnpm run format

# 環境変数の検証
pnpm run validate:env

# 本番用Dockerイメージのビルド
pnpm run build:docker
```

## プロジェクト構成

```
travel-expenses-settlement/
├── docker/                    # Docker設定
│   ├── postgres/
│   ├── nginx/
│   └── node/
├── packages/
│   ├── backend/               # バックエンド
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── package.json
│   └── frontend/              # フロントエンド
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── hooks/
│       │   ├── utils/
│       │   ├── types/
│       │   └── styles/
│       └── package.json
├── .github/
│   └── workflows/              # CI/CDパイプライン
├── docs/                       # ドキュメント
│   ├── API.md                  # API仕様書
│   ├── DEPLOYMENT.md           # デプロイガイド
│   └── CONTRIBUTING.md         # コントリビューションガイド
├── scripts/                    # ビルド・デプロイスクリプト
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

## アクセス先

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Nginx Proxy**: http://localhost:80
- **Database**: localhost:5432

## API エンドポイント

### ヘルスチェック
- `GET /api/health` - システムの稼働状況確認

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `GET /api/auth/me` - 現在のユーザー情報

### 精算申請
- `GET /api/expense-reports` - 精算申請一覧
- `POST /api/expense-reports` - 精算申請作成
- `GET /api/expense-reports/:id` - 精算申請詳細
- `PUT /api/expense-reports/:id` - 精算申請更新
- `DELETE /api/expense-reports/:id` - 精算申請削除

## 開発のステータス

### フェーズ1: 基盤構築 ✅
- [x] Docker環境の構築
- [x] プロジェクト初期設定
- [x] TypeScript設定
- [x] ESLint/Prettier設定
- [x] 基本的なフォルダ構造

### フェーズ2: 認証機能 🚧
- [ ] ユーザー認証API
- [ ] JWT実装
- [ ] ログイン画面
- [ ] 認証コンテキスト

### フェーズ3: 精算申請機能 🚧
- [ ] 精算申請API
- [ ] 精算申請画面
- [ ] 申請一覧画面
- [ ] 申請詳細画面

### フェーズ4: 承認機能 🚧
- [ ] 承認API
- [ ] 承認画面
- [ ] 承認履歴
- [ ] 通知機能

### フェーズ5: デプロイメント準備 ✅
- [x] 環境変数管理システム
- [x] 本番用Dockerイメージ（マルチステージビルド）
- [x] CI/CDパイプライン（GitHub Actions）
- [x] ビルド最適化設定
- [x] API仕様書
- [x] デプロイメントガイド
- [x] コントリビューションガイド

## トラブルシューティング

### Docker関連
- コンテナが起動しない場合: `docker compose down -v && docker compose up -d`
- データベース接続エラー: `.env`ファイルの設定を確認

### 依存関係関連
- インストールエラー: `pnpm install --force`
- 型エラー: `pnpm run typecheck`で詳細確認

### サンプルアカウント
  - **Admin**: admin@example.com / password123
  - **Employee**: employee1@example.com / password123

## ドキュメント

- **[API仕様書](docs/API.md)** - REST APIの詳細仕様
- **[デプロイメントガイド](docs/DEPLOYMENT.md)** - 本番環境への配置手順
- **[コントリビューションガイド](docs/CONTRIBUTING.md)** - 開発参加ガイドライン

## 本番環境への展開

### 環境変数の設定
```bash
# 環境固有の設定ファイルをコピー
cp .env.example .env.production

# 本番環境用の値を設定
# - データベース接続情報
# - JWT シークレット（32文字以上）
# - API URL
```

### ビルドとデプロイ
```bash
# 環境変数の検証
pnpm run validate:env

# 本番用ビルドの実行
./scripts/build.sh --docker

# 本番環境へのデプロイ（詳細はデプロイガイドを参照）
docker-compose -f docker/docker-compose.prod.yml up -d
```

### CI/CD パイプライン
GitHub Actionsを使用した自動化：
- **コード品質チェック**: lint、型チェック、テスト
- **セキュリティスキャン**: 脆弱性検出
- **Dockerイメージビルド**: 本番用イメージの作成
- **自動デプロイ**: 承認後の自動配置