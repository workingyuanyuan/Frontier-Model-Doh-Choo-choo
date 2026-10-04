# Dashboard 效能檢查（2026-10-04）

主要互動瓶頸是成本圖的同步計算。每次 Dashboard 更新都會進入 CostChart，重新建立一般曲線、進階曲線和進階模型選項；進階圖收合時仍執行完整計算。進階模型選項又針對六個來源各建立一次曲線。過程中每筆成本資料反覆掃描證據，並重新尋找、排序 AA 版本，累積成秒級主執行緒工作。

已完成的修正：

- `apps/bench/lib/view-model.ts`：每次計算建立證據索引，重用 AA 版本及 profile／來源／benchmark 查找結果。進階模型選項的六個來源共用索引。一般曲線一次建立代表模型查找表；開發者診斷一次掃描證據。
- `apps/bench/lib/common-benchmarks.ts`：先按 profile、benchmark 分組，再計算平均值與 metric 相容性，減少內層的完整陣列掃描。
- `apps/bench/components/cost-chart.tsx`：依資料與來源選擇記憶計算結果；進階資料在開啟時才建立。元件邊界阻擋無關的父元件更新；滑鼠提示、模型選單、點選狀態重用圖表資料。
- `apps/bench/components/radar-chart.tsx`：共用代表模型和座標計算，重用維度與圖形結果。
- `apps/bench/components/dashboard.tsx`：共同比較、開發者診斷依顯示模式計算；模型選項依原始資料更新。新 preset 的預設模型在當次 render 生效，消除 effect 造成的第二輪更新；固定比較的 profile 陣列保持穩定。

使用實際 `data/product/current.json`：8,351 筆證據、214 個 profile、992 筆成本、68 個可比較模型。Node v24.19.0，每個函式暖身後量測七次取中位數；每組先用 `isDeepStrictEqual` 驗證完整輸出一致。下表為一次本機量測，不代表使用者裝置的固定延遲。

| 計算                          |      修正前 |  修正後 |
| ----------------------------- | ----------: | ------: |
| 比較模型選項                  |     8.02 ms | 2.13 ms |
| 全部模型的共同 benchmark 比較 |     2.95 ms | 1.56 ms |
| 一般成本曲線                  |   241.05 ms | 5.31 ms |
| 進階成本曲線                  |   336.04 ms | 8.31 ms |
| 進階模型選項                  | 1,562.77 ms | 9.08 ms |
| 開發者診斷列                  |    27.91 ms | 0.64 ms |

當次前後版本、量測程式與輸出保存在工作目錄的 `tmp/performance-audit/`；可執行 `pnpm exec tsx tmp/performance-audit/run.ts` 重測。此目錄是本機暫存，不隨 Git 發佈。計算索引只存活於當次呼叫，後續資料變更會重新讀取；新增測試覆蓋分數更新、metric 順序與重複值、掃描次數，以及收合圖表的計算邊界。

另以同一資料版本的前後正式版靜態輸出，在本機 headless Chromium、正常 CPU 速度量測互動。每項三次取中位數，使用 CDP `ScriptDuration` 差值；以 DOM input／change／click 觸發 React 事件並核對狀態。以下數字是 JavaScript CPU 時間，不是 INP 或畫面完成繪製時間。各次測試間重設狀態，重設不納入樣本。

| 瀏覽器互動                  | 修正前 JS 時間 | 修正後 JS 時間 |
| --------------------------- | -------------: | -------------: |
| 模型數 8 → 10               |    2,004.40 ms |        5.85 ms |
| 同一模型 effort：max → high |    1,030.41 ms |        2.79 ms |
| 開啟進階成本圖              |    1,004.53 ms |       12.73 ms |

量測程式與原始結果：本機 `tmp/perf-bounded.cjs`、`tmp/perf-baseline-bounded.json`、`tmp/perf-optimized-bounded.json`。這些數字用於判斷瓶頸與改善方向，會受裝置和當時系統負載影響。

另以 Playwright 的 `fill`、`click`、`selectOption` 在前後版本交叉驗證：模型數 8／10 的表格列數、進階圖顯示、effort 變更後的表格 `data-profile-id` 均正確。該次單次量測同樣顯示 slider 與進階圖的 JavaScript 時間由秒級降至約 10／19 ms；結果存於本機 `tmp/perf-playwright-confirmation.json`。

驗證：正式版建置、TypeScript、修改檔案 ESLint 與 Prettier 通過；158 項前端單元測試、桌面 41 項與手機 41 項 Playwright 測試通過，涵蓋模型數切換、分數／effort 更新、來源切換、比較、重設、圖表、排序、匯出與可及性。

下一步建議先做資料分層。`app/page.tsx` 將完整 ProductVersion 傳入 Client Component；目前 JSON 約 9.01 MB，輸出的 HTML 約 10.04 MB（未壓縮），證據欄位約占 JSON 的 91%。壓縮能降低傳輸量，瀏覽器仍須解碼並建立完整物件。

建議在資料產製階段輸出首頁需要的精簡分數、比較用 metric／數值及成本索引，將來源追溯與排除原因等明細依 profile 拆成版本化靜態 JSON，展開時載入並快取。這可沿用靜態網站部署；需要共同設計資料契約、版本一致性與載入失敗的 UI，屬於下一階段架構工作。

若日後模型與證據量繼續增加，再評估把共同比較移到 Web Worker。需處理請求版本、過期結果與資料傳遞成本；目前函式已降至毫秒級，優先降低首頁資料負擔更有價值。
