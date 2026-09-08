# Benchmark 區辨力政策實作

2026-09-08：使用者核准將飽和／低區辨力審查納入選集。

## 採用政策

- AIME、ProgramBench 排除於所有 preset：分別對應前段天花板與地板效應。
- AA-LCR、GPQA Diamond、LegalBench、MMLU-Pro、Tax Eval v2 合計至多占各主要維度 1/3。
- 以固定審查名單與證據路徑控制政策；自動生成時不重新依當期模型分布分類或加權。
- 其他項目不等於已證明高區辨力；前段壓縮、資料量與測驗版本仍需定期複核。
- 五維覆蓋、指定必留模型、來源模式與完整 profile 判定都在同一搜尋中套用。

相較直接依標準差調權，固定名單更容易追溯，也避免模型群更新時權重自動漂移。
1/3 是本次試行的政策界線，不是統計顯著性門檻。AA-LCR 在預設集合繼續涵蓋長脈絡推理。

## 產物

| 項目                               | 原集合 | 品質限制後 |
| ---------------------------------- | ------ | ---------- |
| 預設 benchmark 數                  | 28     | 25         |
| 預設模型數                         | 13     | 13         |
| 預設 Reasoning 受限占比            | 3/8    | 2/6        |
| 預設 Knowledge 受限占比            | 2/5    | 1/4        |
| free-sources-22 benchmark 數       | 17     | 14         |
| free-sources-22 Knowledge 受限占比 | 2/3    | 0/2        |
| preset 數                          | 24     | 25         |

預設移除 AIME、LegalBench、Tax Eval v2。13 個模型與代表 effort 相同；
前 11 名順序相同，第 12、13 名互換。Overall 下降約 1.40–2.52，
反映計分基準改變，不能解讀成模型退步或新排名較準確。

22 模型集合的模型成員有 7 個替換；保留相同模型數不代表模型群相同。
新增 GPT-6 Astra、Kimi K3、GPT-5.6 Terra、DeepSeek V4 Flash、Inkling、Kimi K2.7 Code、Qwen3.6 27B；
退出 Claude Opus 4.8、Muse Spark 1.2、Gemini 3.5 Flash、Qwen3.8 27B、Qwen3.7 Max、Kimi K2.6、Qwen3.6 Plus。
這是品質限制與來源覆蓋共同造成的取捨。

完整模型、effort、分數與集合列表見 [impact JSON](2026-09-08-saturation-policy-impact.json)。
分類證據見 [審查 JSON](2026-09-08-benchmark-saturation.json)。

## 驗證

搜尋以兩維品質餘額區分狀態；每加入受限項目扣 2，其他同維項目加 1。
只在後續所有其他項目也無法補足時提前排除；超過未來最多需求的正餘額可合併。
支配剪枝限於相同餘額，以免用不合法集合淘汰可修復的集合。

測試涵蓋小資料集窮舉的可行最優模型數、單來源／全來源模式、早期品質赤字的後續修復、
禁止項目與必選項目衝突、政策欄位驗證，以及產品建置拒絕超標或過期集合。
每組生成 preset 均驗證模型數、指定模型完整性與五維計分。

重跑：`pnpm data:generate-display-set`、`pnpm data:build-current`、`pnpm report:coverage-matrix`。

驗證結果：資料套件 99 項測試、介面邏輯 59 項測試通過；TypeScript、ESLint 與完整產品建置通過。
桌面／手機 E2E 首輪 36 通過、4 條件性略過，2 項 Astra 舊分數斷言失敗；
改為核對當前 preset 的產物分數後，該 2 項重跑均通過。
新集合分布驗算見 [policy audit](2026-09-08-saturation-policy-audit.json)。
原審查腳本支援指定輸入及輸出路徑，並拒絕以不同版本覆寫既有審查證據。
