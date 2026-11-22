# 2026-11-22 資料刷新報告：FrontierMath 改用 v2

完整 release 通過，**沒有需要停下來審核的重大變更**。

每日查核發現，專案一直匯入 Epoch 的 FrontierMath v1，但 Epoch 的 `benchmark_metadata.csv` 已把兩份 v1 私有題組標為被 v2 取代（`superseded_by`）。查核報告在 10-14、10-15、10-17 都記錄了這個「v2 匯入缺口」，但一直沒有處理。代理向使用者說明後推薦改用 v2，使用者 2026-11-22 指示「改用 v2」：

- **新增 `frontiermath-v2` 與 `frontiermath-tier-4-v2`**：分別來自 `frontiermath_tiers_1_3_v2.csv` 與 `frontiermath_tier_4_v2.csv`。維度與 v1 相同：主維度 Reasoning，次要 Knowledge。來源角色維持 ORGANIZER。
- **`frontiermath` 與 `frontiermath-tier-4`（v1）改為不計分**：兩者照常物化為證據，由品質政策排除計分（[審核紀錄](../analysis/2026-11-22-frontiermath-v2-supersession.json)）。

預設集合 `aa-top-9` 完全沒有變化。v2 進入 2–5 個模型的前沿集合與 2–6 個模型的覆蓋集合，這些集合的名次都沒有變，總分上升 0.23–1.19 分。

## 版本與來源基準

