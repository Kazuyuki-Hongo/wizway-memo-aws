# wizway-memo-aws

ウィズウェイ実績づくり向けのサンプル。  
お題例: **雑メモボード**（DynamoDB で残るデータ）。

**React + Python Lambda + API Gateway (HTTP API) + DynamoDB**

| 経路 | 役割 |
|------|------|
| `GET /hello` | 疎通確認 |
| `GET/POST /items` | メモ一覧・追加（DynamoDB） |
| `DELETE /items/{id}` | メモ削除（DynamoDB） |

構成・デプロイだけの最小 Hello は別リポジトリ:  
https://github.com/Kazuyuki-Hongo/wizway-hello-aws

## 動いている画面（デプロイ済み）

デプロイ後に README を更新する（スタック名: `wizway-memo-aws`）。

## 構成

```
backend/          Python Lambda (/hello, /items)
frontend/         React (Vite) — 雑メモボード
template.yaml     SAM (HTTP API + DynamoDB + S3 + CloudFront)
samconfig.toml    デプロイ設定 (ap-northeast-1 / stack: wizway-memo-aws)
.cursor/mcp.json  AWS Serverless MCP (profile=deploy)
docs/             構成図
```

### 構成図

![AWS architecture](docs/images/hello-architecture.png)

- 左（CloudFront → S3）＝画面ファイルの配信
- 右（API Gateway → Lambda）＝ブラウザ上の React が呼ぶ API
- **残るデータ**は Lambda → **DynamoDB**（`/items`）

## 前提

- AWS CLI / SAM CLI / Node.js / uv
- IAM Identity Center の `deploy` profile（Deployer。DynamoDB 含む）

```powershell
aws sso login --profile deploy
aws sts get-caller-identity --profile deploy
```

## デプロイ手順

### 1. API + 基盤

```powershell
sam build
sam deploy --profile deploy
```

Outputs: `ApiUrl` / `ItemsEndpoint` / `ItemsTableName` / `FrontendBucketName` / `FrontendUrl` / `CloudFrontDistributionId`

### 2. フロント

`frontend/.env.production`:

```env
VITE_API_URL=https://xxxx.execute-api.ap-northeast-1.amazonaws.com/prod
```

```powershell
cd frontend
npm ci
npm run build
aws s3 sync dist/ s3://<FrontendBucketName>/ --delete --profile deploy
aws cloudfront create-invalidation --distribution-id <CloudFrontDistributionId> --paths "/*" --profile deploy
```

## ローカル確認

Docker Desktop 起動後:

```powershell
sam build
sam local start-api
```

`sam local` 時の `/items` はメモリ仮データ。クラウドでは DynamoDB。

## 関連

- Hello のみ: https://github.com/Kazuyuki-Hongo/wizway-hello-aws
- 学習パック: https://github.com/Kazuyuki-Hongo/ai-utilization-pack （`04` / `06` / `07`）
