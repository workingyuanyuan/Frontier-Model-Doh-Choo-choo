# LLM Bench 重構規格

> 狀態：Accepted
> 決策日期：2026-07-16
> 適用階段：重構規劃、資料實證、新前端實作與舊系統淘汰
> 決策來源：需求 grilling 第 1–70 項共識

## 1. 重構目標

目前系統雖具有完整的 LiveBench、PostgreSQL、Edition 與發布管線，但網站缺少足以支撐產品價值的可用模型資料。重構的第一優先級不是維持舊架構，而是縮短：

```text
公開來源
→ 可審查的真實分數
→ Draft 網站
→ 人工 Published
```

產品後端定位參考 BenchLM 的模型與 Benchmark 聚合能力；前端體驗聚焦 LiveBench 類型的三個核心視圖：

1. Leaderboard：模型、綜合性能與八維能力。
2. Quality vs. Cost Curve：性能與價格關係。
3. Category Profile：八維雷達圖。

第一版成功標準是使用者核准一份含真實資料的 Published 版本，不是 Connector 數量、歷史模型數量或理論覆蓋率。

## 2. 固定產品能力

八個能力維度固定為：

| 維度        | 能力邊界                                                     |
| ----------- | ------------------------------------------------------------ |
| Reasoning   | 抽象化、演繹、歸納、因果、空間、時間、社會認知與規劃推理     |
| Math        | 數量計算、代數、形式化推導、證明、競賽數學與數值最佳化       |
| Knowledge   | 模型內部事實、專業與世界知識、知識校準及幻覺抑制             |
| Language    | 語意理解、篇章連貫、文字品質、改寫、摘要、敘事與風格控制     |
| Instruction | 顯式要求、格式／內容限制、任務規格與隱含工作慣例             |
| Coding      | 程式生成、補全、除錯、修復、遷移、重構、效能與軟體工程       |
| Agentic     | 工具使用、環境操作、步驟規劃、狀態管理、錯誤恢復與長時程任務 |
| Context     | 長輸入檢索、跨文件整合、上下文學習、資訊追蹤與長時程狀態維持 |

Benchmark 映射必須是版本化、可修改的設定。每個 Benchmark 第一版只計入一個主要維度；次要能力關聯只記錄於知識文件，不重複計分。

另建單一用途的 Benchmark 映射知識庫，記錄主要維度、次要關聯、映射理由、能力邊界、限制與易混淆處。該文件不混入資料接入狀態、來源時效或計分權重。

## 3. 資料來源與結果角色

結果按實際執行者分為：

1. **Benchmark 主辦方**
2. **獨立評測者**
3. **廠商自報**

分類單位是一筆結果，不是整個網站。同一網站可能同時包含多種角色。

來源優先序為：

```text
主辦方實測 > 獨立評測 > 廠商自報
```

廠商自報可在新模型上市初期先提供分數。相同 Benchmark、版本、模型 Profile 與配置出現較高優先級結果時：

- 新值直接成為目前計分值。
- 舊值與原始證據保留供追溯。
- 第一版不因差異建立複雜衝突阻塞流程。
- 只有廠商自報資料的模型仍標為 `Estimated`，但必須顯示分數。

採用來源與時效規則見 [BENCHMARK_SCORE_SOURCES.md](./BENCHMARK_SCORE_SOURCES.md)。

## 4. 前沿模型範圍

第一版不追求完整歷史模型庫，採前沿模型導向：

1. 找出各優先網站主要排行榜的綜合分數或核心排序指標，例如 Intelligence Index、ECI 或 Overall Score。
2. 每個具有可信綜合指標的來源取「最多 Top 20」。
3. Top 20 按基礎模型去重；同一模型只有最高綜合分數 Profile 占一個名額。
4. 排行榜不足 20 個合格模型時，只採實際存在的數量，不以舊資料補足。
5. Agent／harness 產品可視為獨立產品，例如 Fugu、Maestro、Composer。
6. 額外加入管理者人工指定、且至少已有一筆合格精確分數的新品。
7. 各站集合合併並正規化身份後形成 `Frontier Set`。

