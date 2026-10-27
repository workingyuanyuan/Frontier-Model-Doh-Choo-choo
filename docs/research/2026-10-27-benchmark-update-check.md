# 2026-10-27 模型 Benchmark 聯網查核

本次以 [10/26 查核](2026-10-26-benchmark-update-check.md)與目前已提交快照為基準，主要更新是 **GPT-6.1 Terra**：Artificial Analysis、LiveBench 2.0 與 FrontierCode 都新增成績。Vals 補上 Kimi K3.1 Pro 的六項科學評測，AA 公布 **Code2Video-AA**。本次匯入 AA、LiveBench、FrontierCode、Vals，完整產品驗證與人工抽查見[刷新報告](../refresh/2026-10-27.md)。逐欄差異、擷取時間、SHA-256 與方法證據見[查核 JSON](2026-10-27-benchmark-update-check.json)。

## GPT-6.1 Terra 與正式榜單

[OpenAI 官方模型頁](https://developers.openai.com/api/docs/models/gpt-6.1-terra)與 changelog 確認 10/26 發布，API ID `gpt-6.1-terra`，六檔為 none／low／medium／high／xhigh／max。新增精確模型對應 `openai-gpt-6-1-terra`；AA 的 Non-reasoning 對齊產品既有 non-reasoning 檔。官方標準 input／cached input／output 每百萬 tokens 為 $1／$0.05／$5；context 1,050,000，最大輸出 128,000。沒有另行證實 dated checkpoint。

| 官方榜單                                                          | 新成績與設定                                                                                                                       | 採用結果                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [AA](https://artificialanalysis.ai/models/releases/gpt-6-1-terra) | Intelligence Index v4.3.2：non-reasoning 33、low 36、medium 41、high 44、xhigh 45、max 48                                          | 六檔匯入；指數只供外部比較與選模                   |
| [LiveBench](https://livebench.ai/)                                | 正式 `20261025`，max；Long Agentic 48.6、Reasoning 88.7、Coding 90.8、Browser 93.1、Data Analysis 82.3、Research 73.9、Design 82.3 | 七 suite 匯入，主榜 30→31 列                       |
| [FrontierCode](https://cognition.com/frontiercode)                | 1.1、codex；low 42.41%、medium 46.66%、high 46.33%、xhigh 45.14%、max 44.38%                                                       | 五配置匯入，Main 46→47 列；此項仍為 comparisonOnly |

FrontierCode 對應 USD／rollout 為 low 0.145、medium 0.2352、high 0.356、xhigh 0.5263、max 1.1906。AA max 的 Intelligence Index 任務成本約 $0.40，不能代用為各個 suite 的任務成本。Terra 可用自選模型比較；其 AA 分數低於目前第十個合格前沿模型，沒有進入拉桿前十。

[官方發布頁](https://openai.com/index/introducing-gpt-6-1-terra/)提到 Terminal-Bench 4.0 max 50.3%，另有 ALE v1、OSWorld 2.1、MMMU-Pro、Terminal-Bench-Science 0.1 的比較。已保存系統卡 HTML／PDF；後續安裝WSL Linux Chrome後已取得六圖143列、Terra五檔共30列分數與圖表成本，見[供應商資料查核](2026-10-27-gpt-6-1-terra-vendor-review.md)。圖表成本的分母與各項執行配置仍需核對；早先直接擷取403的紀錄保留作歷史證據。

## AA 新 benchmark 與既有資料修訂

[Code2Video-AA](https://artificialanalysis.ai/evaluations/code2video-aa) 10/26 公告，27 個模型、114 個影片設計 brief；資料集標示 0.3.0。每題產生一次 HyperFrames HTML，無工具，渲染成影片後由 Gemini 4 Argon 盲評五軸，分別擬合 Elo，再取五軸平均。Opus 5.5（max with fallback）1536、Sonnet 5.5（max with fallback）1443、Astra max 1427、Sol 6.1 max 1369。方法含渲染失敗記敗、8 fps 與評審同時是受評模型等限制。原始分數、信賴區間、各軸、tokens 與成本欄均已保存。**計分維度、Elo 正規化與來源採用須另行裁決**。

`/models` 獨立渲染為 **27 of 715**（原 709）。正式 materializer 聯集 266 profiles／251 active；候選 2871→2957、成本 419→437，API 交叉核對通過，warnings 0。新增 86 候選包含 Terra 六檔，以及先前已存在的 Ling 3.0 Flash、Quasar 配置補齊；未知 canonical 維持 null。既有 75 筆分數修訂全屬 GDPval-AA；例如 Sol max Elo 1596.20→1607.61，正規化 54.81→55.3805。既有八筆 profile 欄位差異是 context window metadata。

AA-Briefcase 即時 Elo、PersonalityBench 及多項耗時／成本欄也有修訂，完整逐欄值保存在 AA findings。正式 AA-Briefcase 採用列的分數沒有改值。CritPt v2 頁面選擇範圍由 10/25 的12列變27列；核對較近的10/26模型 detail 原始資料後，既有模型的 CritPt v2／FrontierCode／SciCode 分數並未改值，不能把畫面選擇範圍改變算成15筆新測評。SciCode 目錄仍標示 Under review；方法頁仍列在 Index 中，沒有公開支持切換計分口徑的變更。

## LiveBench 2.0 與 Epoch AI

LiveBench release 清單維持 `20261014`／`20261025`，新增 Terra 後原30模型的分數與成本逐欄相同，categories 也相同。2.0 渲染31列、1.0勾選 finetunes 後65列均已核對。notes 等權文字與 categories／頁尾加權說明的衝突，缺少10/26相同 notes 原檔可定位新增時間，按既有多日觀察揭露。

[Epoch AI Hub](https://epoch.ai/benchmarks) 仍411模型／94 benchmarks。ZIP 全92個成員逐檔比較：六 CSV bytes 變動，其中五份結果檔只改 country 多值順序；model metadata 1176→1183，新增 Terra 七種 effort metadata，另有 Jev 欄位補值。ECI scores、inputs、EDI、benchmark metadata 與全部評測分數／run設定相同；live `benchmarks.csv` 1779列，88項異動全是 metadata。ECI 方法文字只見導覽／日期變動。10/26沒有獨立索引 ZIP，因此完整檔比較採10/25實體基準和已提交10/23 artifact，不把這段 metadata 變化都歸為10/27發布。

## Vals 與其他現役榜單

[Vals](https://www.vals.ai/benchmarks) 60頁／56可解析，目錄與前次一致。Kimi K3.1 Pro 新增 BioMysteryBench 75.556、IOI 81.889、MysteryMechanism 26.126、ProofBench 91、Science Index 44.37、Terminal-Bench Science 31.429。ProofBench／IOI 來源列雖 INCLUDED，仍被產品品質政策排除；其餘四項未核准計分。

Haiku 5.5 Legal Research 43.269→43.75（來源候選已收錄；Haiku 5.5 canonical 尚為 null，未進入產品比較）、Legal Index 70.267→70.294、Vals Index 58.708→58.727（兩個指數不計能力）。Terminal-Bench 2.1 的 `google/barium-bb` 改為 `google/gemini-4-argon`，分數57.678相同，後者可精確對應既有模型。Terminal-Bench Science 的 DeepSeek V4.1 Flash effort high→max。另有31筆既有成本修訂，移除一筆舊 LiveCodeBench 成本。TB2／2.1 頁面新增 archived 標示，多頁補 token_tasks_measured；沒有 metadata version 變動。

ARC Prize、DeepSWE、Zapier、Surge 七榜都在隔離資料副本執行正式 adapter，候選與成本逐列相同。DeepSWE 畫面28模型、Surge各榜42／44／50／44／36／36／20列獨立核對。Surge目錄12項相同。FrontierSWE仍因榜單21列／coverage22列不一致失敗；coverage多出的名稱為 Claude Sonnet 5.5 + proximus，採用前次有效快照。

## 其他官方模型公告

[Mistral 官方權重頁](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B)仍 Upcoming release，ETA為10/31；沒有證實10/27已釋出權重。metadata API 401，weight commit與license保持null。官方模型頁標示 Public Preview／26.10，input／cached input／output每百萬為 $1.36／$0.14／$4.18；本次AA input／output也為 $1.36／$4.18，未知實際調價日。

Anthropic newsroom 最新 dated entry 為10/26 S-1，xAI release notes為10/14語音更新；Google分類入口不足以建立完整逐日清單。這些是有界官方入口檢查，非所有供應商歷史頁面逐欄掃描。

## 證據範圍

原始擷取、headers、觀測時間、SHA-256、語意差異與隔離快照保存於 `artifacts/research/2026-10-27-benchmark-check/`。來源分工為 `aa/`、`live-epoch/`、`boards/`、`releases/`；匯入前完整基準在 `import-baseline/`。四個供應商離線發布頁快照日期與個別未刷新來源日期均保留在產品的 sourceSnapshotIds。JSON含原始擷取清單與基準路徑，缺少同日基準的比較均明示其日期。

## Terra 官方發布頁補充查核

使用者指定發布頁後，另完成[供應商資料查核](2026-10-27-gpt-6-1-terra-vendor-review.md)與[JSON](2026-10-27-gpt-6-1-terra-vendor-review.json)。安裝WSL Linux Chrome後已成功取得六圖143列，與渲染點數逐一相符。Terra max：ALE60%、MMMU-Pro Vision85.5%、OSWorld2.1 offline74.2%、事實錯誤率4.3%、TB4.0 50.3%、TB-Science0.1 58.3%。各effort與圖表成本保存在補充JSON；六項的計分及來源採用政策仍需裁決。
