# 2026-11-17 benchmark 聯網查核

## 範圍與基準

- 比較基準是 2026-11-16 的聯網查核（[報告](2026-11-16-benchmark-update-check.md)）與既有產品 `sha256:48fb9c7975b92fcd1d53729a124b053d6c3e859321cf3ef2dbea7df36d7afffd`（commit `dd622dfc41e3000702bd883c4c2e41fea605f15d`，`generatedAt: 2026-11-15T13:35:14.745Z`）。
- 聯網擷取於 2026-11-17T04:35Z–04:41Z（台灣時間 2026-11-17 12:35–12:41）執行，涵蓋受追蹤廠商（`V` 62 個 URL，全部 SHA-256 與位元組長度已核對）與主辦方／待查線索（`L` 55 個 URL，全部 SHA-256 與位元組長度已核對），原始回應保存在 `artifacts/research/2026-11-17-benchmark-check/web/{V,L}/`，結構化摘要見同名 [JSON](2026-11-17-benchmark-update-check.json)。另補抓阿里雲 Model Studio 官方 `models` 與 `model-pricing` 頁面驗證 `qwen4-max` 身分與定價。
- 同時使用 Playwright 實測各主要、Scale SWE Atlas 與 Surge 八榜的可見母體列數（`artifacts/research/2026-11-17-benchmark-check/rendered/`），並執行全部 22 個 `@llm-bench/acquisition` materializer 指令及 `pnpm data:refresh-diff`。
- **由於 6 個現役來源發生實質更新**（`artificial-analysis`、`livebench`、`vals-ai`、`scale-swe-atlas`、`frontier-swe`、`arc-prize`），依 [OPERATIONS](../OPERATIONS.md#每日-benchmark-查核的兩份文件) 完成資料刷新、`scale-swe-atlas` 版面標籤適配、`alibaba-qwen4-max` 身分登記、完整 `pnpm data:release` 驗證，並撰寫 [刷新報告](../refresh/2026-11-17.md)。

## 各廠商新模型

- **Alibaba（`Qwen4 Max`，`alibaba-qwen4-max`）**：繼 2026-11-11～11-25 限時 Token Plan 預覽版 `qwen4-max-preview` 後，阿里雲百煉（Model Studio）已正式推出通用版 **`qwen4-max`**（2.4T MoE／約 71B active、1M context、原生支援思考模式與視覺理解；[模型文件](https://help.aliyun.com/zh/model-studio/models)、[定價文件](https://help.aliyun.com/zh/model-studio/model-pricing) 北京／全球輸入 10 元、輸出 30 元／百萬 Token，新加坡國際 10.938 元／32.813 元）。今日同步登上 Artificial Analysis（`releaseDate: 2026-11-16`，Intelligence Index v5.0.1 = `42.89`）、LiveBench 2.0（`qwen4-max` 7 科）與 Vals AI（`alibaba/qwen4-max` 10 科含 Vals Index `63.197`）。已依官方證據於 `data/mappings/models.json` 建立 `alibaba-qwen4-max`；`qwen4-max-preview` 不混淆併入。
- **其餘追蹤廠商無新文字／推理模型**：
  - **OpenAI**：`openai.com/news/` 於 11/16 新增科學、安全與醫療合作文章，模型文件列表僅新增 `CSAM classifier` 分類器條目，無新語言模型。
  - **Google DeepMind**：`introducing-gemini-4-hydrogen/` 於 11/16 補上 Safety and Security Report 連結，無新模型。
  - **Anthropic**：11/16 僅於 release notes 新增舊款 4.5/4.6 浮水印公告，無新模型（最新仍為 11/09 的 Claude Fable 5.2／Mythos 5.2）。
  - **Meta / xAI / DeepSeek / Moonshot / Mistral / MiniMax / Zhipu / Thinking Machines / LG / Agnes**：Hugging Face 14 個追蹤帳號最新 8 個 repo 與官方部落格／模型目錄皆無新文字或推理模型。`ai.meta.com/blog/` 對 HTTP 客戶端仍回傳 400，改以 Playwright 實測取得 HTTP 200，最新文章仍為 2026-07-27。

## 現役來源

全部 24 個現役來源經 Playwright 可見母體實測、materializer 匯入與 `pnpm data:refresh-diff` 核對，**6 個來源有資料變動、18 個來源無語意變動**：

| 來源            | 實測可見數／解析情形                                                                                                                                                           | 相對基準變化                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| AA              | `/models` 742 個 profile（可見 27，+1）；抓取 225 頁明細；3,283 候選分數（+57/-14）、367 成本（+5）；AA-Briefcase 29 現場＋165 保留                                            | **有變動**：新增 `Qwen4 Max`（12 分數、2 成本）與 4 筆未對應舊模型，移除 `K2 Think V2` 等 14 列    |
| LiveBench       | 2.0 主榜 36 列（+1）；1.0（Include finetunes）65 列；536 分數（+7）、156 成本（+2）；JS bundle 換為 `main.f14f89ca.js`                                                         | **有變動**：2.0 新增 `qwen4-max` 7 科成績與 2 筆成本                                               |
| Vals            | 發現 65 頁、解析 60 頁；3,617 分數（+16）、3,466 成本（+16）                                                                                                                   | **有變動**：新增 `alibaba/qwen4-max` 10 科與 10 成本，ClaimBench 新增 6 筆 `decision/*` 並更新日期 |
| Scale SWE Atlas | Overall 分頁 29 列（+1）；29 分數；上游將 `variants[0].label` 由 `SWE Atlas - Overall` 改為 `Overall`，並將分數／信賴區間顯示改為兩位小數                                      | **有變動**：新增 `Beam 1.0`（34.72），既有模型分數改以兩位小數發布（如 Fable 5.2 80.5 -> 80.55）   |
| FrontierSWE     | 全頁 26 列（+1）；26 分數                                                                                                                                                      | **有變動**：新增 `Inkling 2 Small`（proximus 25.0518%）                                            |
| ARC Prize       | `v2_Semi_Private` 304 分數（+4）、304 成本（+4）                                                                                                                               | **有變動**：新增 `Inception Mercury 3 Preview` 四個 effort 檔位                                    |
| 其餘 18 個來源  | DeepSWE（28 列／70）、FrontierCode（32 Best / 125 All / 10/10 JSON-LD）、MaxxBench（17）、Surge 八榜（42/16/55/21/40/38/16/20）、Epoch（1,494）、Zapier（137／136）、Bio／廠商 | 無實質變動（僅擷取時間與 Evidence SHA 更新）                                                       |

## 新 benchmark／版本與待查線索

- **Scale 主目錄（`scale.com/leaderboard`）**：新增 `Gemini 4 Hydrogen (mini-swe-agent) high`（`69.10 ± 3.50`）於主排行榜。
- **ARC Prize `v3_Semi_Private`（非現役任務）**：`evaluations.json` 新增 `thinky-inkling-2-small-xhigh`（`0.297%`）與 `thinky-inkling-2-small-xhigh-provider-adapter`（`2.55%`）以及 `inception-mercury-3-preview-high`；現行 `arc-prize` 僅收錄 `v2_Semi_Private`。
- **Epoch `benchmarks.csv`（非現役欄位）**：維持 1,891 筆 run（1,892 行），僅更新 `Reference`、`Notability criteria`、`Parameters`、`Domain` 與 `Training compute cost` 等中繼欄位，無新成績或分數更動；`epoch-ai` 採用的 `benchmark_data.zip` / `eci_scores.csv` 數值不變。
- **BenchLM（非現役來源）**：更新競技場統計並於跑馬燈列出 Qwen4 Max 發布；`Fireworks Specialized Intelligence Index` 與 11/16 完全相同。

## 證據與覆蓋限制

- **HTTP 異常與重導向**：`https://ai.meta.com/blog/` 對 Python `urllib` 回傳 400（Playwright 實測 HTTP 200）；`https://www.perplexity.ai/hub/blog/wandr-benchmark-evaluating-research-agents-that-must-search-wide-and-deep` 回傳 403；`https://livebench.ai/static/js/main.8a7822ea.js` 因上游更新 bundle 為 `main.f14f89ca.js` 回傳 404（已補抓新版 bundle 至 `L/raw/livebench-main.js`）。
- **AA API**：`/api/v2/data/llms/models` 持續回傳 HTTP 410，由頁面管線擷取並經 `pnpm data:release` 證據與靜態站檢查驗證通過。