外部綜合指標用於選模、原站排名展示與人眼對照，不直接投入本產品八維計分，也不反推其專有權重。

## 5. Benchmark 選擇

第一版只擷取符合下列條件的 Benchmark：

- 至少包含一個 `Frontier Set` 模型的有效分數。
- 仍是該網站現行主榜、methodology 或最新模型頁使用的評測。
- 未標示 Legacy、Archived 或 Deprecated。
- 沒有被新版本取代；多版本預設只取現行版。

舊版只有在現行版缺少人工指定新品且能提供重要早期分數時才可暫時採用。

被選中的 Benchmark 原則上取得完整榜單，而不是只抓目標模型。臨時任務若無法立即完整刷新，可先取得完整的目標模型單列。

## 6. 第一批實證來源

第一批資料實證使用：

1. OpenAI
2. Terminal-Bench
3. DeepSWE
4. Artificial Analysis
5. Epoch AI
6. LiveBench
7. Vals AI
8. LLM Stats

LLM Stats 只作前沿模型與上游來源索引，不直接採用其混合聚合值。

八站都必須實際嘗試，但不是硬性交付門檻。成功來源立即形成 Draft；失敗來源記錄人眼可見內容、實際取得量與限制，再迭代擷取方法。

## 7. 資料獲取原則

第一版採「多手法獲取驗證 → 快照落地 → 穩定方法逐步固化」：

依網站狀況依序或混合使用：

1. 官方 API／匯出檔
2. 網站內嵌 JSON
3. API response
4. Next.js／RSC payload
5. HTML table／DOM
6. 分頁或懶載入資料
7. PDF／Model Card
8. 視覺讀取與人工覆核

不假設結構化資料一定比畫面正確，也不假設 DOM 是完整資料。結構化資料與人眼畫面實質不一致時，該批資料先進隔離，不自動選邊；合理四捨五入不視為衝突。

不同欄位可來自不同證據層，例如：

- JSON 提供精確分數。
- DOM 提供顯示名稱與狀態。
- 視覺讀取提供圖表中的 Profile 或日期。

每個欄位必須記錄 provenance。OCR／視覺轉錄的精確分數須經人工覆核或另一份證據交叉一致，才能進入正式快照。

## 8. 有效擷取門檻

一次完整來源擷取必須：

- 取得完整排行榜，而不只是首屏或前幾名。
- 將擷取列數與公開總數、分頁、payload 或人眼逐段檢查對照。
- 每列至少取得 Benchmark、版本（若公開）、模型、Profile（若公開）、指標、分數與來源 URL。
- 來源未公開的日期或配置保持 `null`，不得猜測。
- 保存原始 response、payload、HTML、PDF 或必要截圖。
- 產生列數、缺欄、重複、衝突及可見內容對照報告。

無法證明完整性時標記 `PARTIAL`，不得取代上一份完整有效來源快照。

若排行榜不完整，但目標模型單列具有完整身份、Benchmark、版本、指標、精確分數與證據定位，該結果可標為 `PARTIAL_SOURCE`：

- 可進入 Draft 並參與 `Estimated` 排名。
- 不設期限。
- 完整新快照出現時直接採新值。
- 舊值與證據保留。
- `PARTIAL_SOURCE` 永遠低於同配置的完整快照。

## 9. 擷取知識與 Connector 邊界

資料獲取知識分為三層：

1. **共用獲取規範**：定義擷取方法、證據保存與完整性閘門。
2. **每站 Source Manifest**：定義 URL、角色、Benchmark、入口順序、分頁、欄位映射、完整性判定、fallback 與最後驗證日。
3. **複雜站點 Runbook／Skill**：只在 DOM、視覺操作或特殊判讀顯著複雜時建立。

Connector 只忠實擷取並產生 `Candidate Result`，不得直接決定：

- 模型別名或 Profile 合併
- Benchmark 版本合併
- 來源優先級
- 八維映射
- 權重
- 排名

流程邊界為：

