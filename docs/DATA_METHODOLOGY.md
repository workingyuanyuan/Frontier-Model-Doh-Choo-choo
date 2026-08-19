# 資料方法

## 原則

資料先成為可追溯 Candidate，再經身份、Profile、映射與衝突規則產生 deterministic ProductVersion。來源刷新與目前版本建立是分離步驟；任何擷取結果都不能直接改變已部署網站。

## 來源角色

| 角色          | 定義                         | 使用方式                                 |
| ------------- | ---------------------------- | ---------------------------------------- |
| `ORGANIZER`   | Benchmark 主辦方或官方排行榜 | 可直接採用其執行或正式收錄的結果         |
| `INDEPENDENT` | 自行執行測試的獨立評測者     | 保留其版本、模型配置與執行環境           |
| `VENDOR`      | 受測模型廠商自報             | 保留來源角色與出處，仍須通過顯示清單門檻 |
| `AGGREGATOR`  | 混合來源索引                 | 只用於發現與選模，不直接投入八維計分     |

同一 Benchmark、版本、模型、effort 與 metric 的可比較結果，先依既有來源角色優先級，再依 `FULL` 優先於 `PARTIAL_SOURCE`、較新快照優先。Harness 歸併造成的同配置重複結果取較高可比較分數，但每筆 Evidence 最多只貢獻一次。

來源網站、角色、Benchmark 與最近更新狀態由 [可採用成績來源](BENCHMARK_SCORE_SOURCES.md) 維護。

## 來源資料單位

每個 `data-v2/sources/<source>/` 目錄包含：

- `manifest.json`：來源角色、URL、快照狀態、取得方法與驗證時間。
- `evidence-index.json`：artifact hash、byte length、locator、方法與來源 URL。
- `candidates.json`：原始值、標準化值、Profile、Included／Excluded 與欄位級 provenance。
- `costs.json`：來源有公開成本資料時保存獨立 CostRecord。
- `validation-report.md`：母體列數、取得列數、分頁、衝突及已知限制。

原始 bytes 寫入根目錄 `artifacts-v2/sha256/...`。Git 只保存可審查 metadata 與產品輸出；原始大檔不進 Git。

## 擷取與刷新

可混合使用下列方法，不假設每站都有相同資料入口：

1. 官方 API、CSV／JSON／ZIP 或表格匯出。
2. 網站內嵌 JSON 或實際 API response。
3. Next/RSC payload。
4. semantic DOM 與表格。
5. PDF。
6. 視覺讀取與人工轉錄。

優先選擇可完整重現的結構化資料，但畫面與結構化 payload 都必須納入列數對照。兩者衝突時不得靜默取值，需在 validation report 保留差異；公開證據無法裁決時才交給人工。

支援來源的物化命令：

```bash
pnpm --filter @llm-bench/acquisition materialize:artificial-analysis
pnpm --filter @llm-bench/acquisition materialize:frontier-code -- --visual-row-count <count> --visual-top-ten-matched
pnpm --filter @llm-bench/acquisition materialize:snapshots
pnpm --filter @llm-bench/acquisition materialize:costs
```

Artificial Analysis 以 evaluation 頁面 RSC 為主資料源，合併 `/models` 與現役
`/models/<slug>` detail 頁面補齊任務成本與 token 單價。`null` 與字串
`$undefined` 都表示缺值；API 只做交叉驗證，失效時保留 warning 並繼續使用頁面管道。

Frontier Code 以頁面使用的官方靜態 JSON 取得 FrontierCode 1.1 Main 全部
模型 × effort 設定、`new_score` 與平均 rollout `cost`，並以頁面 JSON-LD
Top 10 和渲染後 DOM 雙重核對。Extended 只保留在原始 artifact，不混入 Main；
來源 effort `none`、缺值與未解析 identity 都保持 null。

正常排程採統一頻率。新模型推出時，人工可額外觸發一次相同資料收集流程；不建立永久的「自動發現模型」旁路。

## 完整性與缺失值

- `FULL`：官方結構化母體、可見列與分頁已對齊。
- `PARTIAL_SOURCE`：候選列可驗證，但來源快照有界或未完整取得。
- `PARTIAL_SOURCE` 不設期限；只要該列本身是 INCLUDED 且有非 null normalized score，仍可作為來源證據。
- 來源未測、canonical identity 未解析或缺乏該維 Benchmark 都保留為 N/A；不填零、不模糊猜測。
- Composite index、無核准正規化或來源衝突列可保存為 `EXCLUDED`，但不投入分數。

