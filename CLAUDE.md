# Claude Code 接手入口

這個 repository 已完成一次大幅靜態化重構，目前正在執行第二次重構。開始工作前，依序完整閱讀：

1. `docs/REFACTOR_SPEC_V2.md`：**第二次重構的權威規格**。與其他文件衝突時以本文件為準。
2. `tasks/claude-code-plan.md`：任務契約、相依順序與驗收條件。
3. `docs/REFACTOR_DISCARD_LIST.md`：明確禁止恢復的舊架構。
4. `docs/PROJECT_HANDOFF.md`：上一次重構的進度與風險盤點。其 §8「待使用者決定」已全部決定，答案在 `REFACTOR_SPEC_V2.md`。
5. `docs/ARCHITECTURE.md`、`docs/DATA_METHODOLOGY.md`、`docs/SCORING_METHODOLOGY.md`、`docs/OPERATIONS.md`：上一次重構後的系統契約，正由第二次重構逐項改寫。

`docs/history/REFACTOR_SPEC.md` 是上一次重構的規格（狀態 Implemented），只供考證，不是現行依據。

**文件權威順序**：`docs/REFACTOR_SPEC_V2.md` > `tasks/claude-code-plan.md` > `CLAUDE.md` > 其他文件。

## 不可自行改變的邊界

- 唯一支援中的 runtime app 是 `apps/bench`；現行資料／程式 workspace 只有 `apps/bench`、`packages/benchmark-data`、`packages/acquisition`。
- 不得恢復舊 Web、Worker、DB、PostgreSQL、Drizzle、Docker／Compose、Edition、PREVIEW／FORMAL、Remotion/video、雙語、雙主題或多頁架構。
- 缺失 Benchmark 分數保持 `null`／N/A，不能填零、推測 identity 或用 composite index 代替八維成績。
- Agent 不得 push、deploy 或 release。
- Agent 不得 commit `data-v2/product/current.json`；那是發布動作，需使用者審核後明確指示（`REFACTOR_SPEC_V2.md` §11.2）。**這條規則只針對這一個檔案，不是不要 commit 的意思**：每個 task 完成時仍必須 commit 其餘檔案，做法見 `tasks/claude-code-plan.md` 共同契約。用 `git add` 逐一列出檔案，不要用 `git add -A`。
- 規格未涵蓋的情況不得自行決定；先向使用者確認，再把決定寫回文件與測試。
- 不要把 `N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-frontend` 當成工作來源。那是 detached 的舊代理 worktree，含未追蹤的較早 UI 與建置產物。

## 工作方式

- 只在目前 repository 的 `main` 主線工作，不另建長期功能分支，除非使用者明確要求。
- 動程式前先把 `tasks/claude-code-plan.md` 中該 task 的**狀態欄位**改成 `進行中`，完成後改成 `完成`。每個 task 要保持單一目的且可獨立驗收。
- 不得刪除或修改 `data-v2/sources/` 底下任何目錄。
- 產品版本檔的處置依 `REFACTOR_SPEC_V2.md` §8 與 §11：舊的 `data-v2/product/versions/*.json` 要刪除，改為單一 `data-v2/product/current.json`。
- 不要把歷史文件 `docs/history/DECISIONS.md` 或舊 Draft review 當成現行架構權威。
- 保留使用者現有變更；不要用 reset、checkout 或清理指令丟棄未知內容。

## 基準驗證

```bash
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @llm-bench/bench build
pnpm e2e
```

**順序不可調換**：`pnpm e2e` 的 `webServer` 以 `scripts/serve-static.mjs` 服務靜態匯出產物 `apps/bench/out`，因此必須排在 production build 之後。build 固定讀取 `data-v2/product/current.json`（見 `REFACTOR_SPEC_V2.md` §11）。

完成一個任務時回報：`summary`、`changed_files`、`validation`、`risks`、`unresolved`。
