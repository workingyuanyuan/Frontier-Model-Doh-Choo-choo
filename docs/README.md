# 文件索引

## 接手時先讀

| 文件                                                         | 狀態        | 用途                                           |
| ------------------------------------------------------------ | ----------- | ---------------------------------------------- |
| [REFACTOR_SPEC_V2.md](REFACTOR_SPEC_V2.md)                   | **Binding** | 第二次重構的唯一權威規格（狀態：使用者已確認） |
| [../tasks/claude-code-plan.md](../tasks/claude-code-plan.md) | **Current** | 第二次重構任務計畫契約                         |
| [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md)                     | **Current** | 專案現況、需求、資料狀態與歷史交接紀錄         |
| [REFACTOR_DISCARD_LIST.md](REFACTOR_DISCARD_LIST.md)         | **Binding** | 明確禁止恢復的功能、程式與操作路徑             |

## 現行權威規格

| 文件                                                             | 管轄範圍                                           |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| [REFACTOR_SPEC_V2.md](REFACTOR_SPEC_V2.md)                       | 第二次重構唯一權威規格                             |
| [ARCHITECTURE.md](ARCHITECTURE.md)                               | runtime、workspace 與資料流                        |
| [DATA_METHODOLOGY.md](DATA_METHODOLOGY.md)                       | 來源、Evidence、identity、Profile、Frontier 與成本 |
| [SCORING_METHODOLOGY.md](SCORING_METHODOLOGY.md)                 | 八維、缺值、衝突、Overall 與排序                   |
| [OPERATIONS.md](OPERATIONS.md)                                   | 安裝、來源刷新、目前版本、審核與 Git 回復          |
| [BENCHMARK_DIMENSION_MAPPING.md](BENCHMARK_DIMENSION_MAPPING.md) | Benchmark 到單一主要維度的映射                     |
| [BENCHMARK_SCORE_SOURCES.md](BENCHMARK_SCORE_SOURCES.md)         | 可採用來源與人工覆核事項                           |

## 歷史與審計紀錄

下列文件只用來解釋以前做過什麼，不可覆蓋現行規格：

- `REFACTOR_SPEC.md`：上一次重構規格（狀態：Implemented），只供考證，非現行依據。
- `DECISIONS.md`：舊 PostgreSQL／Worker／Edition v1 決策，整份 Superseded。
- `DRAFT_REVIEW_2026-07-17.md`、`DRAFT_REVIEW_2026-07-18*.md`：舊 Draft 審核。
- `N_A_IDENTITY_REMEDIATION_2026-07-19.md`：identity 修正紀錄。
- `DRAFT_REVIEW_2026-08-13.md`：前次 Draft 的代理審核證據。

若文件互相衝突，優先順序為：`REFACTOR_SPEC_V2.md` > `../tasks/claude-code-plan.md` > `CLAUDE.md` / `REFACTOR_DISCARD_LIST.md` > `PROJECT_HANDOFF.md` > 其他文件 > 歷史文件。
