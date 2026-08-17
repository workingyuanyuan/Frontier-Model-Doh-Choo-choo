# LLM Bench 專案交接

> 盤點日期：2026-08-17（Asia/Taipei）  
> 接手對象：Claude Code / Codex agent  
> 本文件記錄第一次重構（Stage 5）完成後的交接歷史。**第二次重構的現行唯一權威規格為 [`REFACTOR_SPEC_V2.md`](REFACTOR_SPEC_V2.md)**，§8 待決事項已全部定案；本文件只供歷史考證。

## 1. 一句話狀態

專案已從 DB／Worker／多應用平台重構為「Git 內靜態資料 + 不可變 ProductVersion + 單頁 Next.js Dashboard」；Stage 5 程式切換、最新 Draft 審核與單一 `main` 主線整合均已完成，且尚未產生任何 Published pointer。

## 2. Git 與工作目錄狀態

- 盤點時有兩個本地分支：`main` 與 `codex/static-data-rebuild`。完成交接提交後已 fast-forward 合併並刪除功能分支，現行本地主線只保留單一 `main`。
- `origin/main` 仍停在舊 v1 commit `9ab96b2`。除非使用者明確要求，本次交接與重構不 push、不開 PR、不 release。
- repository 因擁有者曾是 `CodexSandboxOffline`，部分環境需對單次 Git 指令使用 `-c safe.directory=<repo>`；不要擅自修改全域 Git 設定。
- 額外存在 detached worktree `N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-frontend`，基於 `85e87db`，含未追蹤的較早 `apps/bench` 與 `.next`／`node_modules` 產物。它不是有效分支，也不是現行來源；未經使用者確認不要刪除。

## 3. 現行產品需求（已確認）

### 3.1 產品輸出

同一個 `ProductVersion` 驅動英文、單一淺色主題、完整響應式的單頁 Dashboard。目前有四個可見區塊：

1. Leaderboard：Overall、Coverage 與八維分數，可排序、搜尋、選 Profile。
2. Eight Dimensions：所選 Profile 的雷達／比較視圖。
3. Quality vs. Cost：合併任務成本、provider 圖例與 Pareto frontier。
4. Evidence：按能力維度顯示 Included／Excluded、原始來源 Profile 與 provenance。

預設只顯示 Representative Profile 達 8/8 Coverage 的模型；右上無文字、具 `Developer mode` accessible name 的 switch 才顯示已有分數但只有 1–7/8 的模型。完全沒有分數的 Frontier 模型不能成為排名列。

### 3.2 八維與排名

- 維度固定為 Agentic、Coding、Reasoning、Math、Knowledge、Language、Context、Instruction。
- 每個 Benchmark 第一版只投入一個主要維度。
- 缺失值保持 `null`／N/A，不填零；Overall 只平均已有資料的維度。
- 至少一項有效結果即可得到 `ESTIMATED`，但 Coverage 必須同時展示。
- Composite index 只用於 Frontier 選模／展示，不投入八維。
- Product Profile 只按 reasoning effort 分離。Harness、tools、attempt、thinking、context、quantization 留在 provenance，不建立產品 Profile。
- Identity 只允許 canonical catalog 與 exact reviewed alias；不得 fuzzy match 或把舊型號猜成新版。

### 3.3 資料與發布

支援的資料路徑是：

```text
公開來源
  -> packages/acquisition
  -> data-v2/sources + Git 外 artifacts-v2
  -> packages/benchmark-data
  -> immutable data-v2/product/versions/<sha256>.json
  -> DRAFT / PUBLISHED pointer
  -> apps/bench static build
```

- 來源刷新、Draft build、Published switch 是三個獨立操作。
- Agent 可刷新來源、審核與修正 Candidate、建立新 Draft。
- Agent 不得自行建立或切換 Published pointer，也不得自行 rollback。
- `publish`／`rollback` 只能切 pointer，不重新擷取或計分。
- 已存在的 ProductVersion 必須能在無網路、無 artifact store、無 Docker、無 PostgreSQL時建置顯示。

## 4. 現行實作邊界

唯一支援中的程式／資料單元：

- `apps/bench`
- `packages/benchmark-data`
- `packages/acquisition`
- `data-v2`
- Git 外 `artifacts-v2`

目前約略維護面積：

| 區域                      | 來源檔數 | 約略 LOC | 主要集中點                                                      |
| ------------------------- | -------: | -------: | --------------------------------------------------------------- |
| `apps/bench`              |       25 |    5,573 | `globals.css` 1,875 行、`leaderboard.tsx` 509 行                |
| `packages/benchmark-data` |       10 |    2,556 | `src/index.ts` 1,170 行                                         |
| `packages/acquisition`    |       15 |    5,005 | `materializers.ts` 1,929 行、organizer materializer 約 1,300 行 |

這些大檔是下一輪重構可處理的結構性問題，但拆檔本身不能改變資料／計分／發布語義。

## 5. 最新資料與產品狀態（歷史 Draft 盤點與第二次重構收斂）

> **第二次重構狀態更新**：舊的 21 個 `data-v2/product/versions/*.json` 與 `data-v2/product/pointers/` 已依 `REFACTOR_SPEC_V2.md` §8 刪除（Task A1）。發布機制簡化為單一 `data-v2/product/current.json`。以下為上一次重構（Stage 5）結束時的歷史盤點：

歷史 Draft pointer：