```text
Source Manifest
→ raw evidence
→ Candidate Result
→ model/profile and benchmark resolution
→ source selection
→ normalization and dimension mapping
→ Draft product data
→ human Published
```

一般網站優先使用 TypeScript；PDF、OCR 或資料處理若 Python 明顯更適合，可使用 Python。跨工具只統一版本化 JSON Schema，不強制單一語言或跨語言框架。

## 10. Agent 與排程

第一版由 Agent 作為資料獲取執行層：

- 已穩定的 API／JSON 方法可使用確定性腳本。
- 腳本失敗或尚未固化時，Agent 可改用 request、DOM、RSC 或視覺手法。
- 重複成功且穩定的方法再固化為 Connector。
- Agent 可自行修正擷取程式與 Source Manifest，通過基本驗證後自行合併為正式規則。
- Agent 無權切換 Published。

所有已接入來源採單一、統一且可修改的固定頻率。第一版不做每站排程、動態調度、退避或成本最佳化。

平時只執行固定來源排程。當管理者知道新模型已有測試結果時，可人工指定目標模型並觸發一次額外資料收集：

- Agent 根據 Source Manifest 自行選擇相關來源。
- 管理者可補充已知 URL，但不必列出所有網站。
- 目標模型只用於選站和排序，不作結果列過濾。
- 每站原則上完整刷新，並順帶吸收其他新增或修正模型。
- 任務完成後結束，不建立持續性的 Launch Tracking。

## 11. 快照、Draft 與 Published

每次擷取產生不可變快照包：

- 來源、擷取時間
- Source Manifest／Connector 版本
- 原始證據索引與 hash
- Candidate Results
- 完整性與差異報告
- 審核狀態

Git 保存：

- Source Manifest
- 擷取與解析規則
- 正規化 Candidate Results
- Draft／Published 產品資料
- 驗證報告、hash 與證據索引

大型 response、HTML、RSC、PDF 與截圖保存在 Git 外的內容定址 artifact；小型且關鍵的 JSON／CSV 可提交 Git。

所有新資料一律先進 `DRAFT`，新模型與 Estimated 資料沒有例外。

- Draft 使用受限、不可索引的 Preview 入口。
- Draft 與 Published 使用同一前端與資料契約。
- 人工核准時，將同一份已審查資料版本原子切換為 `PUBLISHED`。
- 發布不得重新擷取或重新計算。
- 支援切回上一個 Published 版本。
- 第一版使用 CLI 或受保護 CI 工作切換，不建立管理後台。

## 12. 模型與 Profile

資料與計分最小單位是 `Model Profile`：

- reasoning effort
- thinking mode
- tools／network
- agent／harness
- context 設定
- 量化或 checkpoint
- sampling 與 attempt 設定

不同 Profile 不合併。

主 Leaderboard 每個基礎模型預設只顯示一個代表 Profile，避免同一模型占滿榜單。其他 Profile 可在展開內容與成本曲線中顯示。

Agent 系統與裸基礎模型分開，例如 Fugu、Maestro、Devin harness 或 Composer。

代表 Profile 選擇先保持簡單且可配置；取得真實資料後再調整。

## 13. 計分

第一版採簡單、透明、可修改的標準化與加權：

- 原始分數永久保留。
- 百分比、accuracy、pass rate 統一到 0–100。
- 非百分比指標使用 Benchmark 專屬明確轉換。
- 沒有可靠轉換時只展示原始結果，不納入八維計分。
- 每個 Benchmark 第一版只進入一個主要維度。
- 維度分數為可配置的 Benchmark 加權平均。
- 缺失 Benchmark 不計零，按已有權重重新正規化。
- 模型至少有一項八維證據即可顯示綜合 Estimated 分數並進入主榜。
- 只有價格、沒有任何八維證據時，不產生綜合分數。

第一版不建立：

- percentile 或動態 cohort min-max
- 貝葉斯校準
- 複雜信心區間
- 嚴格 Supported 升級演算法
- 差異衝突阻塞器

這些問題由真實資料與人眼審查揭露後再決定。

## 14. 成本資料

