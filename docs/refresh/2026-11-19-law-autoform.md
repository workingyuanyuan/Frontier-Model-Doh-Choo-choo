# 2026-11-19 資料刷新報告：收錄 DAYJOB: Law 與 Vals Autoform-Hard

完整 release 通過，**沒有重大變更**。兩個 benchmark 都依使用者 2026-11-19 的指示收錄，它們是上午[每日查核](../research/2026-11-19-benchmark-update-check.md)列出的新 benchmark 線索：

- **Surge DAYJOB: Law（`dayjob-law`）**：新增主辦方來源 `surge-dayjob-law`，口徑與 DAYJOB: Tax 相同。
- **Vals Autoform-Hard（`autoform-hard`）**：加入 Vals 計分允許清單。

預設集合 `aa-top-9` 的模型、共同測試與分數完全不變。DAYJOB: Law 只進入 `aa-top-2` 的共同測試，兩個模型名次不變。Autoform-Hard 目前沒有進入任何集合的共同測試。判斷依據見「重大變更判斷」。

## 版本與來源基準

- 起始 commit：`f66c98f7277ec326e1d7f12e776be8fd6cc9b6d9`（main，已含上午的 Gemini 4 Neon 刷新），於分支 `data/2026-11-19-dayjob-law-autoform` 進行。
- 舊版本：`sha256:3f530338362539fa040bb4d7f16cfc2a3a9b72322209295eb534caf6c504f1b2`
- 新版本：`sha256:00ffc95828d0872e6c2b82d862f51bf5549887f54d706fc7ee889a966f3fd052`
- Release `2026-11-19T02-24-22-583Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-19-law-autoform-receipt.json)
- 前一次 release `2026-11-19T02-20-29-953Z` 在 `tests` 失敗：我在 Surge 目錄測試的 fixture 多加了一個 Law 連結，使寫死的目錄筆數由 12 變成 13。已移除該連結，只保留把 `surge-dayjob-law` 加進參數化清單；重跑即為本次 release。
- 離線重建 `materialize:snapshots -- --check` 包含 `surge-dayjob-law` 與 `vals-ai`，差異為 0。
- `pnpm typecheck` 與 `pnpm lint` 皆通過。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| frontier |    10 |    10 |    0 |
| profiles |   295 |   295 |    0 |
| evidence | 10924 | 10948 |  +24 |
| costs    |  1088 |  1088 |    0 |
| presets  |     9 |     9 |    0 |

## 新來源：Surge DAYJOB: Law

- **官方資料**：
  - [榜單](https://surgehq.ai/benchmarks/dayjob-law)
  - [公告](https://surgehq.ai/blog/dayjob-law)（2026-11-18）
  - [資料集卡](https://huggingface.co/datasets/surgeai/DAYJOB-law)
  - [DAYJOB README](https://github.com/surge-ai/dayjob)
- **內容**：71 項由執業律師撰寫的法律任務，涵蓋公司交易、訴訟、刑事辯護、勞動、智財、遺產等，共 2,638 個工作區檔案。公開資料集只有 2 題樣本，完整題組要向 Surge 申請。
- **計分**：通過率，即在 95% rubric 門檻下通過的嘗試比例，與 DAYJOB: Tax 相同（metric `pass-at-1`）。README 載明榜單每題 5 次嘗試，所以 `attempts` 記為 5。
- **維度**：Agentic 主維度，次要關聯 Reasoning 與 Knowledge，與其他三個 DAYJOB 領域一致。
- **未公開、保留 null 的欄位**：逐列 harness、工具、benchmark 版本、context 與榜單發布日期。
- **擷取**：沿用 Surge 百分比榜的共用 parser。Chromium 渲染後的畫面為 24 列，與 `--visual-row-count=24` 及解析結果一致。
- **列數**：24 列全部 INCLUDED，其中 21 列對應到模型。依「不模糊比對」原則，以下 3 列維持未對應：`GLM 5.3`、`Hy Hy4 Preview`、`Mistral Large 4`，這些模型都還沒有登記身分。

**前沿前 10 名的覆蓋**（10 個都有成績）：

| 模型              | effort | DAYJOB: Law |
| ----------------- | ------ | ----------: |
| GPT-6.2 Astra     | max    |        41.4 |
| GPT-6 Astra       | max    |        36.6 |
| GPT-6.2 Sol       | max    |        32.7 |
| GPT-6.1 Sol       | max    |        31.6 |
| Claude Sonnet 5.5 | max    |        26.8 |
| Claude Fable 5.2  | max    |        26.5 |
| Gemini 4 Neon     | high   |        26.2 |
| Claude Opus 5.5   | max    |        23.7 |
| Gemini 4 Carbon   | high   |        13.8 |
| Gemini 4 Hydrogen | xhigh  |         9.7 |

## Vals Autoform-Hard 加入計分

- **官方資料**：[Vals 榜單與方法](https://www.vals.ai/benchmarks/autoform_hard)，更新日期 2026-11-18。
- **內容**：以 Lean 4 形式化並證明研究所到研究等級的數學。題目取自 AutoformBench（Meta FAIR）100 題驗證集中，原研究十個前沿模型都沒解出的題目，去除 3 題重複後共 56 題。Vals 稽核後修正了其中 5 題。
- **執行條件**：所有模型使用同一個 agent harness，每題 1 次嘗試，上限為 3 小時與 200 美元。
- **評分**：提交必須通過 clean-room 重建與獨立 kernel 重放，才算解出。
- **來源角色 ORGANIZER**：題組、修正與評分規則都由 Vals 定義，也只有 Vals 發布這份榜單，和 ProofBench 的判定相同。
- **維度**：Reasoning 主維度，次要關聯 Coding。評分終點是數學上正確、經 kernel 驗證的證明，Lean 程式只是表達媒介，和 ProofBench 相同。
- **資料**：8 列在上午的 Vals 快照中已存在，原本因未核准而 EXCLUDED。本次以同一批證據離線重建，改為 INCLUDED，分數與證據都不變。
  - 7 列對應到模型。`MiniMax-M3.1-Flash`（0%）沒有登記身分，維持未對應。
  - Reflection `Beam 1.0` 頁面未標示 effort，維持 null。
- **`attempts` 欄位**：仍為 null。這是 Vals materializer 對所有 benchmark 一律採用的既有行為；方法頁寫明每題 1 次。本次不改動 Vals 的共用程式。

**現有列**：

| 模型               | effort | Autoform-Hard |
| ------------------ | ------ | ------------: |
| GPT-6.2 Astra      | max    |         87.50 |
| Claude Fable 5.2   | high   |         85.71 |
| GPT-6.2 Sol        | max    |         85.71 |
| Gemini 4 Carbon    | high   |         71.43 |
| Gemini 4 Hydrogen  | xhigh  |         64.29 |
| Gemini 4 Argon     | high   |         48.21 |
| Beam 1.0           | —      |          0.00 |
| MiniMax-M3.1-Flash | max    |          0.00 |

## 集合與逐模型影響

### 前沿前 10 名

不變（Fable 5.2、GPT-6.2 Astra、Gemini 4 Neon、Gemini 4 Carbon、Opus 5.5、GPT-6.2 Sol、GPT-6 Astra、GPT-6.1 Sol、Sonnet 5.5、Gemini 4 Hydrogen）。

### 各模型數的共同測試

| 模型數 | Preset          | 共同測試 | 變化              |
| -----: | --------------- | -------: | ----------------- |
|      2 | `aa-top-2`      |  23 → 24 | 加入 `dayjob-law` |
|    3–5 | `aa-top-3`～`5` |  10 → 10 | 不變              |
|    6–9 | `aa-top-6`～`9` |    9 → 9 | 不變（含預設）    |
|     10 | `aa-top-10`     |    8 → 8 | 不變              |

- **`aa-top-2`**：Fable 5.2 max 由 67.29 降為 66.75（−0.54），GPT-6.2 Astra max 由 63.54 降為 63.32（−0.22），名次不變。
- **DAYJOB: Law 沒有進入 `aa-top-3` 以上的原因**：集合中的 Gemini 4 Neon 以 xhigh profile 代表，Law 只有 Neon high 的成績。
- **Autoform-Hard 沒有進入任何集合的原因**：集合中的 Fable 5.2 以 max profile 代表，Autoform-Hard 只有 Fable high；其餘前沿模型也有多個沒有成績。
- 其他集合的模型、名次與分數完全不變。

### 主畫面（預設集合 `aa-top-9`）的進出

無。共同測試、模型與分數都不變。

## 來源變化

- 新增 `surge-dayjob-law` 快照（`surge-dayjob-law:2026-11-19T02:19:07.164Z`），並加入 `data/mappings/sources.json` 白名單。
- `vals-ai` 快照重建：`autoform_hard` 改為 APPROVED，INCLUDED 由 2136 列增為 2144 列。
  - `manifest.json` 的 loader URL 清單順序有變，這是離線重建與線上擷取的排序方式不同所致，內容相同。
- 程式與設定的登記點：
  - Surge 百分比榜規格表、`materialize:dayjob-law` 命令、來源目錄、來源監測、離線重建清單；
  - Vals 允許清單、`benchmarks-v2.json`；
  - 看板的 benchmark 名稱與來源標籤。
- 文件同步：`SPEC.md` 來源表與說明、`BENCHMARK_DIMENSION_MAPPING.md` 維度對照、`OPERATIONS.md` 命令清單。
- 來源監測：DAYJOB: Law 的目錄項目由 `unintegrated` 改為 `scored`。各來源的 `checkedAt` 因 Law 匯入時的全來源監測而更新，快照內容沒有變化。

### 依證據自行決定的事項

- **DAYJOB: Law 的 `attempts` 記為 5**：公告沒有寫明次數，依 DAYJOB README「leaderboard runs use 5 attempts per task」，與 Tax 的判定相同。
- **Autoform-Hard 的來源角色記為 ORGANIZER**：題目雖來自 Meta FAIR 的 AutoformBench，但 56 題的選題、修正、harness 與評分都由 Vals 定義，沒有其他機構發布同一份榜單。

### 程式審查

Codex（gpt-6.2-sol，唯讀）審查了這次的程式與文件差異：

- **P1：產品與集合尚未重建**：審查時 release 還沒重跑，本次 release 已重建並通過 `fresh`。
- **P3：Autoform-Hard 文件漏了「去除 3 題重複」**：已補上。
- **P3：Tax 段落說 95% 門檻「不同於姊妹領域」，與 Law 相互矛盾**：已改為「不同於 Finance 與 Healthcare」。
- **P3：Autoform-Hard 的 `attempts` 為 null**：未改，理由見上。

## 已知未解

- 未對應的列：
  - DAYJOB: Law 的 `GLM 5.3`、`Hy Hy4 Preview`、`Mistral Large 4`；
  - Autoform-Hard 的 `MiniMax-M3.1-Flash`。
  - 這些模型都需要官方證據才能登記身分。
- Autoform-Hard 的 Reflection `Beam 1.0` 沒有 effort 標示，維持 null。

## 檔位推測揭露表（強制）

本次沒有新增或移除推測列。依同一腳本重算，全部來源仍是 935 列（跨來源 567、預設 368），與 [2026-11-19 推測表](2026-11-19-effort-inferences.md) 相比增減皆為 0。

- DAYJOB: Law 的 24 列都有來源標示的 effort。
- Autoform-Hard 有標示的 7 列直接採用；Beam 1.0 未標示，也沒有產生推測列。

進入預設集合的推測仍只有一筆，與上午相同：Sonnet 5.5 的 AutomationBench，以 Anthropic 發布頁的 max 為依據。

## 獨立抽查

由未參與匯入的 agy（gemini-4-hydrogen-high）在 2026-11-19 10:21–10:25（+08:00）直接開啟兩個官方榜，逐列比對兩個 benchmark 的全部 32 列。

| 來源          | 網址                                           | 頁面位置／欄位                                     | 結果       |
| ------------- | ---------------------------------------------- | -------------------------------------------------- | ---------- |
| DAYJOB: Law   | <https://surgehq.ai/benchmarks/dayjob-law>     | 「DAYJOB: Law Leaderboard」主榜，分數欄（%）       | 24/24 相符 |
| Autoform-Hard | <https://www.vals.ai/benchmarks/autoform_hard> | 「Autoform-Hard leaderboard」Accuracy 欄與設定彈窗 | 8/8 相符   |

- **分數**：32/32 相符。Surge 比對到小數 1 位；Vals 表格比對到小數 2 位，頁面載入的 JSON 比對到小數 3 位。
- **effort**：31/32 相符，另 1 筆是頁面未標示。
  - Surge 的 effort 來自列名的 `(Max reasoning)`、`(Adaptive/Max)` 等標籤。
  - Vals 的 effort 來自每列設定彈窗的 `Reasoning effort` 或 `Thinking Type: Adaptive, Effort`。
  - 未標示的是 Beam 1.0：彈窗只列 temperature、top P 與 max tokens，與我們存的 null 一致。
- **模型身分**：28 列對應全部正確；4 列未對應的列都確實出現在官方榜上。
- 榜單總列數：Law 24 列、Autoform-Hard 8 列，與快照一致。

抽查樣本、逐列結果與報告：`artifacts/research/2026-11-19-benchmark-check/spot-check-law-autoform/`。

## 重大變更判斷

**沒有重大變更**，依據如下：

1. **收錄是使用者的決定**：新 benchmark 的採用屬使用者決定事項，使用者已於 2026-11-19 明確指示收錄兩者。
2. **預設集合 `aa-top-9` 完全不變**：模型、共同測試與分數都沒有變動，主畫面沒有模型進出。
3. **其他集合只有 `aa-top-2` 受影響**：加入一項測試，兩個模型的 Overall 下降不到 0.6 分，名次不變。
4. **沒有無法解釋的變化**：抽查全部相符，離線重建零差異。

因此依流程直接提交、開 PR，CI 通過後合併。
