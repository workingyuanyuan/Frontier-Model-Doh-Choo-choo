# Claude Code 接手入口

這個 repository 已完成一次大幅靜態化重構。開始工作前，依序完整閱讀：

1. `docs/PROJECT_HANDOFF.md`：目前進度、確認需求、風險與未決產品邊界。
2. `tasks/claude-code-plan.md`：下一階段任務契約與驗收條件。
3. `docs/REFACTOR_DISCARD_LIST.md`：明確禁止恢復的舊架構。
4. `docs/ARCHITECTURE.md`、`docs/DATA_METHODOLOGY.md`、`docs/SCORING_METHODOLOGY.md`、`docs/OPERATIONS.md`：現行系統契約。

## 不可自行改變的邊界

- 唯一支援中的 runtime app 是 `apps/bench`；現行資料／程式 workspace 只有 `apps/bench`、`packages/benchmark-data`、`packages/acquisition`。
- 不得恢復舊 Web、Worker、DB、PostgreSQL、Drizzle、Docker／Compose、Edition、PREVIEW／FORMAL、Remotion/video、雙語、雙主題或多頁架構。
- 缺失 Benchmark 分數保持 `null`／N/A，不能填零、推測 identity 或用 composite index 代替八維成績。
- Agent 可以審核和建立 Draft，但不得自行建立／切換 Published pointer、執行 publish／rollback、push、deploy 或 release。
- `docs/PROJECT_HANDOFF.md` 中仍標為「待使用者決定」的產品範圍，不得自行選擇；先向使用者確認，再把決定寫回文件與測試。
- 不要把 `N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-frontend` 當成工作來源。那是 detached 的舊代理 worktree，含未追蹤的較早 UI 與建置產物。

## 工作方式

- 只在目前 repository 的 `main` 主線工作，不另建長期功能分支，除非使用者明確要求。
- 先更新 `tasks/claude-code-plan.md` 的狀態，再做程式變更；每個 task 要保持單一目的且可獨立驗收。
- 不重寫或刪除不可變 `data-v2/product/versions/*.json`；資料修正要生成新版本。
- 不要把歷史文件 `docs/DECISIONS.md` 或舊 Draft review 當成現行架構權威。
- 保留使用者現有變更；不要用 reset、checkout 或清理指令丟棄未知內容。

## 基準驗證

```bash
pnpm install --frozen-lockfile
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
```

Draft production build：

```powershell
$env:LLM_BENCH_CHANNEL = "DRAFT"
pnpm --filter @llm-bench/bench build
```

完成一個任務時回報：`summary`、`changed_files`、`validation`、`risks`、`unresolved`。
