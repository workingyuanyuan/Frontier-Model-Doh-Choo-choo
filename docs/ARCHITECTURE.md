# 架構

本文件負責系統邊界與資料流；共用契約入口見 [文件索引](README.md)，操作步驟與完成標準見 [操作手冊](OPERATIONS.md)。

## 系統邊界

LLM Bench 是一套靜態資料產品。採集端使用本機 SQLite 保存取得與處理歷史，產品執行期只使用靜態資料。支援中的資料路徑為：

```text
公開來源／官方匯出
        │
        ▼
packages/acquisition
  擷取、物化、hash、列數與完整性驗證
        │
        ├── artifacts/evidence/store.sqlite  取得、依賴與快照
        │
        ├── artifacts/sha256/...       原始 bytes（Git 外）
        └── data/sources/<source>/     可審查的結構化結果（Git 內）
                         │
                         ▼
packages/benchmark-data
  Schema → canonical identity → Profile policy → 來源取代
         → Frontier → 五維計分 → deterministic ProductVersion
                         │
                         ▼
               data/product/current.json
                         │
                         ▼
                    apps/bench
              靜態 Dashboard UI
```

不存在 Dashboard → API → DB 的執行期資料路徑。`apps/bench` 在建置時讀取固定的 `current.json` 與 benchmark mapping；啟動後不需要來源網站、artifact store、Worker 或資料庫。

## 工作區責任

### `apps/bench`

- 英文、單頁 Dashboard。
- 顯示 `current.json` 的 ProductVersion 與完整 `versionId`。
- Leaderboard、Quality vs. Cost、Five Dimensions 與 Included／Excluded Evidence。
- 主畫面只顯示在所選集合（產品的 `presets`）每一項測試都有成績、且各維度皆非 null 的模型；Developer mode 提供缺格清單及獨立 partial-coverage 清單；後者顯示已有維度分數，不提供 Overall 或排名。
- 靜態／standalone 建置不讀取 `data/sources` 或 `artifacts`。
- 同一次建置另外輸出給代理與腳本讀取的純文字檔，內容見下方「代理可讀輸出」。

### `packages/benchmark-data`

- 版本化 Zod Schema：SourceManifest、EvidenceRecord、CandidateResult、CostRecord、ModelProfile 與 ProductVersion。
- canonical model identity、reasoning-effort Profile、來源優先與衝突取代。
- Frontier 模型選取、五維映射、稀疏安全計分及 Representative Profile 選擇。
- canonical deterministic JSON、內容 SHA-256 與目前資料檔寫入。

### `packages/acquisition`

- 從 API、匯出檔、內嵌 JSON、RSC、DOM 等來源物化快照。
- 保存真實 artifact bytes、SHA-256、byte length、locator 與取得方法。
- 對照來源母體、分頁或人眼可見列數，產生完整性報告。
- 驗證 Candidate／CostRecord 引用的 Evidence 存在。
- SQLite 保存每次取得與處理快照，來源 JSON 由完整快照匯出；共同介面提供輸入驗證、快取與中斷恢復。操作與維護責任見 [證據儲存](EVIDENCE_STORE.md)。
- 來源刷新只產生候選資料，不直接改變產品資料檔。常態任務接著依核准政策重產集合、重建產品及驗證展示，由操作手冊定義完整交付。

### `data`

- `mappings/`：人工審核的政策，包含 Benchmark 分類與品質、模型 alias、前沿身分、Profile policy 與來源白名單。
- `derived/`：由政策與來源快照生成的前沿集合與其 audit；不手動編輯。
- `sources/`：每站 manifest、evidence-index、candidates、costs 與 validation report。
- `product/current.json`：唯一的目前 ProductVersion，內容 hash 形成 `versionId`。

### `artifacts`

原始 HTML、JSON、CSV、ZIP、PDF 或 JS 使用內容 SHA-256 定址且不進 Git。它支援溯源與重新物化，但不是 Dashboard 建置的依賴。

## 資料生命週期

```text
verified sources
      │ frontier policy + benchmark taxonomy and quality policy
      ▼
 data/derived/frontier-set.json（集合與 audit）
      │ build-current
      ▼
data/product/current.json ──► apps/bench static build
      │
      └── Git commit records the deployed data version
```

- 每次修正都重建 deterministic ProductVersion，並以內容 SHA-256 產生新的 `versionId`。
- `current.json` 是可覆寫的工作區輸出；使用者審核後才提交資料 commit。
- 建置、頁尾與審核材料都使用同一個完整 `versionId`。
- Git 歷史保存已部署資料版本；SQLite 保存本機採集與處理歷史，交易與可恢復匯出保護來源快照。切換 Git 分支後明確初始化目前快照，匯出以 snapshot ID 選取。

## 代理可讀輸出

