# Epoch 未採用 benchmark 評估（2026-11-22）

Epoch 的 ZIP 內有 8 個 Epoch 自跑、但沒有 benchmark ID 的檔案。本文評估是否採用。採用新 benchmark 由使用者決定（AGENTS.md），本文是採用前的證據與建議；評估當時沒有改動任何 mapping 或產品資料。

- 原始資料：`artifacts/sha256/8f/8fe0ea47…c7991.zip`（2026-11-22 匯入的同一份 ZIP）。
- 身分解析：沿用 `epoch-materializer.ts` 的 `resolveEpochProfile`，與已採用的 Epoch benchmark 相同。
- 方法說明：Epoch 各 benchmark 頁面（`https://epoch.ai/benchmarks/<slug>`，2026-11-22 讀取）。
- 影響模擬：在暫時分支加入設定，重跑 `materialize:snapshots`、`generate-frontier-set` 與 `build-current`，比較產品後還原。模擬沒有提交，也不是 release。

## 決定

使用者 2026-11-22 指示「採用建議的兩項」：採用 `mystery-game-puzzles`（推理）與 `furniture-assembly`（理解，次要推理）。其餘六個檔案維持不採用，繼續列在 Epoch validation report。實作與 release 見 `docs/refresh/2026-11-22-epoch-furniture-mystery.md`。

## 總表

前沿窗口指 `aa-top-10` 的十個模型。分數為各模型的最佳合格列（百分比）。

| 檔案                        | 測什麼                                                      | 窗口覆蓋 | 窗口內分數 | 建議               |
| --------------------------- | ----------------------------------------------------------- | -------- | ---------- | ------------------ |
| `furniture_assembly`        | 看 IKEA 組裝照片與說明書，判斷哪一步裝錯（視覺＋工具）      | 9/10     | 57.5–90.0  | **採用**，理解     |
| `mystery_game_puzzles`      | 不公開的遊戲變體中找最佳下一步（純文字，仿 Chess Puzzles）  | 9/10     | 65–95      | **採用**，推理     |
| `ebr_bench`                 | 重複遊玩桌遊 Earthborne Rangers，看能否邊做邊學（代理）     | 8/10     | 54.3–98.1  | 暫緩：版本混雜     |
| `mirrorcode`                | 只靠黑箱執行重寫整個 CLI 程式（長程程式代理，與 METR 合作） | 5/10     | 60.0–97.8  | 暫緩：覆蓋太低     |
| `spireclimb`                | 以截圖操作玩 Slay the Spire 1／2 最高難度（電腦操作代理）   | 7/10     | 1.3–41.3   | 暫緩：太新         |
| `frontiermath_erdos`        | 以 Lean 4 證明 68 個未解 Erdős 問題                         | 6/10     | 2.9–10.3   | 不採用：鑑別度不足 |
| `spireclimb_sts1_a20_heart` | SpireClimb 的 StS1 子分數                                   | 7/10     | 0–33.3     | 不採用：子分數     |
| `spireclimb_sts2_a10`       | SpireClimb 的 StS2 子分數                                   | 7/10     | 2.7–49.3   | 不採用：子分數     |

窗口內**沒有任何一項**有 GPT-6.2 Sol 的成績。GPT-6.2 Sol 在 AA 排第 6，所以不論採用哪幾項，`aa-top-6` 到 `aa-top-10`（含預設 `aa-top-9`）都不會改變。

## 逐項依據

### 建議採用

**Furniture Assembly → comprehension（次要 reasoning）**

- 依據：題目是解讀照片與說明書，符合「解讀輸入材料」；comprehension 目前只有 9 項 benchmark，是最少的維度之一。
- 鑑別度：窗口內 57.5–90.0，標準誤 ±3.9–6.3，名次大致可分。
- 方法穩定：60 張照片、最高 effort、80 步上限，少於 5% 碰到上限；有人類基準（平均 63%）。
- 風險：裝錯描述由 LLM（GPT-5.6 Sol）評分；不支援圖片的模型沒有成績（缺值保持 null）。

**Mystery Game Puzzles → reasoning**

- 依據：與已採用的 Chess Puzzles 同類型，是 Epoch 依其設計的新題庫；100 題，程式產生。
- 鑑別度：窗口內 65–95，標準誤 ±3.0–4.8。
- 風險：遊戲、提示與紀錄不公開，無法自行檢查題目；reasoning 已有 27 項，邊際效益比 Furniture 小。

