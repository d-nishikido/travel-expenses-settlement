# 出張精算システム API 仕様書

## 1. API 概要

### 1.1 基本情報
- **プロトコル**: HTTPS
- **データ形式**: JSON
- **文字エンコーディング**: UTF-8
- **API バージョン**: v1.0.0
- **認証方式**: JWT (JSON Web Token)

### 1.2 ベース URL
```
開発環境: http://localhost:5000/api
ステージング環境: https://api-staging.example.com/api
本番環境: https://api.example.com/api
```

### 1.3 共通ヘッダー
| ヘッダー名 | 必須 | 説明 |
|-----------|------|------|
| Content-Type | ○ | application/json |
| Authorization | △ | Bearer {token} ※認証が必要なエンドポイントで必須 |

## 2. 認証

### 2.1 認証フロー
1. `/api/auth/login` エンドポイントにメールアドレスとパスワードを送信
2. 認証成功時、JWT トークンを含むレスポンスを返却
3. 以降のリクエストでは Authorization ヘッダーにトークンを含める

### 2.2 トークン仕様
- **有効期限**: 24 時間
- **更新方法**: 再ログインによる新規トークン取得
- **保存場所**: クライアント側でセキュアに保存（localStorage は非推奨）

## 3. エラーレスポンス

### 3.1 エラーレスポンス形式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーの詳細説明",
    "details": "追加情報（オプション）"
  }
}
```

### 3.2 HTTP ステータスコード
| コード | 説明 | 使用場面 |
|--------|------|----------|
| 200 | 成功 | 正常にリクエストが処理された |
| 201 | 作成成功 | 新規リソースが作成された |
| 400 | 不正なリクエスト | リクエストパラメータが不正 |
| 401 | 認証エラー | 認証が必要または認証情報が無効 |
| 403 | 権限エラー | アクセス権限がない |
| 404 | 見つからない | 指定されたリソースが存在しない |
| 409 | 競合 | リソースの状態が競合している |
| 422 | 検証エラー | 入力値の検証に失敗 |
| 429 | リクエスト過多 | レート制限に達した |
| 500 | サーバーエラー | サーバー側の予期しないエラー |

### 3.3 エラーコード一覧
| エラーコード | 説明 |
|-------------|------|
| AUTH_INVALID_CREDENTIALS | メールアドレスまたはパスワードが正しくありません |
| AUTH_TOKEN_EXPIRED | 認証トークンの有効期限が切れています |
| AUTH_TOKEN_INVALID | 認証トークンが無効です |
| VALIDATION_ERROR | 入力値が正しくありません |
| RESOURCE_NOT_FOUND | 指定されたリソースが見つかりません |
| PERMISSION_DENIED | この操作を実行する権限がありません |
| CONFLICT_STATUS | 現在のステータスではこの操作は実行できません |

## 4. API エンドポイント詳細

### 4.1 ヘルスチェック

#### GET /health
システムの稼働状況を確認する

**認証**: 不要

**レスポンス例**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00Z",
  "version": "1.0.0"
}
```

### 4.2 認証 API

#### POST /api/auth/login
ユーザー認証を行い、アクセストークンを取得する

**認証**: 不要

**リクエストボディ**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "山田太郎",
      "role": "employee",
      "department": "営業部"
    }
  }
}
```

#### POST /api/auth/logout
ログアウト処理（トークンを無効化）

**認証**: 必要

**レスポンス例**:
```json
{
  "success": true,
  "message": "ログアウトしました"
}
```

#### GET /api/auth/me
現在ログイン中のユーザー情報を取得

**認証**: 必要

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "山田太郎",
    "role": "employee",
    "department": "営業部"
  }
}
```

### 4.3 ユーザー管理 API

#### GET /api/users
ユーザー一覧を取得（経理部門のみ）

**認証**: 必要（経理ロール）

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| page | number | × | ページ番号（デフォルト: 1） |
| limit | number | × | 1ページあたりの件数（デフォルト: 20） |
| role | string | × | ロールでフィルター（employee, accounting） |

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "name": "山田太郎",
        "role": "employee",
        "department": "営業部",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

