# wizway-memo-aws

繧ｦ繧｣繧ｺ繧ｦ繧ｧ繧､螳溽ｸｾ縺･縺上ｊ蜷代￠縺ｮ繧ｵ繝ｳ繝励Ν縲・ 
縺企｡御ｾ・ **髮代Γ繝｢繝懊・繝・*・・ynamoDB 縺ｧ谿九ｋ繝・・繧ｿ・峨・
**React + Python Lambda + API Gateway (HTTP API) + DynamoDB**

| 邨瑚ｷｯ | 蠖ｹ蜑ｲ |
|------|------|
| `GET /hello` | 逍朱夂｢ｺ隱・|
| `GET/POST /items` | 繝｡繝｢荳隕ｧ繝ｻ霑ｽ蜉・・ynamoDB・・|
| `DELETE /items/{id}` | 繝｡繝｢蜑企勁・・ynamoDB・・|

讒区・繝ｻ繝・・繝ｭ繧､縺縺代・譛蟆・Hello 縺ｯ蛻･繝ｪ繝昴ず繝医Μ:  
https://github.com/Kazuyuki-Hongo/wizway-hello-aws

## 蜍輔＞縺ｦ縺・ｋ逕ｻ髱｢・医ョ繝励Ο繧､貂医∩・・
繝・・繝ｭ繧､蠕後↓ README 繧呈峩譁ｰ縺吶ｋ・医せ繧ｿ繝・け蜷・ `wizway-memo-aws`・峨・
## 讒区・

```
backend/          Python Lambda (/hello, /items)
frontend/         React (Vite) 窶・髮代Γ繝｢繝懊・繝・template.yaml     SAM (HTTP API + DynamoDB + S3 + CloudFront)
samconfig.toml    繝・・繝ｭ繧､險ｭ螳・(ap-northeast-1 / stack: wizway-memo-aws)
.cursor/mcp.json  AWS Serverless MCP (profile=deploy)
docs/             讒区・蝗ｳ
```

### 讒区・蝗ｳ

![AWS architecture](docs/images/hello-architecture.png)

- 蟾ｦ・・loudFront 竊・S3・会ｼ晉判髱｢繝輔ぃ繧､繝ｫ縺ｮ驟堺ｿ｡
- 蜿ｳ・・PI Gateway 竊・Lambda・会ｼ昴ヶ繝ｩ繧ｦ繧ｶ荳翫・ React 縺悟他縺ｶ API
- **谿九ｋ繝・・繧ｿ**縺ｯ Lambda 竊・**DynamoDB**・・/items`・・
## 蜑肴署

- AWS CLI / SAM CLI / Node.js / uv
- IAM Identity Center 縺ｮ `deploy` profile・・eployer縲・ynamoDB 蜷ｫ繧・・
```powershell
aws sso login --profile deploy
aws sts get-caller-identity --profile deploy
```

## 繝・・繝ｭ繧､謇矩・
### 1. API + 蝓ｺ逶､

```powershell
sam build
sam deploy --profile deploy
```

Outputs: `ApiUrl` / `ItemsEndpoint` / `ItemsTableName` / `FrontendBucketName` / `FrontendUrl` / `CloudFrontDistributionId`

### 2. 繝輔Ο繝ｳ繝・
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

## 繝ｭ繝ｼ繧ｫ繝ｫ遒ｺ隱・
Docker Desktop 襍ｷ蜍募ｾ・

```powershell
sam build
sam local start-api
```

`sam local` 譎ゅ・ `/items` 縺ｯ繝｡繝｢繝ｪ莉ｮ繝・・繧ｿ縲ゅけ繝ｩ繧ｦ繝峨〒縺ｯ DynamoDB縲・
## 髢｢騾｣

- Hello 縺ｮ縺ｿ: https://github.com/Kazuyuki-Hongo/wizway-hello-aws
- 蟄ｦ鄙偵ヱ繝・け: https://github.com/Kazuyuki-Hongo/ai-utilization-pack ・・04` / `06` / `07`・・