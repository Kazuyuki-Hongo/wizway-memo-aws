# wizway-memo-aws

ウィズウェイ実績づくり向けのサンプル。  
お題例: **雑メモボード**（DynamoDB でデータが残る）。

**React + Python Lambda + API Gateway (HTTP API) + DynamoDB**

| 経路 | 役割 |
|------|------|
| `GET /hello` | 疎通確認 |
| `GET/POST /items` | メモ一覧・追加（DynamoDB） |
| `DELETE /items/{id}` | メモ削除（DynamoDB） |

永続化なしの Hello 専用サンプル:  
https://github.com/Kazuyuki-Hongo/wizway-hello-aws

## 動いている画面（デプロイ済み）

- フロント: https://d2tm7fh6nl8vai.cloudfront.net
- API（items）: https://r52vm0llrg.execute-api.ap-northeast-1.amazonaws.com/prod/items
- API（hello）: https://r52vm0llrg.execute-api.ap-northeast-1.amazonaws.com/prod/hello

## 構成

```
backend/          Python Lambda (/hello, /items)
frontend/         React (Vite) — メモ画面
template.yaml     SAM (HTTP API + DynamoDB + S3 + CloudFront)
samconfig.toml    デプロイ設定 (ap-northeast-1 / stack: wizway-memo-aws)
.cursor/mcp.json  AWS Serverless MCP (profile=deploy)
docs/             構成図
```

### 構成図

![AWS architecture](docs/images/hello-architecture.png)

- 静的配信: CloudFront → S3（フロント）
- API: API Gateway → Lambda。画面の React がこの API を呼ぶ
- **データが残る理由**: Lambda が **DynamoDB**（`/items`）に読み書きする

## 前提

- AWS CLI / SAM CLI / Node.js / uv
- IAM Identity Center の `deploy` profile（Deployer。DynamoDB 権限が必要）

```powershell
aws sso login --profile deploy
aws sts get-caller-identity --profile deploy
```

## デプロイ手順

### 1. API + インフラ

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

Docker Desktop が必要:

```powershell
sam build
sam local start-api
```

`sam local` の `/items` は、ローカルから実 DynamoDB を見る構成になりがち（要確認）。

## 関連

- Hello 専用: https://github.com/Kazuyuki-Hongo/wizway-hello-aws
- 学習パック: https://github.com/Kazuyuki-Hongo/ai-utilization-pack （`04` / `06` / `07`）
