# 外部評測來源查核：2026-09-08

比對基準：commit `0672da544f008bd115de0c8f7820214d8ad87ef8` 的 2026-09-06 來源快照。查核範圍為 `data/mappings/sources.json` 的八個現役來源。

## 已確認更新

### Artificial Analysis

官方 [Intelligence Benchmarking 方法](https://artificialanalysis.ai/methodology/intelligence-benchmarking) 已標示 Intelligence Index **v4.3**，基準快照為 v4.2。新版採用 Terminal-Bench v4.0，τ³-Banking 移出綜合指數。跨版本 Index 差異不能直接解讀為模型能力變化。

本次下載並解析 18 個既有 evaluation URL 與 `/models` 的公開嵌入資料，逐頁與既有 artifact 比對。頁面 payload 含目前選取的模型子集，以下列數指取得的子集，不代表全站模型總數。

| 項目                                      | 9 月 6 日 | 9 月 8 日 |
| ----------------------------------------- | --------: | --------: |
| AutomationBench-AA payload 模型列         |        13 |        28 |
| AA-AnalystAgent payload 模型列            |        12 |        16 |
| Astra max：AutomationBench-AA             |      null |  68.4917% |
| Astra max：AA-AnalystAgent                |      null |    51.25% |
| Astra max：Terminal-Bench v4.0 欄位       |      null |  59.0909% |
| Astra max：GDP.pdf all-pass               |     33.2% |     31.0% |
| Terra max：AutomationBench-AA             |  45.6145% |  59.6500% |
| Sol max：AutomationBench-AA               |  51.1877% |  60.0811% |
| Gemini 3.8 Flash high：AutomationBench-AA |  50.7161% |  59.9301% |

`null` 表示該次頁面 payload 欄位無值；不能據此判定評測首次發布時間。AutomationBench-AA 頁面取得列数淨增 15，涉及模型子集變化，不能視為恰好新增 15 款模型。

來源：[AutomationBench-AA](https://artificialanalysis.ai/evaluations/automationbench-aa)、[AA-AnalystAgent](https://artificialanalysis.ai/evaluations/aa-analyst-agent)、[AA-Briefcase](https://artificialanalysis.ai/evaluations/aa-briefcase)。AutomationBench-AA 的部分目標完成率與 Zapier 的完整任務完成率是不同指標。

### LiveBench

最新 release 仍為 `2026-06-25`，公開應用程式的 cache version 已從 `1788552585` 更新為 `1788809517`。

官方 [成績 CSV](https://livebench.ai/table_2026_06_25.csv?v=1788809517) 與 [成本 CSV](https://livebench.ai/cost_2026_06_25.csv?v=1788809517) 都由 54 增至 56 個資料列，新增 `smaug-mini`、`smaug-flash`。以模型名稱比對，既有 54 列內容相同；categories JSON bytes 相同。

| 新增模型    | 每題成本（美元） | 每成功任務成本（美元） |
| ----------- | ---------------: | ---------------------: |
| smaug-mini  |           0.0765 |                 0.0994 |
| smaug-flash |           0.0109 |                 0.0140 |

列數為 CSV 匯出母體。

### Epoch AI

官方 [benchmarks.csv](https://epoch.ai/data/benchmarks.csv) 維持 1,679 個 run。以 `id_runs` 對照，4 個既有 run 的 `mean_score`／`best_score` 已修訂，均屬 `FrontierMath-Tier-4-v2-Private`。

| 模型／檔位         |     舊成績 | 新成績 |
| ------------------ | ---------: | -----: |
| GPT-6 Astra high   | 95.121951% |  97.6% |
| GPT-6 Astra xhigh  | 95.121951% |  97.6% |
| GPT-6 Astra max    | 95.121951% |  97.6% |
| Claude Fable 5 max | 87.804878% |  90.2% |

來源 [benchmark_data.zip](https://epoch.ai/data/benchmark_data.zip) 的內容 hash 也有變動。以相同時間與 materializer 分別解析新舊 ZIP，產生的 1,480 筆 CandidateResult 完全相同。上述 FrontierMath 修訂來自 live CSV；該 task 尚未由專案納入，不能將其視為現有看板分數已變更。

### Vals AI

從官方 index 取得 42 個 benchmark slug，逐頁解析 Astro 資料並與快照比對。33 頁解析結果相同，8 頁新增 `meta/muse_spark_1_3_max`，另 1 頁有成本修訂。

| Muse Spark 1.3 max 新增評測                                             |    成績 | 每次測試成本（美元） |
| ----------------------------------------------------------------------- | ------: | -------------------: |
| [Code Migration](https://www.vals.ai/benchmarks/code-migration)         | 47.414% |            14.210071 |
| [Enterprise Model Benchmark](https://www.vals.ai/benchmarks/emb)        | 67.426% |             2.546868 |
| [Finance Agent v2](https://www.vals.ai/benchmarks/fabv2)                | 59.958% |             0.756512 |
| [HLE Agentic](https://www.vals.ai/benchmarks/hlab)                      | 23.750% |             2.237702 |
| [Legal Research](https://www.vals.ai/benchmarks/legal_research)         | 55.288% |             0.588812 |
| [Terminal-Bench 2.1](https://www.vals.ai/benchmarks/terminal-bench-2-1) | 79.026% |             0.596710 |
| [Vals Index](https://www.vals.ai/benchmarks/vals_index)                 | 64.526% |             3.404111 |
| [Vibe Code](https://www.vals.ai/benchmarks/vibe-code)                   | 85.856% |             2.543084 |

Vals Index 為綜合指標。新增來源模型名稱的 canonical identity 需依專案模型政策處理。

[SREBench](https://www.vals.ai/benchmarks/srebench) 的 `anthropic/claude-fable-5-1` 每次測試成本由 **$34.652732** 改為 **$32.231825**，成績相同。

## 已核對相同的官方資料

| 來源                                                | 比對證據                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [DeepSWE](https://deepswe.datacurve.ai/)            | `/artifacts/v1.1/leaderboard-live.json`，94,738 bytes，SHA-256 與基準相同。           |
| [Frontier Code](https://cognition.com/frontiercode) | `/data/frontiercode-leaderboard/data.json`，68,021 bytes，SHA-256 與基準相同。        |
| [ARC Prize](https://arcprize.org/leaderboard)       | leaderboard HTML 與 datasets／evaluations／models 三個 JSON 的 SHA-256 均與基準相同。 |
| [Zapier](https://zapier.com/benchmarks)             | benchmarks HTML 與其評測資料 module 的 SHA-256 均與基準相同。                         |

## 刷新前診斷：匯入與計分影響

以下為刷新前的診斷紀錄。修正、catalog 收錄、八來源刷新、產品重建與完整驗證結果見 [完成報告](2026-09-08.md)。

使用目前 materializer，對相同 19 個 AA evaluation／models URL 的新舊 HTML 進行記憶體解析。比較鍵包含 benchmark、metric、inclusion、模型名稱與 effort，避免混淆 Omniscience Index 與 Accuracy。此範圍不含 model-detail／API，不能替代完整產品排名重建。

- 新舊分別產生 544／556 筆候選結果；共同列中 78 筆有分數或版本差異，其中 45 筆為 Intelligence Index 換至 v4.3。
- GDPval-AA 有 20 筆共同列分數調整。Astra max 的 normalized score 由 54.138% 改為 54.010%，Sol max 由 56.374% 改為 56.2055%。這是單項評測 normalized score，不是 Overall。
- 發現版本解析問題：parseArtificialAnalysisVersionMetadata 對全文取第一個 Terminal-Bench 版本，可能將 terminalbenchV21 成績套上頁面提及的 v4.0。相同範圍重現於 Opus 5 high／xhigh、Grok 4.6 xhigh；分數分別維持 87.640449%、88.014981%、88.014981%，benchmarkId 為 terminal-bench-2-1，但版本由 v2.1 變成 v4.0。正式刷新前需按實際評測欄位限定版本來源。
- 現行 AA direct score mapping 尚未涵蓋 AutomationBench-AA、AA-AnalystAgent、GDP.pdf、Terminal-Bench v4.0；下載頁面不等於這些新指標會進入五維計分。專案 automationbench 使用 Zapier 資料，與 AA 部分目標完成率不同。
- 模型 catalog 尚未收錄 Muse Spark 1.3、smaug-mini、smaug-flash。來源新增列需要模型對應才能建立產品 profile；主榜資格仍取決於完整評測覆蓋。

正式刷新應先處理 Terminal-Bench 版本辨識，再按現有政策更新來源、重產集合並比較排名。新增模型或納入新的 AA 指標涉及模型／評測政策選擇。
