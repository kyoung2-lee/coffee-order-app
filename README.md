# コーヒー注文決済システム

このプロジェクトは、アイデア立案からアーキテクチャ設計、主要な機能実装までを自ら手がけて開発したコーヒー注文決済システムです。

React SPA、AWS Cognito、Express API、Stripe決済、AWS IoT Core (MQTT)を用いたリアルタイム通知機能を統合して構築しました。

開発の過程では、環境変数設定例やコードフォーマットといった細かな補助タスクについてAIを活用して効率化を図りましたが、アプリケーションの設計・実装方針や主要なロジック、AWSサービスの統合部分は自ら構築しています。

技術習得の一環として実装しましたが、実務でも活用可能な構成を意識して設計しており、このリポジトリは開発内容を整理した記録として、将来的な拡張や他プロジェクトへの応用の参考とすることを目的としています。

## プロジェクト構造

```
coffee-order-app/
├── src/
│   ├── components/     # Reactコンポーネント
│   ├── contexts/       # React Context
│   ├── aws-exports.ts  # AWS Cognito設定
│   ├── amplify.ts      # AWS Amplify初期化
│   └── App.tsx         # メインアプリコンポーネント
```

## 実装完了機能

### 1段階: React SPA + AWS Cognitoログイン連携

#### 設定方法

1. **AWS Cognito User Pool作成**
   - AWS ConsoleでCognitoサービスに移動
   - User Pool作成
   - App Client作成
   - ドメイン設定

2. **環境設定**
   - `src/aws-exports.ts`ファイルで以下の情報を更新:
     - `userPoolId`: AWS Cognito User Pool ID
     - `userPoolWebClientId`: AWS Cognito User Pool Client ID
     - `domain`: AWS Cognitoドメイン

3. **開発サーバー実行**
   ```bash
   npm run dev
   ```

#### 機能

- ユーザー新規登録
- メール認証
- ログイン/ログアウト
- 認証状態管理
- レスポンシブUI (Tailwind CSS)

### 2段階: Express API構築 (JWT検証)

#### 設定方法

1. **APIサーバー実行**
   ```bash
   cd api-server
   npm install
   npm run dev
   ```

2. **環境変数設定**
   - `api-server/env.example`を`.env`にコピー
   - AWS Cognito設定追加

#### 機能

- JWTトークン検証ミドルウェア
- ユーザー認証API
- コーヒーメニューAPI
- 注文管理API
- セキュリティヘッダー (Helmet, CORS)

### 3段階: PG決済連携 (Stripe)

#### 設定方法

1. **Stripeアカウント設定**
   - Stripe DashboardでAPIキー発行
   - Webhookエンドポイント設定

2. **環境変数設定**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

#### 機能

- Stripe Payment Intent作成
- 決済確認及びキャンセル
- Webhook処理
- 決済状態管理

### 4段階: AWS IoT Core MQTTリアルタイム通知

#### 設定方法

1. **AWS IoT Core設定**
   - AWS IoT Coreサービス作成
   - ポリシー及び証明書設定
   - WebSocketエンドポイント確認

2. **環境変数設定**
   - `AWS_IOT_ENDPOINT`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

#### 機能

- リアルタイム注文状態通知
- 決済状態リアルタイム更新
- MQTTクライアント (サーバー/クライアント)
- 通知センターUI

## プロジェクト実行方法

### 1. フロントエンド実行
```bash
npm install

npm run dev
```

### 2. バックエンドAPIサーバー実行
```bash
cd api-server

npm install

cp env.example .env

npm run dev
```

### 3. 環境変数設定

#### フロントエンド (.env)
```env
VITE_AWS_REGION=ap-northeast-1
VITE_USER_POOL_ID=pool_id(新発行)
VITE_USER_POOL_CLIENT_ID=user-pool-client-id(新発行)
VITE_COGNITO_DOMAIN=cognito-domain(新発行)
VITE_AWS_IOT_ENDPOINT=aws-iot-endpoint(新発行)
```

#### バックエンド (api-server/.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# AWS Cognito Configuration
AWS_REGION=ap-northeast-1
COGNITO_USER_POOL_ID=pool_id(新発行)
COGNITO_USER_POOL_CLIENT_ID=user-pool-client-id(新発行)

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Payment Gateway Configuration
STRIPE_SECRET_KEY=stripe-secret-key
STRIPE_WEBHOOK_SECRET=stripe-webhook-secret
STRIPE_PUBLISHABLE_KEY=stripe-publishable-key

# AWS IoT Core Configuration
AWS_IOT_ENDPOINT=ap-northeast-1.amazonaws.com
AWS_ACCESS_KEY_ID=aws-access-key-id
AWS_SECRET_ACCESS_KEY=aws-secret-access-key
AWS_SESSION_TOKEN=aws-session-token
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

### 決済 (Payment)
- `POST /api/payment/create-payment-intent` - 決済意図作成
- `POST /api/payment/confirm-payment` - 決済確認
- `POST /api/payment/cancel-payment` - 決済キャンセル
- `GET /api/payment/status/:paymentIntentId` - 決済状態取得
- `POST /api/payment/webhook` - Stripe Webhook処理

## リアルタイム通知

### MQTTトピック
- `coffee/orders/{orderId}/status` - 注文状態更新
- `coffee/orders/{orderId}/payment` - 決済状態更新

### 注文状態
- `pending`: 注文待機
- `confirmed`: 注文確認
- `preparing`: 製造中
- `ready`: 準備完了
- `completed`: 完了
- `cancelled`: キャンセル

## 技術スタック

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS
- **認証**: AWS Cognito + AWS Amplify
- **バックエンド**: Node.js + Express + TypeScript
- **決済**: Stripe
- **リアルタイム通信**: AWS IoT Core MQTT
- **セキュリティ**: JWT
- **ログ記録**: Morgan

## 開発環境設定

```bash
npm install

npm run dev

npm run build
```

## 環境変数

`.env`ファイルを作成

```env
VITE_AWS_REGION=ap-northeast-1

```
"# coffee-order-app" 
