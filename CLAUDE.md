# 出張精算システム プロジェクト仕様書

## プロジェクト概要
社内利用の出張精算WebシステムをClaudeCodeを使用して実装する。

## システム要件

### 機能要件

#### ロール
1. **経理部門**
   - 申請の承認・却下
   - 全申請の閲覧・管理
   - 支払い処理の管理
   - レポート生成

2. **社員**
   - 出張精算申請の作成・編集
   - 申請状況の確認
   - 過去の申請履歴閲覧

### 技術要件
- **データベース**: PostgreSQL
- **環境**: Docker
- **フロントエンド**: React + TypeScript
- **バックエンド**: Node.js + Express + TypeScript
- **スタイリング**: TailwindCSS
- **認証**: JWT

### 非機能要件
- 見栄えのいいモダンなUIデザイン
- レスポンシブデザイン対応
- セキュアな認証・認可機能
- パフォーマンスの最適化

## データベース設計

### テーブル構造

#### users (ユーザー)
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE NOT NULL
- password: VARCHAR(255) NOT NULL
- name: VARCHAR(100) NOT NULL
- role: ENUM('employee', 'accounting') NOT NULL
- department: VARCHAR(100)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

#### expense_reports (精算申請)
- id: UUID (PK)
- user_id: UUID (FK -> users.id)
- title: VARCHAR(200) NOT NULL
- trip_purpose: TEXT NOT NULL
- trip_start_date: DATE NOT NULL
- trip_end_date: DATE NOT NULL
- status: ENUM('draft', 'submitted', 'approved', 'rejected', 'paid') NOT NULL
- total_amount: DECIMAL(10, 2) NOT NULL
- submitted_at: TIMESTAMP
- approved_at: TIMESTAMP
- approved_by: UUID (FK -> users.id)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

#### expense_items (精算項目)
- id: UUID (PK)
- expense_report_id: UUID (FK -> expense_reports.id)
- category: ENUM('transportation', 'accommodation', 'meal', 'other') NOT NULL
- description: VARCHAR(500) NOT NULL
- amount: DECIMAL(10, 2) NOT NULL
- receipt_url: VARCHAR(500)
- expense_date: DATE NOT NULL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

#### approval_history (承認履歴)
- id: UUID (PK)
- expense_report_id: UUID (FK -> expense_reports.id)
- action: ENUM('submitted', 'approved', 'rejected', 'paid') NOT NULL
- user_id: UUID (FK -> users.id)
- comment: TEXT
- created_at: TIMESTAMP

## API エンドポイント設計

### 認証
- POST /api/auth/login - ログイン
- POST /api/auth/logout - ログアウト
- GET /api/auth/me - 現在のユーザー情報取得

### ユーザー管理
- GET /api/users - ユーザー一覧（経理のみ）
- POST /api/users - ユーザー作成（経理のみ）
- PUT /api/users/:id - ユーザー更新
- DELETE /api/users/:id - ユーザー削除（経理のみ）

### 精算申請
- GET /api/expense-reports - 精算申請一覧
- GET /api/expense-reports/:id - 精算申請詳細
- POST /api/expense-reports - 精算申請作成
- PUT /api/expense-reports/:id - 精算申請更新
- DELETE /api/expense-reports/:id - 精算申請削除（ドラフトのみ）
- POST /api/expense-reports/:id/submit - 申請提出
- POST /api/expense-reports/:id/approve - 申請承認（経理のみ）
- POST /api/expense-reports/:id/reject - 申請却下（経理のみ）
- POST /api/expense-reports/:id/pay - 支払い完了（経理のみ）

### 精算項目
- GET /api/expense-reports/:reportId/items - 精算項目一覧
- POST /api/expense-reports/:reportId/items - 精算項目追加
- PUT /api/expense-reports/:reportId/items/:id - 精算項目更新
- DELETE /api/expense-reports/:reportId/items/:id - 精算項目削除

### レポート
- GET /api/reports/summary - サマリーレポート（経理のみ）
- GET /api/reports/export - CSV/PDFエクスポート（経理のみ）

## UI/UX 設計

### 画面一覧

#### 共通画面
1. ログイン画面
2. ダッシュボード
3. プロフィール設定

#### 社員用画面
1. 精算申請一覧
2. 精算申請作成・編集
3. 精算申請詳細
4. 申請履歴

#### 経理用画面
1. 承認待ち一覧
2. 全申請管理
3. ユーザー管理
4. レポート・分析

### デザインガイドライン
- カラーパレット：プロフェッショナルで信頼感のある色調
- フォント：読みやすく、ビジネス向けのフォント
- レイアウト：クリーンでミニマル、直感的なナビゲーション
- アニメーション：適度なトランジション効果

## 開発環境設定

### Docker構成
- PostgreSQLコンテナ
- Node.jsアプリケーションコンテナ
- Nginxリバースプロキシコンテナ

### 環境変数
- DATABASE_URL
- JWT_SECRET
- NODE_ENV
- PORT

## テスト戦略
- 単体テスト（Jest）
- 統合テスト
- E2Eテスト（Cypress）

## デプロイメント
- CI/CD パイプライン設定
- ステージング環境
- 本番環境

## セキュリティ考慮事項
- パスワードのハッシュ化（bcrypt）
- SQLインジェクション対策
- XSS対策
- CSRF対策
- レート制限

## 今後の検討事項
1. 領収書画像のアップロード・OCR機能
2. モバイルアプリ対応
3. 外部会計システムとの連携
4. 多言語対応
5. 通知機能（メール、Slack等）
6. 予算管理機能

## コマンド一覧
```bash
# 開発環境の起動
docker compose up -d

# データベースマイグレーション
npm run migrate

# 開発サーバー起動
npm run dev

# テスト実行
npm run test

# ビルド
npm run build

# リント
npm run lint

# 型チェック
npm run typecheck
```