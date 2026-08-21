# 操作與資料流程

## 不可違反的操作邊界

- Source refresh、目前版本建立與資料 commit 是不同的操作。
- Agent 可以刷新來源、修正 Candidate、重建 `current.json` 並完成代理審核。
- Agent 不得替使用者審核或提交 `data-v2/product/current.json`。
- 不使用 Docker、PostgreSQL、Drizzle、Worker、Edition 或影片流程。

## 1. 安裝

```bash
pnpm install --frozen-lockfile
```

只需要 Node.js 24+ 與 pnpm 11+。不要設定 `DATABASE_URL`，也不要啟動容器或 migration。

## 2. 刷新來源

來源快照與成本使用相同 materializer：

```bash
pnpm --filter @llm-bench/acquisition materialize:artificial-analysis -- --visual-profile-count=<count>
pnpm --filter @llm-bench/acquisition materialize:livebench -- --visual-profile-count=<count>
pnpm --filter @llm-bench/acquisition materialize:deepswe -- --visual-model-count=<count>
pnpm --filter @llm-bench/acquisition materialize:frontier-code -- --visual-row-count <count> --visual-top-ten-matched
pnpm --filter @llm-bench/acquisition materialize:effort-reports
```

四個刷新命令都必須先核對渲染後頁面的可見母體數，並把實測值傳入。Artificial Analysis 的命令會組合 evaluation RSC、`/models` 與現役 profile 的
`/models/<slug>` detail payload；`ARTIFICIAL_ANALYSIS_API_KEY` 僅從 gitignored
`.env.local` 讀取，官方 API 失效時記錄 warning，不阻斷頁面管道。

Frontier Code 必須先開啟渲染後頁面，核對 Main 列數與 Top 10，再執行帶有
`--visual-row-count` 與 `--visual-top-ten-matched` 的刷新命令。腳本會擷取頁面
JSON-LD 與官方靜態 JSON；未提供 DOM 核對結果時會拒絕標記完成。

四站完成後執行 `materialize:effort-reports`；它只替換 validation report 中
標記過的推測區段，保留每站刷新產生的可見母體核對與前後 delta。

刷新完成後逐站檢查：

- artifact 是來源回傳的真實 bytes，SHA-256 與 byte length 相符。
- SourceManifest 的 URL、角色、方法、時間與 `FULL`／`PARTIAL_SOURCE` 正確。
- Evidence locator 可指回原始欄位。
- Candidate／CostRecord 的 evidenceIds 全部存在。
- 官方母體、分頁或人眼可見列數與取得列數已對照。
- 結構化資料與畫面衝突已揭露，沒有模糊 identity 猜測。

來源刷新失敗時停止本次資料建立；既有 `current.json` 不受影響。

## 3. 建立目前版本

```bash
pnpm data:v2:build-current
```

命令會：

1. 驗證所有 manifest、Evidence、Candidate、CostRecord 與 mapping schema。
2. 套用 canonical identity、effort-only Profile 與來源衝突規則。
3. 依據來源資料與人工指定清單建立 Frontier 模型集合。
4. 計算八維、Overall 與 cost point；主畫面另依 display set 驗證完整矩陣。
5. 產生 canonical deterministic JSON 及內容 `versionId`。
6. 驗證內容 hash 後寫入 `data-v2/product/current.json`。

`current.json` 是單一可變工作區輸出；使用者審核前不得提交。相同輸入會產生相同內容與 `versionId`。

## 4. 開發與建置

```bash
pnpm --filter @llm-bench/bench dev
pnpm --filter @llm-bench/bench build
```

Dashboard 建置固定讀取 `data-v2/product/current.json`，不讀取來源、artifact、網路或資料庫。**頁尾直接顯示完整 `versionId`；頁首顯示的是縮寫，完整值在該元素的 `title` 屬性上**（見 `apps/bench/components/version-header.tsx`），核對時請以頁尾為準。目前資料沒有預覽通道，也不產生 noindex metadata。

## 5. 建置前代理審核

Agent 必須先完成所有可由 repository、artifact 或公開來源裁決的審核，不把機械檢查交給人工。

### 版本完整性

- `current.json` 的 schema、deterministic bytes 與內容 hash 一致。
- 重新建立結果的 `versionId` 與審核材料一致。
- ProductVersion 可在無網路、artifact、DB 或 Docker 時建置。

### 資料與計分

- 來源角色、時效、母體列數與 `FULL`／`PARTIAL_SOURCE` 敘述正確。
- canonical identity、alias 與 effort 歸屬可由證據支持。
- Harness、tools、attempt、thinking、context 沒有拆成 Product Profile。
- Included Benchmark 皆有主要維度映射；Excluded 不計分。
- 缺值不是零，Composite index 未重複投入八維。
- Representative Profile 取最高 Overall，且 display set 的每個 benchmark 都有 INCLUDED、非 null 分數。

### UI

- 主畫面八個維度不出現 N/A；Developer mode 只列出缺格模型，不顯示聚合分數。
- Profile selector 只提供仍通過完整矩陣與 no-N/A 門檻的 Profile，並同步更新雷達與 Evidence。
- Leaderboard／Evidence 排序與 Included／Excluded 出處正確。
- 桌面、行動、鍵盤與無障礙檢查通過。

