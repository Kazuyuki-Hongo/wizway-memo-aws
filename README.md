# wizway-hello-aws

ウィズウェイ実績づくり向けのサンプル。  
**React + Python Lambda + API Gateway (HTTP API)** の Hello World。

小篠さんなど待機中の実績づくりで、「要件 → 実装 → AWS デプロイ」の型を見せるための最小構成。

## 構成

```
backend/          Python Lambda (GET /hello → {"message":"Hello World"})
frontend/         React (Vite) — API を呼んで表示
template.yaml     SAM (HTTP API + S3 + CloudFront)
samconfig.toml    デプロイ設定 (ap-northeast-1 / stack: wizway-hello-aws)
.cursor/mcp.json  AWS Serverless MCP (profile=deploy)
```

## 前提

- AWS CLI / SAM CLI / Node.js / uv
- IAM Identity Center の `deploy` profile（Deployer 権限）

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

Outputs から控えるもの:

- `ApiUrl` / `HelloEndpoint`
- `FrontendBucketName`
- `FrontendUrl`
- `CloudFrontDistributionId`

### 2. フロント build & アップロード

`frontend/.env.production` を作成:

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

ブラウザで `FrontendUrl` を開き、`Hello World` が出れば成功。

## Cursor Agents + MCP

Serverless MCP を使い、`deploy_webapp` は使わない。

```text
Serverless MCP を使え。deploy_webapp は使うな。
template.yaml を正本にして:
1. sam_build
2. sam_deploy（既存 stack があれば更新）
最後に ApiUrl / FrontendBucketName / FrontendUrl を返せ。
勝手に新サービスを足すな。
```

フロント同期は上記 `aws s3 sync` を続けて実行。

## ローカル確認（API のみ）

```powershell
sam local start-api
# 別ターミナル
curl http://127.0.0.1:3000/hello
```

## 関連

- Growi: 実績づくり_AWSデプロイ環境セットアップ（React_Lambda_MCP）
- 学習パック: `ai-utilization-pack`
