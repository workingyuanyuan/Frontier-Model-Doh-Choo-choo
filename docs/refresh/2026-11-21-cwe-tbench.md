# 2026-11-21 資料刷新報告：收錄 CWE-bench v2 與 Terminal-Bench 4.1

完整 release 通過，**沒有需要停下來審核的重大變更**。兩個 benchmark 都是 Gemini 4 Neon 公告圖表裡的項目，經逐項查證後由代理推薦，使用者 2026-11-21 指示「照你的推薦收錄」：

- **CWE-bench v2（`cwe-bench-v2`）**：新增主辦方來源 `cwe-bench`（Collinear AI）。
- **Terminal-Bench 4.1（`terminal-bench-4-1`）**：新增主辦方來源 `terminal-bench`（tbench.ai）。4.1 是 4.0 的改版，依「benchmark 改版時跟隨新版」規則取代 `terminal-bench-4-0`；AA 與 Vals 的 4.0 列保留為證據、不再計分。

預設集合 `aa-top-9` 的 9 項共同測試中，`terminal-bench-4-0` 換成 `terminal-bench-4-1`，模型不變。Gemini 4 Carbon 與 Claude Opus 5.5 原本只差 0.01 分，這次互換第 4、5 名。CWE-bench v2 目前沒有進入任何集合的共同測試。判斷依據見「重大變更判斷」。

## 版本與來源基準

