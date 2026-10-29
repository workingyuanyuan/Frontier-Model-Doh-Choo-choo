# 2026-10-29 模型 Benchmark 聯網查核

本次以 `7a1564f82e62b1ca1a613e6995c1e57201ce2b98`、產品 `sha256:404b473ef8ad025d573e793a3963f16316b183122c03eea15754b1bc6d570d34` 為匯入前基準；已包含今天稍早核准的 Terminal-Bench 4.0、AutomationBench-AA 暫緩及 Gemini 4 Carbon 身分。與 [10/28 查核](2026-10-28-benchmark-update-check.md)比較上游消息時，另區分今天稍早已整合的內容。工作目錄起始乾淨，原始擷取始於台北 10/29 08:57。資料更新的版本、分數、驗證與抽查見[同日刷新報告的第二次查核](../refresh/2026-10-29.md#第二次查核carbon-取得第二個獨立組織成績)。

**主要影響：Zapier 新增 Carbon 三個 effort，Carbon 因此具備 Vals 與 Zapier 兩個獨立組織的成績，進入前沿集合。預設共同測試由 20 項降為 12 項，Muse Spark 1.3 退出前十。** Carbon 缺七項 LiveBench 2.0；AA-LCR 本身已有成績，但理解維度失去 LiveBench Data Analysis 後，無限制測試只剩 GDP.pdf 一項，未達受限測試的搭配門檻，因而再移除 AA-LCR。

## 現役來源

17 個現役排行榜來源均經正式 adapter 即時擷取成功；四個模型發布頁來源由官方公告、目錄、文章及模型卡研究補充查核。逐欄差異、原始回應 SHA-256 與來源時間保存在[同名 JSON](2026-10-29-benchmark-update-check.json)及 `artifacts/research/2026-10-29-benchmark-check/`。

| 來源                                                    | 本次核對與變化                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Zapier AutomationBench](https://zapier.com/benchmarks) | 榜單 126→129 列。新增 Gemini 4 Carbon High **53.88%／$2.12**、Medium **52.97%／$1.65**、Low **31.51%／$1.02**（每任務）。依模型、effort、版本比對，其餘 126 列成績及 125 筆成本均相同；來源 ID 含 rank，順位平移不是成績異動。                                                                                                                   |
| [FrontierSWE V2](https://www.frontierswe.com/)          | 先前 leaderboard 與 coverage 不一致已消失，這次核對成功。20→23 列，新增 Carbon **61.2% mean@5**、Muse Spark 1.3、Claude Haiku 5.5；既有 20 列不變。仍限手動比較；Carbon 的前沿資格依據是 Vals、Zapier。                                                                                                                                          |
| [FrontierCode](https://cognition.com/frontiercode)      | 2.0 Best **24**、All **95**，JSON-LD／export Top 10 符合 10/10，hiddenModels 為空。Mistral Large 4 的三個 effort 及成本自 2.0 移除（原 25／98）；既有 45 列 candidate、45 筆成本的 harness 從 chisel 改標 devin-cli，數值不變。1.1 export 另移除 Mistral Large 4 Preview 兩列，連同先前 Terra 五列共七列依現行保留規則保存，141 列及成本均維持。 |
| Artificial Analysis                                     | `/models` 實測 **28 of 716**；各評測取得 215 個 active profiles、2,568 candidates、77 列 v5.0 Index。與起始已整合版本逐欄相同。                                                                                                                                                                                                                  |
| LiveBench                                               | 2.0 主榜 **31** 列，1.0 Include finetunes **65** 列；501 candidates、144 costs 僅匯出網址的 cache-buster 更新。                                                                                                                                                                                                                                  |
| DeepSWE                                                 | 全選後 **28** models、70 configurations、68 costs，內容相同。                                                                                                                                                                                                                                                                                    |
| Surge                                                   | 主榜 Chartography **42**、Complex Constraints **44**、CoreCraft **50**、Riemann **44**、Finance **38**、Healthcare **38**、Tax **16**、GDP.xlsx **20**，逐列相同。                                                                                                                                                                               |
| Epoch、ARC、Vals                                        | candidates／costs 與起始版本相同。Vals 62 個 slugs、57 個可解析頁；Immigration 已由今天稍早刷新保存為未核准證據。CyberOffense 在目錄可見，但現有 adapter 無法解析該頁，不宣稱已匯入。                                                                                                                                                            |

內容未變的來源保存本次擷取及比較證據，工作區沿用既有正式快照日期；新增資料匯入 FrontierCode、FrontierSWE、Zapier。`materialize:effort-reports` 重產檔位揭露；全來源監測 `errorCount: 0`，66 個注意項包含既有未整合項與組態變化，不能解讀為 66 個新 benchmark。

## 新發現及待決定的採用項目

| 項目                                                                                                                              | 官方方法與現況                                                                                                                                                                                                                            | 採用前需決定／查明                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Vals Immigration Bench](https://www.vals.ai/benchmarks/immigration)                                                              | 更新日 10/28；519 專家題，最多五輪對話。Average Answer Accuracy 與 All-Pass 分開；裸模型與 web search 分開。GPT-6 Luna 模擬使用者、Sonnet 5 評分。Fable 5.1 75.44%、Opus 5.5 72.14%。今天稍早已擷取，非本次新匯入。                       | 主指標、工具條件、分類與品質政策；目前未核准計分。                                                                                                                                                    |
| [Vals CyberOffense](https://www.vals.ai/benchmarks/cyber_offense)                                                                 | 頁面標更新日 10/23，但 10/28 原始目錄沒有該 slug。七個模型、Nova／Lighthouse 兩場景、Pi agent；完成目標比例各占一半，隱藏標記檢驗，48 小時／五億 tokens 上限。                                                                            | 新來源頁解析、長時工具代理的計分口徑；頁面 GPT-6 Sol Daybreak 是 restricted-access cyber program，不能直接對應一般 Sol。                                                                              |
| [Scale DualChem](https://scale.com/blog/dualchem-evaluating-ai-models-dual-use-chemistry-risks)                                   | 10/28 公告；已讀完整 25 頁論文。600 題（485 選擇、115 自由回答），論文 §5.2／Table 4 為 **33 模型**。最高無工具全題 accuracy 為 GPT-5.6 Sol **67.3%**；排除拒答後為 **67.7%**，兩種分母不能混用。能力、拒答率、風險旗標及嚴重度判斷分開。 | 指標、工具條件、拒答分母、模型 checkpoint 與 effort 身分追溯；未直接採成一般能力分數。                                                                                                                |
| [Surge × Fireworks SII](https://surgehq.ai/blog/fireworks-specialized-intelligence-index) 的 DAYJOB Accounting／Data Science／Law | Surge 10/28 公告提及前兩項，Fireworks [官方 SII](https://fireworks.ai/specialized-intelligence-index)目錄與 API 另有 Law。各 15 模型，API last_updated 為 10/28，pass@1 at 95%；Surge 目錄沒有對應公開頁，SII 稱結果由 Surge 提前提供。   | 是否採用二級發布來源、原始方法／環境／effort、身份與主辦方後續公開核對。沒有昨日 SII 基準，不把第一次查到當成推出日。SII 對 Tax 仍稱尚未公開，與 Surge 已公開 50 環境頁衝突，不能用其註記覆蓋主辦方。 |

DualChem 原始文章及論文均已保存，摘要數量以論文表格為準。paper landing page 回 404，不影響已下載 PDF 的查核。以上新增政策依 [OPERATIONS](../OPERATIONS.md#2-刷新來源)交由使用者決定。

## 方法文字與 agent 組合

- [AA 方法](https://artificialanalysis.ai/methodology/intelligence-benchmarking)仍為 v5.0；文字澄清 HLE-Diamond 圖像題、GDP.pdf 頁面影像可傳給支援圖像的模型，並刪除 Terminal-Bench 2.1 仍屬 Coding Index 的舊句。未觀察到新權重或版本。
- [AA Copilot Fusion](https://artificialanalysis.ai/articles/github-copilot-fusion-orchestrates-anthropic-and-openai-models-to-balance-performance-and-cost)評估 Copilot CLI 跨 Anthropic／OpenAI 模型的動態編排。它是 agent 組合，不能當作單一模型新增身分。
- [Zapier 加入 SII 公告](https://zapier.com/blog/automationbench-on-specialized-intelligence-index/)描述 657 私有任務、47 模擬 apps、strict all-checks pass；未見新版方法。文章仍稱 Argon 領先，即時榜已出現 Carbon，排行依即時榜核對。
- Scale leaderboard 可見模型列替換，未完成各子榜逐列解析，保存為研究線索，未轉為可比較的一般能力分數。

## 模型發布與官方補充來源

- [Mistral Large 4 權重預告](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B)的 ETA 從 10/31 提前至 **10/29**，仍顯示 Upcoming release／Waiting for release。16 家 HF 組織各最近八個 repo 的 ID、createdAt 與昨天相同，尚不能宣稱權重已發布。
- [Carbon 官方公告](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)已整合身分；本次深入讀取 SEC-bench Pro 88.2%、ExploitGym 54.8%、CWE-bench 71.0%，方法明示 without guardrails，列入後續候選。TB4 cheating success 0.0%、attempt rate 0.4% 是安全行為指標。
- OpenAI changelog 10/28 的 API credits、Anthropic 10/28 的科學合作文章均未發現新文字模型。
- 第三方 DeepSeek V4.1 Flash Cyber 頁面描述為 abliterated Flash 1017、Inference.net 服務；DeepSeek 官方頁與 HF 目錄未見此 checkpoint，維持未驗證狀態。

### 官方成績補充候選清單

以下為此次已讀方法的既有文章／卡片；缺昨日同頁 bytes，不能宣稱今日改版。完整逐方法筆記見 `vendors/findings.md`，尚未完成全部比較列與主辦方重疊核對。

| 模型／官方連結                                                                             | 可補充項目與現有缺口                                                                                                                           | 狀態及後續條件                                       |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [Kimi K3.1 Pro](https://www.kimi.com/en/blog/kimi-k3-1-pro)                                | TB4 65.7% 採 Claude-Code；目前 Vals 63.64%，harness 不同。另有 TBS 0.1、SWE-Marathon 1.1、PostTrainBench 1.2；後者用 H20 代 H100、更換 judge。 | 已讀方法；須分辨引用／自跑列、工具與成本配對。       |
| [Opus 5.5 system card](https://www.anthropic.com/claude-opus-5-5-system-card)              | TB4 66.36% xhigh、max 64.8%，Claude Code --bare、五次／題及 safeguard fallback；TBS 0.1 max 58.7%。CursorBench 4.0 由 Cursor 執行。            | 已讀方法；需主辦方逐列與 effort／成本核對。          |
| [Sonnet 5.5 system card](https://www.anthropic.com/claude-sonnet-5-5-system-card)          | TB4 70.6% max，無外網／預快取、fallback；TBS 0.1 59.9%。                                                                                       | 已讀方法；環境與 Vals 不同，需主辦方重疊核對。       |
| [Fable 5.1 system card](https://www.anthropic.com/claude-fable-5-1-mythos-5-1-system-card) | 含 TB4、TBS、FrontierSWE、CritPT-Corrected；此卡 CursorBench 為 3.2.0。                                                                        | 已讀方法；與新卡 4.0 不可直接比較，須逐版本核對。    |
| [DeepSeek Flash 1017 card](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)    | TB4 42.3% Claude Code；DeepSWE 77.0% Mini-SWE-V2；AutomationBench 60.5%。                                                                      | 已讀方法；10/17 既有公告，逐列環境、分割與成本未齊。 |

## 證據與覆蓋限制

- `import-baseline/`：匯入前產品、mapping、來源與監測基準；`baseline.json` 記錄工作目錄、HEAD、起始狀態、SHA-256。
- `captured-snapshots/`、`refresh/`：17 站刷新 log、逐欄差異、保存快照清單、monitoring 與 release 紀錄。原始回應留在內容定址 artifact store。
- `rendered/`：AA、LiveBench、DeepSWE、FrontierCode、Surge 的渲染文字、列陣列、觀測時間；Zapier Carbon 三列與 FrontierSWE Carbon 截圖已目視核對。
- `benchmark-web/`：37 份原始回應、逐行差異、目錄差異、SII API、DualChem PDF／表格摘錄；`vendors/`：50 份原始檔、三份 manifests、模型卡與 16 家 HF 目錄比較。成功保存的 bytes 均回讀核對 SHA-256 與大小。
- OpenAI news／xAI news 為 403、MiniMax news 網路不可達；以可取得的 changelog、release notes、官方模型目錄與 HF 補充，不能宣稱讀過受阻頁。Meta 官方目錄顯示過舊，HF org 只涵蓋其開放權重。
- HF 僅比較每個組織最近八個 repo，benchmark 公告探索限定官方目錄及相關連結；不把此範圍外的未知狀態當作無更新。
