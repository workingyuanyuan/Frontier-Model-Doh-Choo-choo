# 2026-11-22 資料刷新報告：採用 Epoch 的 Mystery Game Puzzles 與 Furniture Assembly

完整 release 通過，**沒有需要停下來審核的重大變更**（依據見文末）。

FrontierMath 改用 v2 之後，Epoch 的 validation report 開始列出 8 份 Epoch 自己跑、但沒有採用的檔案。代理評估這 8 份並模擬採用後的影響（[評估](../analysis/2026-11-22-epoch-unpromoted-benchmarks.md)），推薦其中兩項。使用者 2026-11-22 指示「採用建議的兩項」：

- **`mystery-game-puzzles`**：主維度 Reasoning，沒有次要維度。來源檔 `mystery_game_puzzles.csv`。
- **`furniture-assembly`**：主維度 Comprehension，次要維度 Reasoning。來源檔 `furniture_assembly.csv`。

其餘 6 份（EBR-bench、MirrorCode、SpireClimb 與兩個子分數、FrontierMath Erdős）維持不採用，繼續列在 validation report。

預設集合 `aa-top-9` 完全沒有變化。兩項新測試進入 2–5 個模型的前沿集合與 2–7 個模型的覆蓋集合；`coverage-7` 換了一個模型（見下）。

## 版本與來源基準

