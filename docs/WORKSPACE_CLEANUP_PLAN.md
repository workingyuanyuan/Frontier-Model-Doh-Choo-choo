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

## 3. 待裁決：文件命名收斂

| 現況                                                  | 建議                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `docs/REFACTOR_SPEC_V2.md`（105 KB，27 處反向引用）   | 改名為 `docs/SPEC.md`，同時更新 `CLAUDE.md` 的權威順序段落             |
| `tasks/claude-code-plan.md`（181 KB，A–O 共 15 階段） | A–N 已完成，抽出為 `docs/history/PHASE_A_TO_N.md`，計畫只留 O 之後     |
| `docs/REFRESH_<日期>.md` 三份                         | 移入 `docs/refresh/`，同時更新規格 §11.4 與 `OPERATIONS.md` 的路徑約定 |

## 4. Git 外的本地產物（已處置）

`artifacts/`（影片截圖）、`output/`（`llm-bench-weekly.mp4` 與 `video/`）、
`reference-table-data/`（21 項早期人工抓取）、`data/raw/`（早期抓取暫存）、
`playwright-report/`、`test-results/` 均已移除。`.turbo/` 與 `.pnpm-store/`
是套件與建置快取，保留。

## 5. 待確認：未追蹤的工作檔

| 檔案                             | 說明                                                     |
| -------------------------------- | -------------------------------------------------------- |
| `start-bench-review.cmd`         | 本地審查用啟動器，`README.md` 的未提交變更已為它加了一節 |
| `scripts/start-bench-review.ps1` | 同上，`.cmd` 呼叫的實作                                  |
| `apps/bench/CLAUDE.md`           | 內容待確認是否與根目錄 `CLAUDE.md` 重複                  |
| `apps/bench/AGENTS.md`           | 同上                                                     |

四個檔案要一起決定進版或留在本機；`README.md` 的該節現在指向未追蹤的檔案。

## 6. 未完成的工作

| 位置                              | 狀態                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `tasks/claude-code-plan.md` N6    | 期三審核關卡，待使用者執行                                |
| `tasks/claude-code-plan.md` N7    | 期三刷新報告與文件同步，前置為 N6                         |
| `tasks/claude-code-plan.md` O1–O5 | 維度集合改為五維，待開工                                  |
| 規格 §12 第 11、12 項             | `medscribe` 歸屬與 Reasoning 內部結構，待資料量足夠後重驗 |

`data/sources/` 下 `lech-writing`、`llm-stats`、`openai`、`osworld`、`scale-hle`、
`terminal-bench` 六個來源依規格 §3.2 為凍結狀態，保留不動。
