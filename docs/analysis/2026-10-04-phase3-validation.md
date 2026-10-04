# Phase 3 互動驗證

驗證日期：2026-10-04。產品版本：
`sha256:36bf3de9984f8eac4c7b7754f3d898d00a72cfb1b8b76a4ee905fde2bca3c553`。

使用正式靜態建置，於 Playwright Desktop Chrome 及 Pixel 7 Chromium 執行。
78 項測試通過：既有測試 76 項（74 項全套通過、2 項更新資料預期後定向重跑通過），新增維度流程 2 項。

## 驗證範圍

- AA 預設六個 profiles，榜單及雷達圖顯示五個有效維度。
- Clear 清空榜單、雷達軸及資料點；重選模型重新決定維度。
- Qwen3.7 Plus 單選為六維；加入 Gemini 4 Argon 後共同測試為五維；移除後恢復六維。
- Language 排序欄消失後回復 Overall 排序；Markdown 匯出同步調整欄位。
- effort 切換、保留 effort、移除 effort、Default 恢復 AA 預設 profiles。
- 開發者模式的共同測試及來源連結；手動比較的 FrontierSWE V2。
- 桌面及手機版五維、六維、雙模型比較截圖檢查；無整頁橫向溢出。
- 主頁及開發者模式無 serious／critical axe 違規；新增維度流程無瀏覽器 pageerror。

## 重跑

```sh
pnpm --filter @llm-bench/bench build
pnpm exec playwright test --workers=3
```

新增回歸流程：`apps/bench/e2e/phase3-dimensions.spec.ts`。
測試截圖由 Playwright 寫入該測試的 outputPath；標準設定為 `test-results/bench/`。
