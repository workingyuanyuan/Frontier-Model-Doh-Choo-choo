# Dashboard 資料分層（2026-10-04）

首頁使用精簡的分數與比較資料；完整證據在模型明細展開時載入。以目前資料版本測量，傳入 Dashboard 的 JSON 從 9,012,263 bytes 降到 1,642,844 bytes，減少 81.8%；正式版首頁 HTML 從 10,035,262 bytes 降到 1,768,635 bytes，減少 82.4%。以上是 UTF-8 未壓縮大小。

## 資料契約

- `lib/dashboard-data.ts` 將完整 ProductVersion 投影為 DashboardProduct，保留所有 INCLUDED 證據的計算欄位，以及成本圖需要的 EXCLUDED 指標。來源定位、擷取時間、排除原因與其餘完整證據欄位放在明細層。
- 首頁用 `dashboard-payload-v1` 傳送數值 tuple、共用字串表與 metric 表。Dashboard 依輸入物件記憶解碼結果，後續操作共用同一份資料。
- `app/evidence/[version]/[profile]/route.ts` 在 Next 靜態建置時輸出每個 profile 的 JSON。網址為 `/evidence/sha256-<hash>/<profileId>.json`；回應的 `versionId` 保留原本的 `sha256:<hash>`。路徑轉換讓 Windows 也能產製檔案。
- 明細的 `profile-evidence-v1` 契約包含 `schemaVersion`、`versionId`、`profileId` 與完整 `evidence`，涵蓋該 profile 的 INCLUDED 證據及同一模型的 EXCLUDED 證據。

目前輸出 214 份明細 JSON，每份中位數 31,835 bytes，最大 101,783 bytes。使用者只下載已展開的 profile；同一頁面內再次展開會重用快取。

## 載入與一致性

`ModelDetailPanel` 展開後立即顯示精簡資料中的分數與來源連結，同時載入完整證據。定位與擷取時間以原始 evidence ID 對應，沿用目前分數選取的證據。

`lib/profile-evidence.ts` 依資料版本與 profile 合併並快取請求，使用 `NEXT_PUBLIC_BASE_PATH` 支援子路徑部署。它檢查回應版本、profile、欄位形狀、重複 ID，以及首頁所需的 INCLUDED 證據是否齊全。失敗請求會移出快取，畫面顯示重試按鈕；切換 profile 或版本後，舊請求的結果不會覆蓋新明細。

首頁與明細由同一次靜態建置產生，發佈時需一起部署整個 `apps/bench/out`。版本化網址避免把新舊資料混用；若部署後舊頁面的資料版本已不存在，重新載入頁面會取得目前版本。

## 驗證

單元測試涵蓋字串表編解碼（含 null 欄位）、完整與精簡資料的比較分數及成本曲線一致性、靜態路由、版本與 profile 檢查、請求合併、失敗與不完整資料的重試。

瀏覽器測試涵蓋首頁與模型數調整不請求明細、展開後載入完整來源、收合重開使用快取、HTTP 與版本錯誤恢復，以及較晚完成的舊 profile 請求。正式版建置、TypeScript、ESLint、Prettier 與 177 項單元測試通過；桌面與手機共 92 項 Playwright 測試通過。
