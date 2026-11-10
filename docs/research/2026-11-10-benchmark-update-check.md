# 2026-11-10 benchmark 聯網查核

## 範圍與基準

本次查核以工作目錄起始 commit `2e656d55e0f5cad1f1a7b4c4b4a92eef123eb6ce`、匯入前產品基準版本 `sha256:720ec5d5ead2dc2953b9c768073ffef59777db085be53f1bea0e2f95fdf4c258` 為比較對象；更新後產品版本為 `sha256:3d7046b4c0829adf6f9c2c3a3a65519da1a2b828d1fc6f18c86c924068e62398`。查核涵蓋現役來源刷新、Anthropic 發布頁、其他受追蹤供應商官方入口、Hugging Face latest8 樣本與延續研究候選。原始資料與抓取紀錄保存在 `artifacts/research/2026-11-10-benchmark-check/`，逐欄結構化資料見[同名 JSON](2026-11-10-benchmark-update-check.json)。

本次任務由多代理分工協作完成：

- **來源刷新與語意差異**：由 Codex（gpt-6.1-sol）執行現役來源 materializer 刷新。
- **上游消息與榜單探索**：由 agy（Gemini 3.8 Flash）執行三輪檢索。第一輪在擷取 21 份原始頁面後發生逾時中斷；隨後拆分為資料擷取（A）與消息探索（B）兩階段重跑，產出 76 份完整回應與探索報告。
- **身分研究與核實**：由 Codex 完成官方模型身分評估與跨來源對齊。

本次 release 正式新增三個模型身分：`anthropic-claude-fable-5-2`（發布日期 2026-11-09）、`meta-muse-ember`（發布日期 2026-11-09）、`agnes-agnes-2-5-pro-theta`（發布日期 null，官方未明示）。其中 Claude Fable 5.2 進入每一組包含該模型的 Artificial Analysis cohort，且均排名第 1，其 AA Intelligence Index 為 64.56（Max effort）。完整的資料更新細節與產品影響分析見[同日刷新報告](../refresh/2026-11-10.md)。

## 主要消息：Claude Fable 5.2 與 Mythos 5.2