不同成本類型不得混為同一數列：

1. 標準化 API 任務成本
2. Benchmark 實測 cost per task
3. Agent 系統成本
4. 訂閱產品成本
5. 開放權重自架或託管成本

主 Quality vs. Cost Curve 先顯示有公開 API 定價的 Profile，使用可配置且公開的 input／output token 假設換算標準化任務成本。

Benchmark 公布的實測任務成本使用獨立視圖。沒有可比價格的模型可顯示性能，但不強行放進主成本曲線。

## 15. 新前端

在同一 repository 建立乾淨的新 Web App／入口，不原地改造舊 `apps/web`。

第一版是單頁 Dashboard：

1. Leaderboard
2. Quality vs. Cost Curve
3. Category Profile 八維雷達圖
4. 可展開的 Benchmark／證據明細

證據明細同時顯示 `Included` 與 `Excluded`：

- Benchmark 與版本
- 原始分數及標準化分數
- 來源角色
- Model Profile
- 來源 URL
- `FULL`／`PARTIAL_SOURCE`
- 計分權重
- 排除原因

第一版介面要求：

- 英文
- 單一高品質淺色主題
- 桌面與行動版完整響應
- Draft Preview 與 Published 共用相同 UI
- 不建立完整模型詳情頁、管理後台或多頁資訊架構

保留 pnpm、Turborepo、Next.js、React 與必要的瀏覽器測試外殼。新 App 直接讀取版本化靜態 JSON；不引入 API server、GraphQL、全域狀態框架或 PostgreSQL。

前端實作前必須依當時 `AGENTS.md` 路由規範，優先委派最適合 user-facing UI 的子代理。主代理保留資料契約、共享架構、整合與最終驗收責任。

## 16. 新資料工作區

在同一 repository 建立乾淨的新資料工作區，不依賴：

- `apps/worker`
- `packages/db`
- LiveBench 專用 aggregation／promotion／publication
- 舊 Edition／PREVIEW／coverage gate 契約

第一版最短垂直路徑為：

```text
Source Manifest
→ evidence acquisition
→ Candidate Results
→ normalization and eight-dimension mapping
→ Draft static data
→ Preview
→ human Published
```

可重用的純函式、型別、幾何或測試資產需經審查後抽取；不得讓新工作區直接依賴舊套件內部契約。

## 17. 基礎設施取捨

第一版及未來版本均不使用 Docker：

- 不保留 Dockerfile 或 Compose。
- 本機開發不要求 Docker Desktop。
- 資料擷取直接使用工作區 Node／Python runtime。
- 前端直接使用 Node／pnpm 建置。
- CI 不啟動 PostgreSQL container。
- 未來也不重新導入 Docker。

PostgreSQL 不再是產品或發布依賴。Published 網站由靜態資料驅動，Connector、資料庫或 artifact 暫時不可用時，上一份 Published 仍可部署。

## 18. 並行交付方式

資料實證與前端骨架並行：

- 資料線擷取真實來源、產生快照與 Draft。
- 前端線同步建立三個核心視圖與證據明細。
- 每批資料直接推入 Draft Preview。
- 人眼從實際頁面發現缺列、Profile、價格、排名、曲線與雷達異常。
- 問題回推至擷取方法、Manifest、模型身份、映射或資料契約。

不等待資料 schema 理論完整後才做 UI，也不長期使用虛構資料主導產品設計。

## 19. 第一版非目標

- 全部來源自動 Connector 化
- 全歷史模型與所有 Benchmark
- PostgreSQL
- Docker
- 管理後台與帳號系統
- 舊前端相容
- 多語系
- 多主題
- 影片產出
- 個別來源排程最佳化
- 複雜衝突、信心與 Supported 規則
- 完整來源／方法學／管線狀態頁

## 20. 驗收

第一版驗收條件：

