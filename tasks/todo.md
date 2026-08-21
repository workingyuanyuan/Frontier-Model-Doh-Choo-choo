# LLM Bench Tasks

> **歷史文件（Superseded）。** 本檔描述的是 Stage 5 時代的架構，包含已廢棄的
> Draft／Published pointer 流程、`data-v2/product/versions/*.json` 多版本檔，以及
> 「預設只顯示 8/8、Developer mode 顯示 1–7/8」等舊顯示規則。現行依據是
> [第二次重構規格](../docs/REFACTOR_SPEC_V2.md) 與 [執行計畫](claude-code-plan.md)。
> 保留本檔只為考證第一次重構的完成範圍，不得當成待辦或現行契約。

## Completed — Stage 5 cutover

- [x] Workspace 只保留 `apps/bench`、`packages/benchmark-data`、`packages/acquisition`。
- [x] Root scripts 只保留新資料、測試、build 與 browser 操作。
- [x] 移除舊 Web、Worker、video、DB、Connector 及 Edition-bound package。
- [x] 移除 PostgreSQL、Drizzle、Docker／Compose、migration、seed 與 `DATABASE_URL`。
- [x] 移除 LiveBench 專用 ingest／score／promote／publication／weekly path。
- [x] 移除舊雙語、雙主題、多頁、PREVIEW／FORMAL 與 Edition 契約。
- [x] CI 改為 schema、acquisition、benchmark-data、bench、static build 與 browser gates。
- [x] 重寫權威文件並將舊架構標記 Superseded。
- [x] 跑 clean install、format、lint、typecheck、tests、build 與 browser review。
- [x] 驗證 Published static build 不需要網路、artifact、PostgreSQL 或 Docker。
- [x] 確認沒有自行建立或切換 Published pointer。

## Existing product requirements

- [x] 八維 mapping、Candidate/Evidence/Cost schema 與 immutable ProductVersion。
- [x] Artificial Analysis、LiveBench、Epoch、DeepSWE 等來源物化與 Draft。
- [x] reasoning-effort-only Product Profile 與 deterministic Representative Profile。
- [x] Leaderboard、單一 Quality vs. Cost、Eight Dimensions 與 Evidence UI。
- [x] 預設只顯示 8/8；Developer mode 顯示 1–7/8 已計分模型。
- [x] Agent-first Draft review；人工只處理無法裁決問題與 Published pointer。

## Human-only publication

- [ ] 人工核准明確 Draft version ID。
- [ ] 人工執行 Draft → Published。
- [ ] 人工完成 Published A → B → rollback A 驗證。

Agent 不得把 Stage 5 cutover 或測試通過視為發布授權。

## Deferred empirical decisions

- [ ] Supported 最終門檻。
- [ ] Benchmark 與來源品質最終權重。
- [ ] 每來源排程最佳化。
- [ ] Representative Profile 未來演算法。
- [ ] 進階衝突／confidence policy。
- [ ] 只有實際操作證明需要時才考慮管理 UI。
