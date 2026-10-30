# 2026-10-30 模型 Benchmark 聯網查核

本次以 `639d8c533d359b14ec68f0b5323d4361b234f660`、產品 `sha256:b66847921adc9575cf04b759a8d8a729189780cb40f26226d84e5c6f8ffe0b77` 為匯入前基準，和 [10/29 查核](2026-10-29-benchmark-update-check.md)比較。分工如下：

- **來源刷新與語意差異**：Codex（gpt-6.1-sol）執行。
- **上游消息探索**：agy（Gemini 4 Argon）執行，原文見 `artifacts/research/2026-10-30-benchmark-check/benchmark-web/agy-discovery.md`。
- **抽查與重點核實**：主代理負責；Mistral 公告由主代理親自下載核對。

資料更新的版本、分數與抽查見[同日刷新報告](../refresh/2026-10-30.md)，逐來源計數與 SHA-256 見[同名 JSON](2026-10-30-benchmark-update-check.json)。

**主要消息：Mistral Large 4（“Le Chonk”）於 10/29 正式發布並開放權重**，AA、LiveBench、Vals、FrontierCode 同日都有成績。它的 AA v5 Index 是 26（High），不影響前沿集合。預設集合唯一的分數變化，是 Carbon 的 FrontierCode 2.0 改採 Cognition 主辦方成績。

## 現役來源

18 個線上刷新都成功，渲染計數與逐欄差異見刷新報告 §3。重點：

| 來源                                               | 本次變化                                                                                                                                                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [FrontierCode](https://cognition.com/frontiercode) | 2.0 主榜 24 → 26、All 95 → 101。新增 Gemini 4 Carbon（devin-cli）medium 40.00%、high 37.48%、low 31.88%，以及 Mistral Large 4（vibe）high 19.65%、medium 8.78%、low 9.50%。1.1 不變。                                                    |
| Artificial Analysis                                | `/models` 716 → 718。10/29 changelog 新增 Mistral Large 4 (High) Index 26、(Medium) 23，原 Preview 列改名為 Mistral Large 4 Preview。Kimi K3 (Low)、Qwen3.8 27B (Low／Medium) 等進入 v5 Index；九個模型 GDPval-AA 微幅重算。方法頁不變。 |
| LiveBench                                          | 2.0 31 → 32 列，新增 `mistral-large-4-0`（high）：Coding 95.4、Reasoning 85.2、Research 79.7、Data Analysis 76.6、Design 76.3、Long Agentic 27、Browser 17.4。                                                                           |
| [Vals](https://www.vals.ai/news)                   | 10/29 公告評測 Mistral Large 4 OSS（high）於十項 benchmark，例如 Vals Index 56.42%、Terminal-Bench 4.0 26.26%。另有八張卡片只更新顯示日期，資料未變。                                                                                    |
| Epoch                                              | ECI 新增 GPT-6.1 Terra 168.05、DeepSeek V4.1 Flash 1017 158.65、Beam 1.0 150.17，IRT 重配造成 242 筆既有 ECI 微調。個別 benchmark CSV 不變。                                                                                             |
| 其餘                                               | DeepSWE、FrontierSWE、Surge 八榜、ARC、Zapier 內容不變。Surge 部落格把 SII 文章標題改為 “Six Surge Benchmarks Join the Fireworks Specialized Intelligence Index”，內文未變。                                                             |

全來源監測沒有新增注意項（66 → 66）。

## 模型發布

- **Mistral Large 4（[官方公告](https://mistral.ai/news/mistral-large-4-oss/)，`datePublished` 2026-10-29T12:00:07Z）**：Mistral Ecosystem Open-Weight License 開放權重，API 名稱 `mistral-large-4`。依 agy 摘錄，它是 MoE 架構，總參數約 1T、每 token 活躍約 49B，context 1M，effort 有 low／medium／high 三段。主代理核對公告頁，確認 FrontierCode 2.0 圖表值 19.7%，與 Cognition 榜的 high 19.65% 相符。公告另列 AA Index 26、BrowseComp 84.5% 等自報成績，未逐項核對。
  - 10/29 的「權重 ETA」線索因此結案。
  - 目前尚無模型身分；處理方式見刷新報告 §5。
- **InclusionAI `Ling-3.0-flash-Sante-fp8`**：HF 新出現的醫療專用 FP8 量化 checkpoint，不是前沿通用模型，不追蹤。
- **其他追蹤廠商**：OpenAI、Anthropic、Google、Meta、xAI、DeepSeek、Moonshot、Qwen、MiniMax、Zhipu 均未見新模型。agy 回報 16 個 HF 組織中有 14 個的最近八個 repo 與 10/29 相同，但未保存今日回應與比對雜湊，此項相同與否為 unknown。

## 10/29 待查線索

| 線索                                     | 今日狀態                                                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Vals Immigration Bench                   | 不變：Vals 刷新快照中既有成績無改值（`refresh/semantic-diff.json`）。仍未核准計分，採用與否由使用者決定。 |
| Vals CyberOffense                        | agy 回報資料不變、僅新增圖表切換；現有 parser 仍無法解析，未保存比對證據（unknown）。                     |
| Scale DualChem                           | agy 回報文章與 PDF 與 10/29 相同、landing page 仍 404；未保存今日回應雜湊（unknown）。                    |
| Surge × Fireworks SII DAYJOB 三榜        | agy 回報 SII API `last_updated` 仍為 2026-10-28，Surge 目錄仍無這三榜頁面；未保存比對證據（unknown）。    |
| Mistral Large 4 權重                     | **已發布**（見上節）。                                                                                    |
| DeepSeek V4.1 Flash Cyber                | agy 回報仍只見於第三方 llmgateway.io，DeepSeek 官方頁與 HF 未提及；維持未驗證。                           |
| 廠商模型卡補充候選（Kimi、Anthropic 等） | agy 回報八份頁面或檔案未變，未保存比對證據（unknown）。Mistral Large 4 公告成為新的候選。                 |

## 證據與覆蓋限制

- `artifacts/research/2026-10-30-benchmark-check/`：
  - `refresh/`：各來源 log、`summary.md`、`semantic-changes.md`、`semantic-diff.json`、`unresolved.md`、監測比較、`independent-review.md`。
  - `rendered/`：渲染計數與截圖。
  - `benchmark-web/agy-discovery.md`：agy 探索報告。
  - `vendors/mistral-large-4-oss.html`：主代理下載的公告原文。
- 受阻頁面：OpenAI news、xAI news 回 403，改查 changelog、模型目錄與 HF；Scale DualChem landing page 與 `gpt-6.1-terra-pro` 模型頁回 404，與 10/29 相同。MiniMax news 今日可連線。
- **agy 的「與 10/29 相同」結論都沒有保存今日原始回應與 SHA-256**，本文一律標為 agy 回報、相同與否為 unknown；它們不影響本次匯入的資料。agy 摘錄的數字中，主代理只親自核對了 Mistral 公告的發布時間與 FrontierCode 19.7%。其餘有寫入資料的數字，已由刷新快照與抽查代理另行核對；只出現在本文、沒有進入資料的數字，均標為引用。
- HF 僅比較各組織最近八個 repo；公告探索限定官方目錄與相關連結，不把此範圍外的未知狀態當作「沒有更新」。
