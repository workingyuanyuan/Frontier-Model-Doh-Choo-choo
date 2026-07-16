# LLM Bench 重構可捨棄項目清單

> 狀態：Accepted deprecation scope
> 日期：2026-07-16
> 依據：[REFACTOR_SPEC.md](./REFACTOR_SPEC.md)

## 1. 移除原則

舊架構不立即刪除。移除順序必須是：

1. 新資料工作區能產生真實 Draft。
2. 新前端能呈現 Leaderboard、Quality vs. Cost、Category Profile 與證據明細。
3. Draft 經人眼審查及修正。
4. 使用者將同一資料版本核准為 Published。
5. 驗證新 Published 可回退。
6. 確認新版沒有引用舊模組。
7. 成批刪除舊程式、測試、CI、設定與過時文件。

不建立 `legacy/`，也不長期維護新舊兩種執行方式。Git 是唯一歷史保存。

## 2. 明確捨棄的架構

| 項目                             | 現有位置                                                            | 捨棄理由                                                                | 替代方式                                          | 移除時機                     |
| -------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------- |
| 舊 Web App                       | `apps/web/`                                                         | 綁定 PostgreSQL、Edition、PREVIEW、舊路由與舊資料契約                   | 新單頁靜態資料 Dashboard                          | 新版 Published 核准後        |
| 舊 Worker                        | `apps/worker/`                                                      | 大量 LiveBench 專用 ingestion、alias、promotion、scoring 與 publication | 新資料工作區的 Manifest → Candidate → Draft 流程  | 新版 Published 核准後        |
| PostgreSQL／Drizzle              | `packages/db/`                                                      | 靜態 Published 不需資料庫；DB 故障不應使網站失去資料                    | 版本化靜態 Draft／Published JSON 與 artifact 索引 | 新版 Published 核准後        |
| Docker Compose                   | `compose.yaml`                                                      | Docker 永久退出技術路線；目前只服務 PostgreSQL                          | Node／pnpm 與必要 Python runtime                  | 新版不再引用 DB 後           |
| DB 根層命令                      | `db:*`、`local:prepare`、舊 `local:up`                              | 依賴 Docker／PostgreSQL／Worker                                         | 新的 dev、data、draft、publish 命令               | 新垂直切片可獨立啟動後       |
| LiveBench 專用 Connector         | `packages/connectors/src/livebench*`                                | 一個來源主導整體架構，且舊 revision recovery 成本過高                   | LiveBench 作一般 Source Manifest／Agent 擷取來源  | 新 LiveBench 擷取實證可用後  |
| LiveBench alias adjudication     | `apps/worker/src/livebench-alias*`、`livebench-reviewed-aliases.ts` | 綁定固定 inventory 與舊 canonical DB schema                             | 新模型／Profile resolution 契約                   | 新身份解析可處理第一批資料後 |
| LiveBench aggregation／readiness | `livebench-aggregation*`、`livebench-aggregation-readiness*`        | 只服務舊六分類 judgment 資料與 coverage gate                            | 通用 Candidate Result 與簡單八維聚合              | 新計分輸出通過 Draft 審查後  |
| LiveBench promotion／publication | `livebench-promotion*`、`livebench-score-publication.ts`            | 交易式 DB 發布與 task conflict gate 阻礙快速顯示                        | 靜態 Draft 生成、人工 Published 指標              | 新發布流程驗收後             |
| Edition 系統                     | `edition-*`、DB edition tables／repositories                        | Weekly edition 與資料庫 active pointer 不再是產品核心                   | 不可變資料版本與靜態 Draft／Published pointer     | 新發布與回退驗收後           |
| PREVIEW／FORMAL 舊狀態           | Web fixture、DB publication mode、formal coverage gate              | 新規格只有 DRAFT／PUBLISHED；Estimated 是資料品質，不是發布例外         | DRAFT／PUBLISHED 無例外切換                       | 新資料契約生效後             |
| 舊 coverage／confidence gate     | `packages/scoring/` 的 formal eligibility、相關 DB 欄位與 UI        | 第一版允許一項八維證據進 Estimated 主榜；真實偏差後再調整               | 簡單加權、Estimated、可見證據                     | 新計分結果通過人眼審查後     |
| PostgreSQL 狀態 API              | `/api/v1/health`、`/api/v1/status/data`、DB readiness               | 靜態站不需要資料庫 readiness                                            | 建置版本與 Published metadata                     | 新 Web 上線後                |
| 舊 Rankings API                  | `/api/v1/rankings/latest`                                           | 不再透過 DB active edition 讀取                                         | 新 App 直接讀 Published 靜態資料                  | 新 Web 上線後                |
| Pipeline／Sources 頁             | 舊 `/{locale}/pipeline`、`/{locale}/sources`                        | 非第一版核心，且綁 DB operational state                                 | 證據明細直接服務資料 QA                           | 新 Dashboard 可追溯證據後    |
| Methodology 多頁                 | 舊 `/{locale}/methodology`                                          | 第一版採單頁 Dashboard；政策先留 docs                                   | 文件與 Dashboard 簡短說明                         | 新 Dashboard 上線後          |
| 模型／Benchmark 詳情頁           | 舊動態路由                                                          | 第一版以同頁展開證據完成審查                                            | Dashboard evidence panel                          | 新 Dashboard 功能完整後      |
| Compare 多頁流程                 | 舊 `/{locale}/compare`                                              | 第一版三視圖在同一頁共享選擇狀態                                        | Dashboard 內互動比較                              | 新 Dashboard 功能完整後      |
| 舊雙語系統                       | `/zh-TW`、`/en` 與舊 i18n copy                                      | 第一版只做英文                                                          | 顯示名稱保留未來本地化欄位                        | 新 Web 上線後                |
| 舊雙主題                         | Google-inspired／Apple-inspired tokens                              | 第一版只保留一套高品質淺色主題                                          | 新單一設計系統                                    | 新 Web 視覺驗收後            |
| 舊 Weekly dry-run                | `.github/workflows/weekly-dry-run.yml`                              | 綁定 Worker、PostgreSQL、LiveBench 與 preview publication               | 統一來源排程與 Draft 產生工作                     | 新資料排程可執行後           |
| CI PostgreSQL service            | `.github/workflows/ci.yml` 的 postgres service                      | 新架構沒有 DB／Docker                                                   | 新資料 schema、前端、瀏覽器測試                   | 新 CI 穩定後                 |