- 第一批八站均有實際擷取嘗試與結果紀錄。
- 已取得資料能形成具比較價值的前沿模型集合。
- 新單頁 Dashboard 使用真實 Draft 資料呈現三個核心視圖與證據明細。
- 模型、Profile、價格、Benchmark 分數與來源 URL 可追查。
- Draft 問題可以回推並修正資料獲取或映射。
- 只有人工能把完整 Draft 原子切換為 Published。
- 可回退上一個 Published。
- 英文淺色頁面在桌面與行動版可操作。
- 使用者確認目前數字足以公開，並執行 Published 核准。

不另外設定硬性來源數、模型數、八維覆蓋率或理論正確度門檻。

## 21. 實證迭代決定的問題

下列事項不在規劃前預先過度設計：

- Supported 的精確升級門檻
- 來源或 freshness 的數值權重
- Benchmark 實際權重
- 代表 Profile 的最佳選法
- 非百分比指標的全部轉換
- 外部綜合指標是否最終作補充訊號
- 個別來源排程頻率與成本最佳化
- 複雜衝突處理
- `PARTIAL_SOURCE` 對排名偏差的實際影響
- 是否需要管理後台、資料庫或更進階 artifact 服務

它們必須由真實資料、實際 UI 與人眼審查結果驅動。

## 22. 決策追溯摘要

第 1–15 項為 grilling 中斷前已確認的產品與資料政策；第 16–70 項為中斷後逐題確認。