### 建議暫緩

**EBR-bench**：鑑別度好（54.3–98.1），但 Epoch 在 2026-09-22 的 v4 禁用一張卡，並說明之前的成績不能直接比較。ZIP 沒有版本欄，窗口內 GPT-6 Astra（08-30）與 Claude Opus 5.5（09-22）可能是舊版成績，與其他模型（11 月）混在一起。等 Epoch 重跑或標出版本再評估；若要先採用，需要另訂「只採 2026-09-22 之後執行的列」的規則。

**MirrorCode**：題目品質高，但窗口只覆蓋 5/10（缺 Claude Fable 5.2、Gemini 4 Neon、Gemini 4 Carbon、GPT-6.2 Sol、Gemini 4 Hydrogen），GPT-6 Astra 的標準誤達 ±11.8，Epoch 也說無法排除記憶的影響。只會進入測試覆蓋集合，前沿集合用不到。

**SpireClimb**：2026-11-04 才開始執行，11-05 修正 StS1 計分後 GPT-6 Astra 由 16.7% 改為 33.3%，Epoch 自己說「可能異常快地飽和」。窗口缺兩個 Gemini 主力模型。累積幾次刷新、確認分數穩定後再評估。

### 建議不採用

**FrontierMath Erdős**：68 題中多數模型只解出 0–2 題，窗口內 4 個模型同為 2.9（2/68），標準誤 ±2.1，無法區分名次。與 ProofBench（2026-10-03 因分數集中在頂端而排除）相反，是集中在底部，同樣缺乏鑑別度。保留在原始資料即可。

**SpireClimb 兩個子分數**：Epoch 的 SpireClimb 總分就是兩者的平均。若和總分一起採用會重複計分，單獨採用子分數則沒有理由。

## 採用後的影響（模擬）

### 只採用 Furniture Assembly 與 Mystery Game Puzzles

| 集合                              | 測試數  | 變化                                                                                                                                                   |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `aa-top-2`                        | 28 → 30 | 名次不變，總分 +1.5                                                                                                                                    |
| `aa-top-3`～`aa-top-5`            | 15 → 17 | 名次不變，總分 +2.1～+3.7                                                                                                                              |
| `aa-top-6`～`aa-top-10`（含預設） | 不變    | 無                                                                                                                                                     |
| `coverage-2`～`coverage-5`        | +2      | 名次不變，總分 +0.1～+0.7                                                                                                                              |
| `coverage-6`                      | 35 → 37 | GPT-6 Astra 與 Claude Opus 5.5 對調（第 3／4 名）                                                                                                      |
| `coverage-7`                      | 29 → 31 | **換模型**：GPT-6.2 Sol 換成 Gemini 4 Hydrogen；改用 Epoch 的 7 項測試，捨棄 AutomationBench、Terminal-Bench 4.1 等 5 項；GPT-6 Astra 與 Opus 5.5 對調 |
| `coverage-8`～`coverage-10`       | 不變    | 無                                                                                                                                                     |

`coverage-7` 換模型與捨棄 5 項測試屬於明顯重排。依 AGENTS.md，預設集合以外的重排可以直接套用並告知使用者，但新 benchmark 本身仍需使用者先決定。

### 參考：6 項全部採用（不含 SpireClimb 子分數）

`aa-top-2` 多 4 項、`aa-top-3`～`aa-top-5` 多 3 項（EBR、Furniture、Mystery），名次都不變。`coverage-2`、`coverage-3`、`coverage-5` 與 `coverage-7` 會換模型，`coverage-5` 的第 1 名由 Gemini 4 Carbon 變成 GPT-6.2 Astra。預設集合仍不變。

## 若採用需要的改動

1. `packages/acquisition/src/epoch-materializer.ts`：在 `EPOCH_DIRECT_FILES` 加入檔案與 benchmark ID（並補 `liveTaskName` 以便與 live `benchmarks.csv` 核對）。
2. `data/mappings/benchmarks-v2.json`：加入主要／次要維度。
3. `apps/bench/components/model-detail-panel.tsx`：顯示名稱。
4. `docs/SPEC.md`（Epoch promote 表）與 `docs/BENCHMARK_DIMENSION_MAPPING.md`：歸類理由。
5. 跑完整 `pnpm data:release`，由另一個代理抽查，再依重排情況決定是否需要審核。
