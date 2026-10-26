# 2026-10-26 模型 Benchmark 聯網查核

以 [10/25 紀錄](2026-10-25-benchmark-update-check.md)與已提交快照為基準，本次主要發現是 **LiveBench 2.0 主榜升版為 `20261025`**：預覽版轉為正式版，Long Agentic 與 Browser 重新給分，主榜由 53 列縮減為 30 列，Overall 改用加權平均。現役 adapter 起初因不認得新的 `_overall_weights` metadata 而停止。**使用者於 10/26 決定跟隨新版**，adapter 改為驗證權重後重新物化，正式產品已改用 `20261025`。AA 只有三筆 GDPval-AA 微幅修訂，其餘 13 個可線上刷新的現役來源逐列不變。原始資料於台北 10/26 下午擷取。逐欄差異與 SHA-256 見[查核 JSON](2026-10-26-benchmark-update-check.json)，匯入結果見[刷新審核報告](../refresh/2026-10-26.md)。

## LiveBench 2.0：`20261025` 升為正式版

bundle `main.e0554084.js` 的 release 清單為 `["20261014","20261025"]`。頁面顯示「Last updated 25 October 2026 — the latest release」，無頭瀏覽器實測主榜 **30 列**；1.0 歷史頁（`#/release/2026-06-25`）勾選 Include finetunes 後仍是 **65 列**。昨天的 `/new` 預覽資料 `data/20261023/` 已回 404。

- **權重**：`categories.json` 新增 `_overall_weights`，Long Agentic ×2、Coding／Design ×1.5，其餘 ×1。頁面寫明這是各 release 自訂權重，「Releases up to 2026-10-14 weight every suite equally, and a published release's values never change」。我們不採用來源 Overall，七個 suite 的欄名與分類對應都沒變。
- **重新給分**：與 10/14 版共有的 30 個模型都只改 Long Agentic 與 Browser 兩欄，Nemotron 3.5 Super VL 另外改了 Reasoning、Coding、Research、Design。舉例：Claude Opus 5.5 的 Long Agentic 85.0→72.8、Browser 80.0→88.4；GPT-6 Astra 82.4→77.5、84.0→91.3；Kimi K3.1 Pro 49.5→39.1、80.0→75.9。
- **移出主榜的 23 個模型**：Beam 1.0、Claude Fable 5、Claude Opus 5、Claude Opus 4.8、Claude Sonnet 5、Claude Sonnet 4.6、Claude Haiku 4.5、GPT-5.5、GPT-5.6 Luna／Sol、GPT-6 Sol、Gemini 3.1 Pro、Gemini 3.7 Flash、Grok 4.5、GLM-5.3、MiniMax M3、DeepSeek V4 Flash（含 vision）、DeepSeek V4.1 Flash、Muse Spark 1.2、Nemotron Lightning 3.5、Nemotron Ultra 3、Qwen3.8 Flash。新版沒有新增模型。
- **與 10/25 預覽版比較**：只少了 Beam 1.0，另外三列 Nemotron 變體的 Browser 修正（例如 Super VL 4.2→21.6），其餘相同。

### 跟隨新版的影響試算（獨立 worktree，未寫入正式產品）

在 adapter 略過 `_overall_weights` 後以 30／65 的畫面列數重新物化，494 個候選、24 個未解析名稱（原本就未對應的長尾模型）。以目前快照重建產品（`livebench-preview/current.json`）的結果：

| 集合                    |       共同測試：現行 → 新版 | 說明                                                                                                                    |
| ----------------------- | --------------------------: | ----------------------------------------------------------------------------------------------------------------------- |
| `aa-top-2`～`aa-top-8`  |       同現行（36、18、17…） | LiveBench 七項保留但分數改變。前 8 名：Opus 5.5 69.21→68.88、Fable 5.1 68.99→68.50；Sonnet 5.5 升到第 5，Argon 降到第 6 |
| `aa-top-9`、`aa-top-10` |                      17 → 9 | Opus 5、Fable 5 不在新版主榜，LiveBench 七項與 `aa-lcr` 一起移出                                                        |
| 預設集合                | `aa-top-10` → `aa-frontier` | 第 9、10 名集合的共同測試數低於第 8 名集合，依規則不再延伸                                                              |

這屬於來源大幅改版與預設集合明顯重排，曾提出三個方案：跟隨 `20261025`、暫留 `20261014`、兩版混用（不建議，兩版的 Long Agentic／Browser 給分不同）。

**裁決**：2026-10-26 使用者原文「採用方案 1，跟隨 LiveBench 新版」。adapter 改為驗證 `_overall_weights`（只接受已知 suite 與正數權重）後重新物化，正式產品的預設集合、各集合測試、名次與 Overall 都與試算相同，見[刷新審核報告](../refresh/2026-10-26.md)。

## Artificial Analysis

`/models` 實測 **27 of 709 models**，Intelligence Index 仍是 v4.3.2，目錄沒有新增 benchmark（19 項待審都是既有的未整合項目）。正式刷新得到 256 profiles、243 active、2871 候選、419 成本，API 交叉核對通過。和 10/25 快照相比只有三筆 GDPval-AA normalized score 微調：GLM-5.3-Flash 57.109→57.108、MiniMax-M3 37.1235→37.128、MiniMax-M3.1-Flash 47.8845→47.8785。三個模型都不在前沿集合內。

## 逐列不變的現役來源

ARC Prize、DeepSWE、Epoch AI、FrontierCode、Surge 七榜（Chartography、Complex Constraints、CoreCraft、Riemann、DayJob Finance／Healthcare、GDP.xlsx）、Vals、Zapier AutomationBench 都用正式 adapter 完成刷新，候選與成本扣除擷取時間、evidence id 後**逐列相同**。快照已還原為已提交版本，不做無實質變更的匯入。FrontierCode 渲染列數 46 與 adapter 吻合；DeepSWE 與 Surge 這次沒有獨立重數畫面列數，因為沒有匯入，不影響正式資料。

FrontierSWE 依然出現「leaderboard and coverage model lists disagree」，屬於既有的上游不一致，沿用前次快照。Vals 與 Surge 的即時目錄沒有新增或移除 benchmark。

## 新模型與官方發布

AA changelog 最新一筆是 10/23（Kimi K3.1 Pro、Nemotron 3.5 Bolt E4B）。10/24–26 的公開發布彙整只看到 Block 語音模型與 Qwen3 Reranker 8B，都不是看板評比的對象。沒有找到新的前沿 LLM、checkpoint 或供應商比較表修訂。第三方報導提到 Mistral Large 4 的權重預計 10/27 釋出，屬於後續查核條件，不是新的成績。

## 證據與範圍

原始擷取、各站刷新 log、語意差異、渲染文字與計數、LiveBench 新舊檔案和試算產品都在 `artifacts/research/2026-10-26-benchmark-check/`。匯入前基準位於同目錄的 `import-baseline/`。四個供應商發布頁來源是離線快照，這次沒有重建。
