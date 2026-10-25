# 2026-10-25 模型 Benchmark 聯網查核

以 [10/24 紀錄](2026-10-24-benchmark-update-check.md)與實際匯入快照為最近基準，本次主要更新為 **Vals 新增 Kimi K3.1 Pro 成績、LiveBench 預覽版新增 Step 5 Preview，以及 AA 補上 Beam 的 CritPt v2 結果**。原始資料於台北 10/25 中午擷取；逐欄差異、來源時間與 SHA-256 見[查核 JSON](2026-10-25-benchmark-update-check.json)。現役資料的匯入與看板影響見[刷新審核報告](../refresh/2026-10-25.md)。

## Vals：Kimi K3.1 Pro

官方新增十個 overall 結果，均明示 `reasoning_effort=max`、Moonshot AI provider、temperature 1、top_p 0.95、max_output_tokens 262144。VibeCode 使用 OpenHands，其餘列沒有公開 harness；不能把這個輸出上限視為每題實際使用量。

| 官方榜單                                                          | 版本 |    分數 | USD／test |
| ----------------------------------------------------------------- | ---- | ------: | --------: |
| [EMB](https://www.vals.ai/benchmarks/emb-v1-1)                    | 1.1  | 70.000% | $1.588749 |
| [Finance Agent](https://www.vals.ai/benchmarks/fabv2-1)           | 2.1  | 61.488% | $2.290605 |
| [HLAB](https://www.vals.ai/benchmarks/hlab)                       | 1.1  | 11.667% | $9.004671 |
| [Legal Research](https://www.vals.ai/benchmarks/legal_research)   | 1    | 37.500% | $7.231463 |
| [Tax Agent Bench](https://www.vals.ai/benchmarks/tax_agent_bench) | 1    | 24.870% | $3.643476 |
| [Terminal-Bench](https://www.vals.ai/benchmarks/terminal-bench-4) | 4.0  | 63.636% | $4.568940 |
| [VibeCode](https://www.vals.ai/benchmarks/vibe-code)              | 1.1  | 84.894% | $7.485151 |
| [Vals Index](https://www.vals.ai/benchmarks/vals_index)           | 2.2  | 62.520% | $6.440192 |
| [Finance Index](https://www.vals.ai/benchmarks/finance_index)     | 1    | 56.012% | $2.507610 |
| [Legal Index](https://www.vals.ai/benchmarks/legal_index)         | 1    | 67.037% | $6.626537 |

官方 fallback 資料十列皆為 available、refusals／fallbacks 都是 0，without-fallback 等於 published。三個 Index 是既有測試的聚合，不能作為額外獨立測量。Legal Index 的 HLAB 成分使用 criteria pass rate，Legal Research 使用各領域 all-pass，再按律所營收加權；不能直接平均表內兩個 overall 分數來驗算。

Vals 目錄維持 60 頁，標準 JSON 為 56 頁、3458 overall／23352 task 列；Router 自訂資料另有 5／45，RSI 另有 25／125。56 個標準 payload 的清單、SHA-256 與正式 adapter 逐一核對吻合。相對 10/24 正式快照新增十筆候選與十筆成本，既有候選分數及成本沒有修改。

另由 10/23 完整研究資料補查 [ClaimBench](https://www.vals.ai/benchmarks/claimbench)：drex-max **99.184%**、solar-decide-flash **82.449%**。10/24 沒有保存該頁完整 payload，不能把這兩筆斷定為 10/25 才新增。

## LiveBench 2.0

[公開主榜](https://livebench.ai/)仍是 `20261014`、53 列；table、cost、categories、notes 與 effort registry 對 10/24 相同。官方 bundle 改為 `main.27333af3.js`。

[`/new` 預覽版](https://livebench.ai/new) `20261023` 由 30→31 列，新增 Step 5 Preview／max，其餘三十列分數相同：

| Long Agentic | Reasoning | Coding | Browser | Data Analysis | Research | Design |
| -----------: | --------: | -----: | ------: | ------------: | -------: | -----: |
|         19.4 |      83.8 |   85.6 |    24.8 |          63.5 |     72.8 |   76.9 |

預覽版的 `_overall_weights` 仍為 Long Agentic ×2、Coding／Design ×1.5，其餘 ×1；notes 卻仍描述等權，已保留這項文件差異。主榜與預覽的 Long Agentic／Browser 使用不同給分資料，各自保留版本。預覽若升為主榜，adapter 需先辨識權重 metadata，再跟隨新版本重新物化。

## Epoch AI

[官方 ZIP](https://epoch.ai/data/benchmark_data.zip)共 92 個成員，相對 10/24 僅六份 CSV 的國家清單順序變動，沒有新增、刪除或修改成績。ECI scores **270**、ECI inputs **2888**、EDI **59** 列，均逐位元相同；完整 runs CSV **1779** 列僅一列國家順序變化。

[Hub](https://epoch.ai/benchmarks)顯示 411 models／94 benchmarks，[搜尋目錄](https://epoch.ai/benchmarks/search)顯示 94 results，ZIP metadata 為 91 個 benchmark。這些是不同覆蓋範圍；缺少前日同頁完整 registry，不能從數量推定某個 benchmark 首發。Kimi 的四個 effort metadata 在 10/24 已存在，本次沒有新增 Epoch 成績。

[ForecastBench 上游](https://www.forecastbench.org/assets/js/leaderboard_tournament_compact.js)與 10/23 保存資料比較，仍有 406 列，其中 38 列 Overall 修訂、88 列僅 Rank 變動；Epoch 匯入尚未同步。這是 difficulty-adjusted Brier Index，並非答對率。

## Artificial Analysis

[CritPt v2](https://artificialanalysis.ai/evaluations/critpt-v2)新增 **Beam 1.0：39.7143%**，目前十二配置；10/24 實際匯入頁面的對應欄位仍為 null。此評測有 70 題，使用離線 Stirrup 程式工具、每題五次、最多五十 turns，屬 standalone，不能替換 Intelligence Index 中的舊 CritPt 欄位。[FrontierCode](https://artificialanalysis.ai/evaluations/frontiercode)另補上 gpt-oss-120b High 的 **1.2222333%**。

`/models` 無頭瀏覽器實測為 **27 of 709 models**；Intelligence Index 維持 v4.3.2。首頁的 708 與模型目錄的 709 分別保存，不混用母體。[Coding Agent Index v2.0](https://artificialanalysis.ai/agents/coding-agents)完整二十四配置／二十一個非 router，三項等權重算通過；其 index、分項與成本對 10/23 補充基準相同，reward-hacking 的 materializedAt 更新不當成新分數。

[HealthBench 原網址](https://artificialanalysis.ai/evaluations/healthbench)現在預設顯示 Professional，頁內可切換一般版；兩種題集及結果欄位分開保存。AA 正式匯入涵蓋 256 profiles，API 交叉核對通過；現役 adapter 採用的候選分數與成本對 10/24 沒有實質變化。

## 官方模型卡與發布表

[Kimi 官方比較表](https://www.kimi.com/en/blog/kimi-k3-1-pro)相對 10/24 修訂 GPT-6 Astra（max, with fallback）的 Agents’ Last Exam ALL **32.8→41.8**、CLI **38.8→44.2**。其餘分數相同；這是供應商引用的對手結果修訂，不代表新 checkpoint。完整 47 列配對表、harness、tools 與限制已保存。

補查較早發布的 [NVIDIA Bolt E4B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16)二十一項 benchmark 配對表，以及 [WeVisOne-VL](https://github.com/Tencent/WeVisOne-VL)與 [Hy-Nomas Diffusers](https://huggingface.co/tencent/Hy-Nomas-Diffusers)模型卡及權重 OID。首權重均早於 10/24 查核完成時間，列為補覆蓋候選，沒有用最近檔案修改日冒充發布日。

## 證據與範圍

原始擷取、逐欄差異、匯入前基準、各來源驗證與根目錄 evidence manifest 位於 `artifacts/research/2026-10-25-benchmark-check/`。ARC、Surge、DeepSWE、FrontierCode、Zapier、FrontierSWE 亦與最近保存資料比對。四個發布頁來源與十九個官方 Hugging Face 組織採有限頁面及最新二十筆搜尋；部分頁面回應 403／401。10/24 未保存完整檔案的部分，明列以 10/23 或固定 commit 補充；舊 Vals asset 的 404 不作為榜單消失依據。
