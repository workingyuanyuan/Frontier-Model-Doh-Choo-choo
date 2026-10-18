# 2026-10-16 Benchmark 計分排除審查

核准內容：新增排除 **LiveBench Mathematics**（`livebench-mathematics`）與 **IOI**（`ioi`）。適用 AA 前 2～10 名各集合及自選模型／effort 的共同計分。

核准原文、固定 profiles 分數與來源定位見 [品質審查](../analysis/2026-10-16-benchmark-exclusions.json)；有效設定為 [benchmark-quality-v2.json](../../data/mappings/benchmark-quality-v2.json)。

## 版本與輸入

- 基準產品：`sha256:aa2ec4e72506c2494c04e0ca3635dcb6b83e27af655c3795dd57fdd17d0e0b96`。
- 本次產品：`sha256:6fa91f222b86daf7ef9aacb6773c07fedbae885548ae5e91ccdc1fb7647d4c35`。
- 產物時間（UTC）：`2026-10-16T00:07:04.535Z`。
- 本次使用已保存的來源快照重算品質政策；完整快照 ID、各筆分數與來源日期可由品質審查及差異 JSON 追溯。
- AA 模型與預設 profiles 按既有選模規則產生；本次沒有新增 effort 推測。

## 集合與分數

| AA 模型數 | 合格 benchmark 數 | 本次移除                   |
| --------: | ----------------: | -------------------------- |
|         2 |           29 → 27 | ioi, livebench-mathematics |
|         3 |           29 → 27 | ioi, livebench-mathematics |
|         4 |           27 → 25 | ioi, livebench-mathematics |
|         5 |           20 → 19 | ioi                        |
|         6 |           20 → 19 | ioi                        |
|         7 |           19 → 18 | ioi                        |

各集合逐模型的分數及名次見 [完整差異 JSON](2026-10-16-benchmark-exclusions-impact.json)。最大總分變動為 AA 前四模型集合中的 GPT-6 Astra：65.1351 → 63.0932（−2.0420）。此變動來自計分測試組成。

| 產品項目                  | 基準 | 本次 |
| ------------------------- | ---: | ---: |
| Profiles                  |  214 |  214 |
| AA 模型                   |   10 |   10 |
| Evidence                  | 8351 | 8351 |
| 成本紀錄                  |  992 |  992 |
| 可投入自選比較的 evidence | 3156 | 3073 |

## 驗證

- `pnpm data:generate-frontier-set`：成功，audit 狀態為 `selected`；九組集合內容已核對。
- `pnpm data:build-current`：成功；所有 presets 與 `comparisonEvidenceIds` 均排除兩項 benchmark。
- 資料套件：159 項測試通過。
- 介面邏輯：178 項測試通過，含有兩項原始分數的單一 profile 排除回歸測試。
- 資料套件 TypeScript、修改測試的 ESLint、Next.js production build：通過。
- 桌面／手機互動驗證：8 項通過，涵蓋自選模型與 effort、動態維度、清空／恢復、匯出及頁尾完整產品版本。
- 模型數拉桿：桌面／手機 2 項通過，逐一切換 AA 前 2～10 名，驗證 profiles、維度、網址持久化及恢復預設。

## 畫面核對

- 將 Models 設為 2、3、4：共同合格測試數應分別為 27、27、25。
- 將 Models 設為 5、6、7：共同合格測試數應分別為 19、19、18。
- 自選 Claude Opus 5.5 的 max effort，於 Developer mode 的 Common benchmarks 表格確認計分項目已套用本次排除。
- 頁尾版本應為 `sha256:6fa91f222b86daf7ef9aacb6773c07fedbae885548ae5e91ccdc1fb7647d4c35`。
