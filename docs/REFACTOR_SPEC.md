# LLM Bench 重構規格

> 狀態：Implemented（Stage 5 cutover）
>
> 決策基線：2026-07-16 grilling 第 1–70 項共識
>
> 本版用途：定義支援中的產品、資料、發布與已淘汰邊界

## 1. 產品目標

LLM Bench 聚合可公開驗證的前沿模型 Benchmark 結果，以最短路徑完成：

```text
公開來源 → 可審查 Evidence/Candidate → 不可變 Draft → 人工 Published
```

產品核心是三個共用同一 ProductVersion 的視圖：

1. Leaderboard：Overall、Coverage 與八維能力。
2. Quality vs. Cost：跨來源任務成本與品質曲線。
3. Eight Dimensions：雷達圖、Category score 與 Evidence 明細。

第一優先是新模型及時有分數，並以 Estimated、Coverage、N/A 和 provenance 揭露不確定性；不等待理論上完整的測試覆蓋率。

## 2. 固定架構

唯一支援中的程式與資料邊界為：

- `apps/bench`：Next.js 單頁 Dashboard。
- `packages/benchmark-data`：Schema、identity、Profile、Frontier、八維計分、ProductVersion 與 pointer。
- `packages/acquisition`：來源快照、成本、artifact 與完整性驗證。
- `data-v2`：Git 內 mapping、來源結構化輸出、不可變版本與 pointer。
- `artifacts-v2`：Git 外內容定址來源 bytes。

Dashboard 不依賴執行期 API、資料庫、Worker、來源網站或 artifact store。已存在的 Published 必須能在無網路、無 artifact、無 Docker 與無 PostgreSQL 的環境建置和顯示。

## 3. 資料契約

版本化契約包含 SourceManifest、EvidenceRecord、CandidateResult、CostRecord、ModelProfile、ProductVersion 與 Draft／Published pointer。

每筆可採用分數必須保存：

- 來源角色、URL、Benchmark／版本、metric 與時間。
- 原始值和可用時的 0–100 標準化值。
- canonical identity 或明確的 unresolved 狀態。
- 原始 Profile／Harness／tools／attempt 等配置。
- Evidence ID、artifact hash、byte length、locator 與取得方法。
- `FULL`／`PARTIAL_SOURCE`、Included／Excluded 與排除原因。

`PARTIAL_SOURCE` 不設期限，可參與 Estimated。缺失、未測或 identity 未解析不得填零或模糊歸屬。

## 4. Model 與 Profile

- 基礎模型使用 provider-prefixed canonical ID。
- Product Profile 只按 reasoning effort 分離。
- 未標 effort 的結果歸入可判定的模型最高強度，不建立 `unspecified`。
- Harness、tools/no-tools、attempt、thinking、context、quantization 不建立 Product Profile。
- 原始配置仍完整保留在 Evidence provenance。
- Harness／No Harness 的可比較同 Benchmark 分數依衝突規則選一筆有效結果，不重複計分。

## 5. 八維與排名

八維為 Reasoning、Math、Knowledge、Language、Instruction、Coding、Agentic、Context；UI 固定顯示順序為 AGT、COD、RSN、MAT、KNG、LNG、CTX、IF。

- 每個 Benchmark 第一版只投入一個主要維度。
- 缺失維度不計零；Overall 只平均已有資料的維度。
- 至少一項可計分 Evidence 即可產生 Estimated。
- Composite index 只選模和展示，不投入八維。
- Representative Profile 依 Coverage、有效結果數、Overall、`profileId` 選擇。
- Leaderboard 預設依 Coverage 再 Overall 排序。

預設產品模式只顯示 Representative Profile 為 8/8 的模型。右上無文字 Developer mode switch 才顯示 1–7/8 的已計分模型；它不改變資料或計分。

## 6. 來源與刷新

來源可使用 API、官方匯出、內嵌 JSON、RSC、DOM、PDF 或視覺讀取。每站必須保存 artifact、Candidate、Evidence 與 validation report，並對照人眼可見列數或官方母體。

Agent 平時按統一頻率刷新固定來源；新模型上市時，由人工額外觸發一次相同收集工作。Agent 可修正與合併 Candidate，但來源刷新不能直接更新 Published。

來源角色採主辦方／獨立評測／廠商自報／聚合索引。LLM Stats 等聚合站只用於發現或 Frontier 選模。

## 7. Draft 與 Published

- ProductVersion 是 canonical deterministic JSON，以內容 SHA-256 定址且不可覆寫。
- Agent 可建立和審核 Draft；修正永遠產生新版本。
- Agent 先完成所有可由公開證據與 repository 裁決的審核。
- 只有無法不靠猜測解決的證據衝突、殘餘風險接受和 pointer 操作交給人工。
- Draft → Published 與 rollback 永遠需人工明確觸發。
- publish／rollback 只切 pointer，不擷取、不計分。
- 失敗時既有 Published pointer 不變。

## 8. 前端契約

- 英文、單一淺色主題、完整響應式單頁。
- Draft Preview 與 Published 使用同一 UI；Draft 顯示狀態並 `noindex`。
- Leaderboard 支援欄位排序、Profile 切換及模型選擇。
- Quality vs. Cost 使用單一合併任務成本圖、provider 顏色、右側圖例及 Pareto frontier。
- Evidence 按八維折疊，保留 Included／Excluded 和原始來源 Profile。
- N/A、Estimated、Coverage 與 Developer mode 邊界必須清楚。

## 9. Stage 5 cutover

Stage 5 將舊架構整體淘汰，不保留回退相容層：

- 舊 `apps/web`、`apps/worker`、`apps/video`。
- `packages/db`、PostgreSQL、Drizzle、migration、seed、Docker／Compose。
- LiveBench 專用 alias、revision、aggregation、promotion、publication 與 weekly 流程。
- Edition、PREVIEW／FORMAL、影片與舊 presentation/scoring 契約。
- 雙語、雙主題、多頁資訊架構。
- 僅為舊系統存在的 Connector、CI service、依賴與命令。

詳細項目見 [已捨棄項目](REFACTOR_DISCARD_LIST.md)。歷史文件與決策不刪改其背景，但其架構結論一律標為 Superseded。

## 10. 驗收

- 新 package graph 不引用任何舊 Web、Worker、DB、Edition 或 video package。
- root scripts、workspace、lockfile、CI 與 E2E 只包含新路徑。
- schema、identity、計分、pointer、Dashboard 與 accessibility 測試通過。
- Draft → Published A → Published B → rollback A 的整合測試證明 pointer 原子性。
- Published 靜態 build 在無網路、artifact、PostgreSQL 或 Docker 時成功。
- README、Architecture、Data Methodology、Scoring Methodology 與 Operations 只描述支援中的系統。

## 11. 延後至真實資料迭代

下列問題不是 cutover 阻擋項：

- Supported 的最終門檻。
- Benchmark 與來源品質最終權重。
- 代表性 Profile 未來是否需新演算法。
- 每來源排程最佳化。
- 更進階的衝突／confidence policy。
- 是否需要管理 UI。

這些調整必須透過可修改設定、新 Draft 與相同人工發布閘門完成，不得恢復舊架構。
