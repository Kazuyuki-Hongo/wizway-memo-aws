# AGENTS.md

- 画面は React ＋ TypeScript（`.tsx`）。Vite の `react-ts` に合わせる
- API は Python Lambda。残るデータは DynamoDB（`/items`）
- SAM の `template.yaml` を勝手に大きくしない。RDS やコンテナ常時起動は足さない
