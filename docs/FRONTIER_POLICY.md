# 前沿模型集合政策

核定日期：2026-10-03。此政策取代以測試覆蓋最佳化決定預設前沿模型的規則。

## 模型資格

唯一資格來源為 Artificial Analysis Intelligence Index。同一次判定只使用一個指標版本。
同一模型的不同 effort 取最高 AA 分數，依分數排序後，檢查前十個模型的九個相鄰分差。
若最大分差為唯一正值，且至少達其餘八個分差中位數的兩倍，納入斷層之前的所有模型。
前十名是判定窗口，入選數量由斷層決定。

資料缺少可比較版本、前十名身分未解析、樣本不足或斷層不明確時，產生 `needs-review` 稽核結果。
後續門檻調整依使用者稽核決定。

AA 綜合指標用於選模，不作為能力維度的計分測試。預設 profile 採該模型 AA 最高分那筆的產品 effort；
不同來源的成績經既有 profile 政策對齊，每個 profile 必須自身持有全部共同測試。

## 測試分類

| ID            | 名稱 | 核心概念           |
| ------------- | ---- | ------------------ |
| reasoning     | 推理 | 由已知條件推導答案 |
| knowledge     | 知識 | 運用既有領域知識   |
| comprehension | 理解 | 解讀輸入材料       |
| coding        | 程式 | 產出符合要求的程式 |
| agentic       | 代理 | 操作環境完成目標   |
| language      | 語言 | 按要求表達文字     |

分類資料：[benchmarks-v2.json](../data/mappings/benchmarks-v2.json)。每項測試只有一個主要分類。
次要分類供描述用途，不重複計分。完整歸類理由見 [BENCHMARK_DIMENSION_MAPPING.md](BENCHMARK_DIMENSION_MAPPING.md)。

## 品質政策

品質資料：[benchmark-quality-v2.json](../data/mappings/benchmark-quality-v2.json)。
AIME、ProgramBench、ProofBench 排除計分。ProofBench 在目前六個前沿模型的分數為 99–100，
停止計分的依據保存在 [品質稽核](analysis/2026-10-03-proofbench-quality-review.json)。

有限制的測試仍須在同一主要維度中，每項至少搭配兩項無限制測試。
先求共同測試，再排除不合品質政策的項目。若限制比例超標，保留全部無限制測試，
依 benchmark ID 排序保留最多可容許的限制測試，確保重建結果穩定。
`comparisonOnly` 測試不納入預設計分核心。

## 執行階段

1. **Phase 1：政策資料。** 選出前沿模型、套用六類分類、產生共同合格測試。
2. **Phase 2：動態計分及呈現。** 依勾選 profiles 重算共同測試；有測試才顯示維度；
   單項測試的維度權重為 ½，至少兩個獨立測試設計為 1，正規化後計算總分。
   表格及雷達圖共用有效維度。Clear all 清空選取，重新勾選後重新計算。
3. **Phase 3：互動驗證。** 驗證預設、清空、單選、多選及五軸／六軸切換。

Phase 1 產物為 `data/mappings/frontier-set.json`，由以下指令重建：

```sh
pnpm data:generate-frontier-set
```

指令讀取已儲存的來源快照，先套用精確身分對應及產品 profile 政策，再進行 AA 判定。
`frontier-selection-audit.json` 保留前十名、原始分數、來源證據、指標版本及斷層計算。
判定失敗時回傳非零狀態，不覆寫成功的集合；消費端必須同時檢查最新稽核狀態。

`pnpm data:build-current` 重新產生前沿集合，使用 v2 分類及品質政策建立 `aa-frontier` 預設集合。
產品保存可供自選模型計分的有效 evidence 及品質政策；網頁於每次模型或 effort 選取變更後，
重新求交集、套用品質限制、計算有效維度及加權總分。實作計分規則見 [計分方法](SCORING_METHODOLOGY.md)。
