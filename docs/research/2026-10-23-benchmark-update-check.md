# 2026-10-23 模型 Benchmark 聯網查核

與 [10 月 21 日保存資料](2026-10-21-benchmark-update-check.md)比對，本次主要更新為 **AA Coding Agent Index v2.0、CritPt v2、Epoch 新增 DeepSeek 1017 結果、Vals Finance Index、ARC 新測試，以及 MiniMax M3.1 Flash 權重開放**。來源於台北 10/23 下午擷取；逐欄差異、來源時間與 SHA256 見 [查核 JSON](2026-10-23-benchmark-update-check.json)。

## Artificial Analysis Coding Agent Index v2.0

[官方方法](https://artificialanalysis.ai/methodology/coding-agents-benchmarking)將 DeepSWE v1.1 換為 **FrontierCode v1.1 Main**，SWE-Atlas-QnA 改為 **SWE-Atlas-QnA-AA**；加上 Terminal-Bench 4.0，共 290 題，每題三次，三項等權。QnA 的 124 題與 1,306 個 rubric criteria 中，127 個 criterion 重寫，judge 改為 GPT-6 Luna xhigh、每 criterion 五票。版本與 judge 已變，跨版本差值不宜解讀為模型能力變化。

[當前資料](https://artificialanalysis.ai/agents/coding-agents)包含 **24 個 agent 配置，其中 21 個非 router**；畫面預選數與完整資料列數分開記錄。

| Agent／模型配置                          |       Index | API 成本／題 |
| ---------------------------------------- | ----------: | -----------: |
| Claude Code／Opus 5.5 max                | **61.6529** |     $11.4227 |
| Claude Code／Sonnet 5.5 max              | **59.3374** |     $13.3015 |
| Muse Code／Muse Wonder Full max          | **58.8804** |       未提供 |
| Claude Code／Fable 5.1 max with fallback | **57.6200** |     見原始列 |
| Codex／GPT-6 Astra max                   | **54.6636** |      $7.0362 |
| Codex／GPT-6.1 Sol max                   | **54.1280** |      $1.5046 |

另有三個 Devin Fusion router 配置；其中 Opus 5.5 Max＋GPT-6 Luna High 為 **61.5117**。每列代表 agent、模型、設定的組合，應連同 harness 閱讀。Opus／Sonnet 的拒答統計亦含 fallback，不能視為全程同一模型；例如 Opus 的 index 等權 refusal rate 為 **8.6999%**。

FrontierCode 使用私有 Main 100 題、可聯網；任何 blocking check 失敗即零分，通過後按其他 criterion 得 70–100%，取得上游解答的軌跡另歸零。Opus 在 Claude Code 的 FrontierCode 為 **55.9671%**，AA 模型專頁 Stirrup 評測為 **52.1731%**，兩個 harness 的結果各自保存。

## CritPt v2 與 AA 新結果

[CritPt v2](https://artificialanalysis.ai/evaluations/critpt-v2)是修訂題目後的 70 個物理研究題，加入離線 Stirrup Linux sandbox 與程式執行工具，每題最多 50 turns、五次重複，由原作者 grading server 評分。這是 standalone 評測；目前 Intelligence Index v4.3.2 的 CritPt 欄位仍使用既有測量，不能用 v2 分數直接替換。

| 配置                                  | CritPt v2 pass@1 |
| ------------------------------------- | ---------------: |
| GPT-6 Astra max                       |     **83.1429%** |
| GPT-6.1 Sol max                       |     **82.0000%** |
| Claude Opus 5.5 max、default fallback |     **77.7143%** |
| GPT-5.6 Sol max                       |     **74.8571%** |
| Muse Wonder Full max                  |     **73.1429%** |
| Gemini 4 Argon high                   |     **72.8571%** |
| DeepSeek V4.1 Flash 1017 max          |     **50.0000%** |

頁面共 11 配置。v2 同時修訂題目與執行流程，與舊版兩步式答題的分數分開保存。

[Ling 3.1 Flash 1019](https://artificialanalysis.ai/models/ling-3-1-flash-1019)新增 AA Intelligence Index **43.8974**、Briefcase **1523.64 Elo**、AutomationBench **67.5466%**、HLE **43.4662%**、Terminal-Bench 4.0 **32.8283%**。AA 記 releaseDate 為 10/22；[Ant Ling 官方公告](https://x.com/AntLingAGI/status/2113226531522891851)為 10/22 11:10:41 UTC，並表示 API 與 open weights coming soon。名稱中的 1019 不代表可用日期，既有 Ling 3.1 權重也不能套給此配置。

模型比較頁聯集維持 197 個 profile IDs，新增 Ling、Quasar 退出這個比較子集；不據此推定 Quasar 退役。新增欄位覆蓋包括 FrontierCode **46→64 個非缺值**、Terminal-Bench-Science **56→78 個非缺值**。例：Sol high FrontierCode **46.6056%**／Science **46.1905%**，Muse Wonder max **46.4713%／25.7143%**，MiniMax M3.1 Flash 新 Science **3.3333%**。這些是比較子集覆蓋數，並非完整榜單規模。

[Decision Index](https://artificialanalysis.ai/evaluations/artificial-analysis-decision-index)的決策模型 **15→17**，新增：

| 模型                |       Index | 成本／百萬題 | 中位時間／題 |
| ------------------- | ----------: | -----------: | -----------: |
| Baseten Elephant 9B | **64.6917** |      $8.3863 |       165 ms |
| SubQ Snap 1.1       | **64.9954** |     $30.3370 |       190 ms |

[PersonalityBench](https://artificialanalysis.ai/evaluations/aa-personalitybench)報告 **38→40 profiles**；比較子集 **34→36**，新增 Grok 4.5 high、Grok 4.6 xhigh，34 個既有 profile 的 trait／index／區間有修訂。其 percentile rank 依整個受測群體計算，不能由 percentile 改變直接推定模型行為變化。SSR 預載只有十個模型，完整載入資料另有公開 manifest，不能以十列推定榜單縮減。

另有 GDPval 153 個既有 Elo 與 Briefcase 151 個 overall Elo 修訂。主頁改以原始 Elo 顯示，並移除比較列的 `gdpvalNormalized`；該欄缺值屬資料結構變動。MLCR 方法補充 judge 為 Opus 5.5、Sol 6.1、Grok 4.7，皆 medium effort。

AA 的 Beam 價格由 input/output **$0.70/$2.10→$0.40/$1.20 每百萬 token**，cache hit **$0.115→$0.05**；這是 AA 當前價格紀錄。完整成本與其他 cache 調整另存 JSON。

## Epoch AI 新增八筆結果

[官方 ZIP](https://epoch.ai/data/benchmark_data.zip)新增以下原始結果；模型配置與 run 時間隨資料保存。

| 模型配置                     | Benchmark                 |     新增分數 |
| ---------------------------- | ------------------------- | -----------: |
| DeepSeek V4.1 Flash 1017 max | GPQA Diamond              | **93.1818%** |
| 同上                         | OTIS Mock AIME 2024–2025  | **99.4444%** |
| 同上                         | FrontierMath Tiers 1–3 v2 | **71.2281%** |
| 同上                         | FrontierMath Tier 4 v2    | **46.3415%** |
| 同上                         | SimpleQA Verified         | **42.5000%** |
| 同上                         | Chess Puzzles             | **46.0000%** |
| 同上                         | Mystery Game Puzzles      | **49.0000%** |
| Gemini 4 Argon high          | MirrorCode                | **58.8889%** |

DeepSeek run 起始為 10/19，Argon 為 10/14；本次觀察新增列不能當作 10/23 才執行。八筆公開列沒有 Logs／Log viewer。

[MirrorCode 方法](https://epoch.ai/benchmarks/mirrorcode)指定 ML, +Private, 2L：15 個 Medium／Large 程式、兩語言，共 30 任務，每題三次、每次 **100 億 token／七天**，Inspect ReAct、無網路；必須全部測試通過。這個榜單配置與論文的程式數、語言數和預算不同。

[ForecastBench 上游](https://www.forecastbench.org/assets/js/leaderboard_tournament_compact.js)406 列中，89 列 Overall 實分與 179 列僅 rank 修訂；如 GPT-5.5-2026-04-23† **64.4→64.5**。指標為 difficulty-adjusted Brier Index，各 search／code／effort／budget 設定與 † 標記分開保存。上游修訂與 Epoch 匯入快照具有時間差。

## Vals Finance Index 與新增模型結果

[Finance Index v1](https://www.vals.ai/benchmarks/finance_index)新增 30 模型。頁面 updated 為 10/22、changelog 記 released 10/21，兩日期分列。公式為：

`(1.6 × AVG(Finance Agent v2.1, EMB v1.1) + 0.5 × Tax Agent Bench all-pass) / 2.1`

| 模型                     | Finance Index | 成本／題 |
| ------------------------ | ------------: | -------: |
| Claude Opus 5.5          |    **65.587** | $11.6713 |
| Gemini 4 Argon           |    **64.890** |  $6.5308 |
| Muse Wonder Full         |    **64.551** |  $3.1368 |
| Claude Sonnet 5.5        |    **64.533** |  $8.3295 |
| DeepSeek V4.1 Flash 1017 |    **60.886** |  $0.4189 |

Opus／Sonnet 包含拒答後 fallback；若這些任務記為失敗，兩者分別為 **65.174／62.164**。官方說明前兩名在誤差範圍內。這是既有三項評測的聚合指數，不能再當成三項之外的獨立測量。

Vals 目錄 **57→58 頁**，標準 JSON **55→56**，合計 **3424 overall／22924 task 列**，包含歸檔版本與重複組件。既有榜新增 377 task rows；部分既有列修訂成本、harness 或生成參數。具體新值包括：

- Qwen 3.8 Max 0902：Tax **49.663%**、EMB v1.1 **71.979%**、Code Migration v1.1 **57.187%**、Vals Index v2.2 **59.045%**。
- Mercury 3 high：Finance Agent v2.1 **54.708%**、EMB v1.1 **57.880%**、Code Migration v1.1 **39.264%**、Vals Index v2.2 **43.659%**。
- Beam：Science Index **22.031%**、BioMystery **42.593%**、ProofBench **18.000%**。
- ClaimBench：d1-ultra **100%**、Clef **95.102%**、Solar Decide **94.388%**、Clef-Flash **84.847%**。

這些值依各榜原始方法與配置解讀；完整新增 task／overall、成本與非分數修訂保存於 JSON。

## ARC 與 Surge

[ARC 官方資料](https://arcprize.org/leaderboard)的唯一 model–dataset pairs **1194→1264**，新增 70 組；唯一 model IDs **348→368**，新增 20 個。模型 IDs 包含 effort 與 harness，不能當作 20 個新模型發布。

新增 Sonnet 5.5 的 Standard 與 Provider Adapter、多種 effort，以及 DeepSeek 1017、Muse Spark Open、Nemotron 3.5 Super VL 等結果。ARC-AGI-1／2 的 public／semi-private 與 ARC-AGI-3 分開保存；Provider Adapter 保留 reasoning state 並壓縮長對話，測試方式與 Standard 有別。

[Sonnet 5.5 結果頁](https://arcprize.org/results/anthropic-claude-sonnet-5-5)的 ARC-AGI-3 semi-private xhigh：Standard **24.3104%／總成本 $7394.47**，Provider Adapter **72.4417%／總成本 $8169.90**。ARC-AGI-3 採 **RHAE 效率分數**，不是解題率；55 個 semi-private 環境構成 catalog。後者標明 **partial dataset**、使用完整 catalog 分母，成本僅含有記錄的 usage。API 沒有揭露各模型實際嘗試的 semi-private 環境數，公開 replay 的 25 個環境也不是這個分數的分母；不能直接將兩列相減宣稱提升幅度。[DeepSeek 1017 max](https://arcprize.org/results/deepseek-v4-1-flash-1017)的 ARC-AGI-2 semi-private 為 **78.0556%／$0.163117 每題**，其 effort 配置獨立於 ARC-AGI-3。

[Surge DAYJOB](https://surgehq.ai/benchmarks/dayjob-finance)的 finance／healthcare 各 **32→36** 列，新增 Sonnet 5.5、Muse Wonder 1.0、GPT-6.1 Sol、Mistral Large 4；既有 Argon finance **20.3→18.8**、healthcare **9.6→10.8**，Hy4 finance **7.3→3.3**。方法與單位、完整模型列隨來源保存。

## 官方權重與評測文件

[MiniMax M3.1 Flash 固定版本模型卡](https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash/blob/54e4e69dfc452b1e94a426c24a4fdeeaa8e3ad5e/README.md)確認於 **10/23 11:37:20 台北時間**首次上傳權重，48 個主 shard 與 DSpark 權重皆有 LFS OID。精度是 BF16 global dtype、MXFP8 dynamic 與 NVFP4 MoE 的混合設定。模型卡完整 15 列配對表已保存；HLE 是無工具、text-only 2,158 題，各項來源與 harness 分列，部分 effort／output budget 未公布。

Meta Muse Glimmer 30B 於 10/22 加入 [MMI 結果檔](https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/cec94fcfd6512f2cfe708138c32533b346ea4f69/.eval_results/mmi.yaml)，資料 date 為 10/20、MMI **11.58**，七項原值另存。方法資料集抓取回應 401，無法核全 harness。

Perplexity 既有 embed 模型新增引用 [10/21 技術報告](https://arxiv.org/abs/2610.29523)，含 ViDoRe V3 與 BrowseComp+ 等供應商評測。報告使用 GPT-OSS-120B high 等指定 harness，72-task 私有集合未完整公開。

## 查核範圍與證據

本次以官方資料快照、可見方法與發布記錄為依據，觀察時間與首發時間分列。來源有快取、不同頁面覆蓋與更新時差；分數、缺值、零分、版本歸檔、agent 配置分開處理。LiveBench 2.0 的 release／bundle／49 模型表、成本及分項 JSON 均已擷取並逐位元比對，對應紀錄保存在 JSON。

來源原檔、擷取 manifest、逐欄 diff 與重算腳本位於 `artifacts/research/2026-10-23-benchmark-check/`。官方網站查核為有限頁面與各 Hugging Face 組織最新 20 筆；部分新聞頁回應 403。Personality 完整 lazy payload 與未公開執行日誌不在本次完整解析範圍。
