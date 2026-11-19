# 2026-11-19 benchmark 聯網查核

## 範圍與基準

- 比較基準是 2026-11-18 的聯網查核（[報告](2026-11-18-benchmark-update-check.md)）與既有產品 `sha256:ae37d32a1ed7a3c729b9c5234c379f3ffe8aad00e28d6c17e3a02070f8f796fa`（commit `d0742142070db1f79942c9c753b21ab597a4afb4`，`generatedAt: 2026-11-18T09:24:00.849Z`）。
- 聯網擷取於 2026-11-18T23:28Z 前後（台灣時間 11/19 07:28）執行，涵蓋受追蹤廠商（`V` 62 個 URL）與主辦方／待查線索（`L` 55 個 URL），全部 117 個檔案的 SHA-256 與位元組長度已記錄；原始回應保存在 `artifacts/research/2026-11-19-benchmark-check/web/{V,L}/`。94 個內容有變動的檔案逐一判讀見 `web/discovery-notes.md`（agy，Gemini 4 Hydrogen High），結構化摘要見同名 [JSON](2026-11-19-benchmark-update-check.json)。
- 另抓取 Gemini 4 Neon 的官方公告、API 模型頁、model card 與評測方法頁（`web/neon/`）。
- 以 Playwright 實測各榜可見列數，執行 23 個 `@llm-bench/acquisition` materializer 指令與 `pnpm data:refresh-diff`（Codex，`gpt-6.2-sol`），結果見 `refresh/SUMMARY.md`。
- **14 個現役來源有實質更新**（AA、Scale SWE Atlas、FrontierCode、Surge 七榜、Epoch、Zapier、Vals，以及廠商來源的交叉核對紀錄），因此完成資料刷新、Gemini 4 Neon 身分登記、兩項擷取程式修正與完整 `pnpm data:release`，並撰寫 [刷新報告](../refresh/2026-11-19.md)。

## 各廠商新模型