#### POST /api/users
新規ユーザーを作成（経理部門のみ）

**認証**: 必要（経理ロール）

**リクエストボディ**:
```json
{
  "email": "newuser@example.com",
  "name": "鈴木花子",
  "password": "securePassword123",
  "role": "employee",
  "department": "開発部"
}
```

**バリデーション**:
- email: 必須、メール形式、重複不可
- name: 必須、最大100文字
- password: 必須、最小8文字、英数字混在
- role: 必須、employee または accounting
- department: 任意、最大100文字

#### PUT /api/users/:id
ユーザー情報を更新

**認証**: 必要（自分自身または経理ロール）

**パスパラメータ**:
- id: ユーザーID

**リクエストボディ**:
```json
{
  "name": "更新後の名前",
  "department": "更新後の部署"
}
```

#### DELETE /api/users/:id
ユーザーを削除（経理部門のみ）

**認証**: 必要（経理ロール）

**パスパラメータ**:
- id: ユーザーID

### 4.4 精算申請 API

#### GET /api/expense-reports
精算申請一覧を取得

**認証**: 必要

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| page | number | × | ページ番号 |
| limit | number | × | 1ページあたりの件数 |
| status | string | × | ステータスでフィルター |
| userId | string | × | ユーザーIDでフィルター（経理のみ） |

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174000",
        "title": "東京出張",
        "tripPurpose": "顧客訪問および会議参加",
        "tripStartDate": "2024-01-15",
        "tripEndDate": "2024-01-18",
        "status": "submitted",
        "totalAmount": 125050,
        "submittedAt": "2024-01-19T15:30:00Z",
        "user": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "山田太郎",
          "email": "yamada@example.com"
        },
        "itemsCount": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

#### GET /api/expense-reports/:id
精算申請の詳細を取得

**認証**: 必要

**パスパラメータ**:
- id: 申請ID

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "title": "東京出張",
    "tripPurpose": "顧客訪問および会議参加",
    "tripStartDate": "2024-01-15",
    "tripEndDate": "2024-01-18",
    "status": "submitted",
    "totalAmount": 125050,
    "submittedAt": "2024-01-19T15:30:00Z",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "山田太郎",
      "email": "yamada@example.com",
      "department": "営業部"
    },
    "items": [
      {
        "id": "item-001",
        "category": "transportation",
        "description": "東京往復航空券",
        "amount": 85000,
        "expenseDate": "2024-01-15",
        "receiptUrl": "https://example.com/receipts/flight-001.pdf"
      },
      {
        "id": "item-002",
        "category": "accommodation",
        "description": "ホテル宿泊費（3泊）",
        "amount": 30050,
        "expenseDate": "2024-01-15",
        "receiptUrl": "https://example.com/receipts/hotel-001.pdf"
      }
    ],
    "approvalHistory": [
      {
        "action": "submitted",
        "userId": "123e4567-e89b-12d3-a456-426614174000",
        "userName": "山田太郎",
        "timestamp": "2024-01-19T15:30:00Z",
        "comment": null
      }
    ]
  }
}
```

#### POST /api/expense-reports
新規精算申請を作成

**認証**: 必要

**リクエストボディ**:
```json
{
  "title": "東京出張",
  "tripPurpose": "顧客訪問および会議参加",
  "tripStartDate": "2024-01-15",
  "tripEndDate": "2024-01-18"
}
```

**バリデーション**:
- title: 必須、最大200文字
- tripPurpose: 必須
- tripStartDate: 必須、YYYY-MM-DD形式
- tripEndDate: 必須、YYYY-MM-DD形式、開始日以降

#### PUT /api/expense-reports/:id
精算申請を更新（下書きのみ）

**認証**: 必要（作成者のみ）

**パスパラメータ**:
- id: 申請ID

**前提条件**:
- ステータスが「draft」であること

#### DELETE /api/expense-reports/:id
精算申請を削除（下書きのみ）

**認証**: 必要（作成者のみ）

**パスパラメータ**:
- id: 申請ID

**前提条件**:
- ステータスが「draft」であること

#### POST /api/expense-reports/:id/submit
精算申請を提出

**認証**: 必要（作成者のみ）

**パスパラメータ**:
- id: 申請ID

**前提条件**:
- ステータスが「draft」であること
- 1件以上の精算項目が登録されていること

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "status": "submitted",
    "submittedAt": "2024-01-19T15:30:00Z"
  }
}
```