## Model identity 與 Product Profile

基礎模型使用 provider-prefixed canonical ID；來源 raw name 與 alias 留在 Evidence。無法精確映射的 Candidate 不投入 ProductVersion，但原始分數和來源配置不得刪除。

Product Profile 只按 reasoning effort 分離；推理強度階梯為
`non-reasoning < low < medium < high < xHigh < max`，`default` 位於階梯之外：

- 來源明示 effort 優先；名稱明示的 `(Non-reasoning)` 對應 `non-reasoning`，`(minimal)` 對應 `low`。
- 來源未標 effort 時，只能從其他來源對同一 canonical model 的明示／名稱可判定 effort 取最高檔，且不得覆寫來源或名稱明示值。
- 其他來源也沒有可用依據時使用 `default`；不再把缺值歸入 `max`。
- 每次跨來源推測都列入各來源 validation report，保持 `PENDING USER REVIEW`，並記錄 target row 與 basis source/row。
- UI 和產品計分不建立 `unspecified` effort。
- Harness／No Harness、tools、attempt、thinking、context、quantization 等均不建立 Product Profile。
- 原始 Harness 名稱與配置仍保留在 Candidate／Evidence provenance。

`data-v2/mappings/models.json` 與 `profile-policy.json` 是可修改設定；變更後必須重新生成 `data-v2/product/current.json`，不能在未審核下提交資料。

## Frontier 選模

從每個設定的綜合榜動態取最多 Top 20；來源不足 20 筆時不補齊。按基礎模型去重後取聯集，再加入人工指定新品。

Artificial Analysis Intelligence Index、Epoch Capabilities Index、Vals Index 與 LLM Stats Coding Index 只用於選模與展示，不投入八維 Overall，避免底層 Benchmark 被重複計分。設定位於 `data-v2/mappings/frontier.json`。

## 成本資料

成本必須是帶 Evidence 的 CostRecord，不得只手工塞入模型 catalog：

- Artificial Analysis：來源定義的 Intelligence Index task cost。
- LiveBench：token pricing 與 `cost_per_successful_task` 分開保存。
- DeepSWE：`mean_cost_usd` 保存為 `AGENT_TASK`，來源 Harness 留在 provenance。
- Frontier Code：Main 的 `cost` 是平均 rollout 美元成本，保存為 `AGENT_TASK`；raw `none` 保持 null，產品層只依上述跨來源規則建立可稽核的 effort 決策。

主 Quality vs. Cost 圖排除語義不同的 API standardized series，只合併已物化的任務成本。各來源先對 cost 取自然對數，再在來源內 min-max 正規化至 0–100；0 為該站較低成本，100 為較高成本。第一版權重為 Artificial Analysis 40%、LiveBench 40%、DeepSWE 20%。缺站時只在現有來源上重新正規化權重，不把缺值當零。

圖中的 frontier 是非支配集合：成本由低至高掃描，只保留 Overall 高於所有更便宜 Profile 的點。此指標是比較輔助，不是美元估計或新 Benchmark 分數。

## ProductVersion 與可重現性

建置流程驗證所有來源 schema、Evidence 引用、Included mapping 與 identity 後，產生排序固定的 canonical JSON。移除 `versionId` 欄位後計算 SHA-256，形成 `ProductVersion.versionId`。

`data-v2/sources/` 中的 Candidate 是 acquisition input；其欄位級記錄不直接進入產品檔。`product-version-v3` 會把每筆分數收斂成一個嚴格的 `provenance` 物件，只含 `sourceUrl`、`locator`、`method`、`retrievedAt`、`evidenceId`。其中 `evidenceId` 持續指向 `artifacts-v2` 的內容定址 bytes。

```text
固定來源 bytes + mapping + generatedAt
  → 相同 deterministic JSON
  → 相同 versionId
```

`data-v2/product/current.json` 是唯一產品輸出；其內容可由新的 verified sources 重建，Git 資料 commit 保存已部署版本。

## Dashboard 資料邊界

產品視圖由 `data-v2/mappings/display-set.json` 的固定 benchmark ID 驅動。模型的可選 Profile 必須在清單每一項都有 INCLUDED、非 null normalized score；此外八個渲染維度都必須非 null，主畫面才顯示該模型。缺少任一格的模型進入 Developer mode 的缺格清單；該清單不計算 Overall 或維度聚合，也不修改 ProductVersion、原始分數或 Evidence。
