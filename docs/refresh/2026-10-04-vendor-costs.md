# 模型發布頁 Quality vs. Cost 資料

資料整合日期：2026-10-04（Asia/Taipei）。原始成本與分數採 2026-10-02 已核對的發布頁快照；OpenAI 成本座標軸於 2026-10-04 再次以瀏覽器確認。

## 可用資料

| Benchmark             |                新增可繪製的模型／effort 點 | 發布者    |
| --------------------- | -----------------------------------------: | --------- |
| DeepSWE 1.1           | 10（GPT-6 Sol、GPT-6.1 Sol 各五個 effort） | OpenAI    |
| AutomationBench 1.0.6 |                           5（GPT-6.1 Sol） | OpenAI    |
| CursorBench 4.0       |                20（四個模型各五個 effort） | Anthropic |

產品包含 694 筆成本紀錄，本次加入 74 筆。OpenAI 原始成本 36 筆、有效 30 筆；Anthropic 原始成本 45 筆、有效 44 筆。分數已排除的六筆多模型 fallback 與一筆 FrontierCode 衝突，其成本也排除。其餘與官方重疊的成本保留來源證據，繪圖時優先採用完整官方配對。

GPT-6.1 Sol 的 DeepSWE 資料：

| Effort | 分數（%） | 每項任務成本（USD） |
| ------ | --------: | ------------------: |
| low    |     64.38 |              0.1714 |
| medium |     73.01 |              0.4196 |
| high   |     75.22 |              0.6461 |
| xhigh  |     71.90 |              0.7886 |
| max    |     71.90 |              1.5711 |

## 配對與呈現

成本保留原始 `openai-releases`／`anthropic-releases` sourceId、Evidence、版本、模型與明確 effort。前端按 benchmark 群組配對同一發布者的分數及成本；每個 profile 優先使用官方完整配對，缺漏才使用已核對的供應商配對。重疊紀錄不平均成本、不重複增加群組權重。

Quality vs. Cost → Advanced 選取 DeepSWE，可顯示 GPT-6.1 Sol 五個 effort。懸停／鍵盤聚焦 high 點顯示 75.2 分、$0.646／任務及 OpenAI (vendor) 連結。AutomationBench 與 CursorBench 也提供對應曲線；CursorBench 為新增可選群組。

預設成本圖包含八個等權 benchmark 群組，各 1/8，依模型實際可用群組重新正規化。進階圖初始選取 AA、DeepSWE、Frontier Code、ARC Prize、Zapier；使用者可單獨啟用 CursorBench。每個點仍需具備所有已選群組的分數／成本配對。

## 單位與來源證據

- [OpenAI GPT-6.1 Sol 發布頁](https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/)：瀏覽器 DOM 確認 DeepSWE 與 AutomationBench X 軸為「每項任務成本」，刻度及 tooltip 使用 `$`。DeepSWE high tooltip 為 $0.65、75.2%；AutomationBench high 為 $0.23、33.2%。精確成本採已保存的圖表數值，未從四捨五入的 tooltip 回推。原始摘錄未包含座標軸標籤，成本 provenance 明確記錄人工核對的單位。
- [Anthropic Opus 5.5 發布頁](https://www.anthropic.com/claude-opus-5-5)：原始 HTML 的 FrontierCode 與 CursorBench 圖表都帶 `Cost per task (USD, log scale)`；擷取器要求此標籤存在。
- 可重建命令：`pnpm data:materialize-costs`，接著 `pnpm data:build-current`。成本擷取、vendor refresh、離線 snapshot materialization 都保留供應商／官方交叉核對閘門。

## 驗證

- 760 項單元／整合測試通過，包含供應商版本、profile、發布者、排除列與官方優先配對測試。
- 桌面及手機端共 80 個 E2E 案例完成驗證，包含 GPT-6.1 Sol DeepSWE 五點、high 分數／美元成本／來源連結，以及 AutomationBench、CursorBench 曲線。
- TypeScript 與正式靜態建置通過；本次變更檔案 ESLint 通過。全目錄 lint 掃到既有 `tmp/remove-model-pin-2026-10-03` 暫存腳本的 11 個錯誤，記錄為既有環境檢查限制。
- 本次產品異動欄位只有成本、生成時間與版本；完整逐群組點數與供應商配對見 [機器可讀報告](2026-10-04-vendor-costs.json)。

產品版本：`sha256:10008c8fdd762b6782163a2179f7301a7eeda3dcc01598b3f6ef2024411a910a`。