## 3. 預設捨棄，但先做依賴審查

下列項目不因「可能可重用」而整包保留。只有新版實際引用的最小部分可抽取；其餘刪除。

| 項目                 | 現有位置                                | 可能保留內容                               | 預設處置                                                     |
| -------------------- | --------------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| 舊 shared contracts  | `packages/contracts/`                   | 通用 branded ID 或 Zod 使用方式            | 新契約確定後，只保留被直接採用的純型別；其餘刪除             |
| 舊 scoring package   | `packages/scoring/`                     | 基本 weighted mean 或 null handling 純函式 | 不保留 formal／coverage／confidence 契約；必要函式重寫或抽取 |
| Radar geometry       | `packages/radar/`                       | framework-neutral 0–100 幾何與 null 軸處理 | 視新前端需要抽取；不保證 API 相容                            |
| Presentation package | `packages/presentation/`                | 無舊 DB／Edition 依賴的 view-model 思路    | 新資料契約確定後評估；預設不直接依賴                         |
| Raw storage          | `packages/connectors/src/raw-storage*`  | SHA-256、內容定址檔案的純函式              | 若符合新 artifact 契約可抽取；舊 Connector package 不保留    |
| Browser E2E 設定     | `apps/web/e2e/`、Playwright root config | 響應式、無障礙與瀏覽器驗收方法             | 測試案例重寫，不保留舊 DB fixture／route 假設                |
| Web security headers | `apps/web/next.config.ts`、`proxy.ts`   | 經驗證仍適合靜態新 App 的 CSP／headers     | 逐項移植，不保證舊 nonce／dynamic route 設計                 |
| 品牌與 SVG 資產      | icons、monogram、CSS tokens             | 未綁定舊資料契約且符合新視覺方向者         | 人工挑選後移植                                               |

## 4. 影片系統

`apps/video/` 不屬於第一版範圍，且目前綁定 Edition、PostgreSQL snapshot、雙語與雙主題。

