# 2026-11-08 benchmark 聯網查核

## 取證範圍

以 2026-11-06 實際保存的原始回應為基準，觀測時間為 11/08 14:08:08–14:17:58 UTC，台北 22:08:08–22:17:58。前次 271 個唯一 URL 全部重新請求，沿官方目錄、發布頁與方法連結新增 35 個 URL，共 306 個 URL、305 份保存回應。HTTP 200 共 289，404 共 8，403 共 4，401 共 4，另有 1 個傳輸錯誤。全部 305 份當期回應及 270 份前次回應均重新驗證 SHA-256 與 byte count，全部相符。

完整 metadata 見 `artifacts/research/2026-11-08-benchmark-check/web/manifest.json`、`vendors/manifest.json`、`web/integrity.json`、`web/baseline-integrity.json` 與 `web/completion-inventory.json`。以下 artifact 路徑均位於同一查核目錄。

## 本次新增 benchmark 與方法變更

### VIALS-AA

AA 在 11/06 發布 VIALS-AA。AA 目錄路由從 38 增為 39，Intelligence Index 仍為 v5.0.1。此項是 standalone evaluation，官方方法明示未進入 Index。AA 使用 Handshake 的 161 題、174 張來源圖、8 個領域，每模型 3 次獨立 runs，共 19 模型、9,177 trajectories。[AA 文章](https://artificialanalysis.ai/articles/vials-aa)、[評測頁](https://artificialanalysis.ai/evaluations/vials-aa)、[方法](https://artificialanalysis.ai/methodology/intelligence-benchmarking#vials-aa)

AA 採 Stirrup、最多 100 turns、離線 Python sandbox，具圖片輸入能力的模型另開 image-viewing tool。答案須寫入 `/task/answer.txt`，擷取最後一個 `ANSWER:`，未作答與拒答計零。GPT-6 Luna medium 先以文字評分，必要時才另給圖片。Headline pass^3 是三次全部成功的題目比例，average-of-3 與 pass@3 分別保存。原主辦方 one-shot 方法使用 GPT-5-mini judge、provider default effort，兩者採用不同執行環境。[原主辦方](https://joinhandshake.com/research/benchmarks/vials/)、[原始 paper](https://arxiv.org/html/2608.21357v1)、[官方程式](https://github.com/Handshake-AI-Research/VIALS)

已擷取全部 19 列，逐列核對 161 題 domain 母體、全對次數、至少一次成功次數及 483 次成功數的整數關係，全部符合。Gemini 4 Carbon high 為 103/161、63.9752%，GPT-6 Astra max 為 62.7329%。Claude Opus/Sonnet 的 fallback 標示保留。文章列 GPT-6 Luna max 約 $0.02/task、Sol max 約 $0.06、Grok 4.7 xhigh 約 $1.77，成本含 contestant input/cache/reasoning/answer tokens，排除 judge。精確成本重建尚未完成，數值成本欄保持 null，另存原始 token counts、價格及公開顯示值。

階段為已讀方法與已擷取逐列證據。採用前需決定 benchmark identity、維度、正規化與來源規則，並完成 fallback 與 exact task-cost 核對。證據在 `web/vials-aa-rows.json`、`web/vials-aa-row-checks.json`。原始 dataset 示例標為 VIALS 2.0.0，AA evaluation 自身沒有另造版本號。

### Scale SWE Atlas v1.1

Scale 目錄從 20 增為 21 路由。舊 `sweatlas-qna`、`sweatlas-tw`、`sweatlas-refactoring` 三頁改為同一 `/leaderboard/swe-atlas` 的 overall、qna、testwriting、refactoring 四個 tab。官方明示 v1.1 仍為 v1.0 的 284 題、15 repo、6 種語言，但全模型重跑，judge 改 GPT-6.1 Sol majority-of-3、rubric 修訂並限制網路。版本成績分開保存。[官方榜單與方法](https://scale.com/leaderboard/swe-atlas?tab=overall)

已擷取四個 tab 各 16 列，共 64 列。Overall Opus 5.5 為 77.4、Fable 5.1 為 74.1、Gemini 4 Argon 為 70.1，Inkling 2 Small 為 61.9。entry objects 缺少精確 checkpoint、effort、harness 與 paired cost。官方 PDF 已捕獲，全文尚未閱讀。階段為已讀頁面方法與已擷取逐列證據。採用問題是新版 benchmark/category identity、維度與來源規則。證據在 `web/scale-swe-atlas-rows.json`、`web/raw/scale-swe-atlas-paper.pdf`。

## 官方模型身分補證

### North Mini Code

Cohere 公告明示 2026-06-09 發布，Snapshot Model 為 North-Mini-Code-1.0。官方 card 的程式明示 `CohereLabs/North-Mini-Code-1.0`。HF immutable revision 為 `d11e61a842617a22dc328552fa5bb86231ee4f37`，README 與 main bytes 相同，config dtype 為 bfloat16。HF createdAt 6/5 與 lastModified 6/15 分開保存。官方公開日期 6/9 仍在本次 12 個月資格窗內。[Cohere 公告](https://cohere.com/blog/north-mini-code)、[官方 card](https://huggingface.co/CohereLabs/North-Mini-Code-1.0)

主流程依此採 canonical `cohere-north-mini-code-1-0`、provider `cohere`，aliases 僅 North Mini Code、North-Mini-Code-1.0 與完整 official repo。FP8/w4a16 repo 分開。Card 推薦 temperature 1.0、top_p 0.95，三 seeds 平均，SWE-agent v1.1.0、ReAct terminal 與 Terminus-2 各有適用 benchmark。官方 article 的 competitor 引用與內部補測保留來源角色，paired task cost 缺失。這是既有模型的新增 coverage。

### K-EXAONE 2.0

AA 既有 `k-exaone-2-0-0803` 本次補齊 Index 與評測，detail 明示 weights URL 指向 `LGAI-EXAONE/K-EXAONE-2.0-750B-A37B`。LG 英、韓官方公告皆明示 2026-07-31 公開，官方 card 明示 BF16、750B/37B。Immutable revision 為 `fec0c8dd25fdd20ffd09869d5af5277966d5523d`，README 與 main 相同，config dtype 為 bfloat16。[LG 英文公告](https://www.lgresearch.ai/news/view?seq=678)、[韓文公告](https://www.lg.co.kr/media/release/30411)、[官方 card](https://huggingface.co/LGAI-EXAONE/K-EXAONE-2.0-750B-A37B)、[AA 精確來源頁](https://artificialanalysis.ai/models/k-exaone-2-0-0803)

主流程採 canonical `lg-k-exaone-2-0`、provider `lg`、releaseDate 7/31，aliases 僅官方空格名稱、repo basename 與完整 repo。AA detail 的原始 `releaseDate` 8/12 保存在 artifact；現有 builder 的 `sourcePublishedAt` 為 null，canonical 日期採官方 7/31。0803 未獲官方獨立 snapshot 證據，不加入 alias，也不由 suffix 推測日期。身分採用依據是 exact 官方名稱及來源明示 weights-link 關係。兩模型完整 URL、observedAt、SHA、bytes、immutable proof 在 `vendors/new-model-identities.json`。

## 現役與研究來源的實際資料差異

- AA full catalog score objects 維持 282。171 個既有 object 有變，170 個涉及 output speed/兩項 TTFT，90 個涉及 Index time/task，19 個新增 VIALS。K-EXAONE 補 Index 7.563574 與 10 項 benchmark scores，TB Science 與 TB4 明示零分，缺值仍保持 null。Kimi K3.1 Pro Briefcase 1674.81→1674.17。Nemotron 3.5 Super VL input 0.2→0.175 USD/M tokens，Index task cost 0.538225734→0.519632729。Inkling 補 AA-3D 1021.4599。來源 capture 母體與 adapter 聯集分開，完整 before/after 在 `web/aa-model-row-diff.json`。
- ARC 官方新增 Inkling 2 Small xhigh 四個 dataset 結果。ARC-AGI-2 Semi-Private 81.6667%，paired cost $0.27194635/task。官方 model record 指 11/05 發布、xhigh、standard harness。其餘三組 score/cost 原值保存在 `web/structured-field-deltas.json`。[官方結果](https://arcprize.org/results/thinky-inkling-2-small)
- SII 維持 67 個 benchmark 板，model-result rows 925→939，逐板以 `(model, provider)` 對齊後為新增 17、移除 3、既有 173 列有欄位差異，其中 48 列 headline score 改變。新增涵蓋 Sol 的 LAB Contracts、CorporateBench、Big Finance、τ³ Banking、DeepSWE、Bedside，Sonnet 的 Big Finance，Kimi 的六個 DAYJOB domain 與兩個 DesignArena 板，Tell-1 的 vCX，以及 Inkling 的 FrontierMemory。EnterpriseBench 既有 15 列全有 score 修訂，例 Opus5.5 77.3→75、Astra70.2→67。Kimi CorporateBench 76.877→78.4493 且 k1→3，τ³ Banking64.6907→63.3162 且 cost/trial0.7556→0.9536。VCX、DesignArena 還有 latency、battle數與SE缺值異動。各 metric 與成本原值見 `web/sii-diff.json`，score 更改按 headline 欄位逐列判定，rank 位移另計。SII 的 DesignArena Elo 欄把 unit 標為 percent，已保留原欄並另記語義異常，Elo 仍按原 label 閱讀。此聚合來源供發現與後續 organizer 核對。[SII 官方資料](https://fireworks.ai/specialized-intelligence-index/api/index.json)
- Epoch active CSV 1827→1835，以 id_runs 對齊為新增 16、移除 8、既有 47 列改 metadata。41 列 benchmarks/runs、6 列 log viewer、6 列 logs、1 列 country，既有 score 欄無變。ZIP 的 ECI 253 列與全部欄位相同。逐 run、archive member hash 與欄位差異在 `web/epoch-active-run-diff.json`、`web/epoch-archive-diff.json`。
- HF latest8 的 20 個延續 org 組，僅 Tencent 新增 `Qwen3.8-27B-DSpine-b16` 並擠出一個舊 repo。官方 card 證實它是 Qwen3.8-27B 的五層 draft model，block16、8,192 sliding window。所報數據量測 acceptance length 與加速。HF createdAt 11/07 只作 repo metadata，releaseDate 保持 null。見 `vendors/hf-semantic-comparison.json` 與官方 repo card。[官方 card](https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16)

## 發布頁與比較列續查

Inkling model card 的 16 個前次 AA 交叉核對能力值保留。表格變更包括 Apex-Accounting pass@1/mean 兩列合併雙值、HSS 名稱展開，移除 HLE with-tools、ARC1/2、Global-MMLU-Lite，安全列有競品刪值與修正。這些異動未提供本次新增的可整合 AA 能力值。完整前後 table 在 `vendors/inkling2-table-diff.json`。[官方 card](https://thinkingmachines.ai/model-card/inkling-2-small/)

Ripple card 將 SWE-bench Pro v2 Hard 競品 Inkling 975B 的 2.0 更正為 39.6，Muse Spark Open 816B 的 52.3 更正為 72.4，Ripple 自身 79.1 保留。兩個競品值皆為 italic 內部補測，全表註明 BF16/max。Terminus-2 僅針對 Ripple 的該評測明示，競品 exact harness/attempts/cost 仍待查。Context 文字由 1M 明確化為 1Mi、1,048,576 tokens。[官方 card](https://huggingface.co/ricursiveAI/Ripple-65B-Preview)

Mistral Large 4 docs badge 從 Public Preview 改為 GA。頁面仍顯示 October6、generic model label 及既有 token 價格，generic source alias 與 OSS1029 的 checkpoint 關係仍待官方證據確認。此項保留為身分續查。[官方 docs](https://docs.mistral.ai/models/mistral-large-4-0)

Visa 延續前次方法閱讀，本次沿官方 app.js 找到 `api/results.json`，snapshotId 為 results-2026-11-03。22 模型、990 trials、566 passes 全部對齊，逐模型 passRate 與 cost-per-pass 算式皆符合。精確 checkpoint/effort 欄仍為 null。public tv-126 demo 是獨立 replay pool。這是前次 research gap 的進展，發布仍為 11/05。見 `web/visa-row-checks.json`。[官方 JSON](https://www.visapaymentsfrontier.io/articles/agentic-commerce-benchmark/api/results.json)

GPT-6 Cyber 的官方 release 經 web retrieval 可讀，補確認 RemoteExploitBench 的 controlled remote targets 與已知 vulnerability 設定，正文是約 95% completion，Astra Daybreak Blue 全拒答。Sample size、exact effort label 與 paired task cost 保持 null。直接下載的原始 launch body 仍為 403，system-card PDF 延續前次證據，未將 release 整數顯示推成更精細數值。[官方 release](https://openai.com/index/introducing-gpt-6-cyber/)

## OpenAI 明示 effort 歸檔

獨立抽查核對已保存的 GPT-5.6 發布圖表，三列明示 `juice_level=none`、`juice_index=0`。目前官方 Sol／Luna／Terra 模型頁各自列出具名 `none` effort，guide 明示省略 effort 時預設為 medium。依 SPEC §4.4 的來源明示優先規則，產品將這三筆分數與成本歸入 `non-reasoning`，原始 source 欄位與 provenance 保留。[Sol 模型頁](https://developers.openai.com/api/docs/models/gpt-5.6-sol)、[Luna 模型頁](https://developers.openai.com/api/docs/models/gpt-5.6-luna)、[Terra 模型頁](https://developers.openai.com/api/docs/models/gpt-5.6-terra)、[官方 guide](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6)

| 來源圖表模型  | 來源 effort | DeepSWE 分數 % |  任務成本 USD | 產品 effort   |
| ------------- | ----------- | -------------: | ------------: | ------------- |
| GPT-5.6 Sol   | none        |         44.469 |   2.430281475 | non-reasoning |
| GPT-5.6 Luna  | none        |         2.2124 |  0.1866941315 | non-reasoning |
| GPT-5.6 Terra | none        |             14 | 0.40919845875 | non-reasoning |

補件共八份，其中七份為本次 HTTP 回應、另一份為 10/04 已審核圖表摘錄，全部 SHA／size 經主代理核對。本次原始發布頁直接下載為 403；官方模型頁與 API guide 成功取得。圖表位置、原始 row、具名 effort 證據與來源時間保存於 `vendors/none-effort-audit/assessment.json`，補件清單獨立於前述 306 URL 的每日探索母體。

## 候選與後續採用條件

`vendors/supplemental-candidates.json` 保留前次 26 組並更新本次 evidence，追加 K-EXAONE、VIALS-AA、Scale SWE Atlas v1.1 與 DSpine，共 30 組。模型身分、已定位、已讀方法、已擷取逐列與已整合各自記錄。North 與 K-EXAONE 的身分已由主流程採用，發布頁 supplemental 成績仍依各 benchmark 的版本、role、harness、effort 與成本條件處理。VIALS 與 Scale 新版的採用政策列為待決。

## 取證界線與資料更新報告

本次結論限於 271 個 baseline URL 與 35 個官方跟進 URL。HTTP 錯誤頁均保留原始 bytes，正文結論依成功取得的官方頁面。AA endpoint 方法兩個探索路徑與 guessed K-EXAONE 0803 repo 路徑失敗後，已改沿頁面明示的 endpoint-index 路徑及官方 750B-A37B repo 完成取證。HF latest8 不代表各組織全量。Raw hash 與語義差異分開，`web/visible-word-deltas.json` 保存可讀文字 before/after，精確結構化值另見 `web/structured-field-deltas.json`。

現役來源 adapter 實際採用、產品差異、release receipt 與代理抽查結果保存於 [刷新報告](../refresh/2026-11-08.md)。研究候選的採用條件依各 benchmark 的版本、來源與計分政策分列。
