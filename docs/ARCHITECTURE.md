# 架構

## 系統邊界

LLM Bench 是一套靜態資料產品，不是資料庫應用。唯一支援中的應用與資料路徑為：

```text
公開來源／官方匯出
        │
        ▼
packages/acquisition
  擷取、物化、hash、列數與完整性驗證
        │
        ├── artifacts/sha256/...       原始 bytes（Git 外）
        └── data-v2/sources/<source>/     可審查的結構化結果（Git 內）
                         │
                         ▼
packages/benchmark-data
  Schema → canonical identity → Profile policy → 來源取代
         → Frontier → 八維計分 → deterministic ProductVersion
                         │
                         ▼
               data-v2/product/current.json
                         │
                         ▼
                    apps/bench
              靜態 Dashboard UI
```

不存在 Dashboard → API → DB 的執行期資料路徑。`apps/bench` 在建置時讀取固定的 `current.json` 與 benchmark mapping；啟動後不需要來源網站、artifact store、Worker 或資料庫。

## 工作區責任

### `apps/bench`

- 英文、單一淺色主題、單頁 Dashboard。
- 顯示 `current.json` 的 ProductVersion 與完整 `versionId`。
- Leaderboard、Quality vs. Cost、Eight Dimensions 與 Included／Excluded Evidence。
- 主畫面只顯示通過 `display-set.json` 完整矩陣且八個維度皆非 null 的模型；Developer mode 只列出被排除模型缺少的 benchmark 格子，不顯示聚合分數。
- 靜態／standalone 建置不讀取 `data-v2/sources` 或 `artifacts`。

### `packages/benchmark-data`

- 版本化 Zod Schema：SourceManifest、EvidenceRecord、CandidateResult、CostRecord、ModelProfile 與 ProductVersion。
- canonical model identity、reasoning-effort Profile、來源優先與衝突取代。
- Frontier 模型選取、八維映射、稀疏安全計分及 Representative Profile 選擇。
- canonical deterministic JSON、內容 SHA-256 與目前資料檔寫入。

### `packages/acquisition`

- 從 API、匯出檔、內嵌 JSON、RSC、DOM 等來源物化快照。
- 保存真實 artifact bytes、SHA-256、byte length、locator 與取得方法。
- 對照來源母體、分頁或人眼可見列數，產生完整性報告。
- 驗證 Candidate／CostRecord 引用的 Evidence 存在。
- 來源刷新只產生候選資料，不直接改變產品資料檔。

### `data-v2`

- `mappings/`：可修改的 Benchmark、模型 alias、Frontier 與 Profile policy。
- `sources/`：每站 manifest、evidence-index、candidates、costs 與 validation report。
- `product/current.json`：唯一的目前 ProductVersion，內容 hash 形成 `versionId`。

### `artifacts`

原始 HTML、JSON、CSV、ZIP、PDF 或 JS 使用內容 SHA-256 定址且不進 Git。它支援溯源與重新物化，但不是 Dashboard 建置的依賴。

## 資料生命週期

```text
verified sources
      │ build-current
      ▼
data-v2/product/current.json ──► apps/bench static build
      │
      └── Git commit records the deployed data version
```

- 每次修正都重建 deterministic ProductVersion，並以內容 SHA-256 產生新的 `versionId`。
- `current.json` 是可覆寫的工作區輸出；使用者審核後才提交資料 commit。
- 建置、頁尾與審核材料都使用同一個完整 `versionId`。
- Git 歷史保存已部署資料版本；失敗安全由資料驗證與 Git 歷史共同提供。

## 離線與失敗安全

- 來源刷新失敗不改變現有 `current.json`。
- artifact store 不可用時，不得宣告新快照驗證完成；既有產品資料仍可建置。
- Dashboard 建置只依賴已提交的 `current.json`、mapping 與程式碼。
- 沒有網路、Docker、PostgreSQL 或背景程序時，既有資料仍可顯示。

## Superseded 架構

下列設計不是備援路徑，也不保留相容層：

| Superseded 項目                                        | 現行替代                                       |
| ------------------------------------------------------ | ---------------------------------------------- |
| 舊 `apps/web` 多頁、雙語、雙主題 UI                    | `apps/bench` 單頁英文淺色 Dashboard            |
| `apps/worker` 與 LiveBench 專用 ingest／score／promote | 通用 `packages/acquisition` + `benchmark-data` |
| PostgreSQL、Drizzle、migration、seed、Compose          | Git 內 `data-v2` 靜態資料與 JSON               |
| Edition、PREVIEW／FORMAL、revision／publication 契約   | 單一 `current.json` 與內容 hash                |
| Edition-bound Remotion 影片                            | 不屬 MVP；無保留介面                           |
| 舊 Connector、scoring、presentation package graph      | 新資料工作區中實際使用的獨立模組               |

歷史文件若提及上述元件，只能作為決策背景閱讀；本文件與 [操作文件](OPERATIONS.md) 才是支援中架構的權威說明。
