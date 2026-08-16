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
        ├── artifacts-v2/sha256/...       原始 bytes（Git 外）
        └── data-v2/sources/<source>/     可審查的結構化結果（Git 內）
                         │
                         ▼
packages/benchmark-data
  Schema → canonical identity → Profile policy → 來源取代
         → Frontier → 八維計分 → deterministic ProductVersion
                         │
                         ▼
data-v2/product/versions/<sha256>.json
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
 pointers/draft.json      pointers/published.json
               └─────────┬─────────┘
                         ▼
                    apps/bench
              同一套靜態 Dashboard UI
```

不存在 Dashboard → API → DB 的執行期資料路徑。`apps/bench` 在建置時讀取明確通道的 pointer 與 ProductVersion；啟動後不需要來源網站、artifact store、Worker 或資料庫。

## 工作區責任

### `apps/bench`

- 英文、單一淺色主題、單頁 Dashboard。
- Draft 與 Published 共用同一 ProductVersion schema 和 UI。
- Leaderboard、Quality vs. Cost、Eight Dimensions 與 Included／Excluded Evidence。
- Draft 顯示狀態標示並產生 `noindex` metadata。
- 預設顯示 8/8 模型；Developer mode switch 才顯示 1–7/8 的已計分模型。
- 靜態／standalone 建置不讀取 `data-v2/sources` 或 `artifacts-v2`。

### `packages/benchmark-data`

- 版本化 Zod Schema：SourceManifest、EvidenceRecord、CandidateResult、CostRecord、ModelProfile、ProductVersion 與 pointer。
- canonical model identity、reasoning-effort Profile、來源優先與衝突取代。
- Frontier Top-20 聯集、八維映射、稀疏安全計分及 Representative Profile 選擇。
- canonical deterministic JSON、內容 SHA-256 與不可變版本檔。
- Draft、Published、publish 及 rollback 的原子 pointer 操作。

### `packages/acquisition`

- 從 API、匯出檔、內嵌 JSON、RSC、DOM 等來源物化快照。
- 保存真實 artifact bytes、SHA-256、byte length、locator 與取得方法。
- 對照來源母體、分頁或人眼可見列數，產生完整性報告。
- 驗證 Candidate／CostRecord 引用的 Evidence 存在。
- 來源刷新只產生候選資料；不具備發布權限。

### `data-v2`

- `mappings/`：可修改的 Benchmark、模型 alias、Frontier 與 Profile policy。
- `sources/`：每站 manifest、evidence-index、candidates、costs 與 validation report。
- `product/versions/`：只能新增、不能覆寫的 ProductVersion。
- `product/pointers/`：唯一可變的產品版本狀態。

### `artifacts-v2`

原始 HTML、JSON、CSV、ZIP、PDF 或 JS 使用內容 SHA-256 定址且不進 Git。它支援溯源與重新物化，但不是既有 Draft／Published 的建置依賴。

## 版本與狀態機

```text
verified sources
      │ build-draft
      ▼
immutable ProductVersion ──► DRAFT pointer
                                  │ human publish
                                  ▼
                           PUBLISHED pointer
                                  │ human rollback
                                  ▼
                         previous ProductVersion
```

- Draft 可以由 Agent 建立、重建與審核。
- 每次修正建立新的 ProductVersion，不修改舊版本。
- Published 只能由人工明確觸發；無新模型例外。
- publish／rollback 不重新擷取、不重新計分。
- pointer 切換前必須驗證目標存在、檔名、schema 與內容 hash。
- 任一步驟失敗時，既有 Published pointer 保持不變。

## 離線與失敗安全

- 來源刷新失敗不影響既有 Draft 或 Published。
- artifact store 不可用時，不得宣告新快照驗證完成；既有產品版本仍可建置。
- Dashboard 建置只依賴已提交的 pointer、ProductVersion、mapping 與程式碼。
- 沒有網路、Docker、PostgreSQL 或背景程序時，既有 Published 仍可顯示。

## Superseded 架構

下列設計不是備援路徑，也不保留相容層：

| Superseded 項目                                                 | 現行替代                                                |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| 舊 `apps/web` 多頁、雙語、雙主題 UI                             | `apps/bench` 單頁英文淺色 Dashboard                     |
| `apps/worker` 與 LiveBench 專用 ingest／score／promote／publish | 通用 `packages/acquisition` + `packages/benchmark-data` |
| PostgreSQL、Drizzle、migration、seed、Compose                   | Git 內 `data-v2` 靜態資料與不可變 JSON                  |
| Edition、PREVIEW／FORMAL、revision／publication 契約            | Draft／Published pointer                                |
| Edition-bound Remotion 影片                                     | 不屬 MVP；無保留介面                                    |
| 舊 Connector、scoring、presentation package graph               | 新資料工作區中實際使用的獨立模組                        |

歷史文件若提及上述元件，只能作為決策背景閱讀；本文件與 [操作文件](OPERATIONS.md) 才是支援中架構的權威說明。