- 起始 commit：`51f31ca645eca842a59d89b37e5f8ecf03b5ad6c`（main），於分支 `data/epoch-furniture-mystery` 進行。
- 舊版本：`sha256:232c437eea8e6b05c9b01cb91d755963d09a052b43b7710a03cf03ee7d2f06f0`
- 新版本：`sha256:ff4f9c578973b6d036387a3be72a54ecbf05f34b877d2103a92d6190398344c2`
- Release `2026-11-22T06-18-12-688Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-22-epoch-furniture-mystery-receipt.json)
- 第一次 release `2026-11-22T06-13-19-615Z` 也通過。之後依程式審查修正一段來源說明文字（見「程式審查」），重新匯入 Epoch 再跑一次。兩次的 change report 除了快照 ID 外完全相同。
- 只重新匯入 Epoch（`materialize:epoch`，2026-11-22T06:18:03Z）。ZIP 內容與今天稍早相同：ECI 258 列不變，候選資料只多了兩項新測試的 191 列。其他來源維持今天早上的快照（見 [2026-11-22 刷新報告](2026-11-22.md)）。
- 離線重建 `check:replay` 退出碼為 0，所有來源的候選資料零差異。
- `prettier --check .` 與 `pnpm lint` 皆通過。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| frontier |    10 |    10 |    0 |
| profiles |   296 |   299 |   +3 |
| evidence | 11443 | 11634 | +191 |
| costs    |  1102 |  1102 |    0 |
| presets  |    18 |    18 |    0 |

- 新增的 191 筆 evidence 是兩項新測試的 149＋42 列。
- 新增 3 個 profile：`google-gemini-3-1-pro-preview-low`、`google-gemini-3-1-pro-preview-medium`、`zai-glm-5-2-medium`。這些檔位原本沒有成績，現在在 Mystery Game Puzzles 有成績（Gemini 3.1 Pro Preview 的 low／medium、GLM-5.2 的 medium）。三者都不在前沿窗口內。

## Epoch 匯入

| 檔案                       | benchmark ID           | 列數 | 未對應身分 | 與 live `benchmarks.csv` |
| -------------------------- | ---------------------- | ---: | ---------: | ------------------------ |
| `mystery_game_puzzles.csv` | `mystery-game-puzzles` |  149 |         55 | 149／149 相符            |
| `furniture_assembly.csv`   | `furniture-assembly`   |   42 |          4 | 42／42 相符              |

- 兩份 CSV 的欄位與已採用的 Epoch 檔案相同（`mean_score` 為 0–1，乘以 100 成為百分比），解析方式不變。
- 兩項的所有列都是 INCLUDED，沒有 Pro 設定列。
- **未對應身分**：共 59 列。抽看的模型（Claude Haiku 5.5、DeepSeek V4.1 Flash、Mistral Large 4、GLM-5.3 等）本來就不在模型目錄中，它們在其他 Epoch benchmark 也同樣沒有對上。依規則不做模糊比對。
- 前沿 10 個模型中，9 個在兩項都有與集合代表檔位相同的成績。第 6 名 GPT-6.2 Sol 在 Epoch 兩項都沒有成績，所以 6 個模型以上的前沿集合（含預設 `aa-top-9`）不會納入。
- 來源角色為 ORGANIZER，比照同樣由 Epoch 設計的 FrontierMath。目前沒有其他來源發布這兩項，所以角色不影響選值。

## 程式與文件變更

- `packages/acquisition/src/epoch-materializer.ts`：`EPOCH_DIRECT_FILES` 新增兩份檔案，`liveTaskName` 分別為 `Mystery Game Puzzles` 與 `Furniture Assembly`。ORGANIZER 列的來源說明原本寫死為「FrontierMath is organizer evidence」，改為「Epoch-designed benchmark: organizer evidence」，FrontierMath 列也一併套用。
- `data/mappings/benchmarks-v2.json` 登記兩個新 ID 與維度。品質政策不需要改動。
- 看板顯示名稱新增「Mystery Game Puzzles」「Furniture Assembly」。
- 文件：[SPEC](../SPEC.md) 的 Epoch promote 表與說明、[維度映射](../BENCHMARK_DIMENSION_MAPPING.md#2026-11-22-approved-epoch-benchmark-additions)（新增核准紀錄與歸類理由）、[分數來源](../BENCHMARK_SCORE_SOURCES.md)（Epoch 的主辦方項目），以及 [評估](../analysis/2026-11-22-epoch-unpromoted-benchmarks.md)（補上使用者的決定）。
- 沒有新增或修改測試：這次只是在既有清單加入設定，沒有新的程式行為。

### 程式審查

Codex 額度用完，依委派規則改由 Claude 子代理（opus，high）唯讀審查。沒有發現正確性錯誤。審查者自行執行的 `@llm-bench/acquisition`（629 項）與 `@llm-bench/benchmark-data`（148 項）單元測試都通過，並確認兩個 `liveTaskName` 與 live `benchmarks.csv` 一致、candidate ID 不重複、沒有其他需要登記新 ID 的清單。

採納兩項低嚴重度意見：

- ORGANIZER 來源說明寫死為 FrontierMath，新測試的 191 列都會帶著錯誤說明。已改為中性文字，因此重跑匯入與 release。
- `BENCHMARK_SCORE_SOURCES.md` 仍寫 Epoch 只有 FrontierMath 是主辦方。已更新。

## 集合與逐模型影響

結果與採用前的模擬完全一致。

| 集合                       | 共同測試 | 新增測試 | 模型進出                               | 名次變動                                | 總分增減    |
| -------------------------- | -------: | -------- | -------------------------------------- | --------------------------------------- | ----------- |
| `aa-top-2`                 |  28 → 30 | 兩項     | 無                                     | 無                                      | +1.51～1.53 |
| `aa-top-3`～`aa-top-5`     |  15 → 17 | 兩項     | 無                                     | 無                                      | +2.10～3.73 |
| `coverage-2`～`coverage-5` |       +2 | 兩項     | 無                                     | 無                                      | +0.10～0.70 |
| `coverage-6`               |  35 → 37 | 兩項     | 無                                     | GPT-6 Astra 3 名、Opus 5.5 4 名（對調） | +0.59～1.61 |
| `coverage-7`               |  29 → 31 | 見下     | 進：Gemini 4 Hydrogen；出：GPT-6.2 Sol | GPT-6 Astra 3 名、Opus 5.5 4 名（對調） | +0.59～4.26 |
| 其他 8 個（含預設）        |     不變 | —        | 無                                     | 無                                      | 0           |

**`coverage-7` 的變化**：覆蓋集合依規則在前十名中挑出共同測試最多的 7 個模型。GPT-6.2 Sol 沒有任何 Epoch 成績，Gemini 4 Hydrogen 則有，加入兩項新測試後，換成 Hydrogen 的組合共同測試較多（31 項），因此改選這組。共同測試同時改變：

- 新增 `chess-puzzles`、`frontiermath-v2`、`frontiermath-tier-4-v2`、`gpqa-diamond`、`simpleqa-verified`（Epoch 既有的測試）以及兩項新測試。
- 移除 `automationbench`、`enterprisebench-corecraft`、`riemann-bench`、`swe-atlas`、`terminal-bench-4-1`（Hydrogen 沒有這些成績）。

逐模型數值見 release 的 change report（本機 `artifacts/releases/2026-11-22T06-18-12-688Z/report.md`）。

### 主畫面（預設集合 `aa-top-9`）的進出

無。預設集合的 9 項共同測試、9 個模型與分數都不變。

## 已知未解

- 兩項新測試共有 59 列沒有對到身分（見上），需要官方證據才能登記。
- GPT-6.2 Sol 補上 Epoch 成績之前，6 個模型以上的前沿集合不會有這兩項。
- EBR-bench 在 2026-09-22 改過規則，Epoch 資料沒有版本欄，等 Epoch 重跑或標出版本再評估。MirrorCode 與 SpireClimb 等前沿覆蓋提高、分數穩定後再評估（見[評估](../analysis/2026-11-22-epoch-unpromoted-benchmarks.md)）。

## 檔位推測揭露表（強制）

以同一腳本重算，共 1065 筆（跨來源 747、default 318）。與 [FrontierMath v2 推測表](2026-11-22-frontiermath-v2-effort-inferences.md) 相比新增 13 筆、移除 0 筆，全部來自這兩項新測試。明細見 [本次推測表](2026-11-22-epoch-furniture-mystery-effort-inferences.md)：

- **跨來源推測 9 筆**：都推為 max。Claude Opus 4.5（兩項各一筆）、Opus 4.6、Opus 4.7、Opus 5、Sonnet 4.6、Sonnet 5、MiniMax M3、Nemotron 3 Ultra。
- **default 4 筆**：Kimi K2.6（兩項各一筆）、Qwen3.7 Max、Qwen3.7 Plus 沒有任何來源標示檔位。

這 11 個模型都不在任何集合中，所以推測不影響集合分數。

## 獨立抽查

由未參與匯入的 agy（gemini-4-neon-medium）在 2026-11-22 14:14–14:15（+08:00）以 curl 下載 Epoch 官方資料逐筆比對。樣本由腳本產生：兩項各取分數最高的 3 列、種子隨機 2 列，以及 1 列未對應身分的列。

| 網址                                   | 頁面位置／模型字串                            | 欄位         | 期望值  | 觀察值  | 結果 |
| -------------------------------------- | --------------------------------------------- | ------------ | ------- | ------- | ---- |
| <https://epoch.ai/data/benchmarks.csv> | `Furniture Assembly`／`claude-fable-5-2_max`  | `mean_score` | 0.9     | 0.9     | 相符 |
| 同上                                   | 同上／`gemini-4-neon_xhigh`                   | `mean_score` | 0.89167 | 0.89167 | 相符 |
| 同上                                   | 同上／`gpt-6.2-astra_max`                     | `mean_score` | 0.89167 | 0.89167 | 相符 |
| 同上                                   | 同上／`kimi-k2.6`                             | `mean_score` | 0.21667 | 0.21667 | 相符 |
| 同上                                   | 同上／`gpt-6-luna_max`                        | `mean_score` | 0.44167 | 0.44167 | 相符 |
| 同上                                   | 同上／`claude-haiku-5-5_max`（未對應身分）    | `mean_score` | 0.475   | 0.475   | 相符 |
| 同上                                   | `Mystery Game Puzzles`／`gpt-6.2-astra_max`   | `mean_score` | 0.95    | 0.95    | 相符 |
| 同上                                   | 同上／`claude-fable-5-2_max`                  | `mean_score` | 0.9     | 0.9     | 相符 |
| 同上                                   | 同上／`gemini-4-neon_xhigh`                   | `mean_score` | 0.85    | 0.85    | 相符 |
| 同上                                   | 同上／`qwen3.6-27b_none`                      | `mean_score` | 0.07    | 0.07    | 相符 |
| 同上                                   | 同上／`gpt-5.4-mini-2026-03-17_none`          | `mean_score` | 0.11    | 0.11    | 相符 |
| 同上                                   | 同上／`deepseek-v4.1-flash_max`（未對應身分） | `mean_score` | 0.43    | 0.43    | 相符 |

- **分數**：12/12 完全相符（差值為 0），每筆都恰好對到一列。`benchmarks.csv` SHA-256：`59c809f943d573f0462d354fde09b1e9a84c247d11dd8334b336b5273fe224f5`。
- **方法頁面**：Furniture Assembly 頁面寫明「60 photos in total」與「The reported score is accuracy across the 60 photos」；Mystery Game Puzzles 頁面寫明「100 positions from a puzzle-oriented variant of a well-known game」，逐題比對答案。
- **主代理複核**：以抽查代理下載的同一份 CSV 重算 12 筆，並比對全部列：兩項的模型集合與分數（149＋42 列）都與我們的候選資料完全一致。

抽查樣本、逐列結果與原始檔：`artifacts/research/2026-11-22-epoch-furniture-mystery/spot-check/`。

## 重大變更判斷

**沒有需要停下來審核的重大變更**，依據如下：

1. **採用這兩項是使用者的決定**。使用者在看過模擬結果（包括 `coverage-7` 換模型與測試組成改變）後指示採用，實際 release 結果與模擬完全一致。
2. **預設集合沒有任何變化**：模型、共同測試與分數都不變。
3. **前沿集合沒有名次變動**：`aa-top-2`～`aa-top-5` 只有總分上升。
4. **覆蓋集合的變動都可解釋**：`coverage-6` 的對調來自兩項新測試的分數：GPT-6 Astra 在 Mystery Game Puzzles 領先 Opus 5.5 13 分（84 對 71），在 Furniture Assembly 落後 3.3 分（80 對 83.3），兩者總分同為 66.92（四捨五入後）；`coverage-7` 換模型是覆蓋集合「共同測試最多」規則的直接結果。依 AGENTS.md，預設集合以外的重排直接套用並告知使用者。
5. **沒有無法解釋的變化**：每個分數變動都來自兩項新測試；推測新增的 13 筆都不在集合中；離線重建零差異。

因此依流程提交、開 PR，CI 通過後合併。