只有以下問題交給人工：公開證據互相衝突且無法由版本或配置裁決；來源未公開必要資訊而無法不靠猜測判定；以及是否接受已揭露的殘餘產品風險。

任何修正都要重新生成新的 ProductVersion，不能直接改寫內容 hash。

## 6. 提交與部署

依據規格 §11.4，每次常態資料刷新必須遵守以下程序：

1. 刷新來源並執行 `pnpm data:v2:build-current` 後，`data-v2/product/current.json` 會以變更狀態留在工作目錄，**代理絕不得自動提交**。
2. 產出 `docs/REFRESH_<YYYY-MM-DD>.md` 刷新審核報告（格式參考 [REFRESH_2026-08-20.md](REFRESH_2026-08-20.md)），內容必須涵蓋：
   - **舊／新 `versionId`**，以及模型數、排行榜列數、evidence 筆數、成本筆數各自的增減。
   - **主畫面的進出**：本次新進、退出主畫面的模型，各附原因（缺哪一格／補上哪一格）。
   - **既有模型分數變化的絕對值前幾名**。
   - **檔位推測揭露表（強制）**：本次有哪些 profile 的 effort 是推測出來的，依規格 §4.5 逐筆列出推測依據來源與依據列。缺這一項的報告不算完成。
   - 已知未解：擷取失敗、來源改版、無法解析的名稱。
   - 依風險排序的人眼可驗抽查清單。排序為：本次新進主畫面的模型（每個至少一筆）→ 分數變動最大的幾筆 → 檔位為推測而非來源標示的 profile → 每個來源至少一筆。每一筆必須寫成規格 §11.4 定義的四欄：

     | 欄位     | 要求                                                         |
     | -------- | ------------------------------------------------------------ |
     | 網址     | 可直接點開的頁面，落在該數字所在的那一頁                     |
     | 頁面位置 | 該頁上的區塊或表格名稱，以及**網站上顯示的那個模型名稱字串** |
     | 欄位     | 網站上該欄的顯示名稱                                         |
     | 期望值   | 我們存的值，四捨五入到與網站相同的位數                       |

     驗證動作必須能被壓縮成「打開連結、找到這一列、比對一個數字」。**不得**把 `benchmarkId`、`profileId`、`evidenceId` 或 CSS 選擇器當成抽查指示交給使用者。

   - 新的 `versionId`。
3. **主動提示使用者進行人工抽查，並明確指名抽查哪幾筆資料、如何核對**。
4. 使用者完成審核並明確指示後，才可提交 `data-v2/product/current.json` 與相關報告。
5. 部署由包含該資料的 Git commit 決定；部署前核對建置顯示的 `versionId` 等於審核值。

若需要 rollback，請對包含資料的 Git commit 執行 `git revert`，再以還原後的工作樹重新建置與部署。不要新增版本切換指令，也不要重抓來源或重算未變更的資料。

## 7. 驗證與報告命令

### 基準驗證清單

**順序不可調換**：`pnpm e2e` 的 `webServer` 以 `scripts/serve-static.mjs` 服務靜態匯出產物 `apps/bench/out`，因此必須排在 production build 之後。乾淨 checkout 下先跑 e2e 會因缺少該目錄而失敗。

```bash
pnpm install --frozen-lockfile
pnpm format        # prettier --check，只檢查不自動修改
pnpm format:write  # 需要自動修排版時使用
pnpm lint          # eslint 語法與型別規則檢查
pnpm typecheck     # turbo 跨套件型別檢查
pnpm test          # vitest 單元測試
pnpm --filter @llm-bench/bench build  # Next.js 靜態生產建置
pnpm e2e           # playwright 端對端測試（必須排在 build 之後）
pnpm audit --audit-level high  # CI 的相依套件公告門檻
```

### Display-Set 取捨報告

```bash
pnpm report:coverage-matrix
```

此命令執行覆蓋率矩陣分析，輸出模型 × benchmark 的有無矩陣與各規模 display-set 取捨曲線，供審核關卡 2 人工判讀是否需調整 `data-v2/mappings/display-set.json`。代理不得自行調整顯示清單。

CI 的支援路徑只允許 schema、資料 builder、三個新 workspace、靜態 build、瀏覽器／無障礙與依賴安全檢查；不得啟動 DB service、Docker、舊 Web fixture、Worker 或影片 render。

## 8. Artifact 保存

`artifacts-v2/` 不進 Git。每次成功擷取後應把內容定址 bytes 同步至耐久儲存；Evidence metadata 不能取代原始 artifact。artifact store 暫時不可用時，新快照不得標為驗證完成。

## 9. 已移除命令

任何 `db:*`、Compose、migration、seed、Edition、LiveBench ingest／score／promote、舊 weekly Worker、舊 Web E2E 或 video render 命令都屬已移除流程。不要在 runbook、CI 或故障排除中恢復；需要新能力時，應在目前三個 workspace 與靜態資料邊界內另行設計。
