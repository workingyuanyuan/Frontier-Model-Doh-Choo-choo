# 2026-10-21 模型 Benchmark 聯網查核

與 [10 月 20 日保存資料](2026-10-20-benchmark-update-check.md)比較，本次主要變動為 **Epoch ECI 重新擬合、AA MLCR-AA 評分規則修訂、Vals 多榜改版與新增 Router／ClaimBench，以及 LiveBench 納入 MiniMax M3.1 Flash**。來源擷取約為台北 10/21 11:17 起，各來源時間、完整逐欄差異與雜湊見 [查核 JSON](2026-10-21-benchmark-update-check.json)。

## Epoch ECI 重新擬合

[ECI 官方資料](https://epoch.ai/data/eci_scores.csv)由 **277→270 模型**，新增 Muse Wonder **161.85**、Muse Spark Open **155.11**，九個模型退出本次匯出；266 個既有模型列有分數或區間變動。輸入由 **2987→2888 組**，按模型與 benchmark 對齊為新增 58、移除 157。

| 模型             | 10/20 ECI |   本次 ECI | 本次區間      |
| ---------------- | --------: | ---------: | ------------- |
| Claude Opus 5.5  |    166.82 | **168.83** | 165.25–173.95 |
| GPT-6 Astra      |    166.41 | **168.81** | 165.45–174.51 |
| GPT-6.1 Sol      |    166.32 | **168.37** | 165.00–174.43 |
| Claude Fable 5.1 |    164.65 | **166.49** | 163.47–171.35 |
| Gemini 4 Argon   |    164.56 | **166.45** | 163.23–171.52 |

前三的區間高度重疊，點估計差距不足以支持明確能力排序。[ECI 官方說明](https://epoch.ai/eci)指出指數以全部資料共同擬合，輸入改變會連帶調整既有模型值。

[ZIP](https://epoch.ai/data/benchmark_data.zip)內 `benchmark_metadata.csv` 明示以下變動：

- HLE、DeepSWE、ScienceQA 的 `in_eci` 改為 False。
- WeirdML v3 改為納入 ECI，使用 **Max performance** 欄位。
- GPQA 的 `score_ceiling` 1→0.97；FrontierMath Tiers 1–3 v2 1→0.95；WeirdML v3 設為 0.9。

ECI 輸入的 normalized performance 因而與原始 benchmark 分數分開比較：GPQA 179 組、FM1–3 v2 83 組、APEX 四組、Chess 四組、ProofBench 一組有改值。三份獨立 ECI／EDI／inputs CSV 與當前 ZIP 對應檔逐位元一致。本次屬指數組成、正規化與輸入選擇變更，不能將每筆 ECI 上升當作新模型執行的獨立增益。

ZIP 仍有 92 個成員，16 份 CSV 與 bootstrap JSON 變動；九份 CSV 僅國家清單排序。原始 FrontierMath v2 120／76 列、Chess 153 列比對相同。

## Epoch 其他結果與方法

[ForecastBench](https://epoch.ai/benchmarks/forecastbench)的外部匯出 **82→92 列**，新增 15、移除五，77 個既有列都有 Overall 實分修訂。新增例子包括 GPT-5.5 high **67.0**、GPT-5.6 Sol medium／Opus 5 max **66.5**。指標是 **difficulty-adjusted Brier Index（0–100）**；各模型名稱中的 search、code execution、effort、token budget 必須保留，不能當作一般答對率或純模型裸測。

WeirdML 的 Kimi K3 high 改標 Fireworks、runs 44→72，Score 0.07268865→0.07544403、Max performance 0.15664526→0.15409356。DeepSeek base high 從 `codex_cli:0.156.0` 改回 `opencode:1.18.30`，runs 72→30，Score 0.05830850→0.05946332、Max performance 0.12373953→0.11577239。[原站資料](https://htihle.github.io/weirdml.html)同時保留兩個 DeepSeek harness 結果，證明這是匯入選擇與執行配置差異。官方 Score 結合 token 曲線 AUC、最終 effective score 與提示懲罰；ECI 使用不同欄位 Max performance。

[FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)由 **7→13 列**，新增 GPT-6.1 Sol max **3/68＝4.4118%**、GPT-6 Sol max **1/68＝1.4706%**，另四組為零。方法為 68 個 Lean 命題、每題一次、deepagent scaffold、離線 Comparator、每題 $300／72 小時。CSV 使用 0–1 比例，新增列的 run 起始日期早於本次查核日。

[Chess 方法頁](https://epoch.ai/benchmarks/chess-puzzles)新增外部稽核回應，說明 `qa_agent` 續寫、剩餘 token 預算提醒、工具提交，以及耗盡預算時以最低 effort 取得即時答案並記 `forced_final_answer`；分數以正規化後 deterministic exact-match 判定。2.0.0 的 content-filter 失敗為 25/14800、2.0.1 為 0/400；官方亦承認無法核實出題時的 Stockfish 版本。這些是方法披露與版本解讀資訊，原始 Chess 分數檔本次相同。

## LiveBench 2.0

[官方 table](https://livebench.ai/data/20261014/table.csv)新增 **MiniMax M3.1 Flash**，模型列 **48→49**；前端 effort 為 max，Overall **73.1**。

| Long Agentic | Reasoning | Coding | Browser | Data Analysis | Research | Design |
| -----------: | --------: | -----: | ------: | ------------: | -------: | -----: |
|         34.7 |      82.9 |   83.9 |    92.0 |          71.4 |     72.7 |   74.0 |

Overall 為七項等權平均顯示至一位小數。[成本 CSV](https://livebench.ai/data/20261014/cost.csv)新增同列，input/output 為 **$0.15/$0.60 每百萬 token**，suite 成本、token 與樣本數隨資料保存。既有分數列已逐欄比對。

bundle 為 `main.074b2ee8.js`、cache `1792480668`，release 仍是 `20261014`、畫面日期仍是 18 October 2026。bare 與 cache table 位元組一致。單次 run、最高 effort、重跑仍無法測量記零分等 notes 保留，公開檔未提供完整 prompt／temperature／token budget。

## Artificial Analysis

### MLCR-AA 方法修訂

[更新後方法](https://artificialanalysis.ai/evaluations/mlcr-aa)移除舊版「回應超過 reference answer 五倍長度即零分」的 conciseness gate。一般提示改為每部分一段、引用病歷證據；三位 judge 檢查 ground truth 與原始病歷，空答案直接失敗。Headline 改為多數 judge **各自同時判定完整且無任何與病歷矛盾的主張**才通過，包含超出參考答案範圍的主張；完整性亦要求指出必要的文件缺口。

私有 hardest set 為 60 題、每題三次，pass@1。當前頁面報告 165 配置；跨日可比的模型詳頁比較子集中，MLCR 非缺值 **80→154**，83 個新值、九個值移除、69 個既有值修訂。這是該子集的欄位覆蓋，不能當作完整榜單列數。

| 模型                                | 10/20 欄位值 | 本次 Pass Rate |
| ----------------------------------- | -----------: | -------------: |
| Claude Sonnet 5.5 max with fallback |        75.0% |   **41.6667%** |
| GPT-6 Astra max                     |        35.0% |   **41.6667%** |
| GPT-6.1 Sol max                     |     33.8889% |   **38.3333%** |
| Claude Fable 5.1 max with fallback  |     71.1111% |   **15.5556%** |

跨日差值伴隨評分規則改版，不適合作為模型能力升降的單一證據。Accuracy／Completeness 為另外的指標，不能替換 Headline Pass Rate。

### AA 新增欄位與修訂

[模型資料](https://artificialanalysis.ai/models)新增 21 個 AA-3D Elo 值至本次比較子集，最高 Sonnet 5.5 max **1196.5471**、Opus 5.5 max **1190.9975**。AA-3D 已於 10/12 發布，本次是比較資料欄位覆蓋增加；Elo 與頁面顯示的 `(Elo−500)/2000` 正規化值分開保存。

| 新填入結果                                   |         分數 |
| -------------------------------------------- | -----------: |
| DeepSeek 1017 max FrontierCode               | **43.6606%** |
| MiniMax M3.1 Flash FrontierCode              | **38.5759%** |
| Nemotron 3.5 Super VL FrontierCode           | **25.5239%** |
| DeepSeek 1017 max Terminal-Bench-Science     | **12.8571%** |
| Nemotron 3.5 Super VL Terminal-Bench-Science |       **0%** |

其他新值包含 DeepSeek V4 Pro／Inkling Small 的 FrontierCode、Nemotron Ultra 的 Science 與 Argon high 的 Harvey LAB。零分和缺值分開記錄。

MiniMax M3.1 Flash 的 Intelligence Index **42.3811→42.7057**；其十個構成評測的 `score` 值逐一比對相同。官方未說明本次聚合修訂原因，不能歸因於新填入的 standalone MLCR／AA-3D。另有 GDPval／Briefcase 小幅 Elo 與區間修訂，完整欄位保存在 JSON。

[Decision Index](https://artificialanalysis.ai/evaluations/artificial-analysis-decision-index)的決策模型 **13→15**，新增 Decider Flash v1.2 4B **50.1531**、Decider v1.2 27B **56.1740**，每百萬題成本約 **$8.2293／$15.1441**，時間 **110／206ms**。Perplexity 官方權重首 commit 為 10/16，本次是 AA 覆蓋更新；供應商 public Decision Index 0.3 的不同資料與格式分數另存。

PersonalityBench 頁面報告 **36→38 profiles**，新增 DeepSeek 1017 與 MiniMax M3.1 Flash。當前 SSR 只有十個預設模型、詳頁比較資料涵蓋 34 個 Personality profiles；覆蓋外缺值不能推定模型刪除。部分既有 trait／index 值修訂；方法文字差異限連接詞標點，文章另將 launch snapshot 標為 10/20 並更新示例。HealthBench／Professional 的 14 模型分數已比對。

## Vals 改版與新增榜單

[目錄](https://www.vals.ai/benchmarks) **51→57 頁**，一般 JSON **49→55 份**，合計 **3360 overall／22427 task 列**。這些是模型與評測結果列，包含版本歸檔與分流，不能直接計為唯一模型或新增獨立證據。

| 新頁／版本                                                            | 目前模型列 | 變動性質                                           |
| --------------------------------------------------------------------- | ---------: | -------------------------------------------------- |
| [ClaimBench v1](https://www.vals.ai/benchmarks/claimbench)            |         19 | 1960 個財報 claim，支持／矛盾／無證據三分類，10/20 |
| [Router Index v1.0](https://www.vals.ai/benchmarks/vals_router_index) |  5 routers | 八榜約 1250 個 agentic 任務，10/20                 |
| Code Migration v1.1                                                   |         26 | mini-SWE-agent→Pi、hidden tests 更新               |
| EMB v1.1                                                              |         30 | Scratch judge 更換、Template matching 修正         |
| Finance Agent v2.1                                                    |         28 | jury、rubric 與 hedging 處理更新                   |
| HLAB v1 歸檔                                                          |         81 | 原始版本另留存                                     |

[HLAB 原網址](https://www.vals.ai/benchmarks/hlab)改指 **HLAB-Vals-1.1**：81→24 配置，22 個 matched overall 全修訂；保留 120 題，刪除 17 個無解 criterion、替換一份不匹配文件，finish tool、judge schema、重試、Word comments 與 pandoc 等流程更新，官方明示所有模型重新執行。新版與歸檔 v1、AA 的 Harvey LAB-AA 分別保存。

[Vals Index v2.2](https://www.vals.ai/benchmarks/vals_index)採用新版組件與 Tax all-pass，50→23 配置，21 個 matched overall 全改。標題分數為 Sonnet 5.5 **70.85**、Opus 5.5 **70.18**、Argon **69.24**，其中前兩者含 fallback；若拒答算失敗，Sonnet／Opus 為 **69.03／64.16**，此時 Argon 領先。Router Index 拒答一律失敗並排除 single-model fallback，不能與主 Index 的標題分數無條件比較。

Router Index 結果：Ramp Switchyard **57.795**、FireRouter **56.458**、Jev Router **55.652**、OpenRouter Auto **52.195**、Fugu **48.114**。ClaimBench 的 Decider v1.2 在決策模型中 **99.694%**、每 claim **$0.000104**，四個完整 LLM 達 100%；這是特定 claim 任務資料的結果。

Legal Research、Tax Agent、TB4、Vibe Code 各新增 Beam／M3.1 Flash 兩列。Code Migration／EMB／Finance Agent 舊網址仍保存舊 payload，新版另立頁面。Index 內 Code Migration 的 Sonnet 分數 87.37，單榜為 86.875，來自固定 50/120 CLI＋10 COBOL 子集，題目與聚合範圍應各自保留。

## 其他榜單與發布證據

ARC、FrontierCode、DeepSWE、Zapier、Science Index、RSI、SAFE 及 Surge 各嵌入榜／可比專頁均已核對，詳細覆蓋見 JSON。FrontierSWE 今日各 URL 變體都回傳 21 配置，best／mean／worst 的分數、成本及設定與昨日有效 payload 相同；昨日部分 URL 空回應的來源衝突另保留。

[NVIDIA Embed／Rerank 卡](https://huggingface.co/nvidia/Nemotron-3.5-Rerank-8B-BF16)於台北 10/21 清晨加入 ViDoRe V3／MIRACL-VISION 的供應商配對表，指標 **NDCG@10**。ViDoRe image+text／MIRACL image 分別為 Embed 1B **58.82／68.93**、Embed 8B **61.47／72.64**、Rerank 8B **67.56／78.69**。Reranker 兩方同取 NVIDIA Embed 1B top50，但模型的影像像素設定不同，完整比較模型／precision／尺寸條件見 JSON；這是既有 checkpoint 新增評測。Rerank serving 設定新增 fp32 線性層保留，權重 OID 比對相同。

Cosmos3 Nano 四個變體於 10/21 02:33 UTC 首 commit 發布並有實際 safetensors；GEM-X 於 10/20 22:57 UTC 加入 Body Pose／Motion bundle，依世界模擬與動作等專用模型記錄。Mercury 3 官方 API 發布為 **10/19**、Perplexity Decider v1.2 權重為 **10/16**，本次補錄來源與條件，發布時間不改記為本日。MiniMax 10/19 正文補取得 BankerToolBench／DeepSWE／OSWorld V2／ALE 數值，各項設定缺口隨來源保留。
