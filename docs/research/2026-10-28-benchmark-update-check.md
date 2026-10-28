# 2026-10-28 模型 Benchmark 聯網查核

以 [10/27 紀錄](2026-10-27-benchmark-update-check.md)與已提交快照為基準。本次有兩項評測方大幅改版：**AA Intelligence Index 升為 v5.0、FrontierCode 主榜改為 2.0**，兩者的整合方向由使用者在 10/28 裁決（見文末）。另有 Vals SAGE 升為 1.1、Surge DayJob 重新評分、GPT-6.1 Terra 新增成績，以及 Surge 新 benchmark DayJob: Tax。原始資料於台北 10/28 中午擷取。聯網探索與來源刷新由子代理執行，關鍵結論已由主代理對照原始頁面抽查。匯入結果見[刷新審核報告](../refresh/2026-10-28.md)。

## Artificial Analysis：Intelligence Index v5.0（10/27）

[官方公告](https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v5)。v5 分四組，各占 25%：

| 組別           | 組成與權重                                                                     |
| -------------- | ------------------------------------------------------------------------------ |
| Knowledge Work | AA-Briefcase 15%、AutomationBench-AA 5%、GDP.pdf 5%                            |
| Coding         | FrontierCode 2.0 15%、Terminal-Bench 4.0 10%                                   |
| Science        | Terminal-Bench-Science 15%、CritPt v2 hard subset 10%                          |
| General        | AA-Omniscience v1.1 15%（accuracy 10%、non-hallucination 5%）、HLE-Diamond 10% |

GDPval-AA v2.1、SciCode、AA-LCR v1.1 移出指數；HLE-Diamond 取代 Humanity's Last Exam。公告的前段名次為 Opus 5.5 max 58、Astra max 57、Sol max 55、Argon high 50，開放權重模型中 Kimi K3.1 Pro 為 46（v4.3.2 時為 55）。

以正式 adapter 刷新（`/models` 實測 28 of 715）的結果：

- 頁面母體從 251 個模型減為 214 個，37 個模型從所有評測消失，例如 Claude 4.5 Haiku／Sonnet（Reasoning）、Granite 4.2、Ministral 3、Mistral Large 3、Muse Spark 1.1（Xhigh）。沒有新增模型。
- 候選 2957→2080 列：Intelligence Index 由 248 列 v4.3.2 換成 76 列 v5.0；AA-Omniscience 改為 v1.1，500 列減為 184 列，分數全部改變；GDPval-AA 有 87 列改分。成本 437→280 列。
- 目錄新增 `frontiercode-2-0` 與 `hle-diamond`。

**試算影響（快照另存於 `artifacts/research/2026-10-28-benchmark-check/aa-v5-snapshot/`）**：前沿排名變為 Opus 5.5、Astra、Sol、Sonnet 5.5、Terra、Argon、Fable 5.1、Kimi、Muse Wonder、Muse Spark 1.3。Claude Opus 5、Fable 5 退出前十，GPT-6.1 Terra、Muse Spark 1.3 進入。Fable 5.1 的 AA 勝出檔位從 max 變為 xhigh，而 LiveBench 與 Vals 只有它的 max 成績。因此 8 模型集合的共同測試從 17 項降到 7 項，LiveBench 七項、Legal Research、VibeCode 都移出。各集合共同測試依序為 39／35／34／21／21／8／7／7／7，預設集合因 7 項持平而延伸到 `aa-top-10`。這是計分基礎與預設集合的明顯重排，交由使用者裁決（見文末）。

## FrontierCode 2.0（10/27）

