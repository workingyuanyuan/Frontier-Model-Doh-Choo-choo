# Claude Code 下一階段任務契約

> 狀態：等待使用者回答三個 scope gates  
> 架構與最終驗收 owner：接手主代理  
> 禁止事項：publish、rollback、push、deploy、release、恢復 `docs/REFACTOR_DISCARD_LIST.md` 中的任何項目

## 共同契約

每個 task 開始前閱讀 `CLAUDE.md` 與 `docs/PROJECT_HANDOFF.md`。每次只處理一個 task；不得把未決產品選擇當成授權。

每個 task 回報欄位：

- `summary`
- `changed_files`
- `validation`
- `risks`
- `unresolved`

## Gate 0 — 記錄使用者的收斂決定

### Objective

取得並記錄以下三個 Yes／No 邊界：自動 acquisition、Quality vs. Cost／Evidence、Draft／Published pointers。

### Allowed paths

- `docs/PROJECT_HANDOFF.md`
- `docs/REFACTOR_SPEC.md`
- `tasks/claude-code-plan.md`
- 必要時新增一筆 current decision 文件；不要修改歷史 `docs/DECISIONS.md` 來假裝它仍是現行 ADR。

### Acceptance

- 每項功能明確標為 Keep 或 Remove。
- 每個 Remove 決定列出受影響的 workspace、schema、data、UI、scripts、CI、tests、docs。
- 使用者未回答前，本 gate 保持 blocked；不執行 Task 1–3 的語義變更。

## Task 1 — 收斂 package graph 與資料契約

### Objective

依 Gate 0 的 Keep／Remove 決定，移除不再需要的 workspace、export、schema 欄位、scripts、dependencies 與資料產生路徑；保留 immutable、deterministic 與缺值安全語義。

### Constraints

- 不改寫現有 `data-v2/product/versions/*.json`。
- 若 schema 改版，新增明確版本與 migration/build 路徑；舊版本只能做讀取相容或明確淘汰，不可靜默重解釋。
- 不得恢復 DB、Worker、Docker、Edition 或任何 discard 項。
- 若保留 acquisition，優先把 `materializers.ts` 按 source family 拆成有獨立測試的模組；若移除 acquisition，要連同 scripts、CI、docs、lockfile 與 workspace 一次移除。

### Acceptance

- `pnpm-workspace.yaml`、root scripts、lockfile、Turbo graph 與 imports 只包含 Keep 範圍。
- schema tests 覆蓋保留契約；removed contract 有 negative search 證據。
- 同一輸入仍產生 deterministic version hash；缺失值不變成零。

## Task 2 — 收斂 Dashboard

### Objective

依 Gate 0 移除不再需要的 UI 與 view-model，或在全部保留時只做無語義的元件／CSS 拆分，降低 `globals.css`、`leaderboard.tsx` 與 Dashboard state 的集中度。

### Constraints

- 不以 CSS 隱藏代替功能移除。
- 保留的 Leaderboard 必須維持 sorting、Profile selection、Coverage、N/A、Estimated 與 Developer mode 邊界。
- 保留的雷達不能把 null 畫成 0。
- 保留的 Evidence 必須繼續展示 provenance 與 Included／Excluded。
- 保留的成本視圖必須使用 task-cost aggregation，不把 API token price 混成同一語義。

### Acceptance

- UI contract tests 與 Playwright 同步反映 Keep／Remove 範圍。
- 桌面與 390px mobile 無水平溢出；鍵盤焦點與 axe gate 通過。
- Draft metadata 仍為 noindex；build 顯示正確 version ID。

## Task 3 — 收斂發布與操作面

### Objective

依 Gate 0 保留並簡化 pointer 流程，或完整移除 Draft／Published／rollback 狀態機，改成使用者核准的單一版本選擇方式。

### Constraints

- 若 Keep：publish／rollback 必須繼續是純 pointer 原子操作，且只由人工明確觸發。
- 若 Remove：必須先定義部署如何選取唯一版本、如何避免誤用未核准 Draft、如何 rollback；不能只刪命令而留下模糊操作。
- 本 task 只實作與測試，不實際 publish、rollback 或 deploy。

### Acceptance

- 成功、失敗、目標不存在、hash 不符與 rollback 邊界有測試。
- README、Architecture、Operations、CI 與環境變數只描述一套現行流程。
- production build 不需要網路、artifact、DB、Docker 或背景程序。

## Task 4 — 文件與負面範圍最終同步

### Objective

把實作結果同步回單一權威文件集，避免 Claude 或後續代理從歷史文件恢復舊功能。

### Allowed paths

- `README.md`
- `CLAUDE.md`
- `docs/README.md`
- `docs/PROJECT_HANDOFF.md`
- 現行權威規格
- `tasks/*`

### Acceptance

- `docs/README.md` 的 Current／Binding／Historical 分類正確。
- `PROJECT_HANDOFF.md` 的數量、hash、branch 與測試結果更新到實際狀態。
- `REFACTOR_DISCARD_LIST.md` 至少維持原有負面範圍，除非使用者明確追加。
- 搜尋沒有會讓接手者誤以為 DB／Worker／Edition／video 等仍受支援的現行操作說明。

## Task 5 — 最終驗收與乾淨交接

### Objective

證明收斂後 repository 在乾淨 checkout 可重現，並留下可供使用者核准的最終摘要。

### Validation

```bash
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
```

```powershell
$env:LLM_BENCH_CHANNEL = "DRAFT"
pnpm --filter @llm-bench/bench build
```

另檢查 Git branch/worktree、`git diff --check`、package graph、legacy negative search 與 Published pointer 狀態。

### Acceptance

- 所有 Keep 功能有 unit／browser／build 證據。
- 所有 Remove 功能在 code、data、dependency、script、CI、test、docs 都沒有半殘狀態。
- 沒有 Published pointer 或其他未授權外部狀態改變。
- 最終回報清楚列出仍需人工處理的 publish／部署／舊 worktree 清理（若仍存在）。
