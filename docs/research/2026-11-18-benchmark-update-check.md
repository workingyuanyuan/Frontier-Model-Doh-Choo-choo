# 2026-11-18 benchmark 聯網查核

## 範圍與基準

- 比較基準是 2026-11-17 的聯網查核（[報告](2026-11-17-benchmark-update-check.md)）與既有產品 `sha256:511a7966411490db7c9747a52ac0a69ff25229e73cdc97ffa5efd14aa140767b`（commit `bfe702b0c6b4e7de33aa8ca1e38cd8ca569377d6`，`generatedAt: 2026-11-18T03:50:28.060Z`）。
- 聯網擷取於 2026-11-18T04:45Z 前後（台灣時間 12:45）執行，涵蓋受追蹤廠商（`V` 62 個 URL）與主辦方／待查線索（`L` 55 個 URL），全部 117 個檔案的 SHA-256 與位元組長度已核對；原始回應保存在 `artifacts/research/2026-11-18-benchmark-check/web/{V,L}/`，逐檔差異判讀見 `web/discovery-notes.md`，結構化摘要見同名 [JSON](2026-11-18-benchmark-update-check.json)。
- 另補抓 OpenAI 官方模型頁 `platform.openai.com/docs/models/gpt-6.2-astra`、`gpt-6.2-sol` 與定價頁，並以 Playwright 擷取 `openai.com/news/` 與 `openai.com/index/astra-law-6-2/`（`openai.com` 對一般 HTTP 客戶端回 403）。
- 以 Playwright 實測各主要、Scale SWE Atlas 與 Surge 八榜的可見母體列數（`rendered/`），執行全部 22 個 `@llm-bench/acquisition` materializer 指令與 `pnpm data:refresh-diff`。
- **8 個現役來源有實質更新**（`artificial-analysis`、`livebench`、`frontier-code`、`frontier-swe`、`epoch-ai`、`arc-prize`、`zapier-automationbench`、`vals-ai`），因此完成資料刷新、GPT-6.2 身分登記、一項建置程式修正與完整 `pnpm data:release`，並撰寫 [刷新報告](../refresh/2026-11-18.md)。

## 各廠商新模型

- **OpenAI GPT-6.2 Astra（`openai-gpt-6-2-astra`）與 GPT-6.2 Sol（`openai-gpt-6-2-sol`）**：OpenAI 新聞列表於 2026-11-17 刊出「Introducing GPT-6.2 Astra and Sol」與 System Card。官方模型頁列出 API ID `gpt-6.2-astra`（旗艦，`$8`／`$40` 每百萬 token，快取輸入 `$0.40`，1.05M context，知識截止 2026-05-18）與 `gpt-6.2-sol`（`$2`／`$10`，快取輸入 `$0.10`，知識截止 2026-06-01）；兩者皆拒絕 `reasoning effort = none`。模型總覽改以 GPT-6.2 Astra 為「not sure where to start」的首選。公告正文頁 `introducing-gpt-6-2-astra-sol/` 兩次 Playwright 擷取皆顯示 `500 Internal Server Error`，發布日期取自新聞列表。
  - 首日即出現在 7 個現役來源：AA（5 個 effort，Intelligence Index v5.0.1：Astra Max `62.14`、Sol Max `57.26`）、LiveBench 2.0（各 7 科）、FrontierCode 2.0（各 5 個 effort）、Epoch（Astra，ECI `174.17` 為全站第一）、ARC Prize `v2_Semi_Private`（各 5 個 effort）、Vals AI（各 15 科）、Zapier AutomationBench（各 5 個 effort）。
