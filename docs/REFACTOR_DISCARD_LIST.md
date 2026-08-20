# Stage 5 已捨棄項目

本文件是重構後的負面架構清單：下列項目已移除或 Superseded，不是備援、可選安裝或未來相容承諾。若歷史文件仍提及它們，以 [第二次重構規格](REFACTOR_SPEC_V2.md) 為準；該規格未涵蓋的部分再參照 [架構](ARCHITECTURE.md)。

> **本清單的負面範圍全部仍然有效**，第二次重構只增加項目、不解除任何一項。
>
> 但本文件寫於 Stage 5，其中被描述為「現行」的機制已被第二次重構取代：
>
> - **DRAFT／PUBLISHED pointer 已整套移除**，改為單一 `data-v2/product/current.json`，由部署 commit 決定。見 `REFACTOR_SPEC_V2.md` §11。
> - **不可變 `data-v2/product/versions/*.json` 已刪除**。見 `REFACTOR_SPEC_V2.md` §8。
>
> 遇到本文件描述現行機制的段落，一律以 `REFACTOR_SPEC_V2.md` 為準。

## 應用

| 已捨棄        | 原因                                                      | 現行替代                                           |
| ------------- | --------------------------------------------------------- | -------------------------------------------------- |
| 舊 `apps/web` | DB-bound、多頁、雙語、雙主題，與單一靜態產品重疊          | `apps/bench`                                       |
| `apps/worker` | LiveBench 專用 ingest／scoring／publication orchestration | `packages/acquisition` + `packages/benchmark-data` |
| `apps/video`  | 綁定 Edition，非 Dashboard MVP                            | 無；未保留 Edition/video contract                  |

## 資料庫與執行環境

| 已捨棄          | 包含項目                                                | 現行替代                                  |
| --------------- | ------------------------------------------------------- | ----------------------------------------- |
| PostgreSQL      | DB service、`DATABASE_URL`、migration、seed、repository | `data-v2` 靜態 JSON                       |
| Drizzle         | schema、migration generator、ORM dependency             | Zod schema + deterministic ProductVersion |
| Docker／Compose | `compose.yaml`、DB lifecycle、CI service                | Node.js + pnpm 本機／CI 命令              |
| `packages/db`   | 所有 DB tables、fixtures、integration paths             | `packages/benchmark-data`                 |

專案不保留「將來重新導入 Docker」方案。需要的新資料能力必須遵守靜態資料邊界。

## LiveBench 舊專用流程

下列 alias、inventory、judgment、revision、aggregation、promotion、formal scoring、publication、weekly 與人工 override 流程均已捨棄。LiveBench 現在只是 `data-v2/sources/livebench` 的一個來源，與其他站共用 Candidate、Evidence、CostRecord、mapping 和 Draft 流程。

不得恢復舊 `fetch:*livebench*`、`ingest:*livebench*`、`score:*livebench*`、`promote:*livebench*`、`edition` 或 Worker weekly root command。

## 產品與契約

- Edition、revision、publication record 與 Edition-bound artifact。
- PREVIEW／FORMAL、formal coverage、formal confidence 與 publication-enabled 狀態。
- 舊 theme、locale、multi-page route、source admin 與 DB API contract。
- Harness、tools、attempt 等被誤當 Product Profile 的舊語義。
- 將 Composite index 直接投入八維的舊計分假設。
- Edition-bound video DTO、metadata、ranking CSV 與 render artifact。
- **Coverage 比例與 8/8 顯示欄位**：覆蓋率百分比或維度計數欄位已移除；主榜改由 `display-set.json` 完整矩陣與八維無 N/A 門檻嚴格把關。
- **ProductVersion 的 ESTIMATED 狀態**：ProductVersion schema 升級為 v3，已徹底刪除並拒絕 `status: "ESTIMATED"` / `ProductVersionStatus` 欄位。
- **「至少一維有分數就顯示」與「Developer mode 放寬計算 1–7/8」**：已全數廢棄；Developer mode 只列出被排除模型缺少的 benchmark 格子，嚴禁在 Developer mode 產生任何維度或總分聚合數值。
- **`frontier.json` 的 `compositeSources`**：舊有的 `compositeSources` 映射結構已整套移除，改為單一清單式配置。
- **`evidence-detail.tsx` 獨立 Evidence 區塊**：已整套移除，改由統一的 Model Detail Panel 呈現維度分解與出處。

~~現行狀態只有不可變 ProductVersion，以及人工控制的 DRAFT／PUBLISHED pointer。~~ **Superseded by REFACTOR_SPEC_V2 §11**：改為單一 `data-v2/product/current.json`，pointer 機制整套移除。

## Package 與依賴

只為舊系統存在的 connectors、contracts、scoring、presentation、radar package 應移除；純函式只有在新架構實際 import、具獨立測試且 ownership 已移入新 package 時才可保留。Remotion、PostgreSQL client、Drizzle 及其 transitive-only lockfile entries 不屬支援中的依賴。

## CI、E2E 與操作命令

已捨棄：

- PostgreSQL service container、DB migration／seed 與 DB integration gate。
- 舊 Web fixture、locale/theme/Edition E2E。
- Worker weekly dry-run 與 LiveBench promotion gate。
- video still、render、artifact upload。
- 任何需要 Docker 或 `DATABASE_URL` 的 setup/runbook。

現行 CI 只驗證 acquisition、benchmark-data、bench、靜態產品版本、production build、瀏覽器／無障礙與 dependency security。（`pointer` gate 已隨 `REFACTOR_SPEC_V2.md` §11 移除。）

## 文件狀態

歷史決策可保留供考證，但所有支持舊 DB、Worker、Edition、影片、雙語／雙主題或 PREVIEW／FORMAL 的結論均為 **Superseded by Stage 5 static-data cutover**。它們不得作為新增程式、依賴或操作步驟的依據。

## 完成判定

Stage 5 的機械移除只有在以下搜尋與建置證據同時成立時完成：

- workspace 與 package graph 只包含新路徑。
- root scripts、CI、lockfile、imports 無舊 app／package 或 DB／video 指令。
- repository 無 Compose、migration、舊 Worker、Edition 或 video source。
- 新三個 workspace 的 test、typecheck、build 通過。
- production build 不需要網路、artifact、PostgreSQL 或 Docker。

文件中為說明「已捨棄」而出現的歷史名稱，不代表執行期依賴。