[Cognition 公告](https://cognition.com/blog/frontier-code-2.0)：132 題新套件，主榜只顯示 2.0，1.1 與 1.0 排名移到各自的文章。頁面可見 2.0「Best reasoning mode」25 列、「All reasoning levels」98 列。Mistral Large 4 改用 Mistral Vibe harness 重跑，並新增 Kimi K3。最佳 effort 的 2.0 與 1.1 對照：Opus 5.5 45.5 對 54.6、Astra 42.8 對 53.3。

adapter 只找 1.1 Main 的 JSON-LD，無法在頁面核對 1.1 列數與前十，所以沒有刷新，沿用 10/27 快照。`data.json` 仍保留 `v1_1`，但少了 GPT-6.1 Terra 的五個 effort（46 個模型），其餘 136 列分數相同。依規則，來源移除的資料保留既有值。是否整合 2.0、與 1.1 如何分版，交由使用者裁決（見文末）。

## 其他現役來源

| 來源         | 變更                                                                                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vals         | GPT-6.1 Terra 新增十榜成績與成本。SAGE 升為 1.1：21 列改分（例如 Opus 5.5 45.831→91.302），69 個未重跑的 v1 列移除，6 個模型新增 1.1 成績。535 列只改 `sourcePublishedAt`。                                             |
| Surge DayJob | Finance 與 Healthcare 主榜各為 38 列（原 36），新增 Beam 1.0 與 DeepSeek V4.1 Flash 1017 Max。其餘列全部上升，例如 Finance 的 Opus 5.5 23.9→42.5、GPT 6 Astra 21.5→37.3。來源沒有標示版本，看起來是重新評分，原因不明。 |
| LiveBench    | 2.0 主榜 31 列、1.0 含 finetunes 65 列。只有 GPT-6.1 Terra 的 Coding 90.8→94.3；其餘列只改了 URL 的 cache-buster。                                                                                                      |
| Epoch AI     | 新增 GPT-6.1 Terra（max）的 GPQA Diamond 0.9432、AIME 1.0、SimpleQA Verified 0.573。其餘是依列位置編的 ID 改號與日期更新。                                                                                              |
| 其餘         | ARC、DeepSWE（28 個模型）、Surge 其他五榜（42／44／50／44／20 列）、Zapier 逐列不變，已還原。FrontierSWE 再次出現 `leaderboard and coverage model lists disagree`。                                                     |

Surge 目錄新增 [DAYJOB: Tax](https://surgehq.ai/benchmarks/dayjob-tax)（10/27 公告，50 個環境、rubric 達 95% 才算通過、每題五次），目前第一名是 Sonnet 5.5 的 10.8%。新 benchmark 的採用規則交由使用者裁決（見文末）。

## 新模型與官方發布

- **Liquid AI LFM3**（10/27，約 2B 的開放權重模型），不是前沿模型。
- **inclusionAI Ling-3.1-flash-1019** 的權重在 10/27 上架，AA 已在 10/22 評測過。
- **Mistral Large 4** 權重頁仍寫「Upcoming release」，預計 10/31；**Kimi K3.1 Pro** 權重尚未上架。
- **未確認**：「GPT-6.1 Terra Pro」只出現在 OpenRouter，OpenAI 官方沒有對應頁面，暫不視為新模型。
- OpenAI、Anthropic、xAI、Epoch、ARC Prize 都沒有新的模型或 benchmark 公告。

## 證據與範圍

原始擷取放在 `artifacts/research/2026-10-28-benchmark-check/` 下：

- `web/`：聯網探索的頁面，附 manifest、SHA-256 與 HTTP 狀態。
- `refresh/`：各站的刷新 log、渲染文字與列數，以及語意差異 `semantic-diff.json` 和 `content-diff-epoch-vals.json`。
- `aa-v5-snapshot/`：AA v5 的快照與試算產品。
- `import-baseline/`：匯入前基準。

openai.com/news 回 403、Meta blog 回 400，改用 API changelog 與 Hugging Face 查核。

## 使用者裁決（2026-10-28）

- **AA v5**：跟隨新版，代表 effort 改為「其他組織也有成績」的檔位。字面規則（AA 分數最高、且有其他組織成績）仍會選 Fable 5.1 的 xhigh，因為 xhigh 也有 ARC、FrontierCode、Zapier 的成績，8 模型集合因此只剩 7 項。試算後由使用者改選規則 B：在有 ≥2 個其他組織成績的 effort 中，取組織數最多者，同數比 AA 分數。
- **FrontierCode**：使用者原文「FrontierCode 2.0 與 FrontierCode 1.1 不存在替換關係吧? 這是兩個不同的 Benchmarks」。因此 2.0 作為新 benchmark 加入，1.1 保留。成本圖要等 2.0 涵蓋更多較新的前沿模型時再討論。
- **DAYJOB: Tax**：納入。

整合與驗證結果見[刷新審核報告](../refresh/2026-10-28.md)。
