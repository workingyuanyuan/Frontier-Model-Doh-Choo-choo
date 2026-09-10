# 共同 Benchmark 比較

在 Search Models 勾選模型後，排行榜進入共同 Benchmark 比較模式。模型選單涵蓋產品快照中有有效量測的模型，包含不符合目前 preset 完整矩陣的模型。Default 或切換 Models preset 可回到預設計分。

每個模型固定使用一個 profile。已顯示的模型沿用目前 profile，新加入的模型預設選擇 Benchmark 覆蓋最多的 profile；覆蓋相同時按 profile ID 排序。使用者可在模型列切換 profile，所有共同項目、維度分數、總分、名次和雷達圖隨之更新。

產品生成時，`comparisonEvidenceIds` 記錄 `selectCurrentResults` 選取的有效量測 ID，保留來源角色、完整性、跨來源分數與發布時間的既有選取規則。模型資格與 profile 歸類沿用產品生成流程。前端以這些 ID 對應 evidence，不重新選取多來源成績。舊快照缺少此欄位時，僅使用 presets 已選取的 evidence ID。

交集按 `benchmarkId` 判定；`benchmarkVersion` 作為出處資訊展示。同一 Benchmark 必須具有一致的 metric ID、單位與方向，才納入比較。計分使用既有 normalizedScore，維度內對有效量測取算術平均，五個維度完整時才計算 Overall 和名次。缺少維度時顯示 N/A；交集為空時保留模型與 profile 控制，顯示資料不足提示。

Common benchmarks 表並排顯示所有共同項目的 normalizedScore、原始成績和來源連結。兩個模型時附上第一欄減第二欄的分差。可同時選取多個模型，單選時顯示該 profile 的有效項目。preset 的 Benchmark 品質組合限制屬於 preset 生成政策，共同比較則展示所選 profiles 的完整有效交集。

驗證包含交集、profile 隔離、空集合、缺分、零分、多模型、重複來源、metric 相容性，以及桌面／手機的選模、profile 切換和還原流程。
