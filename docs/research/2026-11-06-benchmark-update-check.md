# 2026-11-06 模型 Benchmark 聯網查核

以 commit `2d26ea50edee5b0c2404c98d870600a6e26abc53`、產品 `sha256:b6d438eeb8adbae2bd548a4aac426419cddc290086626b47477a2ee57444e583` 為匯入前基準，與 [11/05 紀錄](2026-11-05-benchmark-update-check.md) 比較。來源欄位、版本、時間、SHA-256 及原始回應 manifest 見 [JSON](2026-11-06-benchmark-update-check.json)。本次原始資料保存於 `artifacts/research/2026-11-06-benchmark-check/`。

本次完成 21 個現役來源查核與物化，採原廠證據新增 Inkling 2 Small、DeepSeek V4.1 Flash 1017、Beam 1.0 三個獨立模型身分並重建全部受影響來源。AA 新增六個 Index 配置與部分直接測試，FrontierCode 新增 Kimi K3.1 Pro 三組主辦方成績與成本，Surge／Vals 新增 Inkling 2 Small 等覆蓋。另完成 GPT-6 Cyber 官方發布與方法候選查核。完整逐欄差異、版本、來源時間與產品影響分列於研究與刷新報告。

完整來源物化、產品差異、release 與獨立代理抽查見 [刷新報告](../refresh/2026-11-06.md)。

本次以 11/05 真實保存的 raw bytes 為比較基準，觀測時間為 **2026-11-06 00:16:16–00:24:07 UTC（台北 08:16:16–08:24:07）**。230 個前日唯一 URL 全部重新請求並保存回應；沿官方連結追加 41 個 URL，共 271 個唯一 URL 嘗試、270 份保存回應：200＝258、404＝6、403＝4、401＝2，另 1 個傳輸錯誤。270 份回應及可比對的 baseline 檔案都已重新讀取，SHA-256、byte count 全部符合 manifests。完整性明細（`artifacts/research/2026-11-06-benchmark-check/web/integrity.json`）；web manifest（`artifacts/research/2026-11-06-benchmark-check/web/manifest.json`）；vendor manifest（`artifacts/research/2026-11-06-benchmark-check/vendors/manifest.json`）。HTTP 錯誤頁也是保存回應，不能作為該頁內容證據。

## 今日確認的變化

