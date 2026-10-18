# 2026-10-15 模型 Benchmark 聯網查核

查核時間為 2026-10-15 上午（Asia/Taipei）。以 [10 月 14 日查核](2026-10-14-benchmark-update-check.md)保存的官方資料逐列比較；產品比較基準為 2026-10-04 快照、commit `69a71f1f1ff43282f92463653d815654fef0db19`、產品 `sha256:aa2ec4e72506c2494c04e0ca3635dcb6b83e27af655c3795dd57fdd17d0e0b96`。逐列結果、取得時間、官方 URL、範圍限制與原始證據雜湊見 [查核 JSON](2026-10-15-benchmark-update-check.json)。

## LiveBench 2.0

[官方網站](https://livebench.ai/)當前 bundle 為 `main.ba5ba12f.js`，顯示發布日從 2026-10-13 改為 **2026-10-14**；資料檔仍為 `table_2026_09_02.csv`，cache key 從 `1791909720` 更新為 `1792020746`。[當前 CSV](https://livebench.ai/table_2026_09_02.csv?v=1792020746)含 **44 個模型**，較上次增加八個。七個 suite 的分數等權平均後，新增模型 Overall 如下：

| 來源模型 ID            | Overall |
| ---------------------- | ------: |
| mimo-v2.6-pro          |    74.9 |
| qwen3.8-27b            |    58.1 |
| minimax-m3             |    52.6 |
| inkling                |    51.9 |
| mistral-large-4        |    47.7 |
| gemma-4-31b            |    41.5 |
| nemotron-ultra-3       |    40.8 |
| nemotron-lightning-3.5 |    28.7 |

Qwen3.8 Flash 的 Overall 為 **47.0 → 61.9**：Design 38.2 → 72.8、Research 35.4 → 74.6、Browser Use 4.0 → 0.0、Coding 53.5 → 87.4、Agentic 36.0 → 37.1。資料僅能證明官方修訂分數；尚無逐項修訂原因。成本與 breakdown 匯出也已更新，匯入時須使用相同 cache 版本，並從 notes 保留 effort 及工具設定。來源日期映射與舊版 `livebench-no-tools` 擷取規則仍是專案整合重點。

## Epoch AI

[當前官方 ZIP](https://epoch.ai/data/benchmark_data.zip)有 92 個檔案，新增 SpireClimb 的整體與兩個遊戲子項 CSV。[官方發布文章](https://epoch.ai/publications/ai-systems-are-improving-rapidly-at-slay-the-spire-and-its-sequel)日期為 **10 月 14 日**。

[SpireClimb](https://epoch.ai/benchmarks/spireclimb)以最高 reasoning 檔位、電腦操作 harness 評估《Slay the Spire》兩款遊戲。第一款採 A20 Heart、60 局；第二款採 A10、75 局，固定遊戲版本 v0.107.1；Overall 為兩個通關率的等權平均。七款模型中，GPT-6 Astra 為 **25.6667%**、GPT-6.1 Sol 為 **24.6667%**、GPT-6 Sol 為 7.5%、Opus 5.5 為 3.3333%。Sol 6.1 在第一款遊戲為 12/60，Astra 在第二款為 26/75。模型可使用限於遊戲 wiki 的搜尋與跨壓縮筆記，需保留此工具設定。

[FrontierMath Tiers 1–3 v2](https://epoch.ai/benchmarks/frontiermath-tiers-1-3-v2)由 116 → 117 列，[Tier 4 v2](https://epoch.ai/benchmarks/frontiermath-tier-4-v2)由 72 → 73 列；新增 **Gemini 4 Argon high：85.9649%／78.0488%**。專案 `EPOCH_DIRECT_FILES` 目前指定 v1 檔案，需補上 v2 的獨立身分與匯入規則。

其他主辦方結果新增 Mock AIME 的 Gemini 4 Argon high 100%、Muse Wonder max 99.4444%；Mystery Game Puzzles 的 Gemini 4 Argon high 64%、Mistral Large 4 high 17%；Furniture Assembly 的 Mistral Large 4 high 20.8333%。Chess Puzzles 依模型設定辨識後增加 16 個版本、修訂 125 個既有分數。ECI CSV 仍為 274 列，其與這些獨立 benchmark 結果分別核對。

Epoch 的 ZIP 比較使用上次實際保存的檔案；該檔案雜湊與前次補查段落提到的較晚 ZIP 雜湊不同。JSON 記錄兩者與比較限制，FrontierMath v2 的前次列數與領先分數相符。

## 新評測與現有榜單異動

[AA-Robotics v0.1](https://artificialanalysis.ai/articles/aa-robotics)於 **10 月 14 日**發布，是八個實體機械臂任務的研究預覽，以任務完成進度計 0–100 分，全部採 high effort。GPT-6 Astra／Sol 6.1 使用 Codex，Argon 使用 Antigravity，Claude 使用 Claude Code；其分數依序為 **69.4／64.6／55.3／48.8（Opus）／46.3（Fable）**。Astra 平均每題 $16.36，Sol 6.1 為 $1.93。比較時需保留各模型的 agent harness。

[Vals Robo-bench v1](https://www.vals.ai/benchmarks/robo_bench)採 MuJoCo 模擬、24 題（13 個機械臂與 11 個人形機器人任務）、每題單一 seed、三分鐘即時限制，模型透過各供應商 coding agent 編寫控制程式。七款模型以最高支援檔位執行；Sol 6.1 為 **28.333%**、Astra **23.333%**、Opus **14.583%**、Muse Wonder Full **10.417%**。`overall.cost_per_test` 在此頁代表**整組 24 題費用**；Sol $4.9675、Astra $28.479，匯入須保存此單位。官方提醒重跑可造成約十分的差異，小幅排名差距的解讀須考慮單次 seed 限制。

Vals 目錄由 49 → 50 頁，一般 JSON 頁由 47 → 48 頁，總模型列數 **3190 → 3205**。八筆既有頁新增結果包括 Muse Wonder Full 的 LegalBench 87.418%、MedCode 49.932%、MedScribe 89.335%、SREBench 11.832%、Terminal-Bench-Science 37.143%、Vibe Code Bench 1–100 33.978%；另有 Muse Wonder 的 Vibe Code Bench 1–100 26.55%、Step 5 Preview 的 SREBench 0.382%。IOI 的兩筆變化是任務成本，CUA-Bench 的一筆變化是快取成本註解。SAFE-Teen 與 RSI 採專用格式，另存頁面證據。

[AA Decision Index v1.0](https://artificialanalysis.ai/articles/artificial-analysis-decision-index)於 **10 月 13 日**發布，本次補充查閱其正式榜單及方法。其四個構成為 AA-Omniscience-Decision、HLE-MultiChoice、When2Call、WildGuardTest，各占 25%；發布文章的 Jev 1.13 為 58，GLiDE 與 Microsoft-Decision-1 均為 54。它具有獨立的模型、機率校準及計分身分。

[AA 模型頁](https://artificialanalysis.ai/models)的 27 配置子集新增 Argon high 的 FrontierCode **42.6426%**、AA-AnalystAgent **48.75%**，以及 K2 Horizon 的 MLCR **6.6667%**。21 個模型的 GDPval Elo 與對應正規化值修訂，例如 Sol 6.1 Elo 1591.62 → 1593.85、Astra 1571.66 → 1572.84。AA 的 FrontierCode 與 Cognition 主辦方結果各自保留執行身分；AA-AnalystAgent 的主指標為 pass^5。

[ARC Prize 的 Haiku 5.5 結果](https://arcprize.org/results/anthropic-claude-haiku-5-5)新增 20 筆評測、六個模型設定 ID。ARC-AGI-2 Semi-Private 的 **xhigh 為 61.25%、每題 $0.08498917**；max 的 ARC-AGI-2 結果因覆蓋不完整未列出。ARC-AGI-3 的 standard／provider-adapter 為不同 harness，`cost` 為整組費用，須與 `costPerTask` 分別處理。

[FrontierSWE V2](https://www.frontierswe.com/)的 mean@5 從 22 → 21 配置，Sonnet 5.5/proximus 61.8893% 列從目前頁面消失；頁面變動的原因尚待主辦方說明。[sudo L7](https://surgehq.ai/benchmarks/sudo-l7)目前顯示 15 配置、60 題，Opus／Sonnet 由上次記錄的 45.0% → **41.7%**，Astra 32.2% → **33.9%**，Sol 6.1 31.7% → **28.9%**。此站版本未明示；舊文章敘述仍保留約 45%／32%，採用時需保存榜單取得時間與 harness。

## 官方模型發布頁補充

[Grok Voice 3.0](https://x.ai/news/grok-voice-3)公告日期為 **10 月 14 日**，新增的語音評測候選包括 AA Speech-to-Speech Index 86.9、τ-Voice 71.6%、EVA-Bench 74%。`grok-voice-latest` 已改指新版，需保留 checkpoint 與語音模態身分；AA 成績仍須與主辦方相同設定逐列核對。

[Gemini 4 Argon 的 10 月 13 日官方文章](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-argon/)及 model card 提供 ERQA 87%、Gray Swan IPI 攻擊成功率 0.7%（15 次 adaptive attempts，越低越好）、RareBench 57%、LabBench 52.2% 的補充證據。文章未明示新的 checkpoint，發布日期與本次新增收集證據分別記錄。

整合優先項目為 LiveBench 2.0 的資料與 profile 規則、Epoch FrontierMath v2、各新評測的 metric／harness／成本單位，以及 ARC 覆蓋與 sudo L7 版本證據。完整設定與證據路徑保存在查核 JSON。