- 起始 commit：`8b9779d4d87a7aedd46278ff8117ccde53fafd2f`（main），於分支 `data/2026-11-21-cwe-tbench` 進行。
- 舊版本：`sha256:00ffc95828d0872e6c2b82d862f51bf5549887f54d706fc7ee889a966f3fd052`
- 新版本：`sha256:0d063bf6f5bd0763ab8fde45765dc96f5680b6eb4c963613c482f0c6bc46da35`
- Release `2026-11-21T02-16-41-619Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-21-cwe-tbench-receipt.json)
- 第一次 release `2026-11-21T02-07-30-386Z` 也是 `complete`。之後依程式審查補強 parser 的驗證，所以重跑離線重建與 release；兩次產品只有 `generatedAt` 不同，內容完全相同。
- 離線重建 `materialize:snapshots -- --check` 包含兩個新來源，差異為 0。
- `prettier --check .` 與 `pnpm lint` 皆通過；新 parser 的 11 個單元測試只用合成 fixture。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| frontier |    10 |    10 |    0 |
| profiles |   295 |   296 |   +1 |
| evidence | 10948 | 11035 |  +87 |
| costs    |  1088 |  1088 |    0 |
| presets  |     9 |     9 |    0 |

新增的 profile 是 `tencent-hy4-max`，來自 Terminal-Bench 4.1 的 Hy4（max）。

## 新來源：CWE-bench v2

- **官方資料**：[榜單與方法](https://cwe-bench.com/)，結果日期 2026-11-18，v2 於 2026-11-02 發布。
- **內容**：250 個「稽核並修補漏洞」的任務，涵蓋 185 種 CWE、六種語言。100 題公開、150 題不公開。
- **計分**：以程式化驗證器判定，確認漏洞被擋下且正常功能不受影響。每題 4 次 rollout，取 Pass@1；採預設的 Combined（250 題）檢視。
- **來源角色 ORGANIZER**：Collinear AI 出題，也自行執行所有模型。
- **effort 記為 high**：方法段落寫明「four rollouts on each of the 250 tasks, at high reasoning」，適用全部模型。
- **harness**：逐列不同（Claude Code、Codex、Antigravity、opencode），保存在 profile。
- **維度**：Coding 主維度，次要關聯 Agentic 與 Reasoning，與 `cyber` 相同。評分終點是修補後的程式。
- **不物化的欄位**：Public、Held-out 檢視，Pass@4，每次 rollout 平均成本。
- **擷取**：解析伺服器渲染的 HTML，核對版本標記、Combined 範圍、方法段落，並檢查每列屬性與顯示值一致。Chromium 渲染畫面為 20 列，與 `--visual-row-count=20` 一致。
- **模型名稱**：取顯示名稱，因為它保留了日期版本（如 `Qwen3.8-Max (0902)`），`data-model` 屬性則會省略。
- **列數**：20 列全部 INCLUDED，其中 16 列對應到模型。依「不模糊比對」原則，以下 4 列維持未對應：`GLM-5.3`、`Hy4 Preview`、`Mistral Large 4`、`Qwen3.8-Max (0902)`。

## 新來源：Terminal-Bench 4.1

- **官方資料**：[榜單](https://www.tbench.ai/leaderboard)（最後更新 2026-11-20），[4.1 公告](https://www.tbench.ai/news/terminal-bench-4-1)（2026-11-09）。
- **4.1 與 4.0 的關係**：
  - 題目不變，驗證器改寫，加強對 reward hacking 的防護並修正誤判。
  - 主辦方用保存的 artifact 重新評分 4.0 榜單：11,550 次試跑中約 1.16% 改變結果，35 個 agent 的新分數都落在原本的 95% 信賴區間內。
  - 沒有 artifact 或無法重評的試跑，沿用 4.0 分數。
- **計分**：解題率。每列 330 次試跑（66 題各 5 次），`attempts` 記為 5；解析時檢查解題率等於成功數除以試跑數。
- **來源角色 ORGANIZER**：Stanford／Laude Institute 主辦方的官方榜。
- **profile**：每列都有 agent（Claude Code、Codex、Antigravity CLI、mini-swe-agent 等）與 effort。來源 effort `none` 不是產品檔位，保持 null。
- **維度**：與 4.0 相同，Agentic 主維度、Coding 次要。
- **擷取**：頁面把完整榜單查詢嵌在 Next.js flight data。畫面表格每個模型只顯示最佳一列，所以物化全部 67 個 effort 組態，並以不重複模型數 54 核對 Chromium 畫面的 54 列（`--visual-model-count=54`）。tokens 與成本不物化。
- **模型身分**：
  - 榜單用簡短名稱（`Opus 5.5`、`Fable 5.2`），現有 catalog 別名已涵蓋大多數。
  - `Fable 5`、`Opus 4.8`、`Sonnet 5` 的 catalog 沒有不帶「Claude」的別名。我加入逐條審核的精確對應，並要求該列連到 Anthropic 對該模型的官方公告，連結改變即擷取失敗。
  - `DeepSeek V4 Pro 0813` 沿用既有的現行版本對應。
- **列數**：67 列全部 INCLUDED，其中 52 列對應到模型。以下 15 個名稱沒有登記身分，維持未對應：`Copilot Fusion`、`Ember-1`、`Gemini 3.1 Pro`、`GLM-5.3`、`GLM-5.3-Flash`、`Haiku 5.5`、`Hy4 Flash`、`Hy4 Preview`、`Inkling Small 2`、`Inkling Small`、`MiMo V2.6 Flash`、`MiMo V2.6 Pro`、`Mistral Large 4`、`Nemotron 3.5 Super VL`、`Qwen3.8-Max-0902`。

### Terminal-Bench 4.0 改為不計分

- **依據**：AGENTS.md 規定 benchmark 改版時跟隨新版，由代理依證據決定；我在推薦時也寫明「改收 4.1」。4.1 與 4.0 是同一批題目，兩者都計分會把同樣的題目算兩次，比照 HLE-Diamond 取代 HLE 的做法處理。
- **作法**：`benchmark-quality-v2.json` 的排除清單加入 `terminal-bench-4-0`，審核紀錄見 [2026-11-21 supersession](../analysis/2026-11-21-terminal-bench-4-1-supersession.json)。AA 與 Vals 的 4.0 列仍保存為證據。
- **口徑差異**：舊產品的 4.0 成績多數取自 Vals，Fable 5.2 取自 AA（mini-swe-agent、三次重複）；4.1 官方榜則是各家以自己的 agent 執行（Claude Code、Codex、Antigravity CLI 等），每題 5 次。

**前沿前 10 名的覆蓋**（依集合代表的 profile）：

| 模型              | 集合 profile | TB 4.0（舊產品選用列） |               TB 4.1 | CWE-bench v2（high） |
| ----------------- | ------------ | ---------------------- | -------------------: | -------------------- |
| Claude Fable 5.2  | max          | 59.60（AA）            |                65.76 | 75.0（非 max）       |
| GPT-6.2 Astra     | max          | 63.13（Vals）          |                62.12 | 66.8（非 max）       |
| Gemini 4 Neon     | xhigh        | 61.62（Vals）          |                61.21 | 70.7（非 xhigh）     |
| Gemini 4 Carbon   | high         | 63.13（Vals）          |                64.55 | 67.3                 |
| Claude Opus 5.5   | max          | 65.15（Vals）          |                65.76 | 67.1（非 max）       |
| GPT-6.2 Sol       | max          | 60.61（Vals）          |                61.52 | 66.0（非 max）       |
| GPT-6 Astra       | max          | 59.60（Vals）          |                60.30 | 64.2（非 max）       |
| GPT-6.1 Sol       | max          | 55.05（Vals）          |                60.91 | —                    |
| Claude Sonnet 5.5 | max          | 64.14（Vals）          |                63.94 | 61.4（非 max）       |
| Gemini 4 Hydrogen | xhigh        | 54.04（Vals）          | —（只有 high 56.36） | 68.1（非 xhigh）     |

TB 4.0 欄是舊版產品在重複量測中選用的列。Vals 只有 Fable 5.2 high 的成績，所以 Fable max 用的是 AA 以 mini-swe-agent 跑出的 59.60；換成 4.1 後 Fable 與 Opus 同為 65.76，這是 Fable 在各集合加分最多的原因。

## 集合與逐模型影響

### 前沿前 10 名

不變（Fable 5.2、GPT-6.2 Astra、Gemini 4 Neon、Gemini 4 Carbon、Opus 5.5、GPT-6.2 Sol、GPT-6 Astra、GPT-6.1 Sol、Sonnet 5.5、Gemini 4 Hydrogen）。

### 各模型數的共同測試

| 模型數 | Preset          | 共同測試 | 變化                                           |
| -----: | --------------- | -------: | ---------------------------------------------- |
|      2 | `aa-top-2`      |  24 → 24 | `terminal-bench-4-0` 換成 `terminal-bench-4-1` |
|    3–5 | `aa-top-3`～`5` |  10 → 10 | 同上                                           |
|    6–9 | `aa-top-6`～`9` |    9 → 9 | 同上（含預設）                                 |
|     10 | `aa-top-10`     |    8 → 7 | 移除 `terminal-bench-4-0`，4.1 未進入          |

- **預設 `aa-top-9`**：
  - Fable 5.2 63.33 → 63.77（+0.44）、GPT-6.1 Sol 53.76 → 54.18（+0.42），其餘模型變動在 ±0.1 以內。
  - Gemini 4 Carbon 57.50 → 57.60 升為第 4，Claude Opus 5.5 57.51 → 57.56 降為第 5。兩者原本只差 0.01 分，現在差 0.04 分。
  - 其他名次不變。
- **`aa-top-6`～`8`**：與預設相同，Carbon 與 Opus 互換第 4、5 名，其餘名次不變。
- **`aa-top-2`～`5`**：名次不變，Overall 變動在 0.4 分以內。
- **`aa-top-10`**：集合中的 Gemini 4 Hydrogen 以 xhigh profile 代表，4.1 榜只有 Hydrogen high，所以 Terminal-Bench 退出這個集合，共同測試由 8 項減為 7 項。Gemini 4 Neon 與 Claude Opus 5.5 互換第 3、4 名（58.73／58.89 → 59.15／58.42），其餘名次不變。
- **CWE-bench v2 沒有進入任何集合的原因**：主辦方只以 high 執行，集合中只有 Gemini 4 Carbon 以 high 代表；其他前沿模型以 max 或 xhigh 代表，GPT-6.1 Sol 也沒有成績。這和 Autoform-Hard 的情況相同。

### 主畫面（預設集合 `aa-top-9`）的進出

沒有模型進出。共同測試中的 Terminal-Bench 由 4.0 換成 4.1，Carbon 與 Opus 互換第 4、5 名。

## 來源變化

- 新增 `cwe-bench`（`cwe-bench:2026-11-21T02:05:55.708Z`）與 `terminal-bench`（`terminal-bench:2026-11-21T02:05:57.757Z`）快照，並加入 `data/mappings/sources.json` 白名單。
- 程式與設定的登記點：
  - 兩個 materializer 與 refresh 命令（`materialize:cwe-bench`、`materialize:terminal-bench`）、離線重建清單；
  - `benchmarks-v2.json`、`benchmark-quality-v2.json` 與 supersession 審核紀錄；
  - 看板的 benchmark 名稱與來源標籤。
- 文件同步：`SPEC.md` 來源表與說明、`BENCHMARK_DIMENSION_MAPPING.md` 維度對照與品質政策、`OPERATIONS.md` 命令與畫面列數核對。
- 來源監測：兩個新來源加入監測狀態，各來源 `checkedAt` 因匯入時的全來源監測而更新，其他快照內容沒有變化。

### 依證據自行決定的事項

- **Terminal-Bench 4.1 取代 4.0**：理由見上。
- **CWE-bench 的 effort 一律記為 high**：依主辦方方法段落，不是逐列標示。
- **Terminal-Bench 的 `none` 記為 null**：無法判斷是「關閉推理」還是「未設定」，保守處理為未標示。
- **三個 Anthropic 舊模型的精確對應**：每條都以該列連到的 Anthropic 官方公告為證據。

### 程式審查

Codex（gpt-6.2-sol，唯讀）審查了這次的程式與文件差異，提出 5 個 P2 與 1 個 P3，全部採納並補上合成測試：

- **P2：CWE-bench 名稱遇到數字形式的 HTML 實體（`&#160;`）會解析失敗，導致身分對應遺失**：已改為同時解碼十進位與十六進位實體。
- **P2：CWE-bench 的 regex 會把 `data-id="leaderboard"` 等相似屬性誤認為目標元素**：改為比對完整屬性名稱，並要求榜單區段恰好一個。
- **P2：CWE-bench 每次 rollout 的時間上限改變時，仍會以同一 benchmark 匯入**：方法核對加入「one-hour limit」。
- **P2：Terminal-Bench 漏掉某模型排名較低的組態時，畫面模型數不會變**：加入競賽排名（1、2、2、4）連續性檢查，可偵測中間缺列；排名最末的缺列仍無法從頁面偵測，已寫入程式註解。
- **P2：Terminal-Bench 接受非整數的成功次數**：改為必須是整數。
- **P3：維度文件對 TB 4.0「兩者都計分」與「不計分」的敘述互相矛盾**：已改寫為過去式，並明確寫出現在計分的是 2.1 與 4.1。

