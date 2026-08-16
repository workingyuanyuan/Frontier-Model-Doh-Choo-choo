# 操作與發布

## 不可違反的操作邊界

- Source refresh、Draft build、Published switch 是三個獨立操作。
- Agent 可以刷新來源、修正 Candidate、重建 Draft 並完成代理審核。
- Draft → Published 與 Published rollback 永遠需要人工明確操作，沒有新模型例外。
- publish／rollback 只切換 pointer，不擷取、不重新計分。
- 不使用 Docker、PostgreSQL、Drizzle、Worker、Edition 或影片流程。

## 1. 安裝

```bash
pnpm install --frozen-lockfile
```

只需要 Node.js 24+ 與 pnpm 11+。不要設定 `DATABASE_URL`，也不要啟動容器或 migration。

## 2. 刷新來源

Agent 的固定來源排程以及人工觸發的新模型收集，都使用相同 materializer：

```bash
pnpm --filter @llm-bench/acquisition materialize:snapshots
pnpm --filter @llm-bench/acquisition materialize:costs
```

刷新完成後逐站檢查：

- artifact 是來源回傳的真實 bytes，SHA-256 與 byte length 相符。
- SourceManifest 的 URL、角色、方法、時間與 `FULL`／`PARTIAL_SOURCE` 正確。
- Evidence locator 可指回原始欄位。
- Candidate／CostRecord 的 evidenceIds 全部存在。
- 官方母體、分頁或人眼可見列數與取得列數已對照。
- 結構化資料與畫面衝突已揭露，沒有模糊 identity 猜測。

來源刷新失敗時停止該次 Draft 建立；既有 Draft／Published 不受影響。

## 3. 建立不可變 Draft

```bash
pnpm data:v2:build-draft
```

命令會：

1. 驗證所有 manifest、Evidence、Candidate、CostRecord 與 mapping schema。
2. 套用 canonical identity、effort-only Profile 與來源衝突規則。
3. 建立綜合榜 Top-20 聯集與人工新品集合。
4. 計算八維、Coverage、Estimated Overall 與 cost point。
5. 產生 canonical deterministic JSON 及內容 `versionId`。
6. 只新增 `data-v2/product/versions/<sha256>.json`。
7. 版本驗證成功後才原子更新 `pointers/draft.json`。

既有版本不得修改或刪除。相同內容若已存在，bytes 必須完全相同。

## 4. Draft Preview

```powershell
$env:LLM_BENCH_CHANNEL = "DRAFT"
pnpm --filter @llm-bench/bench dev
```

Draft 與 Published 使用同一 App 和 ProductVersion schema。Draft 必須：

- 顯示 DRAFT 狀態與完整 version ID。
- 產生 `noindex, nofollow, nocache` metadata。
- 預設只顯示 8/8 模型。
- Developer mode switch 可檢視 1–7/8 的已計分模型。
- 不把 Developer mode 當發布或資料變更操作。

## 5. 發布前代理審核

Agent 必須先完成所有可由 repository、artifact 或公開來源裁決的審核，不把機械檢查交給人工。

### 版本完整性

- pointer channel、version ID、檔名和內容 hash 一致。
- deterministic 重建結果一致。
- Draft 生成期間 Published pointer 未改變。
- ProductVersion 可在無網路、artifact、DB 或 Docker 時建置。

### 資料與計分

- 來源角色、時效、母體列數與 `FULL`／`PARTIAL_SOURCE` 敘述正確。
- canonical identity、alias 與 effort 歸屬可由證據支持。
- Harness、tools、attempt、thinking、context 沒有拆成 Product Profile。
- Included Benchmark 皆有主要維度映射；Excluded 不計分。
- 缺值不是零，Composite index 未重複投入八維。
- Representative Profile、Coverage、Benchmark result count 與 Overall 規則正確。

### UI

- 預設只顯示 8/8，Developer mode 才顯示 partial scored models。
- Profile selector 會同步更新列分數、Coverage、雷達與 Evidence。
- Leaderboard／Evidence 排序、N/A、Estimated、Included／Excluded 正確。
- 桌面、行動、鍵盤與無障礙檢查通過。

只有以下問題交給人工：公開證據互相衝突且無法由版本或配置裁決；來源未公開必要資訊而無法不靠猜測判定；是否接受已揭露的殘餘產品風險；以及實際 publish／rollback 操作。

任何修正都要重新生成新的不可變 Draft，不能直接改 ProductVersion。

## 6. 人工 Published

發布者先記錄核准的 Draft `versionId`，確認 pointer 尚指向該版本，再執行：

```bash
pnpm data:v2:publish
```

安全條件：

- Draft pointer 不存在時失敗。
- 目標版本不存在、schema 錯誤或 hash 不符時失敗。
- 成功時 Published pointer 保存目標與前一版本。
- 失敗時既有 Published pointer 不變。

Published production build 必須明確指定通道：

```powershell
$env:LLM_BENCH_CHANNEL = "PUBLISHED"
pnpm --filter @llm-bench/bench build
```

部署前核對建置顯示的 version ID 等於人工核准值。

## 7. 人工 rollback

```bash
pnpm data:v2:rollback
```

沒有 `previousVersionId` 或回退版本驗證失敗時，Published pointer 保持不變。回退後重新以 `PUBLISHED` 建置並核對 version ID；不要重抓來源或重算分數。

## 8. 驗證命令

```bash
pnpm --filter @llm-bench/benchmark-data test:run
pnpm --filter @llm-bench/benchmark-data typecheck
pnpm --filter @llm-bench/acquisition test:run
pnpm --filter @llm-bench/acquisition typecheck
pnpm --filter @llm-bench/bench test:run
pnpm --filter @llm-bench/bench typecheck
pnpm --filter @llm-bench/bench build
pnpm lint
pnpm format
```

CI 的支援路徑只允許 schema、資料 builder、三個新 workspace、靜態 build、瀏覽器／無障礙與依賴安全檢查；不得啟動 DB service、Docker、舊 Web fixture、Worker 或影片 render。

## 9. Artifact 保存

`artifacts-v2/` 不進 Git。每次成功擷取後應把內容定址 bytes 同步至耐久儲存；Evidence metadata 不能取代原始 artifact。artifact store 暫時不可用時，既有 Published 仍可離線建置，但新快照不得標為驗證完成。

## 10. Superseded 命令

任何 `db:*`、Compose、migration、seed、Edition、LiveBench ingest／score／promote、舊 weekly Worker、舊 Web E2E 或 video render 命令都屬已移除流程。不要在 runbook、CI 或故障排除中恢復；需要新能力時，應在目前三個 workspace 與靜態資料邊界內另行設計。