Anthropic 官方公告及模型文件明示發布日期為 **November 9, 2026**。官方 API ID 分別為 `claude-fable-5-2` 與 `claude-mythos-5-2`。雲端合作夥伴 ID 包含 Amazon Bedrock（`anthropic.claude-fable-5-2`、`anthropic.claude-mythos-5-2`）、Google Cloud（`claude-fable-5-2`、`claude-mythos-5-2`）、Microsoft Foundry（`claude-fable-5-2`、`claude-mythos-5-2`、`claude-fable-5-2-fast`）及 AWS Platform（`claude-fable-5-2`）。目前官方文件未標註具日期的獨立 checkpoint ID（標記為未知）。[官方公告](https://www.anthropic.com/claude-fable-and-mythos-5-2)、[模型文件](https://platform.claude.com/docs/en/models/fable-5-2/overview)、[變更說明](https://platform.claude.com/docs/en/models/fable-5-2/whats-new)

在計費與規格方面：

- **Standard 模式**：每百萬 input tokens 為 **US$8**、output tokens 為 **US$40**；5 分鐘 cache writes 為 **US$10**、1 小時 cache writes 為 **US$16**、cache reads 為 **US$0.20**；Batch API 為 input **US$4**、output **US$20**。
- **Fast 模式**：每百萬 input tokens 為 **US$16**、output tokens 為 **US$80**，最高提供 2.5 倍輸出速度。
- **規格與推論設定**：Context window 為 1M tokens（1,000,000），最大輸出為 128K tokens（131,072）。提供五檔 effort 等級（`low`、`medium`、`high`、`xhigh`、`max`）；API 預設為 `high`，Claude app 與 Claude Code 預設為 `medium`。

**模型身分與防護配置關係**：Claude Fable 5.2 與 Claude Mythos 5.2 為相同的底層模型，但配置不同層級的安全防護措施（safeguards）。Fable 5.2 具備嚴格的網路安全與生物防護機制，向所有大眾與付費用戶開放；Mythos 5.2 採用較寬鬆防護，僅限通過 Anthropic 審核計畫（Life Sciences and Cyber Verification Programs）的機構或 Enterprise Claude Security 使用。依循專案既有前例（參見 [docs/research/anthropic-release-expansion.md](anthropic-release-expansion.md) 針對 Fable/Mythos 5.1 的處理原則），兩者模型身分維持分立，不進行合併。

官方發布頁公布的完整評測成績如下表所示。發布文章中的分數僅列為研究候選，今日不予直接併入資料庫；新圖表與自報成績需依 OPERATIONS 規範進行 parser 審查、確認評測執行者、版本、harness 與配對成本後，始可決定是否採用。

| 官方評測領域與基準                                                 |                        Fable 5.2 |              Fable 5.1 |                     Opus 5.5 |         GPT-6 Astra |         Gemini 4 Carbon |
| :----------------------------------------------------------------- | -------------------------------: | ---------------------: | ---------------------------: | ------------------: | ----------------------: |
| **Agentic coding**: FrontierCode 2.0                               |       **49.1%** _(Xhigh effort)_ | 32.4% _(Xhigh effort)_ |                        45.5% |               42.8% | 41.1% _(Medium effort)_ |
| **Agentic coding**: FrontierSWE v2                                 |                        **69.9%** |                  56.3% |                        62.3% |               65.5% |                   61.2% |
| **Business workflows**: AutomationBench                            |                            51.4% |                  31.4% |                        42.5% |               41.4% |               **53.9%** |
| **Agentic scientific research**: Terminal-Bench-Science 0.1        | **74.6%** / _75.3% (Mythos 5.2)_ |                  52.6% |                        58.7% |               68.1% |                   64.8% |
| **Cybersecurity**: CyScenarioBench †                               |    **76.3%** _(Mythos 5.2 專有)_ |   61.7% _(Mythos 5.1)_ | 67.6% _(without safeguards)_ | 61% _(GPT-6 Cyber)_ |                       — |
| **Cybersecurity**: CVE Rediscovery                                 |    **89.6%** _(Mythos 5.2 專有)_ |   78.3% _(Mythos 5.1)_ | 81.3% _(without safeguards)_ |                   — |                       — |
| **Protein design**: De novo binder design (24 hr)                  |    **85.1%** _(Mythos 5.2 專有)_ |   79.1% _(Mythos 5.1)_ | 82.6% _(without safeguards)_ |                   — |                       — |
| **Agentic search**: WANDR (relaxed score)                          |                        **82.1%** |                  68.7% |                        72.3% |                   — |                       — |
| **Computer use**: OSWorld 2.1 (offline set, partial)               |                        **89.3%** |                  83.5% |                        87.2% |               79.5% |                   81.5% |
| **Robotics**: RoboDojo Sim ‡                                       |                        **64.9%** |                  27.6% |                        39.4% |               29.8% |                       — |
| **Knowledge work**: AA-Briefcase v1.1 _(rubric)_                   |             **66.1%** _(rubric)_ |       61.5% _(rubric)_ |             61.2% _(rubric)_ |    52.0% _(rubric)_ |        61.8% _(rubric)_ |
| **Knowledge work**: AA-Briefcase v1.1 _(Elo)_                      |                     1785 _(Elo)_ |           1669 _(Elo)_ |             **1800** _(Elo)_ |        1569 _(Elo)_ |            1611 _(Elo)_ |
| **Knowledge work**: Remote Labor Index (RLI)                       |        **41.3%** _(High effort)_ |                  17.9% |                        21.3% |               20.8% |                       — |
| **Multidisciplinary reasoning**: Humanity’s Last Exam (with tools) |                        **74.2%** |                  65.6% |                        67.7% |               57.2% |                       — |
| **Visual chart recognition**: Chartography (no tools)              |                        **73.4%** |                  44.8% |                        64.4% |               71.0% |                   72.5% |

**評測註腳與說明**：

- **評測通則**：評測方法詳見 Claude Fable 5.2 與 Claude Mythos 5.2 [System Card](https://www.anthropic.com/document/claude-fable-5-2-mythos-5-2-system-card)。除特別註明者外，Fable 5.2、Fable 5.1 與 Opus 5.5 的分數均在開啟防護措施（safeguards on）下測得；除特別註明者外，所有分數均採各模型之最高可用 effort 等級。
- **† CyScenarioBench**：各實驗室的題目均不相同，為各別獨立任務。
- **‡ RoboDojo Sim**：展示最高可用 effort，由 Anthropic 內部執行評測。
- **註 1（CVE）**：CVE 指 Common Vulnerabilities and Exposures 軟體弱點列舉系統。
- **註 2（弱點計數）**：弱點數量來自單一測試者的原始審查紀錄，但多位測試者一致反映 Mythos 5.2 能發現比早期模型更多的弱點；在 Anthropic 內部基準上弱點辨識表現與 Opus 5.5 相當。
- **註 3（蛋白質晶體 RMSD）**：以 Cα RMSD 與實驗結構對比（AAV2 PDB:1LP3），若任一預測模型誤差在 3 Å 內即計為正確。
- **註 4（獨立性聲明）**：外部受測組織未審閱公告與 System Card 內文，亦未背書任何宣稱。
- **註 5（Mythos 5.2 測試原因）**：部分任務由 Mythos 5.2 執行，係因在縮減防護下能最全面檢視模型行為極限；預期 Fable 5.2 具相似表現，但在更嚴格防護下部分潛在濫用途徑會被阻截。

## 現役來源

本次 20 個現役來源刷新命令之最終記錄退出碼均為 0。各來源候選與成本的逐項差異統計如下：

- **Artificial Analysis**：候選筆數由 2,840 增至 2,943（新增 104 列、移除 1 列、既有 36 列有欄位差異）；成本新增 16 列、既有 2 列改變。新增原始模型名稱包含 Agnes 2.5 Pro Theta、Claude Fable 5.2 五檔 effort（High、Low、Max、Medium、Xhigh，均標示 Default Fallback）、Muse Ember（Max、Xhigh）。瀏覽器渲染 catalog 母體為 734 列，預設顯示 27 列。監測注意項：`critpt-v2` 遺失 1 筆 profile（MiniMax-M3.1-Flash）。[官方榜單](https://artificialanalysis.ai/models)
- **LiveBench**：當期 2.0 release 日期自 2026-10-25 更新為 **2026-11-06**（涵蓋全部七個 2.0 suite）。畫面 2.0 顯示 33 個模型，凍結 1.0 顯示 65 列。候選新增 7 列、移除 0 列、既有 224 列因版本更新產生欄位差異；成本 42 列改變。新增模型名稱為 `claude-fable-5.2`，在 xhigh 下 7 個 suite 均列為 INCLUDED。原始首頁為 React 客戶端渲染 SPA，已透過官方匯出檔與瀏覽器渲染取得可見性。[官方榜單](https://livebench.ai/)
- **FrontierCode 2.0**：候選新增 5 列、移除 0 列、0 列改變；成本新增 5 列、0 列改變。新增 Claude Fable 5.2 五檔 effort 設定。[官方榜單](https://cognition.com/frontiercode)
- **FrontierSWE V2**：候選新增 1 列、0 列改變；成本 0 列改變。新增 Claude Fable 5.2（proximus harness），排名第一。[官方榜單](https://www.frontierswe.com/)
- **ARC Prize**：候選新增 5 列、0 列改變；成本新增 5 列、0 列改變。新增 Claude Fable 5.2 五檔 effort 設定（Low、Medium、High、XHigh、Max）及配對任務成本。[官方模型資料](https://arcprize.org/media/data/models.json)、[評測資料](https://arcprize.org/media/data/evaluations.json)
- **Epoch AI**：候選新增 6 列、0 列移除、既有 235 列改變；成本 0 列改變。新增 6 列包含 Fable 5.2 max 的 AIME、Chess Puzzles、GPQA Diamond、SimpleQA Verified 評測，以及 Fable 5.2 與 Kimi K3.1 Pro 的 ECI 成績。既有 235 列之差異均為 ECI composite raw score，依專案品質政策維持 EXCLUDED；直接評測（direct-benchmark）之既有成績無變動。[官方資料](https://epoch.ai/data/benchmarks.csv)
- **Vals AI**：候選新增 29 列、既有 21 列改變；成本新增 29 列。新增原始名稱為 `anthropic/claude-fable-5-2` 與 `meta/muse-ember`。五個特定頁面（cyber_offense、inference_provider、mental-health、rsi_index、vals_router_index）仍無可解析之 BenchmarkView overall 資料；ClaimBench 畫面顯示 Systems (20)，parser 取得 25 列，差異留存。[官方目錄](https://www.vals.ai/benchmarks)
- **Zapier AutomationBench**：候選新增 5 列、0 列改變；成本新增 5 列、0 列改變。新增 Claude Fable 5.2 五檔 effort 設定（均標示 default fallbacks）。[官方榜單](https://zapier.com/benchmarks)
- **未變動來源**：DeepSWE、MaxxBench、BioBasicsBench 以及 Surge 八個主榜（Chartography、Complex Constraints、Corecraft、Riemann、Dayjob Finance、Dayjob Healthcare、Dayjob Tax、GDP-xlsx）的候選與成本均無語意變動（+0, −0, 0 changed）。其中 BioBasicsBench 係由離線保存快照重建物化（37 筆候選）。Fireworks Specialized Intelligence Index（SII）最新更新時間仍為 2026-11-09T00:34:02Z，無語意變動，亦未見 Fable 5.2。

### Claude Fable 5.2 在現役受追蹤來源之收錄現況

下表彙整 Claude Fable 5.2 於各現役來源的收錄狀態與關鍵代表成績：

| 來源名稱                   |    狀態    | 關鍵分數 / 代表成績與設定                                                                                                                                            | 成本 / 說明                                            |
| :------------------------- | :--------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
| **Artificial Analysis**    | **已收錄** | Intelligence Index **64.56**（Max，排名 #1/103）；AA-Briefcase rubric **66.08%**；AA-LCR **83.33%**；CritPT-v2 **86.29%**                                            | 每任務 US$26.54；全五檔 effort 均標示 Default Fallback |
| **LiveBench**              | **已收錄** | 2026-11-06 版（xhigh）：Research **94.5**、Reasoning **88.8**、Browser **86.9**、Design **85.1**、Long Agentic **82.9**、Data Analysis **81.5**、Coding **79.2**     | 7 個 suite 均列入 INCLUDED                             |
| **Vals AI**                | **已收錄** | Vals Index **71.31%**（#1/36）；Vibe Code Bench **93.77%**；EMB v1.1 **77.38%**；Finance Agent v2.1 **69.47%**；Terminal-Bench 4.0 **65.15%**（與 Opus 5.5 並列 #1） | 每次測試 US$17.94                                      |
| **Cognition FrontierCode** | **已收錄** | FrontierCode 2.0 weighted-rubric **49.11%**（xhigh，排名 #1，正確率 53.48%）                                                                                         | 任務成本 US$17.734；五檔 effort 成績完整               |
| **FrontierSWE**            | **已收錄** | FrontierSWE V2 Mean@5 **69.94%**（69.94018470588233%，排名 #1；best@5 79.19%、worst@5 62.05%）                                                                       | proximus harness；平均成本 US$168.78                   |
| **Epoch AI**               | **已收錄** | AIME 2024-2025 **99.72%**；GPQA Diamond **93.88%**；SimpleQA Verified **94.00%**；Chess Puzzles **79.00%**（均為 max effort）                                        | ECI 174.24 列為 EXCLUDED                               |
| **ARC Prize**              | **已收錄** | ARC-AGI-2 Semi-Private **93.75%**（XHigh）；ARC-AGI-1 Public Eval **99.25%**（Max）                                                                                  | XHigh 每任務 US$0.983；Max 每任務 US$2.814             |
| **Zapier AutomationBench** | **已收錄** | AutomationBench 1.0.6：Max **51.45%**（排名 #3）、XHigh **47.95%**（排名 #6）、High **44.29%**（排名 #8）                                                            | Max 每任務 US$4.64；均採用 Anthropic default fallbacks |
| **DeepSWE**                | **未收錄** | 0 筆 Fable 5.2 或 Mythos 5.2 資料；僅存既有 claude-fable-5 列                                                                                                        | 上游端點無新資料                                       |
| **MaxxBench**              | **未收錄** | 0 筆 Fable 5.2 資料；最新 changelog 仍為 2026-11-07（Qwen3.8 Flash Next xhigh）                                                                                      | 上游尚未評測                                           |
| **Surge (8 主榜)**         | **未收錄** | 8 個主榜合計 248 可見列中 0 筆符合 Fable 5.2；僅存 Fable 5.1 歷史列                                                                                                  | 上游尚未評測                                           |
| **Fireworks SII**          | **未收錄** | API 匯出僅含 Fable 5.1（high/low/medium），未見 Fable 5.2                                                                                                            | 上游端點未更新                                         |

## 其他官方模型身分

本次查核確認兩款新官方模型身分，其餘追蹤廠商均無官方新模型發布：

- **Muse Ember（Meta，2026-11-09）**：定位 Meta 官方發布公告與開發者文件，明示發布日期為 **November 9, 2026**，API 模型 ID 為 `muse-ember-1.0`。Context window 為 1,048,576 tokens（1M），最大輸出為 524,288 tokens（512K）。Effort 等級為 `minimal` 至 `max`，預設為 `max`。定價：小於等於 200K input 為每百萬 tokens input **US$0.10**、output **US$0.50**、cached input **US$0.004**；大於 200K input 為 input **US$0.30**、output **US$1.50**、cached input **US$0.012**。已於 AA 與 Vals 現役來源建立對齊；Meta 發布頁圖表混雜 AA 成績與內部評測，成績列為研究候選。[Meta 公告](https://research.meta.ai/blog/muse-ember)、[模型文件](https://dev.meta.ai/docs/muse-ember)、[模型頁](https://dev.meta.ai/models/muse-ember)
- **Agnes 2.5 Pro Theta（Agnes）**：官方專頁與價格頁明示名稱與 API 模型 ID `agnes-2.5-pro-theta`。具備 reasoning、多模態圖文輸入與工具呼叫能力。價格為每百萬 tokens input **US$0.10**、output **US$0.30**、cache read **US$0.01**。官方未明示發布日期（canonical releaseDate 保持 null；文件之 `dateModified` 為 2026-11-09T08:02:15.682Z；AA 標註之 11/07 僅屬來源自報，非官方發布依據）。Context window 與具名 effort 官方未明示（標記為未知）。[官方專頁](https://www.agnes-ai.com/zh-Hans/docs/agnes-25-pro-theta)、[官方價格](https://www.agnes-ai.com/zh-Hans/docs/pricing)
- **其他受追蹤廠商檢查**：OpenAI、Google、Meta（除 Ember API 外無開源 checkpoint）、xAI、DeepSeek、Moonshot、Qwen、Mistral、MiniMax、Zhipu、Thinking Machines、LG 均無官方新模型。檢查範圍涵蓋官方新聞/公告頁與 Hugging Face Organization API（最新 8 個 repo 比較）；除 Qwen 官方 blog 取得 byte 級完全相同外，其餘廠商首頁公告未變動，HF latest8 樣本之最新模型名單亦完全一致。

## 新 benchmark／版本與待查線索

針對 Anthropic 發布引述之新評測及既有研究候選進行追蹤核查；任何新 benchmark 或評測版本的採納與計分政策均屬使用者決策，目前僅列為研究候選：

- **FrontierSWE V2**：主辦方 Proximal Labs 公開榜單與 repo（`frontier-swe-v2`）已正式上線，當前版本即為專案已追蹤之版本（`frontier-swe-v2`）。首頁公開榜單顯示 Claude Fable 5.2 排名第一（Mean@5 69.94%）。[主辦方榜單](https://www.frontierswe.com/)、[官方 repo](https://github.com/Proximal-Labs/frontier-swe-v2)
- **Terminal-Bench-Science 0.1**：Harbor Framework 主辦之獨立評測 repo 與獨立榜單入口均已定位，Zenodo DOI 為 `10.5281/zenodo.22110253`，頁面明示版本為 `0.1`。除主辦方網站外，Vals 與 AA 亦有獨立評測。發布日期在頁面未有明確公布，標記為未知。Anthropic 發布自報 Fable 5.2 為 74.6%、Mythos 5.2 為 75.3%。[主辦方榜單](https://www.terminal-bench-science.ai/)、[官方 repo](https://github.com/harbor-framework/terminal-bench-science)
- **WANDR（Wide ANd Deep Research）**：Perplexity 官方 repo 提供評測任務集、評測 adapter 與 Harbor task registry，論文為 arXiv 2608.14747（2026 年 8 月）。**目前該專案並無公開之互動式網頁榜單**，Anthropic 公布之 82.1% 係自行跑開源套件之 relaxed 評測分數。因無常態公開排行榜，是否納入需另行研議。[官方 repo](https://github.com/perplexityai/wandr)
- **Remote Labor Index（Scale AI / CAIS）**：Scale 官方榜單已新增 Fable 5.2，排名第一，得分 41.3（資料欄位 `maxScore` 為 42.539，建立時間 2026-11-09T20:13:33.000Z；Anthropic 發布表註明 high effort）。列為候選研究。[Scale 官方榜單](https://scale.com/leaderboard)
- **VIALS-AA**：延續 11/08 紀錄，為 Artificial Analysis 於 11/06 發布之研究專文，目前仍無獨立資料集或公開排行榜，維持不變。[VIALS-AA 專文](https://artificialanalysis.ai/articles/vials-aa)
- **Scale SWE Atlas v1.1**：延續 11/08 紀錄，11/06 發布之 1.1 版各子榜單（Overall、QnA、Test Writing、Refactoring）內容與 11/09 相同，未新增 Fable 5.2。[SWE Atlas 榜單](https://scale.com/leaderboard/swe-atlas?tab=overall)
- **Into the Unknown**：10/13 之開放科學研究評測（arXiv 2610.19159），官方論文摘要、README 與 viewer 頁面內容與 11/09 完全一致，無新提交紀錄。[論文](https://arxiv.org/abs/2610.19159)、[官方 repo](https://github.com/prometheus-eval/into-the-unknown)
- **BioBasicsBench**：OpenAI 11/06 發布之實驗室評測，本次直接 HTTP 抓取依然受阻於 Cloudflare 403；離線保留之 37 筆候選資料結構與 11/09 相同。
- **MaxxBench**：官方 README 與 11/09 byte 完全相同，changelog 最新紀錄維持 11/07（Qwen3.8 Flash Next xhigh），畫面 15 列對比內嵌 16 個模型之差異維持，尚未加入 Fable 5.2。[主辦方](https://maxxbench.unlap.ai/)

## 證據與覆蓋限制

本次聯網查核遭遇以下存取限制與技術邊界：

- **受阻與特殊頁面**：
  - `https://openai.com/news/`：HTTP 403（Cloudflare WAF 攔截，9,897 bytes，sha256: `ef571c144b...`）。
  - `https://openai.com/index/measuring-how-ai-agents-handle-wet-lab-science/`：HTTP 403（Cloudflare WAF 攔截，10,105 bytes，sha256: `6e2ed25d74...`）。
  - `https://ai.meta.com/blog/`：HTTP 400（自動化抓取請求格式受拒，1,542 bytes，sha256: `6654d28093...`；改經 Meta Research 部落格與開發者文件取得驗證）。
  - `https://www.perplexity.ai/hub/blog/wandr-benchmark-evaluating-research-agents-that-must-search-wide-and-deep`：HTTP 403（Cloudflare WAF 攔截，5,942 bytes，sha256: `14de675842...`；改查 GitHub 官方 repo）。
  - `https://livebench.ai/`：首頁為 React 單頁應用（SPA），原始 HTML 僅回傳 889 bytes 之 `<div id="root"></div>`（sha256: `c7ff3807e2...`），無 SSR 資料列；現役刷新係經官方資料 exports 與瀏覽器自動化完成。
  - `https://artificialanalysis.ai/api/v2/data/llms/models`：HTTP 410（舊 API 端點已廢棄，200 bytes，sha256: `542ef08213...`；改採網頁資料管道）。
- **完全通過 Byte 級雜湊核對的未變動 URL**：
  在本次延續比對中，**僅有以下 5 個 URL 回應之 SHA-256 與 11/09 基準完全一致**：
  1. `https://qwenlm.github.io/blog/`（`qwen-blog.html`，sha256: `ea6345e313611b786c3a13b418128385d677cdd7b50609353654ff48025a7ab9`，13,828 bytes）
  2. `https://arxiv.org/abs/2610.19159`（`unknown-abstract.html`，sha256: `582c0d70b4b72195d9368c5916d8c794e32540da756abe9000ee3df54215fd63`，45,184 bytes）
  3. `https://raw.githubusercontent.com/prometheus-eval/into-the-unknown/main/README.md`（`unknown-readme.md`，sha256: `ce1ccd683ecbd8b796189cb03b024291c16b28912631392e0fc9bb1910c14649`，7,008 bytes）
  4. `https://prometheus-eval.github.io/into-the-unknown/viewer/`（`unknown-viewer.html`，sha256: `55a98de7ba19798f51e4f32c954547cd4481bced71a60f0429410a2203a91a17`，3,181 bytes）
  5. `https://raw.githubusercontent.com/unlap-labs/maxxbench/main/README.md`（`maxxbench-readme.md`，sha256: `5ee075ca5a7d59e517e026df670a734390444ff90f2d5f46663b4817b08acb93`，1,960 bytes）
- **Hugging Face 比較性質**：受限於 Hugging Face API 即時欄位（如 likes、downloads 計數動態變化），對 12 家受追蹤廠商最新 8 個 repo 的比較係屬**語意比對**（比對 repo 名稱與排序一致性），而非 byte 級精確比對。
- **現役來源渲染母體與欄位局限**：Epoch 與 ARC Prize 的視覺畫面未能取得與資料庫完全匹配之有效分母，保留為未知。Vals 有 5 個空頁面維持 null。所有新評測之採用均需待專案審查確認。
