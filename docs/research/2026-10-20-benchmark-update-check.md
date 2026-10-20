# 2026-10-20 模型 Benchmark 聯網查核

以 [10 月 19 日保存資料](2026-10-19-benchmark-update-check.md)為基準。主要新增為 **DeepSeek 1017 與 MiniMax M3.1 Flash 的 AA 成績、Vals 九筆 1017 結果、LiveBench 兩款 Claude 修分、Epoch 外部評測更新、ARC Beam 成績及 AA 新評測**。逐欄差異、來源時間、原始檔與 SHA256 見 [查核 JSON](2026-10-20-benchmark-update-check.json)。本次擷取時段約為台北 10/20 08:19 起，各來源截止時間獨立記錄。

## Artificial Analysis 的新模型成績

[AA 原始模型資料](https://artificialanalysis.ai/models)新增兩個 profile ID。主頁 27 個選取配置以它們替換舊版選取；詳頁比較資料仍保留舊版，聯集由 197→199 個 profile IDs。

| 模型／版本                                                                           | AA Intelligence Index v4.3.2 |          HLE | Terminal-Bench 4.0 | AutomationBench-AA |  每題指數成本 |
| ------------------------------------------------------------------------------------ | ---------------------------: | -----------: | -----------------: | -----------------: | ------------: |
| V4.1 Flash max（10/19 基準）                                                         |                      39.4562 |     39.2493% |           26.7677% |           68.8910% |     $0.485662 |
| [V4.1 Flash 1017 max](https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017) |                  **45.0965** | **43.3272%** |       **33.8384%** |       **66.6410%** | **$0.262048** |
| MiniMax M3（10/19 基準）                                                             |                      29.2203 |     38.9713% |            2.0202% |           21.2513% |     $0.507613 |
| [MiniMax M3.1 Flash](https://artificialanalysis.ai/models/minimax-m3-1-flash)        |                  **42.3811** | **47.9611%** |       **25.7576%** |       **72.5218%** | **$0.220114** |

此表以昨日舊 profile 與今日新 profile 比較，反映公開評測結果；每個版本的完整 run manifest 尚缺，不能推定所有執行條件完全匹配。

AA 的 1017 GDPval Elo 為 1745.77、Briefcase Elo 1570.42；M3.1 Flash 為 1457.69／1473.90。DeepSeek 新舊 effort 均為 max；MiniMax 的 AA effort 欄位缺值。兩個新 profile 的 model release metadata 分別為 10/17、10/19；首頁 changelog 的評測日期分別標為 10/18、10/19，本次確認時間另存，三者分開解讀。

DeepSeek 1017 的 AA input/output token 單價仍為 $0.3/$1.2 每百萬，整套 output tokens 253.114M→210.860M；MiniMax M3.1 Flash 為 $0.15/$0.60，整套 output tokens 117.059M→182.567M。每題成本採 AA 權重與快取方法，不能只用 token 單價判斷。

上述是 AA 實作的獨立評測。DeepSeek 自報 TB4 42.3 使用 Claude Code，AA 的 33.8384 及 Vals 的 31.818 各有來源與執行設定；匯入時保留評測者、harness、profile、版本與日期。

既有 AA 評分修訂包括 Muse Spark Open xhigh Briefcase Overall Elo **1279.25→1279.37**；Qwen3.8 27B xhigh Briefcase **1395.27→1394.92**、GDPval **1419.88→1416.92**，相應分項與信賴區間一併保存。端點速度與估算時間的日常測量變動另列逐欄證據。

## LiveBench 2.0 修分及成本

[當前官方 table](https://livebench.ai/data/20261014/table.csv)仍有 48 個模型列。bundle 改為 `main.c8f94910.js`、cache key `1792438049`，release ID 為 `20261014`，畫面日期仍為 18 October 2026；本次以 payload 比較辨別更新。

| 模型（前端 effort=max） | Overall 10/19→本次 | 主要 suite 差異                                               |
| ----------------------- | -----------------: | ------------------------------------------------------------- |
| Claude Haiku 5.5        |      **74.5→75.6** | 七項均改；Research 73.7→81.9、Coding 84.5→91.4、Browser 88→80 |
| Claude Sonnet 5         |      **74.6→73.0** | Coding 82.2→74.7、Browser 76→72                               |

Overall 為七個 suite 等權平均、顯示至一位小數。其他 Haiku 差異為 Long Agentic 56.6→57.6、Reasoning 84.6→82.4、Data Analysis 51.8→53.1、Design 82.2→83.1。這些是官方資料修訂，完整 run manifest 與修訂原因尚缺。

[成本 CSV](https://livebench.ai/data/20261014/cost.csv)亦修訂兩列：Haiku Long Agentic 36.9632→186.5138、Research 9.7377→42.6783，`nq_research` 25→22；Sonnet Browser 61.2790→157.2459、Coding 137.7318→101.0088。這些是匯出欄位數值，應連同樣本數、token 及計價條件使用。breakdown 有 31 處子分差異。notes、categories 與評分程式比對相同；單次 run、最高 effort 與重跑仍無法測量記 0 分的規則隨結果保存。

## Epoch AI 外部評測更新

[官方 ZIP](https://epoch.ai/data/benchmark_data.zip)的 92 個成員中，**22 份 CSV 變動**。主要變更如下；Epoch 外部匯入可能轉錄已存在於原榜的結果，應以來源與 run 身分辨識獨立證據。

| 檔案／評測   | 新增與修訂                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| APEX-Agents  | 54→55 列；Muse Spark Open 新增 Pass@1 **33.4%**、Mean **48.7%**，六個既有列修訂                        |
| ARC-AGI-1／2 | 新增 **8／7 列**，包含 Argon、Haiku 多種 effort                                                        |
| CursorBench  | 72→78 列；Muse Wonder 六種設定，max **50.4%**、xhigh **48.2%**；59 個既有列的差異為排名欄位            |
| LMCA         | 176→197 列；新增最高 Sonnet 5.5 max **68.26±2.74**                                                     |
| DTBench      | 214→235 列；新增最高 Argon low **97.60% accuracy**，另列 CRI-rescaled **96.0**                         |
| WeirdML v3   | 17→23 列，新增六列，16 個既有列改值，包含執行框架變更                                                  |
| ProofBench   | Grok 4.7 Accuracy **34→26%**；latency 505.658→767.177 秒、cost/test $0.518303→$0.787951                |
| 其他         | ALE-Bench 新增三列、CritPt 一列；SciCode 有新增列／順序變動；ForecastBench 14 列分數、預測數與區間修訂 |

[LMCA](https://conceptualreasoning.ai/lmca)的單位是 **人類與模型評分的相關係數×100**；DTBench accuracy、CRI-rescaled、EDT preference 分別保存，不能混成同一正確率。DTBench 的 537 題含 407 capability 與 130 decision-attitude 題，CRI 使用 capability 子集。

WeirdML 的 DeepSeek base high 由 `opencode:1.18.30` 改成 `codex_cli:0.156.0`，runs 30→72，Score 0.0594633→0.0583085、Cost/run $0.7370795→$0.5119273。這組比較同時變更 agent／harness／樣本，模型效果需與執行條件一起解讀。[來源方法與逐列欄位](https://htihle.github.io/weirdml.html)另存於證據。

[ECI](https://epoch.ai/eci)的三份獨立 CSV 及 ZIP 內 ECI／bootstrap 檔與基準相同，277 模型／2987 輸入；本次外部結果更新尚未反映為 ECI 重估。FrontierMath v2 120／76 列、Chess 153 列已比對，方法頁僅存取日期變動。九份 CSV 的差異限國家排序；model metadata 另新增六種身分。完整分類見 JSON。

## Vals、ARC 與其他榜單

[Vals](https://www.vals.ai/benchmarks)九個頁面新增 DeepSeek 1017 max，overall 3238→3247 列，全部 task 20392→20517 列（+125）；既有列無修訂。各頁 overall 如下：

| 頁面               |        分數 | Cost/test USD |
| ------------------ | ----------: | ------------: |
| Vals Index         | **56.584%** |      0.637296 |
| Vibe Code          |     87.730% |      0.579984 |
| Code Migration     |     44.210% |      1.858025 |
| Enterprise Memory  |     61.805% |      0.355142 |
| Finance Agent v2   |     56.960% |      0.462841 |
| Harvey LAB         |      9.167% |      0.543702 |
| Legal Research     |     45.192% |      0.698560 |
| Tax Agent          |     44.350% |      0.459454 |
| Terminal-Bench 4.0 | **31.818%** |      0.539359 |

公開配置為 max、temperature 1、top_p 1、max_output_tokens 384000；Vibe Code 使用 OpenHands。Vals Index 內的 `code_migration` 子分 **52.205%**、`tax_agent` **74.908%** 與各單榜 overall 不同，應保存各自題目／聚合範圍，不能用欄位同名就直接替換。

[ARC Prize Beam 結果](https://arcprize.org/results/reflection-beam-1-0)新增 low／medium／high／xhigh 四種設定、16 筆評測，standard harness。xhigh 的 ARC1 Semi-Private **74.0%**、每題 **$0.305813**；ARC2 Semi-Private **23.4722%**、每題 **$0.609580**。評測 raw／unique 為 1195／1194，模型 raw／ID unique 為 351／348；重複列保留，按身分比較。

[Surge HANDBOOK.md](https://surgehq.ai/benchmarks/handbook)專頁的前端程式標示 **v1.1**，changelog 明示清理 rubrics／judging protocol 後重新計分。目錄嵌入 CMS 列由 37→14，新增十列、移除 33 列，交集四列全部改分：Fable 5.1 **38.8→47.1**、Kimi K3 **11.9→28.6**、Gemini 3.8 Flash **10.8→26.5**、Qwen3.8 Max **16.5→30.8**。本次最高 Opus 5.5 max **52.3**，Sonnet 5.5 max **47.7**；專頁與目錄十四列一致。

這組修訂包含評分規則變動，應保存獨立版本。Blog／GitHub 的舊敘述仍有「無模型超過 25%」等內容，與新榜不一致；舊版 65 tasks／四次執行、strict pass@1 及 N−1 兩種定義不能直接當作 v1.1 全部執行設定。

FrontierSWE 本次有來源回應不一致：裸網址與一個 query 變體回傳空資料，另一次 cache-busted 回應取得 21 列 best／mean／worst，與基準逐列相同；web 摘要另見 22 個 model labels。這項覆蓋差異保存在 JSON，空回應不足以判斷模型刪除。RSI／SAFE 自訂模組與 Surge 外部圖表的範圍限制另列於各來源 findings。

## AA 新增評測與模型發布

[AA-PersonalityBench](https://artificialanalysis.ai/articles/aa-personalitybench)於 **10/19** 公告，36 個 profile、30 個判讀特質、8 個風格指數與 21 個程式測量溝通指標。每模型回答 900 題各一次、無 system prompt；盲測 pairwise judges 為 Gemini 3.8 Flash high、Sonnet 5.5 medium、GLM 5.3 Flash max。Trait Elo 用 Firth-penalized Bradley–Terry，tie 半勝；以 1000 次 bootstrap 算 trait 95% CI。八個指數將 trait Elo z-scores 平均後轉為 1–100 百分位，Transparency 反向計入 Sycophantic。分數描述風格顯著程度，方向需按讀者偏好解讀。[完整方法](https://artificialanalysis.ai/methodology/aa-personalitybench)

[HealthBench](https://artificialanalysis.ai/evaluations/healthbench)與 [Professional](https://artificialanalysis.ai/evaluations/healthbench-professional)各有 14 個模型結果，屬獨立評測，未納 AA Intelligence Index v4.3.2。HealthBench 5000 題、一次執行、GPT-4.1 temperature 0.5 judge；Professional 525 題、四次、GPT-5.4 low judge。Headline 為長度調整分：以 2000 字元為基準，每 500 字元分別調整 2.99／1.47 百分點；分項使用 raw score。資料集固定於 simple-evals commit `652c89d`、checksum pinned，無 system prompt／tools，重試後仍失敗記 0 分。

HealthBench 長度調整最高 Sonnet 5.5 max 62.0657%，Professional 最高 Astra max 65.9789%。HealthBench 表內 DeepSeek 是 **base V4.1 Flash**，保留原 profile，不能當作 1017 結果。

[MiniMax 官方發布](https://www.minimax.io/blog/minimax-m31f)及 [API release notes](https://platform.minimax.io/docs/release-notes/models)確認 **10/19** 正式推出 M3.1 Flash，API／M Plan／MiniMax Code 可用，權重待後續釋出。官方確認 Space Bunny 是早期版本。API 預設 thinking on、effort max，這是產品預設，AA 未填 effort 的結果仍保持缺值。官方自報 CyberGym 82%，完整 harness／precision／budget 未給。

[DiscoveryRSI-27B](https://huggingface.co/Gen-Verse/DiscoveryRSI-27B)由模型卡公告進展到實際 BF16 權重：release commit `27c9b10e2a7dcb6e0a60ffc17fb792ab26d82ee1` 為台北 **10/20 02:29:32**，base 為 Qwen3.8-27B、round 2 step 150，有 130 shards 與 preserved-untrained 檔及 release manifest。研究展示的數值對照缺完整 checkpoint／run manifest，依科學假說流程的專用設定記錄。

[NVIDIA Parse 新 commit](https://huggingface.co/nvidia/Nemotron-3.5-Parse/commit/e7ea79242a87ea0ad3919b672bfedb429a683206)修復 malformed／truncated blocks 處理；目前保存的 validation 指標與基準相同。已保存的舊 renderer 校正配對分數屬先前方法變更，各版本檔分開保留。
