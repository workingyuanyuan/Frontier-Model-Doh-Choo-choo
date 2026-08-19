# 計分方法

## 八維定義

| 維度        | UI 縮寫 | 最小能力邊界                                 |
| ----------- | ------- | -------------------------------------------- |
| Agentic     | AGT     | 工具使用、環境操作、規劃、狀態與錯誤恢復     |
| Coding      | COD     | 生成、補全、除錯、修復、重構與軟體工程       |
| Reasoning   | RSN     | 抽象、演繹、歸納、因果、空間、時間與規劃推理 |
| Math        | MAT     | 計算、代數、形式推導、證明、競賽數學與最佳化 |
| Knowledge   | KNG     | 事實、專業與世界知識、校準及幻覺抑制         |
| Language    | LNG     | 語意、篇章、文字品質、摘要、敘事與風格控制   |
| Context     | CTX     | 長輸入檢索、跨文件整合、追蹤與長時程狀態維持 |
| Instruction | IF      | 顯式要求、格式／內容限制與任務規格遵循       |

Leaderboard 與 Category score table 使用上表 UI 順序。機器映射由 `data-v2/mappings/benchmarks.json` 控制；主要維度、跨維關聯、理由與限制見 [Benchmark 八維映射](BENCHMARK_DIMENSION_MAPPING.md)。

## Benchmark 納入規則

- 每個 Benchmark 第一版只投入一個主要維度。
- 次要關聯只供文件與未來調整，不重複計分。
- 百分比、accuracy 或具核准轉換的值標準化至 0–100。
- 沒有可靠轉換的 Elo、ECI、Intelligence Index 等只展示原始值或用於選模。
- `EXCLUDED`、identity 未解析或 `normalizedScore: null` 的結果不投入維度。
- 缺失值保持 `null`／N/A，永不當零。

## 有效結果與衝突

同一 Benchmark、版本、模型、effort、metric 與歸屬 Profile 只能有一筆有效結果：

1. 套用來源角色優先級。
2. `FULL` 優先於 `PARTIAL_SOURCE`。
3. 完整新快照直接取代舊值；同條件以較新公開時間為準。
4. Harness／No Harness 可比較且前述條件相同時取較高分，但不建立 Harness Profile。
5. 每筆 Evidence 最多貢獻一次；未採用結果仍留在審計軌跡。

## Profile、維度與 Overall

對每個 reasoning-effort Product Profile：

1. 選出每個 Benchmark 的有效 normalized result。
2. 同一維度內，對已納入 Benchmark 分數取算術平均。
3. Coverage 是非 null 維度數量除以 8。
4. Overall 對實際有資料的維度取算術平均；缺失維度不進分母。
5. 至少一筆已映射 normalized result 即可產生 Estimated 分數。

因此 1/8 新品可以快速顯示，但不能與 8/8 模型的 Overall 脫離 Coverage 解讀。

## Representative Profile

同一基礎模型有多個 effort Profile 時，取該來源測出分數最高（Overall Score 最高）的那一個。不判斷 effort 標籤，不假設 max 一定最好。Overall Score 為 null 者視為低於任何已測得的分數。分數相同時，以 `profileId` 字典序升序作為確定性平手判定。

Leaderboard、雷達圖、性價比圖表與儀表板預設選取全部使用同一個選法。

Leaderboard 預設排序先依 Coverage 8、7……1，再以 Overall 由高至低，最後使用 deterministic `profileId` tie-break。使用者切換 effort 時，該列分數、Coverage、明細與雷達圖都切至所選 Profile。

## Estimated、Supported 與顯示模式

- 第一版有分數結果均標為 `ESTIMATED`，包括只含廠商自報資料的模型。
- `PARTIAL_SOURCE` 可參與 Estimated，沒有期限。
- Supported 門檻尚未由真實資料確定，不硬編碼理論門檻。
- 預設 UI 只顯示 Representative Profile 為 8/8 的模型。
- Developer mode 只解除 8/8 顯示篩選，納入 1–7/8 的已計分模型；它不改分數、不補缺值、不發布資料。

## 綜合榜與成本不進八維

Artificial Analysis Intelligence Index、Epoch Capabilities Index、Vals Index 與 LLM Stats Coding Index 只用於 Frontier 選模和外部指標展示，不投入八維 Overall。

Quality vs. Cost 使用八維 Overall 作 Y 軸，但成本正規化與 Pareto frontier 都不是第九個能力分數，也不回饋至 Leaderboard。成本算法詳見 [資料方法](DATA_METHODOLOGY.md)。

## 可重現性

所有來源、Profile、Evidence、維度與 cost point 以固定次序序列化。固定輸入與 `generatedAt` 產生相同 canonical JSON 和 SHA-256 `versionId`；任何 mapping 或資料修正都建立新版本，而非覆寫既有分數。