Dashboard 首頁內嵌整份資料（約 2 MB），不適合只能抓取網址的代理。建置時另外輸出下列檔案，路徑定義在 `apps/bench/lib/site-paths.ts`，內容由 `apps/bench/lib/agent-surfaces.ts` 產生：

| 路徑                                    | 內容                                                                             |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| `llms.txt`                              | 入口：資料版本、各集合三種格式的連結、資料檔、方法論與原始碼庫                   |
| `data/index.json`                       | 給腳本的入口：各集合三種格式的路徑、其他資料檔、來源清單與授權標示               |
| `data/presets/<presetId>.json`          | 該集合的排名、五維分數、成本指數與各來源美元任務成本、計分測試清單（未四捨五入） |
| `data/presets/<presetId>.md`            | 同上內容的 Markdown 表格（一位小數）                                             |
| `presets/<presetId>.html`               | 同上內容的靜態 HTML 頁，不需執行 JavaScript，也不內嵌資料                        |
| `data/profiles.json`                    | 全部 profile 與各自的 evidence 檔路徑                                            |
| `data/costs.json`                       | 全部成本紀錄，每筆標明單位                                                       |
| `methodology.md`                        | 英文方法論摘要、來源清單與授權標示                                               |
| `evidence/<versionId>/<profileId>.json` | 既有的逐 profile 證據檔                                                          |

- **單一投影**：`apps/bench/lib/preset-projection.ts` 的 `projectPreset` 把一個集合在主畫面上的內容整理成一份純資料，JSON、Markdown 與靜態 HTML 頁都只是它的三種寫法。它呼叫的是 Dashboard 用的同一組函式（`mainScreenProduct`、`getRepresentativeRows`、`buildWeightedCostCurve`、`getCostParetoFrontier`），不另寫一套計算。
- **一致性檢查**：`apps/bench/e2e/agent-surfaces.spec.ts` 讀建置後的輸出，逐集合比對三種格式的版本、列數、排名、分數與成本指數，並比對互動式 Dashboard（預設集合與一個 `?preset=` 集合）的表格和成本明細。它隨 e2e 在 CI 與 `pnpm data:release` 執行，任一格式不一致就失敗。
- **JSON 契約**：每份 JSON 帶 `schemaVersion`、`versionId`、`generatedAt`；連結一律相對於檔案自身的網址；`units` 標明每個數值的單位與方向，`nulls` 說明各欄位為 null 的意義。欄位有破壞性變更時升 `schemaVersion`。
- 首頁頁尾連到目前集合的三種格式，`<head>` 的 `rel="alternate"` 連到 `llms.txt`、`data/index.json` 與 `methodology.md`。
- **只發布最新版**（2026-11-17 使用者裁決）：每次部署整站替換，舊版檔案不保留可抓取的網址；歷史版本以 Git 為準。每個檔案都寫明 `versionId`。
- **英文方法論不是權威文件**（同日裁決）：公式參數、品質政策與來源清單由產品資料生成，敘述為英文摘要並註明以 `docs/` 的中文文件為準。修改計分或成本規則時須同步檢查 `methodologyMarkdown` 的敘述。
- **上游授權標示**（同日裁決）：每個來源列出發布網站與快照時間；授權與再散布條款未經查證者一律寫 `unknown`，不自行宣告開放授權。
- 首頁成本圖的 Source breakdown（各來源美元任務成本）以收合的 `<details>` 隨靜態 HTML 輸出，不需開發者模式，讓不執行 JavaScript 的讀者也能取得。

## 離線與失敗安全

- 來源刷新失敗不改變現有 `current.json`。
- artifact store 不可用時，不得宣告新快照驗證完成；既有產品資料仍可建置。
- Dashboard 建置只依賴已提交的 `current.json`、mapping 與程式碼。
- 沒有網路、Docker、PostgreSQL 或背景程序時，既有資料仍可顯示。

## Superseded 架構

下列設計不是備援路徑，也不保留相容層：

| Superseded 項目                                        | 現行替代                                       |
| ------------------------------------------------------ | ---------------------------------------------- |
| 舊 `apps/web` 多頁、雙語、雙主題 UI                    | `apps/bench` 單頁英文 Dashboard                |
| `apps/worker` 與 LiveBench 專用 ingest／score／promote | 通用 `packages/acquisition` + `benchmark-data` |
| PostgreSQL、Drizzle、migration、seed、Compose          | Git 內 `data` 靜態資料與 JSON                  |
| Edition、PREVIEW／FORMAL、revision／publication 契約   | 單一 `current.json` 與內容 hash                |
| Edition-bound Remotion 影片                            | 不屬 MVP；無保留介面                           |
| 舊 Connector、scoring、presentation package graph      | 新資料工作區中實際使用的獨立模組               |

歷史文件若提及上述元件，只能作為決策背景閱讀；本文件與 [操作文件](OPERATIONS.md) 才是支援中架構的權威說明。