**Inkling 2 Small：11/05 原廠發布，今日取得完整 model card。** [官方公告](https://thinkingmachines.ai/news/inkling-2-small/)與[model card](https://thinkingmachines.ai/model-card/inkling-2-small/)明示 594B total／17B active、文字與圖片輸入、1M context，原生 effort 0.99（xhigh）、temperature 1.0、最大 trajectory 1M tokens。發布時經 Tinker／Playground 提供，完整 Apache-2.0 權重計畫下週公開；尚不能稱今日已公開權重。OpenCode 的 Fledge-Alpha 指早期 checkpoint，不把它當成最終版相同身分。父流程已依官方證據採用 canonical thinking-machines-inkling-2-small／provider thinking-machines。

Model card 外部歸功 AA 的 16 列，已逐列與今日 AA 精確值核對，全部符合顯示位數四捨五入，階段為 **row-verified**，見逐列核對（`artifacts/research/2026-11-06-benchmark-check/vendors/inkling2-row-crosschecks.json`）。例如 TB4 13.1%、Hard CritPt v2 35.0%、HLE Diamond 28.7%、GDP-PDF 25.2%、AA harness FrontierCode 2.0 25.4%。這是與 AA 公開結果的交叉確認；未證明廠商獨立重測，也不等同 Cognition harness。各列採用角色依來源原記錄判定，AA 不一律視為 organizer。Card 的 ComplexConstraints 表格標 v1.0、文字引用 v1.1，版本仍待解。PMPP-Hard 為改編 69 任務、每題四次 10 小時嘗試，AUC 494.27 task-hours、mean 54.25/69 與 pass@4 64/69 是不同指標。各列 paired task cost 不完整。

**AA full catalog score objects 279→282，新增三個 profile**：[Inkling 2 Small](https://artificialanalysis.ai/models/inkling-2-small)、[Tencent Hy4](https://artificialanalysis.ai/models/tencent-hy4)、[Muse Wonder High](https://artificialanalysis.ai/models/muse-wonder-high)，Index 分別 30.628678、34.555239、40.526608。這個母體是 catalog 內有 score objects 的模型，不是整站全部模型，也不是來源 parser 的 detail currentModels 聯集。完整 catalog 中 182 個既有 objects 有欄位差異：outputSpeed／兩項 TTFT 各 165、Briefcase 120、Index time/task 86；另 Index 2、FrontierCode 3、TB Science 3、Hard CritPt 2、HLE Diamond 2 等。它們包含效能測量、顯示標籤與補齊成績，詳見逐欄 before/after（`artifacts/research/2026-11-06-benchmark-check/web/aa-model-row-diff.json`）。來源新增列、保留列及產品影響由 refresh 報告另計，不以這 182 個 objects 推算。

[AA 11/05 Nanbeige 文章](https://artificialanalysis.ai/articles/nanbeige-has-released-nanbeige4-3-33b-scoring-20-on-the-intelligence-index)為新文章，描述既有 Nanbeige4.3-33B 的 Index 20 與 terminal／knowledge 差異。文章日期不能填成模型 releaseDate；原廠 releaseDate 仍未證實。AA 比較文的 DeepSeek 552B 敘述不能取代 DeepSeek 官方 763B metadata。AA Index v5.0.1／CritPt 重評及 Performance v3 已在昨日方法查核中記錄，不重列成今日發布。

**GPT-6 Cyber：11/05 新官方模型，研究候選。** [官方 API 模型頁](https://developers.openai.com/api/docs/models/gpt-6-cyber)及[完整 system card](https://deploymentsafety.openai.com/gpt-6-cyber)／[18 頁 PDF](https://deploymentsafety.openai.com/gpt-6-cyber/gpt-6-cyber.pdf)均保存 200；原始 [release 頁](https://openai.com/index/introducing-gpt-6-cyber/)直接抓取為 403（web 閱讀可見），不得把 403 body 當公告正文。精確 ID gpt-6-cyber，由 Astra 額外 cyber RL specialization；Daybreak Red 有另外申請條件。API 短 context 價格為 input/output/cached input/cache write **20/100/2/25 USD／M tokens**，1.05M context、128K max output。這是 token 價格，不是 benchmark task cost。

已讀 system card 方法：SECBench Pro pass@1 87.02%、SREBench pass@1（全六目標）92.84%、ExploitGym intended exploit 48.45%、Hardened 36.94%、Expert SWE 82.95%。報告使用最高測試 reasoning budget，未提供足夠證據把它寫成某個 API effort label；逐 benchmark 的 exact harness／attempt／paired cost 仍有缺口。ExploitBench 100% 是 ACE normalized mean，另有歷史 contamination 風險；Irregular 的更新 protocol／版本不直接比舊 card。Release 的 RemoteExploitBench 95% 目前僅 located，捕獲 PDF 中沒有該方法段，保留待查。

**Visa Agentic Commerce Benchmark：11/05 新 benchmark，method-read。** [官方新聞](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.22936.html)、[benchmark 正文](https://www.visapaymentsfrontier.io/articles/agentic-commerce-benchmark/agentic-commerce-benchmark.html)與[完整 18 頁 paper](https://www.visapaymentsfrontier.io/articles/agentic-commerce-benchmark/assets/visa-agentic-commerce-benchmark-whitepaper.pdf)皆保存 200；paper 封面為 October 2026，須區分 public launch 日期。首批 22 模型、12 labs、15 episodes、每題 3 runs＝45 trials／模型，overall success 57.2%。所有模型同一固定模擬市場、harness、customer model；正確購買或拒絕還必須問出全部必要隱藏條件。Deterministic answer key 加雙次 LLM wording checks，有歧異由人審。pass^k 要求抽取的 k 次全部成功，不是 pass@k。

Tool budget／格式修復失敗／沒有決定算失敗；provider/network error 重跑並排除，另 9 次未公告 session/output limit 的 runs 被替換。Cost 為 provider token run cost，成功一次的成本另計；latency 包含模擬客戶。只測 checkout 前選擇，未含付款或履約。精確模型 snapshot、effort、逐列成本與 episode-pool version 尚待 dashboard 結構化核對，新 benchmark 採用政策留待主流程判斷。裸網域連線重設不影響已保存的 www 正式正文與 PDF。

**Surge 11/05 Nemotron training report**：[官方報告](https://surgehq.ai/blog/nvidia-nemotron-3-5-super-training-report)是四個不同 LoRA checkpoints，以 Tinker 訓練，不能把 fine-tune 結果貼回基礎 Nemotron 3.5 Super VL。十二個 benchmark 的 same-setting base/fine-tune 對照有資訊，但未找到精確公開 adapter repo IDs。GDP-PDF 12.4→31.0 是 +18.6 points；headline 範圍 4.5–18.6 與正文 4.5–12.8 不一致，保留原值與限制。

## 舊模型的正式身分補證

[DeepSeek 10/17 正式公告](https://api-docs.deepseek.com/news/news261017/)與[官方 repo](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)支持 DeepSeek-V4.1-Flash-1017，releaseDate **2026-10-17**；只使用精確 1017 suffix，不包含 generic Flash、NVFP4 或 Cyber。[Reflection 10/16 公開權重公告](https://reflection.ai/blog/beam-is-available)、[Beam model card](https://reflection.ai/beam-model-card)與[官方 repo](https://huggingface.co/reflection/Beam-1.0-501B-A23B)支持 Beam 1.0；10/5 是較早測試介紹，公開發布為 **2026-10-16**。BF16／FP8／NVFP4 是不同配置，DFlash2 亦另列。這兩個舊 release 加今日 Inkling 已由父流程完成精確 catalog 身分整合，證據、hash、aliases 見 new-model-identities（`artifacts/research/2026-11-06-benchmark-check/vendors/new-model-identities.json`）。

[Ripple-65B-Preview 原廠頁](https://www.ricursive.com/ripple)及[官方 card](https://huggingface.co/ricursiveAI/Ripple-65B-Preview)支持 65B dense、12T pretraining、Apache-2.0、最多 1M context 的 BF16 instruct checkpoint。ReleaseDate 尚無明確官方日期，保持 null。Card 的 SWE-bench Pro v2 hard 79.1%、DeepSWE 1.1 44.3%、TB2.1 80.52%、SciCode 39.4%、AutomationBench public 36.4% 已讀，須區分 Terminus2／OpenCode／InspectAI 與內部重測 comparators；未核對 organizer row、attempts 或 paired cost。Base Preview、NVFP4、DFlash2 不互作別名。

[North Mini Code 原廠公告](https://cohere.com/blog/north-mini-code)JSON-LD datePublished 為 **2026-06-09**，配合[官方 card](https://huggingface.co/CohereLabs/North-Mini-Code-1.0)支持精確舊 checkpoint。AA 聯集此次多抓到它的列，不代表今日發布；現階段是歷史發布／新增 coverage 的研究候選，官方 aliases 尚未整合；2026-06-09 仍在本次 catalog 的 12 個月窗口內。[Gemini Omni 1.2 Flash](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemini-omni-1-2-flash/)為影片生成模型；15 秒 clip、720p $0.07／second 不能當一般 LLM token／task 成本。

## 來源母體與方法比較

- 官方 catalog route sets：[AA](https://artificialanalysis.ai/evaluations) **38→38**、[Vals](https://www.vals.ai/benchmarks) **62→62**、[Surge](https://surgehq.ai/benchmarks) **13→13**、[Scale](https://scale.com/leaderboard) **20→20**；路徑集合沒有增減。精確集合（`artifacts/research/2026-11-06-benchmark-check/web/catalog-diff.json`）只證明這四個捕獲 catalog 的範圍，不證明全網沒有新 benchmark。
- [SII](https://fireworks.ai/specialized-intelligence-index/)資料 **67→67 records**，objects 全相同，last_updated 均為 11/04；昨日所述 board 變動不是今天新變化。見 sii-diff（`artifacts/research/2026-11-06-benchmark-check/web/sii-diff.json`）。
- Epoch active CSV **1827→1827**，以 id_runs 比較為新增 8、移除 8、既有 44 列 metadata 改變：42 列 benchmarks/runs、1 country、1 comments；既有列沒有 retained score 欄改變。新增／替換多為 SpireClimb 各 profile runs；不能只看總列數判定無變化。見 run 逐欄比較（`artifacts/research/2026-11-06-benchmark-check/web/epoch-active-run-diff.json`）。
- Epoch ZIP 的 **ECI 253→253 模型列，任何欄位改變 0，point estimate eci 改變 0**；這兩個分母及欄位範圍已分開。Archive 每個 member 的 hash／CSV 列數及 ECI 完整逐欄比較在 archive-diff（`artifacts/research/2026-11-06-benchmark-check/web/epoch-archive-diff.json`）。昨日 Bayesian 方法變更已記錄，不當今日新方法。
- FrontierCode v1.1 JSON 相同；v2.0 有 **23 paths** 改變，含 Kimi K3.1 Pro 新 low/high/max profile（devin-cli），及 Muse Spark Open／SWE-2 Flash 既有 profile 補入 correct／tokens／flagged_rate。correct 與 new_score 是不同欄位，不用其中一個覆蓋另一個。見 field deltas（`artifacts/research/2026-11-06-benchmark-check/web/frontiercode-diff.json`）。
- HF latest8 的每日 16 org 加 3 個延續組織，共 **19 responses**；只多出 nvidia/MetricTrail repository ID，當前列表 tags 不足證實通用 LLM checkpoint，未把它當新模型。其餘 ID／metadata 的實際 before/after 在 HF comparison（`artifacts/research/2026-11-06-benchmark-check/vendors/hf-semantic-comparison.json`）。latest8 並非各 org 全量歷史。
- HTML raw hash 常隨動態 bundle／頁面殼改變；可讀文字的 before/after 另存 visible word deltas（`artifacts/research/2026-11-06-benchmark-check/web/visible-word-deltas.json`）。不能只憑 raw hash 不同推定方法或成績更新。

## 待查與候選階段

Supplemental candidates（`artifacts/research/2026-11-06-benchmark-check/vendors/supplemental-candidates.json`）共 **26 組：21 method-read、4 located、1 row-verified**。18 個既有組標記 prior-reviewed，更新今日 evidence／hash／baseline；它們的既有數值不重算今日新發布。Inkling 的 16 個外部 AA 列是本次 row-verified。身份採用與 supplemental 分數採用分開記錄。

Mistral Large 4 Preview／OSS 正式身分仍須 source-scoped alias；CoreCraft generic Mistral Large 4 High 沒有精確 checkpoint 證據，維持 unresolved。LongCat full table／dashboard 的 effort／cost 差異未解。Rosalind、FrontierMemory 1.1、Immigration、CyberOffense、DualChem、DAYJOB 三板及 NVFP4 仍依保存頁的特定 protocol／配置處理，沒有以相似名稱拼接。DualChem PDF 與前日 bytes 相同；paper landing URL 今日 404 已保留。xAI 11/07 watermarking 相對台北 11/06 仍屬未來日期，不能宣稱已生效。DeepSeek Cyber 不等同 base DS1017；沒有精確 organizer match 就不製造身份關係。

## 取證界線

結論限於上述 **230 個 baseline URL＋41 個官方跟進 URL**。OpenAI news／部分 release／Rosalind help 回 403，Tencent Hy4 HF API 與 Meta Muse Spark Open README 回 401；另有 404 舊路徑。全部狀態、原始錯誤回應及時間保留於 manifest；缺失內容不以搜尋 snippet 補齊。Official web 閱讀協助定位，論斷優先使用保存的正式卡、API、原始 paper 和 organizer 結構化資料。發布日期採官方明示日期，HF createdAt 不自動充當 releaseDate。完整機器版及證據連結見 discovery.json（`artifacts/research/2026-11-06-benchmark-check/web/discovery.json`）。
