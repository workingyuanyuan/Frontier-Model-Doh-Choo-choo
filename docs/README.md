# 文件索引

## 接手時先讀

| 文件                                                         | 狀態        | 用途                                         |
| ------------------------------------------------------------ | ----------- | -------------------------------------------- |
| [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md)                     | **Current** | 單一現況、需求、資料狀態、風險與待決問題摘要 |
| [../tasks/claude-code-plan.md](../tasks/claude-code-plan.md) | **Current** | Claude Code 下一階段任務契約                 |
| [REFACTOR_DISCARD_LIST.md](REFACTOR_DISCARD_LIST.md)         | **Binding** | 明確禁止恢復的功能、程式與操作路徑           |

## 現行權威規格

| 文件                                                             | 管轄範圍                                           |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| [REFACTOR_SPEC.md](REFACTOR_SPEC.md)                             | 目前產品與 Stage 5 靜態 cutover 基線               |
| [ARCHITECTURE.md](ARCHITECTURE.md)                               | runtime、workspace、資料流與發布狀態機             |
| [DATA_METHODOLOGY.md](DATA_METHODOLOGY.md)                       | 來源、Evidence、identity、Profile、Frontier 與成本 |
| [SCORING_METHODOLOGY.md](SCORING_METHODOLOGY.md)                 | 八維、缺值、衝突、Overall 與排序                   |
| [OPERATIONS.md](OPERATIONS.md)                                   | 安裝、來源刷新、Draft、人工 Published 與 rollback  |
| [BENCHMARK_DIMENSION_MAPPING.md](BENCHMARK_DIMENSION_MAPPING.md) | Benchmark 到單一主要維度的映射                     |
| [BENCHMARK_SCORE_SOURCES.md](BENCHMARK_SCORE_SOURCES.md)         | 可採用來源與人工覆核事項                           |

## 歷史與審計紀錄

下列文件只用來解釋以前做過什麼，不可覆蓋現行規格：

- `DECISIONS.md`：舊 PostgreSQL／Worker／Edition v1 決策，整份 Superseded。
- `DRAFT_REVIEW_2026-07-17.md`、`DRAFT_REVIEW_2026-07-18*.md`：舊 Draft 審核。
- `N_A_IDENTITY_REMEDIATION_2026-07-19.md`：identity 修正紀錄。
- `DRAFT_REVIEW_2026-08-13.md`：目前 Draft 的最近一次代理審核證據。

若文件互相衝突，優先順序為：使用者最新明確決定 → `PROJECT_HANDOFF.md` → `REFACTOR_DISCARD_LIST.md` → 現行權威規格 → 歷史文件。
