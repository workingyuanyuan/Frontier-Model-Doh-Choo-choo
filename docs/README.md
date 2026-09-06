# 文件入口

從這裡找到目前產品、開發與代理工作的共用契約。

## 依任務閱讀

| 需要完成的事                   | 入口與權威範圍                                                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 使用看板、了解功能             | [專案 README](../README.md)                                                                                                             |
| 理解系統與資料流               | [ARCHITECTURE.md](ARCHITECTURE.md)：workspace、runtime、資料生命週期與架構邊界                                                          |
| 理解產品行為與詳細設計         | [SPEC.md](SPEC.md)：產品互動與尚未拆出的詳細設計契約、裁決依據                                                                          |
| 判定資料、模型與成本           | [DATA_METHODOLOGY.md](DATA_METHODOLOGY.md)：Evidence、identity、effort、Frontier、成本                                                  |
| 理解計分與展示資格             | [SCORING_METHODOLOGY.md](SCORING_METHODOLOGY.md)：benchmark 集合、五維、Overall、排名與缺值                                             |
| 查 benchmark 維度              | [BENCHMARK_DIMENSION_MAPPING.md](BENCHMARK_DIMENSION_MAPPING.md)：逐 benchmark 的主要維度與理由                                         |
| 查來源採用與擷取依據           | [BENCHMARK_SCORE_SOURCES.md](BENCHMARK_SCORE_SOURCES.md)：來源目錄；採用清單以 [sources.json](../data/mappings/sources.json) 為機器設定 |
| 更新資料、修正程式、驗證與交付 | [OPERATIONS.md](OPERATIONS.md)：觸發條件、完成標準、異動判斷、審核與文件維護                                                            |
| 查已移除架構的邊界             | [REFACTOR_DISCARD_LIST.md](REFACTOR_DISCARD_LIST.md)：架構邊界的補充清單                                                                |
| 檢視集合覆蓋率                 | [COVERAGE_MATRIX_REPORT.md](COVERAGE_MATRIX_REPORT.md)：有日期的產出報告，重產方式見操作手冊                                            |

## 權威與維護方式

- 使用者已確認的新決定，必須同步到其所屬主題文件。上表定義各文件的權責；同一條規則只在負責的文件維護，其他入口連結引用。
- `SPEC.md` 保留詳細產品設計與裁決依據；資料、計分、架構與操作的現行摘要分別由上表的主題文件負責。歷史階段、舊裁決與一次性任務不能覆蓋現行契約。
- 程式與機器設定用來驗證實作；發現與文件不符時，先追查已核准決定與實作證據，再同步修正。無法裁決的產品政策問題交給使用者。
- `history/` 是歷史考證，`refresh/` 是逐次資料審核紀錄；日期、當時數量與任務狀態均有其時點，不作為日常待辦。
- 開發者與代理使用相同入口。`apps/bench/AGENTS.md` 是框架維護的局部技術指引，適用於該應用的程式工作；產品流程以本入口所列文件為準。
- 每次任務同步文件、引用、狀態與驗證證據的完成條件，見 [操作手冊 §10](OPERATIONS.md#10-任務與文件維護)。

## 歷史與審核紀錄

| 文件                                                           | 範圍                                    |
| -------------------------------------------------------------- | --------------------------------------- |
| [REFACTOR_AGENT_ENTRY.md](history/REFACTOR_AGENT_ENTRY.md)     | 原根目錄 CLAUDE.md；重構時期的代理入口  |
| [REFACTOR_TASK_PLAN.md](history/REFACTOR_TASK_PLAN.md)         | 第二次重構 O–Q 計畫與驗收紀錄           |
| [PHASE_A_TO_N.md](history/PHASE_A_TO_N.md)                     | 第二次重構 A–N 階段紀錄                 |
| [PROJECT_HANDOFF.md](history/PROJECT_HANDOFF.md)               | 起始於 2026-08-17、後續曾補寫的交接紀錄 |
| [WORKSPACE_CLEANUP_PLAN.md](history/WORKSPACE_CLEANUP_PLAN.md) | 2026-08-24 工作區整理紀錄               |
| [其他歷史文件](history/)                                       | 先前規格、設計推導與驗收證據            |
| [刷新報告](refresh/)                                           | 逐次來源與產品異動、抽查及審核結果      |

尚待資料量足夠後重驗的產品問題由 [SPEC.md §12](SPEC.md#12-已知風險與待查項目) 保持可追蹤；歷史紀錄中的未結項需先核對後續證據，不能直接當成新任務。
