# 2026-10-19 模型 Benchmark 聯網查核

本次與 [10 月 18 日保存資料](2026-10-18-benchmark-update-check.md)比對。主要更新為 **LiveBench 2.0 納入 DeepSeek V4.1 Flash 1017、修訂四款既有模型成績，並遷移資料網址**；Artificial Analysis 有 Elo、成本及端點效能變動。來源時間、逐欄差異及證據雜湊見 [查核 JSON](2026-10-19-benchmark-update-check.json)，[可重跑核對 notebook](2026-10-19-benchmark-update-check.ipynb)含本次已執行的驗算與輸出。

## LiveBench 2.0

[當前官方 CSV](https://livebench.ai/data/20261014/table.csv)包含 48 個模型列，新增 `deepseek-v4.1-flash-1017`，`smaug-flash` 從此匯出移除。這個移除事件只建立當前榜單覆蓋變化。

| 模型                     | 10/18 Overall | 本次 Overall |
| ------------------------ | ------------: | -----------: |
| DeepSeek V4.1 Flash 1017 |             — |     **79.2** |
| DeepSeek V4.1 Flash      |          76.8 |     **78.0** |
| Muse Spark 1.2           |          61.8 |     **62.4** |
| Muse Spark 1.3           |          74.9 |     **74.8** |
| Grok 4.6                 |          74.6 |     **74.9** |

1017 的七個 suite 分數如下，Overall 由七項等權平均計算並顯示至一位小數。

| Long Agentic | Reasoning | Coding | Browser | Data Analysis | Research | Design |
| -----------: | --------: | -----: | ------: | ------------: | -------: | -----: |
|         50.9 |      89.1 |   96.0 |    76.0 |          79.5 |     79.5 |   83.4 |

既有 V4.1 Flash 的 Long Agentic 43.8→40.1、Coding 85.4→90.2、Browser 80→84、Research 85.3→86.8、Design 77→79.2。Muse Spark 1.2 的 Coding 80.6→78.2、Browser 29.4→36；Muse Spark 1.3 Browser 81→80；Grok 4.6 Reasoning 90.5→91.2、Data Analysis 73.9→75.3。這些是官方資料修訂；逐項修訂原因與完整 run manifest 尚缺。

[官方 notes](https://livebench.ai/data/20261014/notes.json)新增評分註記：任務無法測量，且重跑一次仍失敗時，記 **0 分**。公開前端將 base 與 1017 的 effort 都標為 **max**；完整 prompt、temperature、token budget 缺值。兩者的比較需保留 checkpoint 身分與這些設定限制。

資料根目錄改為 `https://livebench.ai/data/20261014/`，當前 bundle 為 `main.cc3fb0ac.js`、cache key 為 `1792349618`，頁面日期為 18 October 2026。五個舊根目錄匯出網址本次皆回傳 404。欄位 `long_horizon`→`long_agentic`、`design_layout`→`design`，本次先映射欄位再比對。帶 cache key 與裸 table CSV 位元組相同。

[成本 CSV](https://livebench.ai/data/20261014/cost.csv)由 47→48 列，新增 Beam 與 1017、移除 Smaug，46 個既有列改值；其中 43 列的 `nq_research` 為 25→22，10 款模型的每百萬 token 單價欄位有數值修訂。例如 base V4.1 Flash input/output 0.15/0.6→0.3/1.2，Nemotron 3.5 Super VL 0.15/0.5→0.225/0.575（美元）。這些數值是 LiveBench 本次採用的成本參數；供應商實際調價日期及端點需要另外證據。

[breakdown](https://livebench.ai/data/20261014/breakdown.json)共 107 個路徑差異。Data Analysis 子 task counts 為 47/52/51→1/1/1，Reasoning 為 52/50/50/50→1/1/1/1，而 cost 總樣本數仍為 150／202。這些欄位需各自保留；子項 metadata 的 1 無法直接解讀為 suite 只評測三題或四題。採集分數、成本、樣本數與 notes 時應使用同一版本。

## Artificial Analysis

[AA 模型資料](https://artificialanalysis.ai/models)的兩個配置有評分修訂：

| 模型          | 評測                          |      10/18 → 本次 |
| ------------- | ----------------------------- | ----------------: |
| Kimi K3 max   | GDPval-AA v2.1 Elo            | 1533.13 → 1532.59 |
| Kimi K3 max   | AA-Briefcase v1.1 Overall Elo | 1499.80 → 1499.38 |
| GLM-5.3-Flash | AA-Briefcase v1.1 Overall Elo | 1453.00 → 1452.63 |

相應 analytical quality、presentation 及信賴區間也有變動，完整欄位保存在 JSON。[AA-Briefcase 方法](https://artificialanalysis.ai/evaluations/aa-briefcase)以 pairwise judging 與 rubric 組合出 Elo；小幅 Elo 修訂本身無法證明模型重新執行或能力退步。

DeepSeek V4.1 Flash max 的 **Intelligence Index 每題成本為 $0.265225→$0.485662**，其中 cache read 成本 0.058423→0.053925、cache write 0.096641→0.321577；整套原始總成本為 $476.8904→$677.3733。兩個成本指標的權重不同，分別保存。其 token 單價、canonical token counts 與答題分數保持相同，成本分配變動集中在快取部分；官方本次修訂的具體原因尚缺。

同列 `performanceDataSource` 從 `firstParty: DeepSeek` 改為 `median`，`hostModelCount` 為 27→26；output speed 175.8526→227.8287 tokens/s、TTFT 1.2344→0.9153 秒、估算 time per index task 361.8151→296.6629 秒。比較時必須保留資料來源的改變。[AA 方法](https://artificialanalysis.ai/methodology/intelligence-benchmarking)使用持續測量的代表性快取命中率計算成本；[端點效能方法](https://artificialanalysis.ai/methodology/performance-benchmarking)亦有獨立的測量窗口。此筆模型資料沒有將身分改為 1017。

本次核對主頁 27 配置、五個詳頁內重疊的比較資料（聯集 197 個 profile ID）、Decision Index 13 決策模型及其對照列。主頁有 25 配置的成本／效能／評分欄位變動，廣泛的效能測量修訂已逐欄保存；Intelligence Index v4.3.2 與主要答題指標另行核對。

## Epoch AI 與其他榜單

[Epoch 官方 ZIP](https://epoch.ai/data/benchmark_data.zip)的六份 CSV 共九列變動，全部為 Country 清單順序：GPQA Diamond、Video MME、BoolQ、GSM8K、HellaSwag 各一列，model metadata 四列。國家集合相同，ZIP 仍含 92 個成員。

[ECI](https://epoch.ai/eci)的 277 模型、2987 輸入，三份獨立匯出及 ZIP 的四份 ECI／bootstrap 檔均已比對。[FrontierMath v2](https://epoch.ai/benchmarks/frontiermath-tiers-1-3-v2)的 120／76 列與 [Chess](https://epoch.ai/benchmarks/chess-puzzles)153 列亦已核對。本次差異限上述 metadata，分數及方法比較結果列於 JSON。

| 來源                                                                                                                                                               | 核對範圍                                                      | 本次數值差異                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------- |
| [Vals](https://www.vals.ai/benchmarks)                                                                                                                             | 51 頁、49 一般 JSON、3238 overall／20392 task 列              | 0；包含分數、成本、配置、metadata           |
| [ARC Prize](https://arcprize.org/leaderboard)                                                                                                                      | 1179 raw／1178 unique 評測、347 raw／344 唯一 model IDs       | 0                                           |
| [FrontierCode](https://cognition.com/data/frontiercode-leaderboard/data.json)                                                                                      | v1.1 的 136 model-effort 配置與 272 subset records，另比較 v1 | 0                                           |
| [DeepSWE](https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json)／[FrontierSWE](https://www.frontierswe.com/)／[Zapier](https://zapier.com/benchmarks) | 70／21／126 列                                                | 0                                           |
| [Surge](https://surgehq.ai/benchmarks)／sudo                                                                                                                       | 八榜，另含方法頁共十頁                                        | 僅網站發布時間、chunk URL 與 integrity 變動 |

ARC 模型資料的完整 record 去重為 345，但模型 ID 去重為 344；比較模型身分時使用 ID，保留原始重複列以避免誤報新增。RSI／SAFE 自訂模組本次補存，10/18 的歷史模組位元組未保留，相關歷史比對限頁面與雜湊引用。Surge 外部圖檔未全量獨立下載。查核只涵蓋擷取時點的公開資料。

## Nemotron 3.5 Parse 專用模型與回歸評分

[官方模型卡](https://huggingface.co/nvidia/Nemotron-3.5-Parse)本文日期為 10/17，HF 首次 release commit 時間為台北 **10/18 10:52:38**；台北 **10/19 02:00:22** 的 commit 更新 quick20／full500 回歸評分。這是約 0.631B 的文件 OCR／layout parser。

[官方版本化回歸說明](https://huggingface.co/nvidia/Nemotron-3.5-Parse/blob/05c823083e588ce58fa320f8471cdd3e1906ea91/reference/parse_3_5/README.md)以相同 raw predictions，比較歷史 raw parsing 與 v3 的 Table-body HTML 轉換：Full500 Overall **70.17→74.49**，Table quality **70.41→83.38**，Layout class F1 **66.10→66.10**。這組差異歸於解析及評分相容性修正。

設定為 500 頁（250 表格／250 圖片）、H100 80GB、BF16、one-token MTP、concurrency 128、temperature 0；保留 19 個 token-capped 與兩個 malformed-table 輸出。Pillow 版本與 pin 有明示差異。這是 `layout_lite` 輕量回歸，與主模型卡的 ParseBench triple-pass union **75.20** 使用不同定義；相關主 validation 檔在前後 commit 相同。

模型發布搜尋涵蓋主要官方域名與九個官方 HF org 的近期列表；部分來源有 403、網路失敗、404 與最新十筆截斷限制。來源與具體範圍保存在 JSON，發布日以卡本文和 commit 明示資訊分開記錄。