## 已知未解

- 未對應的列：CWE-bench 4 列、Terminal-Bench 15 個名稱（見上）。這些模型都需要官方證據才能登記身分。榜首的 `Copilot Fusion`（GitHub）也在其中。
- Gemini 4 Hydrogen 在 Terminal-Bench 4.1 只有 high 成績，`aa-top-10` 因此暫時沒有 Terminal-Bench。
- CWE-bench v2 要等主辦方發布 max／xhigh 成績，或集合代表的檔位改變，才會進入集合。

## 檔位推測揭露表（強制）

依同一腳本重算，共 938 筆（跨來源 570、預設 368）。與 [2026-11-19 推測表](2026-11-19-effort-inferences.md) 相比新增 4 筆、移除 1 筆，明細見 [2026-11-21 推測表](2026-11-21-effort-inferences.md)：

- **新增 3 筆（Terminal-Bench 4.1）**：Beam 1.0、Inkling、MiniMax M3 的 mini-swe-agent 列來源標示 `none`，依其他來源推測為 max（依據分別是 Frontier Code、LiveBench、AutomationBench）。這三個模型都不在任何集合中。
- **改變 1 筆（Epoch）**：GPT-5.6 Terra 的未標示列由 xhigh 改為 max。Terminal-Bench 4.1 新增一張 GPT-5.6 Terra max 的票，使 max 票數勝出。此模型不在任何集合中。

