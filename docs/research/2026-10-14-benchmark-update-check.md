# 2026-10-14 模型 Benchmark 聯網查核

以工作目錄的 2026-10-04 來源快照為比較基準。起始 commit：`69a71f1f1ff43282f92463653d815654fef0db19`；產品版本：`sha256:aa2ec4e72506c2494c04e0ca3635dcb6b83e27af655c3795dd57fdd17d0e0b96`，產物時間 `2026-10-04T06:33:15.364Z`。逐列差異、查核範圍與證據檔案雜湊保存在 [查核 JSON](2026-10-14-benchmark-update-check.json)。

本次確認模型新增、評測目錄擴充及計分指標變化。Tax Agent Bench 的指標切換、Harvey LAB-AA v1.1 的幻覺門檻、各來源的執行設定，是後續匯入時需處理的比較條件。

| 新模型                                                              | 官方發布日期 | AA Intelligence Index v4.3.2／配置 |
| ------------------------------------------------------------------- | ------------ | ---------------------------------: |
| [Muse Wonder Full](https://research.meta.ai/blog/muse-wonder)       | 2026-10-12   |                       55.8021／max |
| [Muse Wonder](https://research.meta.ai/blog/muse-wonder)            | 2026-10-12   |                       52.3939／max |
| [Claude Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5)      | 2026-10-07   |                       43.3950／max |
| [Mistral Large 4 Preview](https://mistral.ai/news/mistral-large-4/) | 2026-10-06   |         38.3770／來源未明示 effort |

AA 數值取自[官方模型頁](https://artificialanalysis.ai/models)內嵌原始資料，保留完整精度於 JSON。當前頁面含 27 個配置，與本地同 ID 對照得到 40 筆新增、24 筆既有數值異動；這是該頁子集的比較範圍。

GDPval-AA v2.1 的本地正規化分數中，GPT-6 Astra max 為 52.0945 → 53.5830，GPT-6.1 Sol max 為 53.7545 → 54.5810，Gemini 4 Argon high 為 56.3510 → 56.1910。這些值由來源 `gdpvalNormalized` 乘以 100，與官方顯示的 Elo 使用不同尺度。[官方評測頁](https://artificialanalysis.ai/evaluations/gdpval-aa)

AA 目錄新增 [AA-3D](https://artificialanalysis.ai/evaluations/aa-3d) 與 [FrontierCode 1.1](https://artificialanalysis.ai/evaluations/frontiercode) 頁面；[Harvey LAB-AA](https://artificialanalysis.ai/evaluations/harvey-lab-aa) 現在明示 v1.1。AA-3D v1.0 使用 55 題、Stirrup、離線 three.js 場景與盲評 Elo；Sonnet 5.5 max 1194、Opus 5.5 max 1190，信賴區間重疊。Harvey v1.1 的主指標要求所有 rubric 通過且沒有重大幻覺，官方明示跨版不可直接比較。

[Terminal-Bench 4.0](https://artificialanalysis.ai/evaluations/terminalbench-4-0) 使用 66 題、mini-swe-agent、每題三次平均；專案 AA adapter 目前讀取 `terminalBench21`／2.1 欄位。4.0 與 Terminal-Bench-Science 0.1 已在舊目錄中出現，本次確認的是收錄缺口。4.0 須使用獨立 benchmark ID 與設定，不能把 2.1 的數值改標版本。

| 官方排行榜                                              | 本次可核對變化                                                                                                                                                                                  |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [LiveBench](https://livebench.ai/)                      | 2.0 於 2026-10-13 發布，36 個模型、七個 suites；Fable 5.1 Overall 88.0、Opus 5.5 86.5、GPT-6 Astra 86.1。                                                                                       |
| [FrontierCode](https://cognition.com/frontiercode)      | 1.1 Main 125 → 136 配置。Haiku max 46.36%、Gemini 4 Argon medium 47.55%、DeepSeek V4.1 Flash high 43.87%、Mistral Large 4 high 39.43%。                                                         |
| [FrontierSWE](https://www.frontierswe.com/changelog)    | V2 20 → 22 配置：Haiku 5.5/proximus 43.7687%、Muse Spark 1.3/proximus 25.8021%，皆為 mean@5。                                                                                                   |
| [ARC Prize](https://arcprize.org/leaderboard)           | ARC-AGI-2 Semi-Private 新增八配置：[DeepSeek V4.1 Flash](https://arcprize.org/results/deepseek-v4-1-flash) max 72.9167%；[Grok 4.7](https://arcprize.org/results/xai-grok-4-7) xhigh 61.3889%。 |
| [Zapier AutomationBench](https://zapier.com/benchmarks) | 1.0.6，121 → 126 配置；Haiku 5.5 default fallbacks max 12.02%、high 10.50%、xhigh 9.89%、medium 8.52%、low 6.09%。                                                                              |
| [Epoch](https://epoch.ai/benchmarks/use-this-data)      | ECI 270 → 274 模型；194 個既有 ECI 值異動。GPQA 新增 Gemini 4 Argon high 96.4015%、Haiku max 89.6465%、DeepSeek max 89.8359%、Mistral high 88.0682%。                                           |

[LiveBench 2.0](https://livebench.ai/#/methodology) 的七個 suites 為 Agentic、Reasoning、Coding、Browser Use、Data Analysis、Research、Design。五個 suites 執行有工具的實際任務，Reasoning 與 Data Analysis 為短題；每個 suite 單次執行，Overall 為有值 suites 的等權平均，空白／n/a 不計入。模型預設最高支援 effort，例外由展開列揭露；成本欄為每成功任務成本，需保留其分母。[官方 notes](https://livebench.ai/notes_2026_09_02.json)

LiveBench 官方 bundle 把資料檔日期 `2026-09-02` 映射為發布日期 `2026-10-13`。當前資料是 `table_2026_09_02.csv`，七欄為 `design_layout,research,browser,coding,long_horizon,data_analysis,reasoning`。舊 v1 位於 `/v1/`，其 2026-06-25 匯出比較保留於 JSON 的 `legacyV1ExportComparison`。現有擷取器只能辨識檔案日期，materializer 的核准類別與 `livebench-no-tools` profile 規則仍依 v1；需建立 2.0 的身分、分類、effort、工具及成本口徑後再採用。

Epoch 的 [FrontierMath Tiers 1–3 v2](https://epoch.ai/benchmarks/frontiermath-tiers-1-3-v2) 與 [Tier 4 v2](https://epoch.ai/benchmarks/frontiermath-tier-4-v2) 已於 2026-06-12 發布，修正題目錯誤。當前 ZIP 含 `frontiermath_tiers_1_3_v2.csv` 116 列與 `frontiermath_tier_4_v2.csv` 72 列；live task 為 `FrontierMath-Tiers-1-3-v2-Private` 與 `FrontierMath-Tier-4-v2-Private`。專案 `EPOCH_DIRECT_FILES` 仍指定兩份 v1 CSV，存在 v2 匯入缺口。更新檢查須逐一核對官方新版頁面、匯出檔與實際匯入清單。

Epoch 的原始 CSV 同時包含結果、模型 metadata 與外部鏡像；JSON 保留 ECI 語義比對。行號、training compute 或 metadata 變動需與分數變動分開。Zapier 要從當前頁面發現新模組 URL，舊 URL 仍提供舊資料。

Vals 的[官方目錄](https://www.vals.ai/benchmarks)為 47 → 49 頁，新增 [SAFE-Teen](https://www.vals.ai/benchmarks/mental-health) 與 [SWE-bench Multimodal](https://www.vals.ai/benchmarks/swebench-multimodal)。47 個一般 JSON 頁的列數均與 metadata 相符，共 3079 → 3190 列，新增 111 列，其中 18 列來自 SWE-bench Multimodal；SAFE-Teen 與 RSI 使用個別格式。Multimodal 的 480 題使用 mini-swe-agent、預先附圖與無網路設定，Opus 5.5 為 70.208%。

[Tax Agent Bench](https://www.vals.ai/benchmarks/tax_agent_bench) 的 `tasks.overall[model].accuracy` 現在採所有 rubric 通過後再依引用正確性調整的 Accuracy。65 筆本地舊值逐筆等於當前 `tasks.weighted_pass[model].accuracy`。例如 Fable 5.1 的舊 Weighted Pass 77.642%，新主 Accuracy 49.194%；GPT-6 Astra 分別為 63.335%、20.717%。來源 version 仍為 1，匯入需辨識 metric 語義，這些差值不代表模型能力退步。

Vals 另有可比數值更新：Terminal-Bench 4.0 的 Gemini 3.8 Flash 19.192 → 19.697%、Ember-1 19.697 → 20.707%、Sonnet 5 9.596 → 10.606%；Terminal-Bench-Science 的 Sonnet 5.5 為 45.714 → 47.143%。新增 Haiku 5.5 的 Vibe Code Bench 90.444%、EMB 59.015%；GLM-Legal 的 HLAB 19.167%、LegalBench 86.235% 亦已出現在來源資料。各頁 URL、欄位與配置變化見查核 JSON。

Surge [ComplexConstraints](https://surgehq.ai/benchmarks/complex-constraints) 56 → 44 配置：新增 Gemini 4 Argon high 53.3%，13 個舊配置從當前頁面消失。消失只能證明覆蓋改變，仍需主辦方說明才能判定舊結果失效。[sudo L7](https://surgehq.ai/benchmarks/sudo-l7) 是目前目錄可見、專案缺少的評測：60 題，Opus 5.5 max 與 Sonnet 5.5 max 均 45.0%；已查閱的榜單未明示最初發布日期。

官方發布頁提供補充候選：[Muse model card](https://research.meta.ai/static/muse-wonder-model-card)的 DeepSWE 1.1 為 Full/Wonder 79.0/78.8%；[Mistral](https://mistral.ai/news/mistral-large-4/)為 61.7%。採用前須核對 effort、harness、tools、attempts、metric 與任務成本。Haiku 的[system card](https://www.anthropic.com/claude-haiku-5-5-system-card)以 Claude Code `--bare`、max、十次/題得到 Terminal-Bench 4.0 39.2%，與 AA 的三次/題、mini-swe-agent 有不同設定。Meta OSWorld 使用 108 題，Haiku 使用 82 題 offline subset，同名評測仍需保留子集與指標。

OpenAI 10/7 的[GPT-6 October 更新](https://deploymentsafety.openai.com/gpt-6-october/capability-threshold-critical)明確區分 Chat 版本與 September 版本；benchmark 身分應包含 checkpoint。來源快照、發布文章與安全評測使用不同環境時，需保留其方法欄位。

後續匯入優先順序：處理 Tax metric 識別與 Harvey 版本；補齊新模型 canonical identity、effort 與成本；刷新已有排行榜的可比資料；依維度與品質政策審閱 AA-3D、FrontierCode-AA、SWE-bench Multimodal、SAFE-Teen、sudo L7，再重建共同評測與產品排名。