```text
sha256:8adb32f9b2600c9215a80f4deeaa4e67c9f9a024e5cfc62c05ebb039c6917c21
generatedAt: 2026-08-13T03:24:50.252Z
```

歷史對應產品內容：

| 指標                                        | 數量 |
| ------------------------------------------- | ---: |
| Source snapshots                            |   13 |
| Frontier models                             |   31 |
| Product／scored Profiles                    |   82 |
| Evidence rows                               |  909 |
| Cost points                                 |  110 |
| 預設完整 8/8 representative models          |   14 |
| Developer mode scored representative models |   30 |
| 無直接分數的 Frontier model                 |    1 |

第二次重構將來源從 13 個收斂至 4 個（`artificial-analysis`、`livebench`、`deepswe`、`frontier-code`），其餘來源目錄保留於 `data-v2/sources/` 凍結。舊 Draft 評測紀錄見歷史文件 `DRAFT_REVIEW_2026-08-13.md`。

## 6. 上次重構已明確說「不要留」的項目

以下不是 backlog、可選元件或回退方案；完整負面清單以 `REFACTOR_DISCARD_LIST.md` 為準：

- `apps/web`、`apps/worker`、`apps/video`。
- `packages/db`、PostgreSQL、Drizzle、migration、seed、repository、`DATABASE_URL`、Docker／Compose。
- LiveBench 專用 alias／inventory／judgment／revision／aggregation／promotion／publication／weekly 流程。
- Edition、PREVIEW／FORMAL、formal coverage／confidence、revision／publication record。
- Remotion、Edition-bound video DTO／render／artifact／ranking CSV。
- 舊 connectors、contracts、scoring、presentation、radar packages；只有已移入新 ownership 並實際使用的純函式可以保留。
- 舊 DB API、source admin、多頁 route、雙語、雙主題。
- 把 Harness／tools／attempt 當 Product Profile；把 Composite index 投入八維；把缺值填零。
- PostgreSQL CI service、舊 Web fixture、Worker weekly dry-run、影片 render/upload。
- 恢復舊架構的相容層、fallback 或「未來也許會用」的死程式／依賴／文件。

歷史 `docs/DECISIONS.md` 整份只供考證，其中支持舊架構的條目均已 Superseded。

## 7. 已完成與未完成

### 已完成

- Stage 1：Schema、mapping、Evidence/Candidate/Cost、identity/Profile 基線。
- Stage 2：通用 acquisition 與單頁 Dashboard。
- Stage 3：Frontier、稀疏安全八維計分、immutable Draft。
- Stage 4 代理部分：來源刷新、identity／N/A 修正、UI 與最新 Draft review。
- Stage 5：舊 app／DB／Worker／video／package graph／CI／操作文件的靜態 cutover。
- 2026-08-17 本機重驗：`pnpm install --frozen-lockfile`、lint、typecheck、72 個 unit tests、Draft production build 與格式檢查通過。

### 尚未完成／不可由代理自行完成

- 使用者尚未核准一個明確 Draft version ID。
- 不存在 Published pointer；首次 Draft → Published 尚未執行。
- Published A → B → rollback A 的人工操作驗證尚未做。
- 尚未決定下一輪「功能再次收斂」要砍到哪一層，見下一節。

## 8. 再次收斂邊界（已於 2026-08-17 全部定案）

本節原本列出三個待決問題，**使用者已全部決定**，答案與詳細規格寫在 [`REFACTOR_SPEC_V2.md`](REFACTOR_SPEC_V2.md)：

1. **來源擷取**：保留自動來源擷取，期一收斂至 4 個來源（Artificial Analysis、LiveBench、DeepSWE、Frontier Code）；其餘凍結來源不刪除但建立來源白名單排除（`REFACTOR_SPEC_V2.md` §3）。
2. **介面區塊**：移除獨立 Evidence 區塊，改為點擊展開的「模型明細面板」；保留排行榜、八維雷達圖、以及兩張性價比圖表（預設圖與進階思考強度圖）（`REFACTOR_SPEC_V2.md` §6）。
3. **發布機制**：Draft／Published／rollback pointer 狀態機整套移除，改為單一 `data-v2/product/current.json`，由部署 commit 決定；Rollback 即為 `git revert` 資料 commit（`REFACTOR_SPEC_V2.md` §11）。

## 9. 風險與接手提醒

- 目前支援的 runtime 很小，但 acquisition 與 schema 實作仍集中於超大檔，容易讓局部修改造成跨來源回歸。
- `pnpm-workspace.yaml` 使用 `apps/*`／`packages/*` glob；舊目錄若被重新建立會自動進 workspace，需以測試／CI 防止。
- ProductVersion 是單行 canonical JSON，檔案很大；不要手工格式化或改內容。
- 舊的 21 個不可變版本檔案已在第二次重構 Task A1 刪除（`REFACTOR_SPEC_V2.md` §8），發布改為單一 `current.json`，歷史由 Git 自身保管。
- `origin/main` 尚未包含重構；push 是外部狀態改變，必須由使用者另行授權。
- detached 舊 worktree 尚有未追蹤內容；它不影響主 repository，但是否刪除需使用者決定。

## 10. 驗收基準

任何下一階段重構至少要維持：

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
```

以及：

```powershell
$env:LLM_BENCH_CHANNEL = "DRAFT"
pnpm --filter @llm-bench/bench build
```

若使用者選擇移除某項功能，需同步移除 schema、程式、fixture、依賴、script、CI、E2E 和文件，並加入 negative search／package graph 驗收，不能只從畫面隱藏。
