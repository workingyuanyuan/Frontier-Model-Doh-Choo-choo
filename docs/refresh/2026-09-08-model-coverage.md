# 新模型補資料清單

資料日期：2026-09-08。基準為 `c90e6cf` 的來源快照、模型 mapping 與產品 `sha256:33135a904f652e3d4daad088a9859b368b5b5231538b57e54f9690771ca24d7a`。

缺格依各 profile 的 INCLUDED、非 null `normalizedScore` 與全部 24 個可選集合逐一比較；同一模型的不同 effort 分開檢查。

| 配置                   | 預設集合缺格數 | 缺格最少的集合（其中一組） | 該集合待補項目                                                       |
| ---------------------- | -------------: | -------------------------- | -------------------------------------------------------------------- |
| Muse Spark 1.3 · xhigh |              9 | free-sources-19            | Code Migration                                                       |
| Muse Spark 1.3 · max   |             12 | free-sources-19            | LiveBench 的 Instruction Following、Language、Mathematics、Reasoning |
| Smaug Mini · default   |             24 | free-sources-22            | 13 項，見下文                                                        |
| Smaug Flash · default  |             24 | free-sources-22            | 13 項，見下文                                                        |

預設集合的逐項缺格見 [9/8 更新報告](2026-09-08.md#模型對應與覆蓋)。

## 匯入與對應核對

以三個 canonical model ID 查核所有來源 candidates，AA 有 24 筆、LiveBench 有 12 筆、Vals 有 16 筆。逐一比對其中 INCLUDED 且有標準化分數的結果，產品均有相同模型、effort 與 benchmark 的有效量測。這些已對應結果沒有在產品建置時漏失；跨來源同格依現行衝突規則選取。

Vals 另有 Muse Spark 1.3 xhigh 的 [Tax Agent Bench](https://www.vals.ai/benchmarks/tax_agent_bench) 成績 71.934，候選 ID 為 `vals-ai:tax-agent-bench:meta-muse-spark-1-3`。該 benchmark 未列入現行核准清單，候選保存為 EXCLUDED；它與預設集合要求的 `tax-eval-v2` 是不同項目，因此該格仍缺少有效量測。

## 按優先順序執行

1. **查 Vals Code Migration 的 Muse Spark 1.3 xhigh**。現有 [Code Migration 快照](../../data/sources/vals-ai/candidates.json) 僅有 `meta/muse_spark_1_3_max`，分數 47.414，已納入 max。xhigh 在 `free-sources-19` 只差這一項。來源入口為 [Vals Code Migration](https://www.vals.ai/benchmarks/code-migration)；補到明確屬於 xhigh 的結果後重產集合並重建產品。
2. **查 LiveBench 是否新增 Muse Spark 1.3 max 配置**。[LiveBench candidates](../../data/sources/livebench/candidates.json) 收錄 `muse-spark-1.3-xhigh` 的四項分數，已完整納入 xhigh。max 在 `free-sources-19` 差相同四項；來源入口為 [LiveBench](https://livebench.ai/)。取得 max 的實測列與 effort 證據後才能補入。
3. **補 Smaug 的跨來源評測**。Mini／Flash 各已有 LiveBench 四項分數。最接近的 `free-sources-22` 仍缺 Code Migration、EMB、Finance Agent v2、GPQA Diamond、Harvey Legal、LegalBench、Legal Research、MedCode、MMLU-Pro、SWE-bench、TaxEval v2、Terminal-Bench 2.1、Vibe Code。優先查 [Vals](https://www.vals.ai/benchmarks) 與 [Artificial Analysis](https://artificialanalysis.ai/models) 是否提供這兩個精確模型的評測。

## 判讀邊界

此清單的「缺少」以保存的來源快照與產品為範圍；不能據此斷言網站從未發布該成績。補齊後需依現行政策重新計算集合，表中的進榜條件是固定本次集合下的分析。