#### POST /api/expense-reports/:id/approve
精算申請を承認（経理部門のみ）

**認証**: 必要（経理ロール）

**パスパラメータ**:
- id: 申請ID

**リクエストボディ**:
```json
{
  "comment": "全ての領収書を確認しました。承認します。"
}
```

**前提条件**:
- ステータスが「submitted」であること

#### POST /api/expense-reports/:id/reject
精算申請を却下（経理部門のみ）

**認証**: 必要（経理ロール）

**パスパラメータ**:
- id: 申請ID

**リクエストボディ**:
```json
{
  "comment": "宿泊費の領収書が不足しています。再提出してください。"
}
```

**前提条件**:
- ステータスが「submitted」であること
- comment は必須

#### POST /api/expense-reports/:id/pay
支払い完了を記録（経理部門のみ）

**認証**: 必要（経理ロール）

**パスパラメータ**:
- id: 申請ID

**リクエストボディ**:
```json
{
  "comment": "銀行振込にて支払い完了（振込番号: 12345）"
}
```

**前提条件**:
- ステータスが「approved」であること

### 4.5 精算項目 API

#### GET /api/expense-reports/:reportId/items
精算項目一覧を取得

**認証**: 必要

**パスパラメータ**:
- reportId: 申請ID

**レスポンス例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "item-001",
      "category": "transportation",
      "description": "東京往復航空券",
      "amount": 85000,
      "expenseDate": "2024-01-15",
      "receiptUrl": "https://example.com/receipts/flight-001.pdf",
      "createdAt": "2024-01-19T10:15:00Z"
    }
  ]
}
```

#### POST /api/expense-reports/:reportId/items
精算項目を追加

**認証**: 必要（申請作成者のみ）

**パスパラメータ**:
- reportId: 申請ID

**リクエストボディ**:
```json
{
  "category": "transportation",
  "description": "東京往復航空券",
  "amount": 85000,
  "expenseDate": "2024-01-15",
  "receiptUrl": "https://example.com/receipts/flight-001.pdf"
}
```

**バリデーション**:
- category: 必須、transportation/accommodation/meal/other のいずれか
- description: 必須、最大500文字
- amount: 必須、0より大きい数値
- expenseDate: 必須、YYYY-MM-DD形式
- receiptUrl: 任意、最大500文字

**前提条件**:
- 申請のステータスが「draft」であること

#### PUT /api/expense-reports/:reportId/items/:id
精算項目を更新

**認証**: 必要（申請作成者のみ）

**パスパラメータ**:
- reportId: 申請ID
- id: 項目ID

**前提条件**:
- 申請のステータスが「draft」であること

#### DELETE /api/expense-reports/:reportId/items/:id
精算項目を削除

**認証**: 必要（申請作成者のみ）

**パスパラメータ**:
- reportId: 申請ID
- id: 項目ID

**前提条件**:
- 申請のステータスが「draft」であること

### 4.6 レポート API

#### GET /api/reports/summary
集計レポートを取得（経理部門のみ）

**認証**: 必要（経理ロール）

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| startDate | string | × | 開始日（YYYY-MM-DD） |
| endDate | string | × | 終了日（YYYY-MM-DD） |

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "totalReports": 150,
    "totalAmount": 12500050,
    "statusBreakdown": {
      "draft": 20,
      "submitted": 15,
      "approved": 80,
      "rejected": 10,
      "paid": 25
    },
    "categoryBreakdown": {
      "transportation": 6500000,
      "accommodation": 3500000,
      "meal": 2000000,
      "other": 500050
    }
  }
}
```

