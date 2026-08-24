# 工作區清理計畫

盤點日期：2026-08-24。範圍是 repository 內的全部檔案與目錄，含 Git 未追蹤的本地產物。

## 1. 已完成

| 項目                                                            | 處置                                                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 16 份一次性報告與考證文件                                       | 移入 `docs/history/`，反向連結全部改寫，連結檢查 0 斷鏈                                       |
| `DRAFT_REVIEW_*` 四份                                           | 收斂為 `docs/history/DRAFT_REVIEW.md`                                                         |
| `F2_ACCEPTANCE` / `G4_F2_ACCEPTANCE` / `H5_F2_ACCEPTANCE` 三份  | 收斂為 `docs/history/F2_ACCEPTANCE.md`                                                        |
| `GATE1_AUDIT_2026-08-17` / `GATE1_AUDIT_ROUND2_2026-08-18` 兩份 | 收斂為 `docs/history/GATE1_AUDIT.md`                                                          |
| `tasks/plan.md`、`tasks/todo.md`                                | 移入 `docs/history/STAGE5_PLAN.md`、`STAGE5_TODO.md`；`tasks/` 只留現行 `claude-code-plan.md` |
| `docs/README.md` 索引                                           | 依新結構重寫                                                                                  |
| `data/product/versions/`、`.agents/`                            | 空目錄，已移除                                                                                |
| `.tmp-web-api.*`、`.tmp-e2e-devtools.*` 四個 log                | `apps/web` 時代的執行殘留，已刪除                                                             |
| `tasks/claude-code-plan.md` 的 N10 狀態                         | 三個子任務皆完成，父任務狀態改為完成                                                          |

## 2. 目錄命名（已完成）

| 目錄         | 現況                                         |
| ------------ | -------------------------------------------- |
| `data/`      | 來源、mapping 與 `current.json`，74 個追蹤檔 |
| `artifacts/` | `sha256/` 內容定址保存區，236 個目錄         |

`artifacts-v2` → `artifacts` 改寫了 4 個 acquisition 進入點與 15 份
`evidence-index.json` 的出處路徑；`data-v2` → `data` 改寫了 56 個檔案，
四個 root script 一併去掉 `v2` 段。兩次改名後 `current.json` 的內容不變。

影片時代的 `artifacts/`、`output/`、`reference-table-data/` 與早期抓取的
`data/raw/` 已移除，`playwright-report/`、`test-results/` 為可重新產生的產物。

## 3. 文件命名（已完成）

| 現況                           | 內容                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `docs/SPEC.md`                 | 權威規格                                                |
| `tasks/claude-code-plan.md`    | O 之後的 task                                           |
| `docs/history/PHASE_A_TO_N.md` | A–N 階段的完成紀錄                                      |
| `docs/refresh/<YYYY-MM-DD>.md` | 逐次刷新報告，路徑約定寫在規格 §11.4 與 `OPERATIONS.md` |

## 4. Git 外的本地產物（已處置）

`artifacts/`（影片截圖）、`output/`（`llm-bench-weekly.mp4` 與 `video/`）、
`reference-table-data/`（21 項早期人工抓取）、`data/raw/`（早期抓取暫存）、
`playwright-report/`、`test-results/` 均已移除。`.turbo/` 與 `.pnpm-store/`
是套件與建置快取，保留。

## 5. 工作檔（已進版）

| 檔案                             | 說明                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `start-bench-review.cmd`         | 本地審查啟動器，雙擊即開                                      |
| `scripts/start-bench-review.ps1` | 啟動器的 PowerShell 實作，4000 port，重複執行會沿用既有伺服器 |
| `apps/bench/AGENTS.md`           | `next dev` 產生並維護的 Next.js 代理規則                      |
| `apps/bench/CLAUDE.md`           | 指向 `AGENTS.md` 的一行指標                                   |

## 6. 未完成的工作

| 位置                                  | 狀態                                                      |
| ------------------------------------- | --------------------------------------------------------- |
| `tasks/claude-code-plan.md` O1–O5     | 維度集合改為五維，待開工                                  |
| 審核關卡 O                            | O5 完成後由使用者執行                                     |
| `docs/history/PHASE_A_TO_N.md` N6、N7 | 期三審核關卡與其後的刷新報告，狀態停在未開始              |
| 規格 §12 第 11、12 項                 | `medscribe` 歸屬與 Reasoning 內部結構，待資料量足夠後重驗 |

`data/sources/` 下 `lech-writing`、`llm-stats`、`openai`、`osworld`、`scale-hle`、
`terminal-bench` 六個來源依規格 §3.2 為凍結狀態，保留不動。
