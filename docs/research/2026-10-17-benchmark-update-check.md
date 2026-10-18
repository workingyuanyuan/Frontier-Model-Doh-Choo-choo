# 2026-10-17 模型 Benchmark 聯網查核

查核時間約 2026-10-17 13:08–13:15（Asia/Taipei）。與 [10 月 15 日保存資料](2026-10-15-benchmark-update-check.md)比較官方頁面、匯出檔及模型公告。當前工作目錄 commit 為 `05ac1b80641b87132110c38343e70ea49e68f9ba`，產品產生時間為 `2026-10-16T00:07:04.535Z`，版本為 `sha256:6fa91f222b86daf7ef9aacb6773c07fedbae885548ae5e91ccdc1fb7647d4c35`。逐列差異、範圍限制與證據雜湊見 [查核 JSON](2026-10-17-benchmark-update-check.json)。

## LiveBench 2.0

[官方匯出](https://livebench.ai/table_2026_09_02.csv?v=1792206731)由 **44 → 48 個模型**，新增 Step 5 Preview、Muse Spark Open、Beam 1.0、Nemotron 3.5 Super VL。七個 suite 等權平均的 Overall 如下：

| 新增模型              | Overall |
| --------------------- | ------: |
| Step 5 Preview        |    62.0 |
| Muse Spark Open       |    57.6 |
| Beam 1.0              |    55.5 |
| Nemotron 3.5 Super VL |    51.5 |

四款既有模型的 Browser Use 與 Overall 修訂：

| 模型                | Browser Use |     Overall |
| ------------------- | ----------: | ----------: |
| Qwen3.8 Flash       |      0 → 48 | 61.9 → 68.8 |
| Qwen3.8 27B         |      0 → 32 | 58.1 → 62.7 |
| MiniMax M3          |       0 → 8 | 52.6 → 53.7 |
| DeepSeek V4.1 Flash |   83.3 → 80 | 77.3 → 76.8 |

[首頁](https://livebench.ai/)仍標示 10 月 14 日，資料檔日期仍為 `2026_09_02`；當前 bundle 為 `main.13da4572.js`、cache key 為 `1792206731`。成本與 breakdown 匯出也已變動，需與同次分數一起採集。頁面日期與檔名不足以判斷資料是否更新；本次以實際 payload 比對。官方 notes 保留設定，逐項修訂原因尚未明示。

## Epoch AI

[ECI](https://epoch.ai/eci)由 **274 → 277 模型**，新增 Gemini 4 Argon **164.56**、Claude Haiku 5.5 **158.98**、Mistral Large 4 **146.90**。251 個既有 ECI 值改變；Opus 5.5 為 167.33 → 166.82，目前 Astra 166.41、Sol 6.1 166.32。

ECI 的模型與 benchmark 輸入由 2898 → 2987 對：新增 92、移除 3、變更 68，其中 65 對的 performance 改變。SpireClimb 的七款模型結果納入擬合，EDI 為 174.8056。這些輸入及難度參數變化支持指數重新擬合的判讀，ECI 每筆改值須與新執行的獨立評測分開統計。

[FrontierMath Tiers 1–3 v2](https://epoch.ai/benchmarks/frontiermath-tiers-1-3-v2)與 [Tier 4 v2](https://epoch.ai/benchmarks/frontiermath-tier-4-v2)由 **117／73 → 120／76 列**：

| 新增設定              | Tiers 1–3 v2 | Tier 4 v2 |
| --------------------- | -----------: | --------: |
| Muse Wonder max       |     82.1053% |  70.7317% |
| Mistral Large 4 high  |     58.5965% |  26.8293% |
| Muse Spark Open xhigh |     69.8246% |  31.7073% |

[官方 ZIP](https://epoch.ai/data/benchmark_data.zip)亦新增 Muse Spark Open xhigh 的 GPQA 88.5732%、Mock AIME 98.0556%、SimpleQA Verified 56.6%；Gemini 4 Argon high 的 Earthborne Rangers 64.7619%；Muse Wonder max 的 Mystery Game Puzzles 51%、Furniture Assembly 54.1667%。各列保留原始 run 日期及設定。

[Chess Puzzles 方法頁](https://epoch.ai/benchmarks/chess-puzzles)明示 **10 月 14 日推出 v2**，重新執行可用模型並移除 v1 成績；官方說明兩版不能精確直接比較。當前 CSV 243 → 153 列，移除 95 筆、新增五筆，包含 Astra promax 76%、Mistral Large 4 high 33%。此次覆蓋減少有官方版本說明，匯入需保存獨立版本及原始題目設定。

## 新模型與 AA 結果

| 模型／事件                                                                                           | 日期  | AA Intelligence Index v4.3.2 |
| ---------------------------------------------------------------------------------------------------- | ----- | ---------------------------: |
| [Muse Spark Open](https://research.meta.ai/blog/muse-spark-open) 開放權重發布                        | 10/15 |             38.8667（xhigh） |
| [Beam 1.0](https://reflection.ai/blog/beam-is-available) 權重發布                                    | 10/16 |                      30.3334 |
| [Nemotron 3.5 Super VL](https://blogs.nvidia.com/blog/nemotron-3-5-super-vl/) 公開發布               | 10/15 |                      26.4911 |
| [Nemotron 3.5 Bolt 74B-A9B](https://artificialanalysis.ai/models/nemotron-3-5-bolt-74b-a9b) 新增評測 | 10/15 |                      21.4072 |
| [Solar Pro 4](https://artificialanalysis.ai/models/solar-pro4) 新增 AA 評測                          | 10/15 |                      26.5600 |

AA 值由各模型頁原始資料核對；未明示 effort 的設定保持缺值。Solar Pro 4 的官方發布頁日期在八月，AA metadata 亦使用八月日期；10/15 是新評測出現日期。Beam 的首次公告、benchmark 修訂與 10/16 權重發布是不同事件。NVIDIA 研究頁日期為 10/14，公告與模型卡公開日期為 10/15，兩者都保存在證據。

[AA 模型主頁](https://artificialanalysis.ai/models)的 27 配置子集中，Argon high 的 FrontierCode 為 **42.6426 → 43.4532%**，Terminal-Bench-Science 新增 **52.8571%**。主頁選取模型亦有替換；舊模型從此子集消失僅代表選取變化。

供應商結果需逐一保留精度、工具與 harness：Beam 的 BF16／FP8／NVFP4 有不同分數；Muse Spark Open 的 DeepSWE 使用 Muse Code，Terminal-Bench 2.1 使用 Terminus 2；NVIDIA 的平行 agent、自我驗證與 offline 評測具有獨立設定。模型卡的 Terminal-Bench 2.1 與 AA 4.0 結果分別記錄。

[Decision Index](https://artificialanalysis.ai/evaluations/artificial-analysis-decision-index)的預設表新增 d1-ultra、Clef-Omni，Jev 1.14 替換 Jev 1.13。**d1-ultra 得分 65.2481**，[官方公告](https://www.liquid.ai/blog/d1-ultra)日期為 10/15；Clef-Omni 與 Jev 1.14 的公告日期分別為 10/9、10/14。舊 Jev 結果仍在原始資料中。

## Vals 與 ARC

[Vals 目錄](https://www.vals.ai/benchmarks)由 **50 → 51 頁**，一般 JSON 匯出 **48 → 49 份**，overall 模型列 **3205 → 3238**：新增 33 列、五筆既有 overall 列變動。

[Science Index v1.0](https://www.vals.ai/benchmarks/science_index)於 **10/16**發布，含 21 款模型，是 BioMysteryBench、MysteryMechanism、Terminal-Bench-Science 的等權平均。Astra 65.090%、Sol 6.1 59.628%、Sonnet 5.5 59.118%。此綜合指標的納入需檢查構成評測是否已計分，避免重複加權。

其餘 12 筆新增列來自 Muse Spark Open 的九個頁面、Argon 的 Vibe Code Bench 1–100（21.2%，OpenHands），以及 MiniMax M3／Mistral Large 4 的 SWE-bench Multimodal（33.333%／33.125%）。既有分數修訂包括 Kimi K3 Multimodal **35.833 → 44.167%**、Qwen3.8 Max **39.167 → 42.500%**、Muse Wonder **45.417 → 45.625%**，以及 Mistral Large 4 的 Terminal-Bench 4.0 **23.232 → 27.778%**、Vals Index **48.106 → 48.661%**。對應成本、token、latency 一併保存。

RSI 的自訂頁面新增 Muse Wonder Full（Muse Code、max）的四個構成結果，成本缺值。它與 SAFE-Teen 使用專用格式，另存頁面證據，列數不包含於一般 JSON 總量。

[ARC Prize 的 Gemini 4 Argon 頁](https://arcprize.org/results/google-gemini-4-argon)新增六種設定、17 筆評測。ARC-AGI-2 Semi-Private high 為 **91.25%**、每題 **$0.324876**。ARC-AGI-3 Standard low／medium 為 **49.7940%／46.2657%**，Provider Adapter low／medium／high 約 **97.30–97.46%**，須保存不同 harness。

ARC3 Standard low 完成 42/55 題、medium 46/55、high 19/55；high 結果未列出，分數採完整目錄分母及部分給分。成本使用目前 introductory token pricing，ARC3 的 `cost` 為整組費用。覆蓋、harness 與價格條件影響解讀。

## 其他官方證據

[GPT-Live-1.1 system card](https://deploymentsafety.openai.com/gpt-live-1-1)於 10/15 發布，包含 production／synthetic prompts 的分開安全評估族群；指標方向及模態需各自保存。[Timestral](https://mistral.ai/news/timestral/)於 10/15 發布時間序列模型，官方文章與模型卡對 GIFT-Eval 的 WQL／CRPS 標示不同，採用前須核對指標。

[AA-AgentPerf 的 Vera Rubin 結果](https://artificialanalysis.ai/articles/vera-rubin-nvl72-agentperf)與 [RTX Spark 本機結果](https://artificialanalysis.ai/articles/nvidia-rtx-spark-agentperf-local)於 10/15 發表。此類測量重播 agent 軌跡，需保留硬體、runtime、量化、快取、併發及輸出限制；例如吞吐計入大量快取 input tokens，不能解讀為模型答題品質提升。

採用前優先處理 LiveBench 2.0 的工具與 profile、FrontierMath v2／Chess v2 版本、ARC 覆蓋與 harness，以及綜合指標的重複加權。專案當前 LiveBench profile 仍含 `livebench-no-tools` 規則，Epoch direct file 清單仍指定 FrontierMath v1；具體證據與原始欄位見查核 JSON。
