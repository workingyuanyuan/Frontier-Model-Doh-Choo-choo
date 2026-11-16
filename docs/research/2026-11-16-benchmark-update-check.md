# 2026-11-16 benchmark 聯網查核

## 範圍與基準

- 比較基準是 2026-11-14 的聯網查核（[報告](2026-11-14-benchmark-update-check.md)）與已提交產品 `sha256:48fb9c7975b92fcd1d53729a124b053d6c3e859321cf3ef2dbea7df36d7afffd`（commit `c90900b38c216b0bbc4f07be51a4808729a468d4`，`generatedAt: 2026-11-15T13:35:14.745Z`）。
- 聯網擷取於 2026-11-15T23:41Z–23:49Z（台灣時間 2026-11-16 07:41–07:49）執行，涵蓋受追蹤廠商（`V` 62 個 URL，全部 SHA-256 與位元組長度已核對）與主辦方／待查線索（`L` 55 個 URL，全部 SHA-256 與位元組長度已核對），原始回應保存在 `artifacts/research/2026-11-16-benchmark-check/web/{V,L}/`，結構化摘要見同名 [JSON](2026-11-16-benchmark-update-check.json)。
- 同時使用 Playwright 實測各主要與 Surge 榜單的可見母體列數（`artifacts/research/2026-11-16-benchmark-check/rendered/`），並以全部 22 個 `@llm-bench/acquisition` materializer 指令試跑驗證（全數退出碼 0），逐欄比對全部 24 個現役來源的 10,437 筆候選成績與 5,128 筆成本紀錄。
- 依 [OPERATIONS](../OPERATIONS.md#每日-benchmark-查核的兩份文件)，由於全部 24 個現役來源皆無資料變動，僅更新聯網查核紀錄，不重跑 `pnpm data:release` 產生純時間戳差異的產品版本；工作區保留既有來源快照與 `pnpm data:verify-fresh` 通過狀態。

## 各廠商新模型

- **11/14 以後沒有新的文字或推理模型**：Anthropic、OpenAI、Google、Meta、xAI、DeepSeek、Moonshot、Mistral、MiniMax、Zhipu、Thinking Machines、LG、Agnes 在官方模型目錄、價目與 Hugging Face（14 個追蹤帳號最新 8 個 repo）皆無新文字／推理模型、checkpoint 或 API ID。
- **Alibaba（Qwen）補充觀察**：網頁檢索顯示 Alibaba 於 2026-11-11 推出限時專有預覽版 **`Qwen4-Max-Preview`**（2026-11-11～11-25 於阿里雲百煉／Token Plan 提供、1M context，未開源權重）；Hugging Face `Qwen` 帳號最新 8 個 repo 仍未新增（最新為 2026-10-09 的 `Qwen-Image-2.1-Turbo`），目前 24 個現役來源亦尚未收錄 `Qwen4-Max-Preview`。
- **OpenAI**：`openai.com/news/` 今日成功擷取（HTTP 200），11/15 新增「Our new blog for science」與「A step toward defining the Standard Model on a lattice」兩篇科學部落格文章，無新模型；`platform.openai.com/docs/models` 模型 ID 集合與 11/14 相同。
- **Anthropic**：`anthropic.com/news` 頁面日期更新至 November 15, 2026，正文無新模型（最新仍為 11/09 的 Claude Fable 5.2／Mythos 5.2）；模型總覽與價目頁面模型 ID 與 11/14 相同。
- **Meta**：`ai.meta.com/blog/` 以 HTTP 客戶端請求回傳 400，改以 Playwright 實測載入（HTTP 200），最新文章仍為 2026-07-27；Hugging Face `facebook` 帳號新增視覺模型 `facebook/stereo_crossinjection`，無新語言模型。
- **xAI（SpaceXSI）**：`x.ai/news` 今日成功擷取（HTTP 200），最新貼文仍為 2026-11-02「Introducing Grok Bot 1.0」；`docs.x.ai/docs/models` 模型 ID 集合與 11/14 相同。

## 現役來源

全部 24 個現役來源經 Playwright 可見母體核對及 22 個 materializer 全量比對（對比基準 `c90900b3`），**分數、成本、模型身分、benchmark 版本與收錄狀態皆無任何語意變動**：

| 來源            | 實測可見數／解析情形                                                                                                                                                         | 相對基準變化 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| AA              | `/models` 741 個 profile（可見 27）；抓取 224 頁明細；3,240 候選分數、362 成本；AA-Briefcase 維持 28 筆現場＋165 筆保留                                                      | 無變動       |
| LiveBench       | 2.0 主榜 35 列；1.0（Include finetunes）65 列；529 分數、154 成本                                                                                                            | 無變動       |
| DeepSWE         | Select all 28 列；70 分數、68 成本                                                                                                                                           | 無變動       |
| MaxxBench       | 主榜 17 列（內嵌 18 設定）；17 分數、17 成本；11/14 已匯入 `DeepSeek V4.1 Flash 1017` 與 `Claude Haiku 5.5`                                                                  | 無變動       |
| Scale SWE Atlas | Overall 分頁 28 列；28 分數                                                                                                                                                  | 無變動       |
| FrontierCode    | 2.0 Best 32 列、All 125 列、JSON-LD Top 10 10/10 相符、無隱藏模型；266 分數、266 成本                                                                                        | 無變動       |
| Surge 八榜      | Chartography 42、ComplexConstraints 16、CoreCraft 55、Riemann 21、DayJob Finance 40、DayJob Healthcare 38、DayJob Tax 16、GDP.xlsx 20                                        | 無變動       |
| Vals            | 發現 65 頁、成功解析 60 頁（`cyber_offense`、`inference_provider`、`mental-health`、`rsi_index`、`vals_router_index` 仍無可解析資料）；3,601 分數、3,450 成本                | 無變動       |
| 其餘來源        | FrontierSWE（25）、Epoch AI（1,494）、ARC Prize（300／300）、Zapier（137／136）、BioBasicsBench（37）、廠商發布（OpenAI 207／207、Anthropic 125／125、Google 1、xAI 44／43） | 無變動       |

## 新 benchmark／版本與待查線索

- **Epoch `benchmarks.csv`（非現役任務）**：`benchmarks.csv`（SHA-256 `27c3639a...` → `3e047c07...`）總列數維持 9,791 列（1,892 筆 run），僅外部任務 `SpireClimb (Slay the Spire 2, Ascension 10)` 調整兩筆紀錄：`claude-fable-5-2_max` 的 `steambench-sts2-a10-e3d333f8e00365f8-partial`（0.17568）定稿為 `steambench-sts2-a10-24ea6d93d1eae707`（0.17333），`claude-opus-5-5_max` 更新 run ID（維持 0.06667）。不屬 `epoch-ai` 來源採用的 direct / ECI 快照範圍。
- **Fireworks Specialized Intelligence Index & BenchLM（非現役來源）**：`fireworks.ai/specialized-intelligence-index/api/index.json`（SHA-256 `e3da71d0...` → `b25308f3...`）與 `benchlm.ai`（SHA-256 `fe34ea85...` → `3989c303...`）皆更新競技場對戰數與勝率／Elo，未納入現役來源。
- **其餘待查線索無變化**：Scale 主目錄（16 個榜單連結無增減）、`VIALS-AA`、`Terminal-Bench-Science`（首頁與 README 與 11/14 逐位元組相同）、`WANDR`（README 逐位元組相同）、`Into the Unknown`（README 逐位元組相同）、`Vals`（`benchmarks` 與 `news` 逐位元組相同）。

## 證據與覆蓋限制

- **HTTP 異常或超時**：`https://openai.com/index/` 與 `https://www.perplexity.ai/hub/blog/wandr-benchmark-evaluating-research-agents-that-must-search-wide-and-deep` 回傳 HTTP 403；`https://ai.meta.com/blog/` 直接請求回傳 HTTP 400（已改用 Playwright 實測取得 HTTP 200 正文）；`https://qwen.ai/blog` 於 Playwright 45 秒 `domcontentloaded` 逾時，改以搜尋結果與 Hugging Face `Qwen` 組織補充核對。
- **AA API**：`/api/v2/data/llms/models` 仍回傳 HTTP 410，以頁面管線驗證通過。
- **無母體數指令**：FrontierSWE、Epoch、ARC Prize、Zapier 與 Vals 的刷新指令不接受母體數參數。

## 獨立複核

查核由 Antigravity（Gemini 4 Hydrogen）執行，另由 Claude Code 複核：

- 從證據庫匯出本次刷新的 21 個來源快照，與 commit `c90900b3` 逐欄比對 `candidates.json`／`costs.json`：沒有新增、移除或數值變動的列，差異只有擷取時間與 Evidence 引用，與上述「無變動」一致。
- 以同一批快照執行 `pnpm data:check-replay`：21 個可重播來源的成績與成本差異為 0。
- 查核當時以 `git checkout` 還原來源快照而未重新登記證據庫，事後已補跑 `pnpm evidence init`（`verification.ok: true`）。此後改用 `pnpm data:discard-refresh`（見 [OPERATIONS](../OPERATIONS.md#每日-benchmark-查核的兩份文件)）。