#### GET /api/reports/export
レポートをエクスポート（経理部門のみ）

**認証**: 必要（経理ロール）

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| format | string | ○ | 出力形式（csv, pdf） |
| startDate | string | × | 開始日 |
| endDate | string | × | 終了日 |
| status | string | × | ステータスでフィルター |

**レスポンス**: ファイルダウンロード

## 5. データモデル

### 5.1 User（ユーザー）
```typescript
interface User {
  id: string;           // UUID
  email: string;        // メールアドレス
  name: string;         // 氏名
  role: 'employee' | 'accounting';  // ロール
  department?: string;  // 部署
  createdAt: string;    // 作成日時（ISO 8601）
  updatedAt: string;    // 更新日時（ISO 8601）
}
```

### 5.2 ExpenseReport（精算申請）
```typescript
interface ExpenseReport {
  id: string;           // UUID
  userId: string;       // ユーザーID
  title: string;        // タイトル
  tripPurpose: string;  // 出張目的
  tripStartDate: string;  // 出張開始日（YYYY-MM-DD）
  tripEndDate: string;    // 出張終了日（YYYY-MM-DD）
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  totalAmount: number;    // 合計金額
  submittedAt?: string;   // 提出日時
  approvedAt?: string;    // 承認日時
  approvedBy?: string;    // 承認者ID
  createdAt: string;      // 作成日時
  updatedAt: string;      // 更新日時
}
```

### 5.3 ExpenseItem（精算項目）
```typescript
interface ExpenseItem {
  id: string;                 // UUID
  expenseReportId: string;    // 申請ID
  category: 'transportation' | 'accommodation' | 'meal' | 'other';
  description: string;        // 説明
  amount: number;            // 金額
  receiptUrl?: string;       // 領収書URL
  expenseDate: string;       // 費用発生日（YYYY-MM-DD）
  createdAt: string;         // 作成日時
  updatedAt: string;         // 更新日時
}
```

### 5.4 ApprovalHistory（承認履歴）
```typescript
interface ApprovalHistory {
  id: string;           // UUID
  expenseReportId: string;  // 申請ID
  action: 'submitted' | 'approved' | 'rejected' | 'paid';
  userId: string;       // 実行者ID
  comment?: string;     // コメント
  createdAt: string;    // 実行日時
}
```

## 6. ファイルアップロード

### 6.1 領収書アップロード
**エンドポイント**: POST /api/upload/receipt

**認証**: 必要

**リクエスト形式**: multipart/form-data

**ファイル要件**:
- 最大サイズ: 10MB
- 対応形式: JPEG, PNG, PDF
- ファイル名: 日本語対応

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/receipts/2024/01/abc123.pdf",
    "filename": "領収書_20240120.pdf",
    "size": 1024576
  }
}
```

## 7. レート制限

### 7.1 制限ルール
| エンドポイント | 制限 |
|---------------|------|
| 一般エンドポイント | 100回/15分/IP |
| 認証エンドポイント | 5回/15分/IP |
| ファイルアップロード | 10回/時/ユーザー |

### 7.2 制限超過時のレスポンス
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエスト数が制限を超えました。しばらく待ってから再試行してください。",
    "details": {
      "retryAfter": 900
    }
  }
}
```

## 8. バージョン管理

### 8.1 バージョニング方針
- URL パスにバージョンを含める（例: /api/v1/）
- 後方互換性を維持
- 重大な変更時は新バージョンを追加

### 8.2 非推奨 API の扱い
- 最低 6 ヶ月間は維持
- ヘッダーで非推奨を通知
- ドキュメントに移行ガイドを記載

## 9. セキュリティ

### 9.1 HTTPS 必須
本番環境では全ての通信を HTTPS で暗号化

### 9.2 CORS 設定
```
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 9.3 入力値検証
- SQL インジェクション対策
- XSS 対策
- パラメータの型・長さチェック

## 10. 変更履歴

### v1.0.0 (2024-01-20)
- 初回リリース
- 基本的な CRUD 操作
- 認証・認可機能
- 承認ワークフロー
- レポート機能