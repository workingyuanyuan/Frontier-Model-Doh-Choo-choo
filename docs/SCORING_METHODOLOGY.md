# 計分方法

## 五維定義（R18）

| 維度      | UI 縮寫 | 最小能力邊界                                                                       |
| --------- | ------- | ---------------------------------------------------------------------------------- |
| Agentic   | AGT     | 在可操作環境中多步執行：工具選擇、搜尋、狀態更新與任務完成，評估端點不由程式碼主導 |
| Coding    | COD     | 生成、補全、除錯、修復、重構與軟體工程，不論是否透過 agent harness 完成            |
| Reasoning | RSN     | 依題目或輸入資訊推導、計算、邏輯分析與跨文件整合；數學與長脈絡推理都在其中         |
| Knowledge | KNG     | 事實、專業與世界知識、校準及幻覺抑制                                               |
| Language  | LNG     | 理解與產生自然語言，並依語義、形式與使用者指定的限制控制輸出                       |

Leaderboard 與 Category score table 使用上表 UI 順序，雷達圖為對應的五軸。機器映射由 `data/mappings/benchmarks.json` 控制；主要維度、跨維關聯、理由與限制見 [Benchmark 維度映射](BENCHMARK_DIMENSION_MAPPING.md)。

維度集合的裁決與驗算依據見 [規格 §4.1、§4.6 與 R18](SPEC.md)：46 個 active benchmark ×
145 個 profile 的 738 組同 profile 配對相關度中，維度內平均 Spearman rho 0.61、維度間 0.50。

## Benchmark 納入規則

- 每個 Benchmark 第一版只投入一個主要維度。
- 次要關聯只供文件與未來調整，不重複計分。
- 百分比、accuracy 或具核准轉換的值標準化至 0–100。
- 沒有可靠轉換的 Elo、ECI、Intelligence Index 等只展示原始值或用於選模。
- `EXCLUDED`、identity 未解析或 `normalizedScore: null` 的結果不投入維度。
- 缺失值保持 `null`／N/A，永不當零。

## 有效結果與衝突

同一 Benchmark、模型、effort、metric 與歸屬 Profile 只能有一筆有效結果。`benchmarkVersion` 保存來源版本證據；不可比較的不同測驗需用不同 benchmark ID 隔離。

1. 套用來源角色優先級。
2. `FULL` 優先於 `PARTIAL_SOURCE`。
3. 地位相同的跨來源重複量測取可比較分數較高者；完整新快照替換該站舊快照，其他條件相同再以公開／觀測時間裁決。
4. Harness／No Harness 可比較且前述條件相同時取較高分，但不建立 Harness Profile。
5. 每筆 Evidence 最多貢獻一次；未採用結果仍留在審計軌跡。

## Profile、維度與 Overall

對每個 reasoning-effort Product Profile：

1. 在所選 preset 的 benchmark 範圍內，選出每個 Benchmark 的有效 normalized result。
2. 同一維度內，對已納入 Benchmark 分數取算術平均。
3. 沒有有效分量的維度保持 `null`。
4. Overall 是五個維度分數的算術平均；缺失維度不會被填零。
5. 產品主畫面只使用五個維度皆非 null 且通過顯示清單完整矩陣的 Profile。

缺格資料仍保留在 ProductVersion 供追溯，但不會以聚合數值呈現在主畫面或 Developer mode。

## 完整性閘門與 partial-coverage 清單（R19）

`overallScore` 與 `rank` 只給五個維度全部非 null 的 Profile。判準見
[規格 R19](SPEC.md)：逐維度剔除重排的最大名次位移為 35 名中的 8 名；以其餘四維預測
缺的那一維，MAE 3.5–8.1 分，`knowledge` 的 8.07 對上該維 sd 11.75；而且缺失並非隨機
——覆蓋五維者在其持有 benchmark 上的平均 z 為 +0.114，只覆蓋四維者為 −0.188。

只缺一個維度的 Profile 列入獨立的 partial-coverage 清單：顯示模型、缺少的維度與已有的
各維度分數，不給 Overall、不給名次、不與主榜同表排序。清單放在 Developer mode（R20），
與缺格清單同一性質，預設不顯示。

## Representative Profile

同一基礎模型有多個 effort Profile 時，取該來源測出分數最高（Overall Score 最高）的那一個。不判斷 effort 標籤，不假設 max 一定最好。Overall Score 為 null 者視為低於任何已測得的分數。分數相同時，以 `profileId` 字典序升序作為確定性平手判定。

Leaderboard、雷達圖、性價比圖表與儀表板預設選取全部使用同一個選法。

Leaderboard 以 Overall 由高至低排序，最後使用 deterministic `profileId` tie-break。使用者切換 effort 時，只能切換仍通過顯示清單與五維 no-N/A 門檻的 Profile。

## 顯示門檻與 Developer mode

- `data/mappings/display-set-policy.json` 保存使用者核准的集合生成政策；`pnpm data:generate-display-set` 依來源覆蓋率產生 `display-set.json` 的多組 presets。
- 每次刷新先依現有政策重產集合，再重建產品。來源約束、模型數範圍、必留模型與預設選擇政策的變更需使用者裁決；流程見 [操作手冊](OPERATIONS.md)。
- 每個 preset 同時決定展示資格與計分基準：同表模型只使用該集合內的 benchmark，集合改變可能改變五維、Overall 與排名。每個 preset 在建置時獨立計分。
- 前後比較需分開評估來源數值與集合組成的影響，並核對所選 effort 與代表 profile。
- Profile 必須對清單每一個 benchmark 有 INCLUDED、非 null normalized score，且五個渲染維度都非 null，才能進主畫面。
- Developer mode 的缺格清單列出缺失 benchmark；獨立 partial-coverage 清單依 R19 顯示已有維度分數，沒有 Overall 或排名，不與主榜混排。

## 綜合榜與成本不進五維

Artificial Analysis Intelligence Index、Epoch Capabilities Index、Vals Index 與 LLM Stats Coding Index 只用於 Frontier 選模、外部指標展示，以及性價比進階圖中作為單一來源（AA）的 Y 軸使用。它們**絕不投入五維 Overall**（Evidence 維持 `inclusion: EXCLUDED`），避免底層 Benchmark 被重複計分或跨座標系混淆。

Quality vs. Cost 的預設圖使用五維 Overall 作 Y 軸，進階圖則使用目前啟用來源各自分數的等權平均（AA 使用 Intelligence Index，DeepSWE、Frontier Code 與 ARC Prize 使用各自 benchmark 的 normalized 分數）。四個進階來源預設開啟，使用者關閉來源後重新判定完整交集與等權聚合。成本正規化與 Pareto frontier 都不是第六個能力分數，也不回饋至 Leaderboard。成本與圖表算法詳見 [資料方法](DATA_METHODOLOGY.md)。

## 可重現性

所有來源、Profile、Evidence、維度與 cost point 以固定次序序列化。固定輸入與 `generatedAt` 產生相同 canonical JSON 和 SHA-256 `versionId`；任何 mapping 或資料修正都建立新版本，而非覆寫既有分數。
