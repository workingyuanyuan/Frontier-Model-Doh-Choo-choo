# 2026-10-24 模型 Benchmark 聯網查核

與 [10 月 23 日保存資料](2026-10-23-benchmark-update-check.md)比對，本次主要更新為 **Kimi K3.1 Pro 發布並進入 AA 前十、LiveBench 2.0 新增四個模型與一個預覽版，以及 Vals 新增 Legal Index**。來源於台北 10/24 下午 14:35–14:41 唯讀擷取；逐來源判定、原始檔 SHA-256 見 [查核 JSON](2026-10-24-benchmark-update-check.json)，原始檔在 `artifacts/research/2026-10-24-benchmark-check/`。

## Kimi K3.1 Pro

[官方公告](https://www.kimi.com/en/blog/kimi-k3-1-pro)：「Kimi K3.1 Pro is a post-trained version of Kimi K3, with substantially larger post-training compute.」API 名稱為 `kimi-k3.1-pro` 與 `kimi-k3.1-pro-highspeed`，後者是速度 2–3 倍的另一個產品。公告寫明「Full model weights will be released by Nov 4, 2026」，頁面沒有發布日期；AA 與 Epoch 都記為 2026-10-23。

| 來源                                                                   | 名稱          | 數值                                                       |
| ---------------------------------------------------------------------- | ------------- | ---------------------------------------------------------- |
| [AA 模型頁](https://artificialanalysis.ai/models/kimi-k3-1-pro)        | Kimi K3.1 Pro | Intelligence Index **55.09**（AA 第 4 名）                 |
| [LiveBench 2.0](https://livebench.ai/#/)                               | Kimi K3.1 Pro | Long Agentic **49.5**、Reasoning **91.1**、Coding **81.8** |
| [Epoch](https://epoch.ai/data/benchmark_data.zip) `model_metadata.csv` | Kimi K3.1 Pro | 新增 high／low／max／unknown 四個 metadata 列，尚無成績    |

除 AA 與 LiveBench 外，Vals、Surge、Zapier、ARC、DeepSWE、FrontierCode 都還沒有它的成績。

## LiveBench 2.0

- 主榜仍是 `20261014`，畫面 **49 → 53 列**。新增 `deepseek-v4-flash`（登錄名稱「DeepSeek V4 Flash 0731」）、`nemotron-super-vl-3.5-nvfp4`、`smaug-nemotron-3.5-nvfp4` 與 `kimi-k3.1-pro`。categories 未變；1.0 凍結 release 逐位元相同（啟用 Include finetunes 後 65 列）。
- 隱藏的預覽版 **`20261023`** 只在 `https://livebench.ai/new` 載入（bundle：`/^\/new…$/.test(pathname)?[...Yt,"20261023"]:Yt`），30 列。它的 `categories.json` 新增 `_overall_weights`：Long Agentic **2.0**、Coding **1.5**、Design **1.5**，其餘 ×1，Overall 改為加權平均。Long Agentic 與 Browser 也重新給分，例如 Claude Fable 5.1 的 Long Agentic **80.8 → 77.9**、Browser **100.0 → 89.8**；Claude Opus 5.5 的 Long Agentic **85.0 → 72.8**。
- 本專案不使用 LiveBench Overall，權重本身不影響計分。但 2.0 materializer 會把 `_overall_weights` 當成未審核的 category 而停止；預覽版成為主榜時，需要先調整 adapter，並依「benchmark 改版跟隨新版」處理重新給分。

## Vals

目錄 **58 → 60 頁**：

- [Legal Index](https://www.vals.ai/benchmarks/legal_index)（10/23 發布）：`Legal_Index = 0.978 × Lines + 0.022 × TaxAgentBench`，Lines 是以 2022 年美國律所營收加權的各執業領域分數，每領域取 Legal Research Bench 與 HLAB 的平均。這是既有測試的聚合指數。
- `inference_provider`：比較推論供應商，不是比較模型，沒有 BenchmarkView 資料。

抽查 9 個既有頁面，資料 JSON 的 hash 檔名都沒變。

## 其他現役來源

| 來源                                   | 判定                     | 依據                                                                                                            |
| -------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Epoch AI                               | 位元組有變，成績沒變     | ZIP 2,356,801 → 2,356,851 B；只有國家欄位順序互換與上述 Kimi metadata 列                                        |
| Zapier AutomationBench                 | 頁面重新發布，資料沒變   | 註記「Published Oct 23, 11:06 PM UTC」，表格 module 改名，內容只差 import 名稱                                  |
| DeepSWE、FrontierCode、ARC、Surge 七榜 | 沒變                     | 資料檔 SHA-256 與已存 artifact 相同                                                                             |
| FrontierSWE                            | 頁面有變，仍不符 adapter | coverage matrix 22 組，三張榜各 21 組；Claude Sonnet 5.5 + proximus 有 170 graded trials、61.9%，卻不在任何榜上 |
| 四個官方發布頁                         | 無法判斷                 | 動態產生的 HTML，便宜的探測方式分辨不出內容是否變動                                                             |

## AA 目錄

- `/models` 顯示「27 of 709 models」（10/23 為 707），Intelligence Index 版本仍為 v4.3.2。
- AA API（`/api/v2/data/llms/models`）以新設定的金鑰回應 HTTP 200，709 列；Kimi K3.1 Pro 為 55.1，與頁面一致。
- HealthBench Professional 已不在 AA 評測目錄中；本專案快照沒有它的成績。

## 查核範圍與證據

本次以唯讀方式探測各現役來源（`data/mappings/sources.json`），比較資料檔 hash、列數與頁面日期，並以無頭瀏覽器核對 AA 與 LiveBench 的畫面列數。現役來源的變化已在同日匯入，結果見 [刷新審核報告](../refresh/2026-10-24.md)。