| 決策 | 已確認結論                                                                              |
| ---: | --------------------------------------------------------------------------------------- |
|    1 | 產品後端定位接近 BenchLM，前端聚焦 LiveBench 的三項核心視圖。                           |
|    2 | 保留 Reasoning、Math、Knowledge、Language、Instruction、Coding、Agentic、Context 八維。 |
|    3 | 八維以明確能力邊界定義，不因單一網站現有分類而改名。                                    |
|    4 | 結果角色採主辦方、獨立評測者、廠商自報。                                                |
|    5 | 角色定義以產品可用及可追溯為優先，不要求無法實際驗證的嚴苛組織條件。                    |
|    6 | 初上市可採廠商自報，後續相同評測由主辦方／獨立結果取代。                                |
|    7 | 來源分類屬於每筆結果，不屬於整個網站。                                                  |
|    8 | 來源與計分權重必須版本化且容易修改。                                                    |
|    9 | 第一版先有產出，再依真實偏差打磨權重。                                                  |
|   10 | 廠商自報資料可以顯示分數。                                                              |
|   11 | 只有廠商自報的模型標為 Estimated。                                                      |
|   12 | 即使覆蓋達標，只有廠商自報仍維持 Estimated。                                            |
|   13 | 缺少部分配置不應讓公開精確分數全面退化為 N/A。                                          |
|   14 | 建立並持續更新可採來源登錄，過時來源退出活躍刷新但保留歷史。                            |
|   15 | 來源名單必須經完整實際驗證，不只驗證使用者補充網站。                                    |
|   16 | 採多手法實證獲取、快照落地，再逐步產品化 Connector。                                    |
|   17 | 完整性以人眼可見資料、列數、必要欄位與原始證據驗收。                                    |
|   18 | 使用共用規範、每站 Manifest；只有複雜網站才建 Runbook／Skill。                          |
|   19 | Connector 只產生 Candidate Result，不直接寫正式分數或排名。                             |
|   20 | 首次接入與實質變更先隔離審查；穩定版本可自動產生 Draft。                                |
|   21 | 結構化資料與畫面實質不一致時先隔離，不自動選邊。                                        |
|   22 | 使用不可變快照與活動版本指標。                                                          |
|   23 | 允許混合擷取，但要求欄位級 provenance。                                                 |
|   24 | 不以固定網站數作新模型發布門檻；一筆合格分數即可建立 Estimated 資料。                   |
|   25 | 至少一項八維證據即可進主榜，並醒目標示 Estimated 與覆蓋狀況。                           |
|   26 | 平時固定來源排程；新模型結果由人工額外觸發一次性收集。                                  |
|   27 | 不自動建立持續 Launch Tracking；臨時收集由人工推動。                                    |
|   28 | 人工指定模型，Agent 自行決定相關已登錄來源。                                            |
|   29 | 臨時任務原則上刷新完整來源；緊急時可先取得目標完整單列。                                |
|   30 | 完整單列可作 PARTIAL_SOURCE，殘缺單列不得公開。                                         |
|   31 | PARTIAL_SOURCE 不設期限。                                                               |
|   32 | 完整新快照直接採新值；舊值保留，不建立複雜衝突阻塞。                                    |
|   33 | LiveBench 專用管線退出架構核心，只能成為普通來源之一。                                  |
|   34 | 第一版靜態資料可直接發布，PostgreSQL 不再是必要依賴。                                   |
|   35 | 重建前端產品骨架；前端實作依 AGENTS.md 優先路由適合的子代理。                           |
|   36 | 同 repository 建立乾淨新入口，驗收後取代舊 apps/web。                                   |
|   37 | 資料實證與前端骨架並行，以 UI 人眼審查回推資料問題。                                    |
|   38 | 所有資料無例外先進 Draft，人工切換 Published。                                          |
|   39 | Draft 使用受限 Preview；核准後原封不動切換同一版本。                                    |
|   40 | 第一版以 CLI／受保護流程發布，不建立管理後台。                                          |
|   41 | 底層按 Model Profile 計算，主榜每模型只展示代表 Profile。                               |
|   42 | 成本類型分開；主曲線先採標準化 API 任務成本。                                           |
|   43 | 第一版採簡單標準化與可配置加權。                                                        |
|   44 | 以優先來源的前沿模型與現行 Benchmark 建立資料基線。                                     |
|   45 | Frontier Set 採綜合榜最多 Top 20 聯集，加上人工指定新品。                               |
|   46 | Top 20 按基礎模型去重，並按網站實際模型數動態縮減。                                     |
|   47 | 近期新品定義為人工指定且已有至少一筆合格精確分數。                                      |
|   48 | 外部綜合指標只作選模、展示與對照，不投入八維計分。                                      |
|   49 | Benchmark 至少包含一個前沿模型，且仍屬網站現行評測。                                    |
|   50 | Git 存規則、結果與索引；大型原始證據存 Git 外內容定址 artifact。                        |
|   51 | 同 repository 建立乾淨新資料工作區，不原地遷移舊 Worker／DB。                           |
|   52 | 統一資料契約，不強制擷取工具使用單一語言。                                              |
|   53 | 第一版由 Agent 主導獲取，Connector 是逐步累積的效率工具。                               |
|   54 | Agent 可自行修正並合併正式擷取規則；只有發布狀態受人工控制。                            |
|   55 | 第一版所有來源使用統一頻率，不提前最佳化排程。                                          |
|   56 | MVP 是一批真實資料、三個核心視圖、證據明細與人工發布。                                  |
|   57 | 第一批實證來源固定為 OpenAI、TBench、DeepSWE、AA、Epoch、LiveBench、Vals、LLM Stats。   |
|   58 | 第一版採單頁整合 Dashboard。                                                            |
|   59 | 最小交付必須包含可展開的分數證據表。                                                    |
|   60 | 八維 Benchmark 映射重新審核、可修改，並建立 docs 知識庫。                               |
|   61 | 映射文件功能單一，不以 ACTIVE／CANDIDATE 分層。                                         |
|   62 | 文件保留跨維知識，第一版只按主要維度計分。                                              |
|   63 | 映射知識庫收錄現行代表性 Benchmark，不收錄過時評測。                                    |
|   64 | 第一版英文、單一淺色主題、完整響應式。                                                  |
|   65 | 證據明細同時顯示 Included 與 Excluded 結果。                                            |
|   66 | 保留 pnpm／Turborepo／Next.js 外殼，新 App 讀靜態 JSON。                                |
|   67 | 第一版最終驗收是使用者核准 Published，不另設硬性資料量門檻。                            |
|   68 | 新版核准後成批刪除舊架構，以 Git 作唯一歷史。                                           |
|   69 | 結束需求 grilling；先固化規格與棄用清單，再進具體規劃。                                 |
|   70 | 永久捨棄 Docker，未來也不重新導入。                                                     |
