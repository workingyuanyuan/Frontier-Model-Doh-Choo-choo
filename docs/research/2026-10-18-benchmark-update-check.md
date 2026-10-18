# 2026-10-18 模型 Benchmark 聯網查核

查核時間約 2026-10-18 10:10–10:12（Asia/Taipei），比較 [10 月 17 日保存資料](2026-10-17-benchmark-update-check.md)。主要新增為 DeepSeek-V4.1-Flash-1017 的正式發布、權重與供應商評測。逐列差異、來源時間、SHA256 與查核範圍見 [查核 JSON](2026-10-18-benchmark-update-check.json)。

## DeepSeek-V4.1-Flash-1017

[官方公告](https://api-docs.deepseek.com/news/news261017/)日期為 **10/17**；[官方 HF release commit](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/commit/1bae0e1088993b9b82de08f59de5be5a34e42170)時間為台北 **13:46:55**。以下數值直接配對自[同一官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)，單位為百分比；差值為百分點。

| 評測                      | V4.1-Flash | 1017 |  差值 |
| ------------------------- | ---------: | ---: | ----: |
| HLE 無工具                |       36.8 | 42.6 |  +5.8 |
| HLE 無工具，純文字 subset |       39.1 | 44.0 |  +4.9 |
| Terminal-Bench 4.0        |       31.2 | 42.3 | +11.1 |
| DeepSWE v1.1              |       74.2 | 77.0 |  +2.8 |
| ProgramBench              |       20.3 | 29.1 |  +8.8 |
| NL2Repo-Bench             |       65.4 | 68.2 |  +2.8 |
| Automation-Bench v1.0.6   |       54.8 | 60.5 |  +5.7 |
| Agents’ Last Exam         |       31.8 | 35.4 |  +3.6 |
| Apex Bench v1.1           |       64.6 | 72.1 |  +7.5 |
| Chartography，有工具      |       78.9 | 83.0 |  +4.1 |
| BabyVision，有工具        |       89.6 | 92.5 |  +2.9 |
| ZeroBench-main，有工具    |       49.0 | 51.0 |  +2.0 |

Terminal-Bench 4.0 使用 **Claude Code**，DeepSWE v1.1 使用 **Mini-SWE-V2**；[官方 changelog](https://api-docs.deepseek.com/updates/)明示 ZeroBench-main 採 **Pass@5**。完整與純文字 HLE 分開記錄。模型卡提供配對結果與部分 harness 設定，完整 effort、budget、run manifest、變異及評測精度尚缺，差值屬供應商報告的提升。

[官方 API 說明](https://api-docs.deepseek.com/)已將 `deepseek-flash` 指向 1017，legacy aliases `deepseek-v4-flash`／`deepseek-v4-flash-vision-exp` 亦轉往 1017。後續採集應保存實際版本、抓取時間及 harness，才能辨別舊版與新版成績。公開權重採 MIT；checkpoint config 的 `quant_method=fp8`、`expert_dtype=fp4`、`dtype=bfloat16` 是檔案設定，評測精度需另外確認。

## LiveBench 2.0 與 Epoch AI

[LiveBench 當前 CSV](https://livebench.ai/table_2026_09_02.csv?v=1792206731)含 **48 款模型**，當前 bundle 為 `main.13da4572.js`、cache key 為 `1792206731`。table、cost、notes、categories、breakdown 五份 payload 與 10/17 保存資料位元組相同；帶 cache key 與裸 CSV 亦一致。比對涵蓋七個 suite 及其設定。

[Epoch ECI 頁面](https://epoch.ai/eci)的匯出日期已改成 **10/18**。目前 **277 模型、2987 組輸入、61 個 EDI**；ECI、EDI、inputs、bootstrap 檔與 10/17 相同。另抓取的 [ECI scores](https://epoch.ai/data/eci_scores.csv)、[EDI scores](https://epoch.ai/data/edi_scores.csv)、[ECI inputs](https://epoch.ai/data/eci_benchmarks.csv)與本次 ZIP 對應成員完全一致，日期變更沒有伴隨指數重估。

[官方 ZIP](https://epoch.ai/data/benchmark_data.zip)有 92 個成員，SHA256 為 `3168d66c8261578f91651e98a5e0e970cc0b51d047076fd3c8af6275dd91def5`。九份 CSV 共 12 列改變：八份 external benchmark CSV 共九列，以及 model metadata 三列，全部為 Country 多值順序調整，國家集合相同。

[FrontierMath Tiers 1–3 v2](https://epoch.ai/benchmarks/frontiermath-tiers-1-3-v2)／[Tier 4 v2](https://epoch.ai/benchmarks/frontiermath-tier-4-v2)為 **120／76 列**，[Chess Puzzles](https://epoch.ai/benchmarks/chess-puzzles)為 **153 列**。三份分數檔比對相同。Chess 方法頁記載 10/14 的 version 2、重跑與撤下 v1 顯示，跨版本比較需保存獨立版本與題目條件。

## 其他榜單查核範圍

| 來源                                                        | 本次核對範圍                                                       | 相對 10/17 的數值結果                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| [Artificial Analysis](https://artificialanalysis.ai/models) | 主頁 27 配置、五個模型詳頁、Decision Index 13 決策模型與其他對照列 | 解析結果相同；Intelligence Index v4.3.2  |
| [Vals](https://www.vals.ai/benchmarks)                      | 51 頁、49 份一般 JSON、3238 overall 列與所有 task 列               | 新增／移除／修分各 0；Science Index v1.0 |
| [ARC Prize](https://arcprize.org/leaderboard)               | 1179 raw／1178 unique 評測，347 raw／344 unique 模型               | 原始 JSON 相同                           |
| FrontierCode／DeepSWE／FrontierSWE                          | 136／70／21 列                                                     | payload 相同                             |
| Zapier AutomationBench                                      | 126 列、v1.0.6                                                     | payload 相同                             |
| Surge                                                       | 八份榜單與方法文字                                                 | 數值與方法相同；圖片 URL／alt 有變動     |

AA 的主頁、評測目錄與 Decision Index 可見文字也已比對；模型詳頁內含大量重複的比較配置，列數不能相加當作唯一模型數。Vals 的 RSI／SAFE 是自訂頁面格式，另保存原始頁面；Surge 外部成本與 token 圖表未全量獨立下載。各榜的直接來源 URL 與擷取時間完整列於 JSON。

## 其他公告

[Tencent Hy-Memory-30B-A3B](https://memory.hunyuan.tencent.com/)為 **10/16** 發布，本次補核對。其 memory-writer 評測固定 20% subsample、各 harness 的 prompts／retrieval／answer model／judge，四個 harness 等權、各六項指標等權；官方卡的 macro-average 為 55.49，Opus 5 對照為 54.62。採用這組數值需保留此專門的記憶系統設定。

[DiscoveryRSI-27B 官方模型卡](https://huggingface.co/Gen-Verse/DiscoveryRSI-27B)於 10/17 建立。擷取時官方 HF API 僅列 README 與 `.gitattributes`、`usedStorage=0`，數值評測缺值，依研究公告記錄。公開搜尋範圍與索引限制見 JSON。
