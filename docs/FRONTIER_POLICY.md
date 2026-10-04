# 前沿模型集合政策

核定日期：2026-10-04。此政策取代以測試覆蓋最佳化決定預設前沿模型的規則。

## 模型資格

唯一資格來源為 Artificial Analysis Intelligence Index。同一次排名只使用一個指標版本。
同一模型的不同 effort 取最高 AA 分數，前十名構成拉桿的模型範圍。
使用者可用 Models 拉桿選擇 AA 前 2～10 名，每個位置都有自己的共同合格測試及分數。
目前人工核定預設為前 8 名，preset ID 為 `aa-frontier`；其餘為 `aa-top-N`。
斷層計算保留供稽核參考，不決定首頁數量。預設數量由使用者依能力及測試覆蓋稽核調整。

資料缺少可比較版本、前十名身分未解析或樣本不足時，停止產品建置。
AA 綜合指標用於選模，不作為能力維度的計分測試。預設 profile 採該模型 AA 最高分那筆的產品 effort；
不同來源的成績經既有 profile 政策對齊，每個 profile 必須自身持有全部共同測試。

拉桿切換會重新選取該組 profiles，清除手動 effort 及保留比較設定，並更新網址。
Search Models 可自由選取模型，包括排除第九名並加入第十名；Default 恢復前 8 名。

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
排名資料驗證失敗時回傳非零狀態，不覆寫成功的集合。

`pnpm data:build-current` 重新產生前沿集合，使用 v2 分類及品質政策建立前 2～10 名的九組集合，預設 `aa-frontier` 為前 8 名。
產品保存可供自選模型計分的有效 evidence 及品質政策；網頁於每次模型或 effort 選取變更後，
重新求交集、套用品質限制、計算有效維度及加權總分。實作計分規則見 [計分方法](SCORING_METHODOLOGY.md)。