進入預設集合的推測仍只有一筆，與 11/19 相同：Sonnet 5.5 的 AutomationBench，以 Anthropic 發布頁的 max 為依據。

## 獨立抽查

由未參與匯入的 agy（gemini-4-hydrogen-medium）在 2026-11-21 10:12–10:14（+08:00）以 curl 與 headless Chromium 直接開啟兩個官方榜，逐列比對全部 87 列。

| 來源               | 網址                                | 頁面位置／欄位                                                 | 結果       |
| ------------------ | ----------------------------------- | -------------------------------------------------------------- | ---------- |
| CWE-bench v2       | <https://cwe-bench.com/>            | 「CWE-bench leaderboard」Combined (250)，Pass@1 與 Harness 欄  | 20/20 相符 |
| Terminal-Bench 4.1 | <https://www.tbench.ai/leaderboard> | 畫面表格 54 列（解題率、agent、effort）                        | 54/54 相符 |
| Terminal-Bench 4.1 | 同上                                | 頁面內嵌資料中其餘 13 個組態（`metrics.accuracy`、`n_trials`） | 13/13 相符 |

- **分數**：87/87 相符。CWE-bench 比對到小數 1 位；Terminal-Bench 畫面比對到小數 1 位，內嵌資料比對到小數 2 位。
- **effort 與 harness**：87/87 相符。CWE-bench 的方法段落確認寫明「four rollouts on each of the 250 tasks, at high reasoning」。
- **捨入說明**：Terminal-Bench 畫面有 3 列 `.x5` 的值（Fable 5 44.85、Gemini 4 Carbon 64.55、Muse Spark 1.3 14.85）顯示為向下捨入的 44.8%、64.5%、14.8%，這是浮點數表示造成的，內嵌資料與我們存的值一致。

抽查樣本、逐列結果與報告：`artifacts/research/2026-11-21-cwe-tbench/spot-check/`。

## 重大變更判斷

**沒有需要停下來審核的重大變更**，依據如下：

1. **收錄是使用者的決定**：使用者明確指示依推薦收錄；推薦內容寫明「改收 4.1」並採用主辦方官網作新來源。
2. **4.0 改為不計分屬代理可決定事項**：AGENTS.md 規定「benchmark 改版時跟隨新版」由代理依證據決定並在報告寫明。主辦方公告確認 4.1 是同一批題目的重新評分。
3. **預設集合沒有模型進出**：唯一的名次變動是 Carbon 與 Opus 互換第 4、5 名，兩者原本只差 0.01 分。依規定，預設集合的重排直接套用並告知使用者。
4. **沒有無法解釋的變化**：每個分數變動都來自 TB 4.0 → 4.1 的替換；`aa-top-10` 少一項測試的原因已查明（Hydrogen 的 profile 檔位）。離線重建零差異。

因此依流程提交、開 PR，CI 通過後合併。