- **OpenAI Astra for Law 6.2（不登記為模型）**：官方文章 [Astra for Law leads in legal intelligence](https://openai.com/index/astra-law-6-2/)（2026-11-17）明言它是「a model configuration of GPT‑6.2 Astra」，加上擴充的法律搜尋索引與指令，僅透過 ChatGPT Enterprise 的 Trusted Access 提供。它既不是獨立模型，也不等於純 GPT-6.2 Astra（有工具與檢索加成），因此 AA 的 `Astra for Law 6.2 (Max)` 與 Vals 的 `openai/gpt-6.2-astra-law` 維持未對應。AA 未公布其 Intelligence Index，不影響前沿資格。
- **其餘追蹤廠商無新文字／推理模型**：
  - **Anthropic**：11/17 release notes 僅新增 Linked billing beta，無新模型。
  - **Google**：`build-with-hydrogen` 頁的相關文章出現 `EmbeddingGemma 2` 技術報告（嵌入模型，非追蹤範圍）；其他頁面僅版本戳記變動。
  - **xAI / Meta / DeepSeek / Moonshot / Mistral / MiniMax / Zhipu / Thinking Machines / LG / Agnes**：Hugging Face 14 個追蹤帳號的最新 repo 清單無新 ID；官方頁面只有建置雜湊、日期或導覽列變動。`ai.meta.com/blog/` 仍對 HTTP 客戶端回 400。

## 現役來源

全部 24 個現役來源經可見母體實測、materializer 匯入與 `pnpm data:refresh-diff` 核對，**8 個來源有資料變動、16 個來源無語意變動**：

| 來源           | 實測可見數／解析情形                                                                                                    | 相對基準變化                                                                                                                                                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AA             | `/models` catalog 758（+16）；候選 3,295 → 3,403、成本 367 → 389                                                        | **有變動**：GPT-6.2 Astra／Sol 各 46 分數、10 成本；新增未對應 `A.X-K2`、`Inkling Small (High)`；既有模型補上 `critpt-v2`、`aa-briefcase` 等新成績；部分列的 `contextWindowTokens` 中繼資料在 null／1M 間互換（分數不變）；移除未對應的 `Command A+`、`EXAONE 4.5 33B (Reasoning)`、`Step 5 Preview` |
| LiveBench      | 2.0 主榜 38 列（+2）；1.0 65 列                                                                                         | **有變動**：新增 `gpt-6.2-astra`、`gpt-6.2-sol` 各 7 科與 2 筆成本                                                                                                                                                                                                                                   |
| FrontierCode   | Best 34（+2）／All 135（+10）；前 10 名 10/10 相符                                                                      | **有變動**：GPT-6.2 Astra／Sol × 5 effort（codex harness）分數與成本                                                                                                                                                                                                                                 |
| FrontierSWE    | 26 列                                                                                                                   | **有變動**：`Gemini 4 Hydrogen` `53.0654 → 53.1130`、`Inkling 2 Small` `25.0518 → 25.0696`（上游重算 mean reward）                                                                                                                                                                                   |
| Epoch          | 1,494 → 1,499 候選                                                                                                      | **有變動**：新增 GPT-6.2 Astra 5 列（ECI、GPQA Diamond、AIME、SimpleQA Verified、Chess Puzzles）；240 筆 ECI（已排除、不計分）隨新模型重新估計；其餘 ID 變動為列號重排                                                                                                                               |
| ARC Prize      | `v2_Semi_Private` 304 → 314 候選、304 → 314 成本                                                                        | **有變動**：GPT-6.2 Astra／Sol × 5 effort                                                                                                                                                                                                                                                            |
| Zapier         | 137 → 147 候選、136 → 146 成本                                                                                          | **有變動**：GPT-6.2 Astra／Sol × 5 effort；既有列依名次重新編號，數值不變                                                                                                                                                                                                                            |
| Vals           | 解析 60/65 頁；3,617 → 3,663 候選、3,466 → 3,512 成本                                                                   | **有變動**：GPT-6.2 Astra／Sol 各 15 科；`openai/gpt-6.2-astra-law`、`decision/d1.2(-ultra)`、`tencent/hy4-flash` 未對應；`robo-bench`（已排除）新增 3 個既有模型成績                                                                                                                                |
| 其餘 16 個來源 | DeepSWE 28、MaxxBench 17、Scale SWE Atlas 29、Surge 八榜（42/16/55/21/40/38/16/20）、BioBasicsBench 與 4 個廠商發布來源 | 無實質變動（僅擷取時間與 Evidence SHA 更新）                                                                                                                                                                                                                                                         |

## 新 benchmark／版本與待查線索

- **Epoch `benchmarks.csv`（非現役欄位）**：新增 14 筆 `GPT-6.2 Astra (max)` 成績（FrontierMath Tier 1–3 v2 `0.926`、Tier 4 v2 `1.0`、FrontierMath Erdős `0.103`、MirrorCode `0.678`、SpireClimb 等）；`epoch.ai/benchmarks` 顯示 top ECI 改為 GPT-6.2 Astra。現役 `epoch-ai` 只採用其中 GPQA Diamond、AIME、SimpleQA Verified、Chess Puzzles 與 ECI。
- **Artificial Analysis**：changelog 新增 `JoyAI-VL-Preview`、`LFM3-1.7B`、`LFM3-VL-2B`、`Inkling (High)`、`Inkling Small (High)` 與 `Astra for Law 6.2 (Max)` 的評測；其 releases 目錄把 `GPT-6 Astra` 與 `GPT-6.1 Sol` 標為 `deprecated`。本專案的模型目錄不讀取 AA 的 deprecated 旗標，兩者照常參與前沿排名。
- **Vals AI**：各指數模型數更新（as of 2026-11-16），新聞頁新增「GPT-6.2 Astra is #1 on the Vals Science Index」與「GPT-6.2 Sol scores 66.06% on the Vals Index」。
- **Fireworks Specialized Intelligence Index（非現役）**：新增 `MiniMax M3.1 Flash` 18 項成績，Enterprise Tool Use 與 Big Finance 補上 Gemini 4 Carbon／Hydrogen。
- **Scale 主目錄（非現役）**：AudioMultiChallenge 第 2 名由 `salesforce-launa-omni-1` 更名為 `salesforce-sov-omni-1`。
- **Hugging Face VIALS**：資料集描述改題為「ATLAS - Visual Life Sciences (VIALS)」。

## 證據與覆蓋限制

- **HTTP 異常**：`https://openai.com/news/` 與 `https://openai.com/index/` 對 Python `urllib` 回 403（以 Playwright 取得 HTTP 200）；`https://ai.meta.com/blog/` 回 400；`https://benchlm.ai` 回 500；Perplexity WANDR 文章回 403；LiveBench 舊 bundle `main.8a7822ea.js` 回 404（上游已換為 `main.cb056455.js`）。
- **CSR 外殼**：`ai.google.dev` 的模型與定價頁、Gemini 4 Hydrogen 文件頁擷取到的是用戶端渲染外殼，內容變化無法由這些檔案判定。
- **Vals**：65 頁中 `cyber_offense`、`inference_provider`、`mental-health`、`rsi_index`、`vals_router_index` 5 頁無法取得，與前日相同。
- **AA API**：`/api/v2/data/llms/models` 持續回 HTTP 410，以頁面管線與 `pnpm data:release` 驗證為準。
- **Codex**：`gpt-6.2-sol` 尚未開放給 ChatGPT 帳號的 Codex CLI，本次刷新改由 `gpt-6.1-sol` 執行。