- **Google Gemini 4 Neon（`google-gemini-4-neon`）**：Google 於 2026-11-18 發布 [Introducing Gemini 4 Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)。[API 模型頁](https://ai.google.dev/gemini-api/docs/models/gemini-4-neon) 列出 model code `gemini-4-neon`（Stable）、1,048,576 token context、thinking 檔位 `low`／`medium`／`high`／`xhigh`（公告稱預設為 `high`）；定價頁為 `$3`／`$15` 每百萬 token，快取輸入 `$0.15`，不提供免費層。
  - 首日即出現在 11 個現役來源：AA（4 個 effort，Intelligence Index v5.0.1：Xhigh `61.40`，全站第 3）、FrontierCode 2.0（4 個 effort，antigravity-cli）、Zapier AutomationBench（4 個 effort，XHigh `56.32%` 第 1）、Vals（14 科，`xhigh`）與 Surge 七榜（High reasoning）。
  - **Vals 的模型代號**：Vals 的 [Gemini 4 Neon 模型頁](https://www.vals.ai/models/google_gemini-4-neon) 標題與 h1 都是「Gemini 4 Neon」，頁面卡片與資料使用 model key `google/cobalt-c-high-1p00`；Vals Index `70.873%` 與 Google 公告引用的「70.9%」一致。依此把該 key 加為 Neon 的精確 alias。
  - **廠商自報成績（公告，非現役來源）**：AA Coding Agent Index `58.6`、Terminal-Bench 4.1 `65.2%`、FrontierCode 2.0 `46.2%`（high）、Agents' Last Exam v1.1 `75.8%`、Vending-Bench 2 `$16,843`、Terminal-Bench Science `70.5%`、RiemannBench `84.0%`、HLE-Diamond `71.3%`、Chartography `73.5%`、AutoBaxBench hard `76%`、WebExploitBench v1.2 `51.26%`、SEC-bench Pro `90.5%`。ALE 官方榜今日尚無 Neon（41 列不變），公告的 Chartography `73.5%` 與 Surge 今日顯示的 `86.6%` 不同（見下節）。
- **Genie 4**（Google DeepMind 部落格「Genie 4 is now available」）：世界模型，不在文字／推理模型追蹤範圍。
- **K2 Horizon 32B／K2 Horizon MoVA 36B A4B**：AA changelog 11/18 新增評測（Intelligence Index `14`），無官方身分證據，維持未對應。
- **MAI Code 2／MAI Code 2 Flash**：只見於 BenchLM 首頁的「Microsoft · Nov 17, 2026」條目，未見於現役來源，列為待查線索。
- **其餘追蹤廠商**：Anthropic 11/18 新聞為 IPO 定價，無新模型；OpenAI 新聞列表 11/18 六則皆非新模型；DeepSeek 定價頁改為不再對模型呼叫時觸發的伺服器端搜尋計費；Hugging Face 14 個追蹤帳號無新 repo。

## 現役來源

| 來源                   | 實測可見數／解析情形                                                                                                        | 相對基準變化                                                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AA                     | catalog 758 → 763                                                                                                           | **有變動**：Gemini 4 Neon 42 分數、8 成本；GPT-6.2 Astra Max 補 1 分數；未對應的 K2 Horizon 系列 30 分數；移除未對應的 Olmo 3.1 32B Think 6 列、Molmo2-8B 5 列                                              |
| Scale SWE Atlas        | Overall 29 → 31                                                                                                             | **有變動**：GPT-6.2 Sol `60.48`、GPT-6.2 Astra `60.46`。頁面改版使方法說明移入 iframe，擷取程式已修正（見刷新報告）                                                                                         |
| FrontierCode           | Best 34 → 35、All 135 → 139；前 10 名 10/10 相符                                                                            | **有變動**：Gemini 4 Neon × 4 effort 分數與成本                                                                                                                                                             |
| Surge Chartography     | 42 → 41                                                                                                                     | **有變動**：上游整榜重算。22 個留榜模型分數全部改變（多數大幅上升，例如 Claude Opus 5 `27.3 → 84.4`、GPT 6 Astra `71 → 88.6`），新增 19 列（含 Neon、GPT-6.2、Fable 5.2）、移除 20 列；頁面無版本或方法說明 |
| Surge 其餘五榜         | ComplexConstraints 16 → 25、Riemann 21 → 28、Finance 40 → 49、Healthcare 38 → 49、Tax 16 → 25、GDP.xlsx 20 → 35             | **有變動**：Neon、GPT-6.2、Fable 5.2、Gemini 4 Carbon／Hydrogen 等補上成績；CoreCraft 55 列不變                                                                                                             |
| Epoch                  | hub 顯示 429 個模型、99 項 benchmark                                                                                        | **有變動**：Gemini 4 Hydrogen xhigh 新增 4 項計入成績（`benchmarks.csv` 共 12 列）；其餘 ID 變動為列號重排                                                                                                  |
| Zapier                 | 預設 10 列、展開 151 列                                                                                                     | **有變動**：Gemini 4 Neon × 4 effort；既有列依名次重新編號，數值不變                                                                                                                                        |
| Vals                   | 解析 61/66 頁                                                                                                               | **有變動**：Gemini 4 Neon 14 科與成本；Inkling 2 Small 2 筆；新 benchmark `autoform_hard` 等列入候選但未納入計分                                                                                            |
| OpenAI／Anthropic 發布 | 廠商頁不變                                                                                                                  | 數值不變。Cursor 官方榜於 11/18 由 CursorBench 4.0 升到 4.1，交叉核對改以最後一份審核過的 4.0 擷取為準（見刷新報告）                                                                                        |
| 其餘 9 個              | LiveBench 2.0 38／1.0 65、DeepSWE 28、MaxxBench 17、FrontierSWE、ARC Prize 124、ALE 41 組、BioBasicsBench、Google／xAI 發布 | 無語意變動                                                                                                                                                                                                  |

## 新 benchmark／版本與待查線索

以下都是新出現的 benchmark 或指數，是否收錄屬使用者決定的計分政策，本次未納入：

- **Surge DAYJOB: Law**：長時程法律代理任務（合約審閱、盡職調查、研究備忘錄等）。前 3 名 GPT 6.2 Astra (Max) `41.4%`、GPT 6 Astra (Max) `36.6%`、GPT 6.2 Sol (Max) `32.7%`；Gemini 4 Neon (High) 第 7（`26.2%`）。與現役的 DAYJOB Finance／Healthcare／Tax 同系列。
- **Surge Tuesday@Work Index**：原「Tuesday Work Index」改名，為 Surge 各榜的綜合指數；Neon (High) `71.6` 第 1。屬綜合指數，依既有政策不以綜合指數代替個別成績。
- **Vals Autoform-Hard**：以 Lean 4 形式化研究級數學，8 個模型受測，前 3 名 GPT-6.2 Astra、Claude Fable 5.2、GPT-6.2 Sol；ProofBench v1.1 移入封存。
- **CursorBench 4.1**：Cursor 官方榜 11/18 更新（「Modified instruction following problems」「Increased agent time limit」），頁面已無 4.0 結果檢視。現役資料的 CursorBench 成績來自廠商公告的 4.0 圖表。
- **Fireworks Specialized Intelligence Index（非現役）**：新增 `Qwen 4 Max`（FrontierMemory 並列第 1 `73.3%`）與 GPT-6.2 Astra／Sol 多項成績；TaxCalcBench 既有模型重評分。
- **Epoch `benchmarks.csv`（非現役欄位）**：Gemini 4 Hydrogen xhigh 新增 FrontierMath Tier 1–3 v2 `0.881`、Tier 4 v2 `0.878`、SpireClimb 等 12 列。
- **ARC Prize**：可見表格由 125 列減為 124 列，移除 `Mercury 3 Preview (Instant)` 單獨列；該模型仍在 JSON 中，現役快照無變化。

## 證據與覆蓋限制

- **HTTP 異常**：`openai.com/index/` 對 HTTP 客戶端回 403；`ai.meta.com/blog/` 回 400；Perplexity WANDR 文章回 403；LiveBench 舊 bundle `main.8a7822ea.js` 回 404。`openai.com/news/` 與 `benchlm.ai` 今日回 200（前日 403／500），無法與前日逐字比對，只摘要今日內容。
- **Vals**：66 頁中 `cyber_offense`、`inference_provider`、`mental-health`、`rsi_index`、`vals_router_index` 5 頁無法取得，與前日相同。
- **AA API**：`/api/v2/data/llms/models` 持續回 HTTP 410，以頁面管線與 `pnpm data:release` 驗證為準。
- **Codex 暫存工作區**：Codex 在研究目錄的暫存工作區執行 materializer，新證據檔原本寫在 `artifacts/research/2026-11-19-benchmark-check/refresh/workspace/artifacts/sha256/`。已將 156 個檔案逐一核對 SHA-256 後搬到標準的 `artifacts/sha256/`，並改寫 `data/sources` 與 `data/source-monitoring` 中的路徑。
