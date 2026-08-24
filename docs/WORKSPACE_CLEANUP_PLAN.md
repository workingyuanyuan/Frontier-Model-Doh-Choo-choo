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

## 2. 待裁決：目錄命名收斂

`data` 與 `artifacts` 的 `-v2` 後綴要移除，前置條件是處置同名的舊目錄。

| 目錄         | Git     | 內容                                                       | 前置動作            |
| ------------ | ------- | ---------------------------------------------------------- | ------------------- |
| `data/`      | ignored | 只有 `raw/`，第一次重構前的抓取暫存                        | 確認可刪後移除      |
| `data/`      | tracked | 現行來源、mapping 與 `current.json`，74 個追蹤檔           | 改名為 `data/`      |
| `artifacts/` | ignored | 13 個檔，Remotion／影片時代的截圖與 `llm-bench-weekly.png` | 確認可刪後移除      |
| `artifacts/` | ignored | `sha256/` 原始 artifact 保存區                             | 改名為 `artifacts/` |

改名的影響面：

- `data` 出現在 56 個追蹤檔、182 處，含 `.github/workflows/pages.yml`、
  `apps/bench/lib/load-product-version.ts`、`packages/acquisition` 與
  `packages/benchmark-data` 的全部 refresh／materialize 進入點、`scripts/`、
  以及 `CLAUDE.md` 與規格文件。
- `artifacts` 出現在各來源的 `evidence-index.json` 出處路徑中（`artificial-analysis`
  單一檔就有 61 處）。改名等於改寫已發布的出處字串，須連同 §7 出處記錄一併裁決。

建議作法：獨立一個 task，先改 `artifacts`（純路徑字串），再改 `data`（含 CI 與程式），
每步各跑一次完整基準驗證。

## 3. 待裁決：文件命名收斂

| 現況                                                  | 建議                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `docs/REFACTOR_SPEC_V2.md`（105 KB，27 處反向引用）   | 改名為 `docs/SPEC.md`，同時更新 `CLAUDE.md` 的權威順序段落             |
| `tasks/claude-code-plan.md`（181 KB，A–O 共 15 階段） | A–N 已完成，抽出為 `docs/history/PHASE_A_TO_N.md`，計畫只留 O 之後     |
| `docs/REFRESH_<日期>.md` 三份                         | 移入 `docs/refresh/`，同時更新規格 §11.4 與 `OPERATIONS.md` 的路徑約定 |

## 4. 待確認：Git 外的本地產物

以下都在 `.gitignore` 內，刪除不影響版本控制，但屬使用者本機資料，逐項確認後才處置。

| 路徑                      | 大小／數量 | 說明                                             |
| ------------------------- | ---------- | ------------------------------------------------ |
| `artifacts/`              | 4 MB       | 影片時代的截圖                                   |
| `output/`                 | 4 項       | `llm-bench-weekly.mp4` 與 `video/`，影片架構產物 |
| `reference-table-data/`   | 21 項      | 早期人工抓取的 HTML／TXT 對照表                  |
| `data/raw/`               | —          | 早期抓取暫存                                     |
| `playwright-report/`      | —          | 最近一次 e2e 報告，可重新產生                    |
| `test-results/`           | —          | 同上                                             |
| `.turbo/`、`.pnpm-store/` | —          | 建置與套件快取，可重新產生                       |

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