處置：

- 新版開發期間停止新增影片功能。
- 不讓新資料或前端契約為相容舊影片而變形。
- 新版 Published 核准後進行零引用檢查。
- 若沒有明確、近期的影片產品需求，刪除 `apps/video/` 及相關根層命令、測試、Remotion 依賴與文件。
- 若未來需要影片，使用新 Published 靜態資料重新設計；不保留舊 Edition-bound 實作作為相容層。

## 5. 明確捨棄的舊概念

以下概念不帶入新架構：

- LiveBench 是第一或核心資料來源。
- 固定 `2024-11-25` inventory 作全產品分母。
- judgment revision union 作產品資料骨幹。
- PostgreSQL 是網站可用性的必要條件。
- 一個 active weekly edition 是唯一最新讀取指標。
- PREVIEW／FORMAL 資料庫 publication mode。
- 六個 formal 維度或 65% coverage 才能進排名。
- Verified 與 provisional 必須分榜。
- 衝突必須阻塞所有新值。
- 所有 Connector 必須先完全自動化才能接入。
- 所有來源都必須以同一程式語言實作。
- 所有歷史模型與 Benchmark 都應完整匯入。
- 雙語、雙主題、多頁資訊架構是第一版必要條件。
- Docker／PostgreSQL／Worker 的 one-command local stack。
- 為未來可能用途保留 Docker。

## 6. 需要被新文件取代的現有文件

下列文件目前描述舊架構。新版實作期間可作歷史參考，但不得作為新需求來源：

| 舊文件                                              | 新狀態                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| `docs/PRODUCT_SPEC.md`                              | 被 `REFACTOR_SPEC.md` 取代；切換後刪除或改為歷史索引                   |
| `docs/ARCHITECTURE.md`                              | 舊 DB／Worker／Edition 架構；新架構落地後重寫                          |
| `docs/DECISIONS.md`                                 | 保留歷史決策脈絡；舊決策標示 Superseded，不直接刪除 ADR 歷史           |
| `docs/SCORING_METHODOLOGY.md`                       | formal coverage／confidence 規則被取代；真實資料後重寫                 |
| `docs/DATA_METHODOLOGY.md`                          | LiveBench 與 DB lifecycle 被取代；新 evidence flow 落地後重寫          |
| `docs/SOURCE_REGISTRY.md`                           | 由 Source Manifest 與 `BENCHMARK_SCORE_SOURCES.md` 承接                |
| `docs/OPERATIONS.md`                                | Docker／PostgreSQL／舊 CI 操作失效；新工作流程完成後重寫               |
| `docs/DESIGN_SYSTEM.md`                             | 雙主題與舊元件規則失效；新前端驗收後重寫                               |
| `docs/VIDEO_SPEC.md`                                | 非 MVP；影片確定刪除時一併刪除                                         |
| `docs/BACKLOG.md`、`tasks/plan.md`、`tasks/todo.md` | 舊交付計畫，不得繼續驅動重構；新規劃建立後封存或刪除                   |
| `docs/PROGRESS.md`、`docs/DELIVERY_AUDIT.md`        | 舊系統歷史證據；可保留到切換完成，再移至 release/history 或由 Git 保存 |

`docs/DECISIONS.md` 屬歷史決策記錄。依 ADR 原則不應直接抹除歷史；應在新架構確立時標明哪些決策被本規格 supersede，再由 Git 保存其完整演進。

## 7. 移除驗證

切換後必須確認：

- `rg` 不再找到 Docker、Compose、PostgreSQL、Drizzle、DATABASE_URL 的產品依賴。
- 新 Web 不 import 舊 `apps/web` 或 DB repository。
- 新資料工作區不 import `apps/worker` 或 LiveBench 專用模組。
- 根層命令不再包含 `db:*`、舊 edition、LiveBench promotion 或 weekly preview。
- CI 不啟動 PostgreSQL service。
- Published 靜態資料在 Connector、artifact 與網路不可用時仍可建置和顯示。
- Draft → Published → rollback 完整驗證。
- 舊路由、測試、文件與依賴一起刪除，沒有殘留殭屍程式。
- `pnpm install`、lint、typecheck、tests、production build 與瀏覽器驗收通過。
