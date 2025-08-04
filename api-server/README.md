# Coffee Order API Server

コーヒー注文決済システムのバックエンドAPIサーバーです。

## 技術スタック

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: AWS Cognito JWT
- **Security**: Helmet, CORS
- **Logging**: Morgan

## プロジェクト構造

```
api-server/
├── src/
│   ├── middleware/    # ミドルウェア (JWT認証)
│   ├── routes/        # APIルーター
│   └── index.ts       # メインサーバーファイル
├── package.json
├── tsconfig.json
└── nodemon.json
```

## インストール及び実行

### 1. 依存関係インストール
```bash
npm install
```

### 2. 環境変数設定
`env.example`ファイルをコピーして`.env`ファイルを作成し、設定してください:

```bash
cp env.example .env
```

`.env`ファイルで以下の情報を設定してください:
- `COGNITO_USER_POOL_ID`: AWS Cognito User Pool ID
- `COGNITO_USER_POOL_CLIENT_ID`: AWS Cognito User Pool Client ID
- `JWT_SECRET`: JWTシークレットキー

### 3. 開発サーバー実行
```bash
npm run dev
```

### 4. プロダクションビルド及び実行
```bash
npm run build
npm start
```

## APIエンドポイント

### 認証 (Authentication)
- `GET /api/auth/profile` - ユーザープロフィル取得
- `PUT /api/auth/profile` - ユーザー情報更新
- `POST /api/auth/verify` - トークン検証

### メニュー (Menu)
- `GET /api/menu` - 全メニュー取得
- `GET /api/menu/:id` - 特定メニュー取得
- `GET /api/menu/category/:category` - カテゴリ別メニュー取得

### 注文 (Orders)
- `POST /api/orders` - 注文作成
- `GET /api/orders` - ユーザー注文一覧取得
- `GET /api/orders/:orderId` - 特定注文取得
- `PATCH /api/orders/:orderId/status` - 注文状態更新
- `DELETE /api/orders/:orderId` - 注文キャンセル

## 認証

全ての保護されたエンドポイントはAWS Cognito JWTトークンが必要です。

### リクエストヘッダー
```
Authorization: Bearer <jwt-token>
```

### トークン検証
サーバーはAWS Cognitoで発行されたJWTトークンを自動的に検証します。

## 注文状態

- `pending`: 注文待機
- `confirmed`: 注文確認
- `preparing`: 製造中
- `ready`: 準備完了
- `completed`: 完了
- `cancelled`: キャンセル

## 開発環境

- **Port**: 3001 (デフォルト)
- **Environment**: development/production
- **CORS**: localhost:5173, localhost:3000許可

## 次のステップ

### 3段階: PG決済連携 (Stripe/トスペイ)
- 決済ゲートウェイ連携
- Webhook処理
- 決済状態管理

### 4段階: AWS IoT Core MQTT
- リアルタイム注文状態通知
- MQTTクライアント実装
- 注文状態更新 