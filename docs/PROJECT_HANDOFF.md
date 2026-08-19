# LLM Bench 專案交接

> 盤點日期：2026-08-17（Asia/Taipei）  
> 接手對象：Claude Code / Codex agent  
> 本文件是現況摘要；第二次重構的現行唯一權威規格為 [`REFACTOR_SPEC_V2.md`](REFACTOR_SPEC_V2.md)。

## 1. 一句話狀態

專案已從 DB／Worker／多應用平台收斂為「Git 內靜態資料 + 單一 `current.json` + 單頁 Next.js Dashboard」。Stage 5 的舊 app 已移除；重構工作依 `tasks/claude-code-plan.md` 的順序進行。

## 2. Git 與工作目錄狀態

- 只在本地 `main` 主線工作；除非使用者明確要求，不 push、不開 PR、不 release。
- repository 因擁有者曾是 `CodexSandboxOffline`，部分環境需對單次 Git 指令使用 `-c safe.directory=<repo>`；不要擅自修改全域 Git 設定。
- 額外存在 detached worktree `N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-frontend`。它不是有效來源；未經使用者確認不要刪除或修改。

## 3. 產品輸出

同一個 ProductVersion 驅動英文、單一淺色主題、完整響應式的單頁 Dashboard：

1. Leaderboard：Overall 與八維分數，可排序、搜尋、選擇完整矩陣 Profile。
2. Eight Dimensions：所選 Profile 的雷達／比較視圖。
3. Quality vs. Cost：合併任務成本、provider 圖例與 Pareto frontier。
4. Evidence：按能力維度顯示 Included／Excluded、原始來源 Profile 與 provenance。

主畫面只顯示在 display set 每格都有 INCLUDED、非 null 分數且八維皆非 null 的 Profile。Developer mode 只列出被排除模型缺少的 benchmark 格子，不顯示聚合分數。

## 4. 資料路徑

```text
公開來源
  -> packages/acquisition
  -> data-v2/sources + Git 外 artifacts-v2
  -> packages/benchmark-data
  -> data-v2/product/current.json
  -> apps/bench static build
```

- `current.json` 的 `versionId` 是其 canonical deterministic bytes 的 SHA-256。
- Agent 可以刷新來源、審核與修正 Candidate、建立工作區目前版本。
- 使用者審核後才提交 `current.json`；部署由 Git 資料 commit 決定。
- 若需回復，使用者以 `git revert` 還原資料 commit 後重新建置與部署。

## 5. 現行實作邊界

唯一支援中的程式／資料單元：

- `apps/bench`
- `packages/benchmark-data`
- `packages/acquisition`
- `data-v2`
- Git 外 `artifacts-v2`

不得恢復舊 Web、Worker、DB、影片、Edition、PREVIEW／FORMAL、雙語、雙主題或多頁架構。不得刪除或修改 `data-v2/sources/`。

## 6. 資料與計分基線

- 維度固定為 Agentic、Coding、Reasoning、Math、Knowledge、Language、Context、Instruction。
- 每個 Benchmark 第一版只投入一個主要維度。
- 缺失值保持 `null`／N/A，不填零；Overall 只平均已有資料的維度。
- Composite index 只用於 Frontier 選模／展示，不投入八維。
- Product Profile 只按 reasoning effort 分離；其他 harness 設定留在 provenance。
- Identity 只允許 canonical catalog 與 exact reviewed alias；不得 fuzzy match 或猜測新版。

## 7. 第二次重構收斂

使用者已在 [`REFACTOR_SPEC_V2.md`](REFACTOR_SPEC_V2.md) 定案：

1. 來源收斂至 Artificial Analysis、LiveBench、DeepSWE、Frontier Code；其他來源目錄凍結保留。
2. Evidence 併入模型明細面板；保留排行榜、八維雷達圖與兩張性價比圖表。
3. 產品資料改為單一 `data-v2/product/current.json`；Git 歷史負責版本回復。

## 8. 風險與接手提醒

- acquisition 與 schema 實作仍集中於較大檔案，局部修改需做完整回歸。
- `pnpm-workspace.yaml` 使用 `apps/*`／`packages/*` glob；已移除的 app 目錄若重新建立會自動進 workspace。
- ProductVersion 是大型 canonical JSON；不要手工格式化或改內容。
- `origin/main` 可能尚未包含本次本地重構；push 是外部狀態改變，必須由使用者另行授權。

## 9. 驗收基準

```bash
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm --filter @llm-bench/bench build
```

若使用者選擇移除某項功能，需同步移除 schema、程式、fixture、依賴、script、CI、E2E 和文件，並加入 negative search／package graph 驗收，不能只從畫面隱藏。
