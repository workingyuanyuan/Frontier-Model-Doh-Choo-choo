# 文件索引

## 接手時先讀

| 文件                                                         | 狀態        | 用途                                           |
| ------------------------------------------------------------ | ----------- | ---------------------------------------------- |
| [SPEC.md](SPEC.md)                                           | **Binding** | 第二次重構的唯一權威規格（狀態：使用者已確認） |
| [../tasks/claude-code-plan.md](../tasks/claude-code-plan.md) | **Current** | 第二次重構任務計畫契約                         |
| [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md)                     | Historical  | 2026-08-17 的現況盤點；與規格衝突時以規格為準  |
| [REFACTOR_DISCARD_LIST.md](REFACTOR_DISCARD_LIST.md)         | **Binding** | 明確禁止恢復的功能、程式與操作路徑             |

## 現行權威規格與工具

| 文件                                                             | 管轄範圍                                           |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| [SPEC.md](SPEC.md)                                               | 第二次重構唯一權威規格                             |
| [ARCHITECTURE.md](ARCHITECTURE.md)                               | runtime、workspace 與資料流                        |
| [DATA_METHODOLOGY.md](DATA_METHODOLOGY.md)                       | 來源、Evidence、identity、Profile、Frontier 與成本 |
| [SCORING_METHODOLOGY.md](SCORING_METHODOLOGY.md)                 | 八維、缺值、衝突、Overall 與排序                   |
| [OPERATIONS.md](OPERATIONS.md)                                   | 安裝、來源刷新、目前版本、審核與 Git 回復          |
| [BENCHMARK_DIMENSION_MAPPING.md](BENCHMARK_DIMENSION_MAPPING.md) | Benchmark 到單一主要維度的映射                     |
| [BENCHMARK_SCORE_SOURCES.md](BENCHMARK_SCORE_SOURCES.md)         | 可採用來源與人工覆核事項                           |
| [COVERAGE_MATRIX_REPORT.md](COVERAGE_MATRIX_REPORT.md)           | 審核關卡 2 矩陣分析與 display-set 取捨報告工具產出 |

## 歷史與審計紀錄

`history/` 下的文件解釋過去做過什麼，不覆蓋現行規格：

| 文件                                                 | 內容                                |
| ---------------------------------------------------- | ----------------------------------- |
| `history/REFACTOR_SPEC.md`                           | 第一次重構規格（狀態：Implemented） |
| `history/STAGE5_PLAN.md`                             | 第一次重構的執行計畫與完成範圍      |
| `history/STAGE5_TODO.md`                             | 第一次重構的待辦清單與完成紀錄      |
| `history/DECISIONS.md`                               | PostgreSQL／Worker／Edition v1 決策 |
| `history/DRAFT_REVIEW.md`                            | Draft 發布前代理審核                |
| `history/GATE1_AUDIT.md`                             | 審核關卡 1 的來源逐列稽核           |
| `history/F2_ACCEPTANCE.md`                           | 最終驗收報告                        |
| `history/C6_GATE_1_REVIEW.md`                        | 審核關卡 1 審查總結                 |
| `history/C6_MODEL_CANDIDATES.md`                     | 跨來源模型候選清單                  |
| `history/N_A_IDENTITY_REMEDIATION_2026-07-19.md`     | identity 修正紀錄                   |
| `history/MODELS_RELEASE_DATE_BACKFILL_2026-08-17.md` | `models.json` 發布日期回填對照      |
| `history/EFFORT_INFERENCE_REVIEW_2026-08-18.md`      | 跨來源 effort 推測人工審查          |
| `history/GPQA_AA_VS_EPOCH_2026-08-21.md`             | GPQA 跨來源逐模型對照               |
| `history/N10_DESIGN_PROPOSAL.md`                     | 動態 benchmark 集合的設計推導       |
| `history/ADVANCED_CHART_SOURCES_2026-08-22.md`       | 進階成本圖的來源量測                |
| `history/PHASE3_DUPLICATE_BENCHMARKS_2026-08-22.md`  | 重複 benchmark 的跨來源比較         |

刷新報告依規格 §11.4 逐次產生於 `refresh/<YYYY-MM-DD>.md`。

若文件互相衝突，優先順序為：`SPEC.md` > `../tasks/claude-code-plan.md` > `CLAUDE.md` / `REFACTOR_DISCARD_LIST.md` > `PROJECT_HANDOFF.md` > 其他文件 > 歷史文件。