- 起始 commit：`69456e409f77b27d14caf741e7d45704c1dddf78`（main），於分支 `data/frontiermath-v2` 進行。
- 舊版本：`sha256:76bebaf7b1a917ac199baf01ec5ed794f235026d0d6a7b4d5e9e871bc229e15f`
- 新版本：`sha256:232c437eea8e6b05c9b01cb91d755963d09a052b43b7710a03cf03ee7d2f06f0`
- Release `2026-11-22T05-12-12-105Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-22-frontiermath-v2-receipt.json)
- 第一次 release `2026-11-22T05-06-07-879Z` 在 e2e 失敗，原因與修正見「e2e 測試修正」。
- 只重新匯入 Epoch（`materialize:epoch`，2026-11-22T05:05:44Z）；其他來源維持今天早上的快照（見 [2026-11-22 刷新報告](2026-11-22.md)）。
- 離線重建 `materialize:snapshots -- --check` 退出碼為 0，差異為 0。
- `prettier --check .` 與 `pnpm lint` 皆通過。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| frontier |    10 |    10 |    0 |
| profiles |   296 |   296 |    0 |
| evidence | 11231 | 11443 | +212 |
| costs    |  1102 |  1102 |    0 |
| presets  |    18 |    18 |    0 |

新增的 212 筆 evidence 就是 v2 的 128 + 84 列。

## Epoch 匯入

| 檔案                            | benchmark ID             | 列數 | 與 live `benchmarks.csv` |
| ------------------------------- | ------------------------ | ---: | ------------------------ |
| `frontiermath_tiers_1_3_v2.csv` | `frontiermath-v2`        |  128 | 128／128 相符            |
| `frontiermath_tier_4_v2.csv`    | `frontiermath-tier-4-v2` |   84 | 84／84 相符              |
| `frontiermath.csv`（v1，證據）  | `frontiermath`           |  101 | 101／101 相符            |
| `frontiermath_tier_4.csv`（v1） | `frontiermath-tier-4`    |   72 | 72／72 相符              |

- v2 的 CSV 欄位與 v1 完全相同，解析方式不變。
- Tier 4 v2 有 1 列為 EXCLUDED：這是 Pro 設定列（`pro` 寫在 base model 的檔位後綴），依既有規則不代表 base model。
- **未對應身分**：v2 有 58＋20 列沒有對到 canonical model。抽看最近的列（Claude Haiku 5.5、DeepSeek V4.1 Flash、Mistral Large 4 Preview、GLM-5.3 等），這些模型本來就不在模型目錄中，它們在其他 Epoch benchmark 的列也同樣沒有對上，不是這次造成的。依規則不做模糊比對。
- 前沿 10 個模型中，9 個在 v2 有與集合代表檔位相同的成績。第 6 名 GPT-6.2 Sol 在 Epoch 還沒有 v2 成績，所以 6 個模型以上的前沿集合（含預設 `aa-top-9`）沒有 v2。

## 程式與文件變更

- `packages/acquisition/src/epoch-materializer.ts`：`EPOCH_DIRECT_FILES` 新增兩份 v2 檔案，`benchmarkVersion` 分別為 `Tiers 1-3 v2` 與 `Tier 4 v2`。
- `packages/acquisition/src/refresh-epoch.ts`：validation report 新增「Epoch-run files not promoted」一節，每次匯入都會列出 Epoch 自己跑、但沒有核可 benchmark ID 的檔案。這次列出 8 份：`ebr_bench`、`frontiermath_erdos`、`furniture_assembly`、`mirrorcode`、`mystery_game_puzzles` 與三份 `spireclimb*`。原本這些檔案只會在每日查核中被一句「不在追蹤名單內」帶過。
- `data/mappings/benchmarks-v2.json` 登記兩個新 ID；`data/mappings/benchmark-quality-v2.json` 排除兩個 v1 ID，`evidencePath` 指向新的審核紀錄，並以 `previousEvidencePath` 串回 2026-11-21 的紀錄。
- 看板顯示名稱：v1 改為「FrontierMath (v1)」「FrontierMath Tier 4 (v1)」，v2 為「FrontierMath v2」「FrontierMath Tier 4 v2」。
- 單元測試只新增一個合成 fixture 案例：v1 與兩份 v2 檔案各自對到正確的 benchmark ID 與版本，且 candidate ID 不重複。
- 文件：[SPEC](../SPEC.md) 的 Epoch promote 表（也修正了原本把 Tier 4 寫成 `frontiermath（Tier 4）` 的錯誤）、[維度映射](../BENCHMARK_DIMENSION_MAPPING.md)。

### e2e 測試修正

第一次 release 在 e2e 失敗，`markdown-copy.spec.ts` 的桌面與手機版本各失敗 1 次。這個測試挑「第一個有兩個可比較檔位的模型」，固定一個檔位後比較另一個，再核對成本圖。v2 加入後，第一個符合條件的模型變成 Qwen3.6 27B，它沒有任何任務成本，成本圖是空的，所以斷言 `plotted.length > 0` 失敗。

這代表測試隱含綁定了當期資料。依測試原則改成不變量：`apps/bench/e2e/product-data.ts` 新增 `hasTaskCost`，`sharedEfforts` 可接受檔位篩選條件，測試只挑兩個檔位都有加權來源任務成本的模型。沒有修改任何預期數值。修正後第二次 release 的 e2e 144 項全部通過。

### 程式審查

Codex 額度用完，依委派規則改由 Claude 子代理（opus，high）唯讀審查。沒有發現正確性錯誤。審查者自行執行的 `epoch-materializer.test.ts`（7/7）、`taxonomy-v2.test.ts`（5/5）與 `pnpm lint` 都通過。

- **已採納**（低嚴重度）：未 promote 清單的過濾條件沒有排除舊版 ECI 檔名 `epoch_capabilities_index.csv`。如果 Epoch 回到舊版格式，ECI 會被誤列為未採用的 benchmark。已加入排除條件。
- 審查者指出這個過濾邏輯寫在 `main()` 內、沒有單元測試；只影響報告文字，不影響資料，所以沒有另外補測試。

## 集合與逐模型影響

| 集合         | 共同測試 | 新增測試      | 名次變動 | 總分增減    |
| ------------ | -------: | ------------- | -------- | ----------- |
| `aa-top-2`   |  26 → 28 | v2、Tier 4 v2 | 無       | +0.53～0.55 |
| `aa-top-3`   |  13 → 15 | 同上          | 無       | +0.78～0.99 |
| `aa-top-4`   |  13 → 15 | 同上          | 無       | +0.64～0.99 |
| `aa-top-5`   |  13 → 15 | 同上          | 無       | +0.64～1.19 |
| `coverage-2` |  49 → 51 | 同上          | 無       | +0.23～0.52 |
| `coverage-3` |  47 → 49 | 同上          | 無       | +0.24～0.63 |
| `coverage-4` |  45 → 47 | 同上          | 無       | +0.23～0.63 |
| `coverage-5` |  35 → 37 | 同上          | 無       | +0.26～0.69 |
| `coverage-6` |  33 → 35 | 同上          | 無       | +0.25～0.69 |
| 其他 9 個    |     不變 | —             | 無       | 0           |

所有集合都沒有模型進出。分數上升，是因為前沿模型在 v2 的成績普遍很高（例如 Fable 5.2 max：Tiers 1–3 為 95.09，Tier 4 為 100），使 Reasoning 維度平均上升。逐模型數值見 release 的 change report（本機 `artifacts/releases/2026-11-22T05-12-12-105Z/report.md`）。

### 主畫面（預設集合 `aa-top-9`）的進出

無。預設集合的 9 項共同測試、9 個模型與分數都不變。

## 依證據自行決定的事項

- **v1 改為不計分**：AGENTS.md 規定「benchmark 改版時跟隨新版」由代理依證據決定。證據是 Epoch `benchmark_metadata.csv` 的 `superseded_by` 欄位，以及 v2 頁面 Changelog：「We released v2, which corrected 123 problems in Tiers 1-3 and 12 problems in Tier 4. We also removed 5 problems from Tiers 1-3 and 7 problems from Tier 4.」
- **v2 使用新的 benchmark ID**：依 SPEC「需要分開計分的版本必須給它自己的 benchmark ID」，比照 Terminal-Bench 4.1 取代 4.0 的做法。

## 已知未解

- v2 有 78 列沒有對到身分（見上），需要官方證據才能登記。
- GPT-6.2 Sol 補上 v2 成績之前，預設集合不會有 FrontierMath。
- Epoch 另有 8 份自己跑、未採用的 benchmark 檔案（EBR-bench 等），是否評估採用由使用者決定。

## 檔位推測揭露表（強制）

以同一腳本重算，共 1052 筆（跨來源 738、預設 314）。與今天早上的 [2026-11-22 推測表](2026-11-22-daily-effort-inferences.md) 相比新增 12 筆、移除 0 筆，全部來自 FrontierMath v2。明細見 [FrontierMath v2 推測表](2026-11-22-frontiermath-v2-effort-inferences.md)：

- **跨來源推測 7 筆**：Claude Opus 4.5 → max（依據 Riemann-bench）、Gemini 3.1 Pro Preview → high（DeepSWE）、Kimi K2.7 Code → max（Chartography）、GLM-5.1 → max（AutomationBench），各在 v2 與 Tier 4 v2 出現（GLM-5.1 只有 v2）。
- **default 5 筆**：Qwen3.7 Max、Kimi K2.6、Qwen3.6 27B 沒有任何來源標示檔位。

這 7 個模型都不在任何集合中，所以推測不影響集合分數。

## 獨立抽查

由未參與匯入的 agy（gemini-4-neon-medium）在 2026-11-22 13:10–13:12（+08:00）以 curl 下載 Epoch 官方資料逐筆比對。樣本由腳本產生：兩個 v2 benchmark 各取分數最高的 3 列，加上種子隨機 3 列，另外 v1 兩個 benchmark 各取 1 列。

| 網址                                   | 頁面位置／模型字串                                                  | 欄位         | 期望值  | 觀察值  | 結果 |
| -------------------------------------- | ------------------------------------------------------------------- | ------------ | ------- | ------- | ---- |
| <https://epoch.ai/data/benchmarks.csv> | `FrontierMath-Tiers-1-3-v2-Private`／`claude-fable-5-2_max`         | `mean_score` | 0.95088 | 0.95088 | 相符 |
| 同上                                   | 同上／`gpt-6.1-sol_max`                                             | `mean_score` | 0.93684 | 0.93684 | 相符 |
| 同上                                   | 同上／`gpt-6-astra_max`                                             | `mean_score` | 0.93684 | 0.93684 | 相符 |
| 同上                                   | 同上／`gpt-5.4-nano-2026-03-17_low`                                 | `mean_score` | 0.20351 | 0.20351 | 相符 |
| 同上                                   | 同上／`claude-opus-4-7_max`                                         | `mean_score` | 0.70175 | 0.70175 | 相符 |
| 同上                                   | `FrontierMath-Tier-4-v2-Private`／`claude-fable-5-2_max`            | `mean_score` | 1       | 1.0     | 相符 |
| 同上                                   | 同上／`gpt-6.2-astra_max`                                           | `mean_score` | 1       | 1.0     | 相符 |
| 同上                                   | 同上／`gpt-6.1-sol_max`                                             | `mean_score` | 1       | 1.0     | 相符 |
| 同上                                   | 同上／`gpt-5.2-2025-12-11_xhigh`                                    | `mean_score` | 0.317   | 0.317   | 相符 |
| 同上                                   | `FrontierMath-2025-02-28-Private`／`gpt-5.4-pro-2026-03-05_xhigh`   | `mean_score` | 0.5     | 0.5     | 相符 |
| 同上                                   | `FrontierMath-Tier-4-2025-07-01-Private`／`gpt-5.2-2025-12-11_high` | `mean_score` | 0.188   | 0.188   | 相符 |

- **分數**：11/11 完全相符（差值為 0）。`benchmarks.csv` SHA-256：`51b1b577e482943661b7237dc7cebec2e9f95b5f0815579229dc386826c6e03e`。
- **版本取代**：抽查代理另外下載兩個 v2 頁面，About 寫明「On 2026-06-12, we released a major update, addressing errors in 42% of problems」，Changelog 寫明 v2 修正與移除的題數並連回 v1。主代理以原始檔再次核對了引文與其中兩筆分數。

抽查樣本、逐列結果與原始檔：`artifacts/research/2026-11-22-frontiermath-v2/spot-check/`。

## 重大變更判斷

**沒有需要停下來審核的重大變更**，依據如下：

1. **改用 v2 是使用者的指示**，而且屬於 AGENTS.md 允許代理依證據決定的「benchmark 改版時跟隨新版」。
2. **預設集合沒有任何變化**：模型、共同測試與分數都不變。
3. **非預設集合沒有名次變動**：只有總分上升 0.23–1.19 分，原因是加入兩項前沿模型普遍高分的 benchmark。
4. **沒有無法解釋的變化**：每個分數變動都來自新增的 v2；v2 沒進入 6 個模型以上集合的原因已查明；推測新增的 12 筆都不在集合中；離線重建零差異。

因此依流程提交、開 PR，CI 通過後合併。
