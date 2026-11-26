# 2026-11-26 資料刷新報告：收錄 AA 的 Terminal-Bench 4.1 與 FrontierPhysics

完整 release 通過，**沒有需要停下來審核的重大變更**。今天早上的[聯網查核](../research/2026-11-26-benchmark-update-check.md#新-benchmark版本與待查線索)列出兩個待決線索，使用者同日指示「收錄 AA 的 Terminal-Bench 4.1 和 FrontierPhysics」：

- **Terminal-Bench 4.1（`terminal-bench-4-1`）**：AA（`terminalBench41`）成為這個 benchmark 的第二個來源。主辦方 `terminal-bench` 有成績的 profile 一律採主辦方列，AA 只補主辦方沒測的 profile。
- **FrontierPhysics（`frontierphysics`）**：新 benchmark，來源是 AA 的獨立評測。

預設集合 `aa-top-9` 的模型、名次、分數與 10 項共同測試都沒有改變，因為 9 個模型原本就有主辦方的 Terminal-Bench 4.1 成績，FrontierPhysics 也還沒涵蓋全部 9 個模型。變動都在其他集合，判斷依據見「重大變更判斷」。

這次 release 前，證據庫（`artifacts/evidence/store.sqlite`）因為與另一個 worktree 共用而損壞，已修復並通過完整驗證，見「證據庫損壞與修復」。

## 版本與來源基準

- **起始點**：分支 `data/2026-11-26-aa-tb41-frontierphysics` 由 `fc9193fedb11061b76fc200901598b39a150267b`（今天的每日刷新）開始；開 PR 前後 main 先後合併了 Vibe Code Bench v1.1.1（PR #98）與 Vibe Code Bench 1-100 v1.1（PR #99），所以 rebase 到 `af37127`，再以保存的 Evidence 離線重建並重跑 release。
- **舊版本**：`sha256:0b0efa9cafca5fdc91696dbcee68932202ac02067ff6572b2879b12807852df5`（`af37127`）
- **新版本**：`sha256:c206a7c81be5a63ba70b67140c148eab56ba8bc31f388a2adafc2018d94bfd04`
- **Release**：`2026-11-26T08-49-29-863Z` 退出碼 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-26-aa-tb41-frontierphysics-receipt.json)
- **先前的 release**：
  - `2026-11-26T07-53-58-605Z` 在 `evidence` 步驟失敗（`database disk image is malformed`），原因與修復見下文。
  - `2026-11-26T08-20-24-615Z` 是 `complete`。之後依 Codex（GPT-6.2 Sol）的程式審查強化 parser 的欄位限制，所以重跑離線重建與 release。兩次的 AA 快照逐位元組相同，變更報告除標頭外也完全相同，產品只有 `generatedAt` 不同。
  - `2026-11-26T08-30-58-415Z`（rebase 前）、`2026-11-26T08-40-56-377Z`（rebase 到 #98 後）都是 `complete`。rebase 後的重建沒有改變任何來源快照，集合的共同測試增減與模型進出也都相同；只有分數因 Vibe Code Bench 改版而略有不同，下表以最後一次為準（#98 與 #99 兩次 rebase 後的名次互換完全相同）。
- **AA 重新擷取**：`2026-11-26T07:52:33Z`（新增 `/evaluations/terminalbench-4-1` 與 `/evaluations/frontierphysics` 兩頁）。畫面 profile 數仍是 766（`--visual-profile-count=766`），AA API 交叉核對照常回 HTTP 410。
- **離線重建**：parser 改版後，以保存的 Evidence 重跑 `data:materialize-snapshots`、`rematerialize:vals` 與 `materialize:effort-reports`。除 AA 外，各來源快照都與 HEAD 相同；BioBasicsBench 只有列順序不同，已還原。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| frontier |    20 |    20 |    0 |
| profiles |   353 |   353 |    0 |
| evidence | 11725 | 11985 | +260 |
| costs    |  1193 |  1193 |    0 |
| presets  |    28 |    28 |    0 |

新增的 260 筆 evidence 是 AA 的 Terminal-Bench 4.1 列 219 筆（201 列對應到模型）與 FrontierPhysics 列 41 筆（39 列對應到模型）。AA 的候選列由 3,466 增為 3,726，沒有列被移除，原有列的分數都沒變。

## AA 的 Terminal-Bench 4.1

- **官方說明**：[AA 評測頁](https://artificialanalysis.ai/evaluations/terminalbench-4-1)：「We run all 66 Terminal-Bench 4.1 tasks with the mini-swe-agent harness and report pass@1 averaged over three repeats per task.」AA Intelligence Index v5.0.2 以 4.1 取代 4.0（66 題相同、改用新的驗證器）。
- **對應**：`terminalBench41` → `terminal-bench-4-1`，與主辦方共用 benchmark ID 與 `resolution-rate` 指標，所以重複量測的選擇規則（SPEC §4.3.1）會比較兩個來源：主辦方列是 ORGANIZER／FULL，AA 列是 INDEPENDENT／PARTIAL_SOURCE，重疊的 profile 一律採主辦方列。這與 AA 的 FrontierCode 2.0 採用的規則相同。
- **profile**：harness `mini-swe-agent`、`attempts` 3、`tools` true，版本記為 `v4.1`。
- **產品實際採用的列**：主辦方 67 列加 AA 219 列；進入集合的 AA 列只有主辦方沒測的 profile：
  - Gemini 4 Hydrogen xhigh 55.05：`aa-top-10`、`coverage-10`～`coverage-20` 等 13 個集合。
  - Muse Wonder max 53.54、Muse Spark 1.3 max 33.33、Qwen4-Max xhigh 47.47、Muse Wonder Full max 55.56、Claude Fable 5.2 high／xhigh：只在 coverage 集合。
- **AA 的 4.0 列**：保留為證據，仍不計分（2026-11-21 起由 4.1 取代）。

## FrontierPhysics

- **官方說明**：[AA 評測頁](https://artificialanalysis.ai/evaluations/frontierphysics)。這是 AA 對 BenchFlow FrontierPhysics 的實作：54 題不公開的物理研究任務，分屬 9 個領域，排除 2 題需要 GPU 的任務。agent 要查文獻、執行模擬或分析，再提交結果與論文稿。AA 在 Stirrup harness 中每題跑三次，回合上限 750。
- **計分**：
  - 每次執行先過 deterministic verifier。
  - 接著三位 GPT-6 Luna (xhigh) 評審依 rubric 評分。過半評審認定滿足的 blocking criterion 才算達成。
  - 通過 verifier 且滿足全部 blocking criteria 的執行，得到評審的平均品質分；其他執行得 0。
  - `score` 是全部執行的平均。目前最高的是 Claude Fable 5.2，32.9%。
- **不屬於 AA Intelligence Index**。頁面未標版本，所以 `benchmarkVersion` 保持 null；`frontierphysicsBreakdown`（Pass@1、verifier 通過率、各領域）不物化。
- **維度（代理判斷，可由使用者改）**：Reasoning 主維度，Agentic 與 Coding 次要，與 CritPt v2 相同。評分的是物理結果與研究品質，工具迴圈與程式只是手段。兩者題目不重疊，所以都計分。
- **列數**：41 列全部 INCLUDED，39 列對應到模型。沒有身分的 `GLM-5.3 (Max)`、`MiMo-V2.6-Pro` 本來就在 AA 的未登記名稱中，不在指數審核帳的新增範圍。

## parser 的範圍限制

第一次線上擷取多出 11 筆 `critpt-v2` 列（GPT-6.2 Astra 與 GPT-6.2 Sol 各四個檔位、Gemini 4 Hydrogen 三個檔位）。抽查代理在 AA 的 CritPt v2 頁與這些檔位的模型頁都找不到這些值。追查後發現，值只存在 `/evaluations/frontierphysics` 頁面內嵌的資料裡，例如 `gpt-6-2-astra-high` 物件帶有 `critptAgentic: 0.837…`，而這個數字在 CritPt v2 頁屬於 GPT-6.2 Astra (Max)。

為了讓這次收錄只帶進使用者決定的兩個欄位，兩個新評測頁的列只提供各自的欄位（`terminalBench41`、`frontierphysics`）與身分欄位，排序也排在其他評測頁之後，所以不會成為 profile 的基準列。這兩頁的優先順序也排在未列名的評測頁之後；已知的分數欄位不論型別一律移除，其他數值與物件欄位也一併移除。單元測試以合成資料驗證：只有新頁時不會帶出其他 benchmark，同一 profile 出現在其他頁時也不會被新頁覆蓋。修正後重新離線物化，這 11 筆列消失，Terminal-Bench 4.1 與 FrontierPhysics 的列和線上擷取完全相同。

## 預設集合與其他集合

`aa-top-9`（預設）：模型、名次、分數、共同測試全部不變。

| 集合                         | 共同測試變化                               | 模型進出                                                              | 主要影響                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aa-top-2`～`aa-top-6`       | 加入 `frontierphysics`                     | 無                                                                    | 總分普遍下降 1–5 分（FrontierPhysics 分數低）。`aa-top-5` 的 Opus 5.5 與 Gemini 4 Carbon 互換第 4、5 名                                                                             |
| `aa-top-10`                  | 加入 `terminal-bench-4-1`（8 → 9）         | 無                                                                    | 名次不變；Gemini 4 Hydrogen 由 AA 補上 4.1 成績                                                                                                                                     |
| `coverage-2`、`coverage-3`   | 加入 `frontierphysics`                     | 無                                                                    | 名次不變                                                                                                                                                                            |
| `coverage-7`                 | 36 → 37 項，組成重選                       | 進：Claude Fable 5.1、Muse Wonder；出：Gemini 4 Carbon、GPT-6.2 Astra | AA 補上 Muse Wonder 的 4.1 成績，改變了涵蓋最多共同測試的 7 個模型組合                                                                                                              |
| `coverage-9`                 | `riemann-bench` 換成 `complex-constraints` | 進：Gemini 4 Hydrogen；出：Kimi K3.1 Pro                              | 同上，Gemini 4 Hydrogen 有了 4.1 成績；GPT-6 Astra 與 Opus 5.5 互換第 3、4 名                                                                                                       |
| `coverage-10`～`coverage-20` | 各加入 `terminal-bench-4-1`                | 無                                                                    | 幾組相鄰名次互換：GPT-6 Astra 與 Gemini 4 Carbon（`coverage-13`、`-15`、`-18`）、Opus 5.5 與 Gemini 4 Carbon（`coverage-16`）、Kimi K3.1 Pro 與 Muse Wonder（`coverage-19`、`-20`） |

完整逐模型對照見 release 的 `report.md`（`artifacts/releases/2026-11-26T08-49-29-863Z/report.md`）。

## AA 其他列的出處變化

有 21 列的分數與今天早上相同，只有出處改變：GPT-6.2 Astra／Sol 與 Gemini 4 Hydrogen 各檔位的 AA-Briefcase 11 列，以及這些檔位的 Intelligence Index 10 列。這些列現在記到各檔位自己的模型頁（AA 把檔位網址轉址到主模型頁，頁內帶有各檔位資料），AA-Briefcase 列的 `contextWindowTokens` 因此變成 null。這是 AA 頁面在兩次擷取之間的變化，與兩個新評測頁無關：用來佐證的 Evidence 都是 `/models/gpt-6-2-astra`、`/models/gpt-6-2-sol`、`/models/gemini-4-hydrogen`。

## 證據庫損壞與修復

- **原因**：
  - Vibe Code Bench v1.1.1 的工作在另一個 worktree 進行，它的 `artifacts/evidence/store.sqlite` 是主工作區的 hard link（同一個 inode），但兩邊各有自己的 `-wal`／`-shm` 檔。
  - 15:55（UTC+8）兩邊同時寫入：我的 AA 重新擷取，與對方的 `rematerialize:vals`。SQLite 無法協調分屬不同 WAL 的寫入者，資料庫因此損壞，`evidence verify` 回報 `database disk image is malformed`。
  - 另外，對方留在共用資料庫裡尚未完成的 export journal，被主工作區開啟 store 的程序補做，所以它的 Vals 輸出兩度寫進主工作區的 `data/sources/vals-ai`。兩次都已還原到 HEAD，這次提交不含 Vals 變更。
- **損壞範圍**：`blobs` 表整張無法讀取；`captures` rowid 24790 以後（今天最後 267 列）與 `snapshots` seq 3677（1 列）無法讀取；其他表完整可讀。
- **修復**：
  1. 逐 rowid 讀出所有可讀的列，寫進新資料庫：3,018 個快照、7,016,515 筆引用、21,474 筆擷取，以及 attempts、processes、export journal 等。
  2. `blobs` 由擷取紀錄與快照內嵌的 Evidence 紀錄重建，共 10,371 筆，對應的檔案都存在。
  3. 執行 `pnpm evidence init`：登記這個 checkout 的來源快照，並盤點 `artifacts/sha256`（11,680 個檔案）。
  4. `pnpm evidence verify --full` 通過：blobs 11,834、captures 21,617、snapshots 3,046、issues 0。
- **遺失**：今天最後 267 筆擷取事件的取得紀錄（HTTP 標頭等）。對應的原始檔仍在，目前快照引用的 Evidence 也已由 `evidence init` 重新登記。
- **保存**：損壞的原檔與修復程式在 `artifacts/research/2026-11-26-evidence-repair/`（不進版控）。
- **後續**：另一個 worktree 已停止寫入，改用自己的 store 副本，不再以 hard link 共用。

## 檔位推測揭露

附件：[逐列明細](2026-11-26-aa-tb41-frontierphysics-effort-inferences.md)（[JSON](2026-11-26-aa-tb41-frontierphysics-effort-inferences.json)）。

- **總數**：共 1,580 筆，其中跨來源推測 984 筆，未標示且無跨來源依據而採用 `default` 596 筆。
- **與早上附件的差異**：相對 main 上最新的 [Vibe Code Bench 1-100 v1.1 附件](2026-11-26-vcb-1-100-v1-1-effort-inferences.md)（1,532 筆）新增 48 筆，沒有移除，原有列的檔位與依據都沒變：
  - **Terminal-Bench 4.1 新增 43 筆**：跨來源推測 21 筆（`max`、`xhigh`、`high` 各 7 筆），`default` 22 筆。
  - **FrontierPhysics 新增 5 筆**：都是跨來源推測。
- **進入集合的推測列**：只有 Qwen4-Max 的 AA Terminal-Bench 4.1 列（推測 `xhigh`，依據 Epoch 的 `Qwen4-Max (xhigh)` 標示），只在 `coverage-10`～`coverage-20`。
- **預設集合**：唯一的推測列仍是 Sonnet 5.5 的 AutomationBench（`max`），與早上相同。

## 已知未解

- **AA 頁面的隱藏欄位**：AA 的 FrontierPhysics 頁內嵌資料帶有 CritPt v2 頁與模型頁都沒顯示的 `critptAgentic` 值。本次只限制新頁的欄位，沒有改變既有評測頁的讀取方式。
- **沒有身分的名稱**：Terminal-Bench 4.1 有 18 列、FrontierPhysics 有 2 列沒有身分（例如 `DeepSeek V4.1 Flash (Max)`、`GLM-5.3 (Max)`、`MiMo-V2.6-Pro`、`Step 5 Preview`），都是 AA 上原本就未登記的名稱。
- **AA API**：仍回 HTTP 410，只用頁面資料。

## 代理抽查

抽查由 agy（Gemini 4 Hydrogen High）執行，它沒有參與匯入，直接以 `curl` 抓取 AA 現行頁面後逐筆比對；評測頁圖表另以 headless Chromium 渲染，讀出畫面顯示的百分比。原始頁面與結果存於 `artifacts/research/2026-11-26-aa-tb41-frontierphysics/spot-check/`（不進版控）。我另外從原始頁面重新讀出兩筆（Qwen4-Max 的 4.1、Claude Fable 5.2 的 FrontierPhysics），結果相同。

- **第一輪（隨機，種子 20261126）**：28 筆，其中 Terminal-Bench 4.1 14/14、FrontierPhysics 10/10 相符；新出現的 `critpt-v2` 4/4 不符。追查後確認，這些值只存在 FrontierPhysics 頁的內嵌資料（見「parser 的範圍限制」），修正 parser 後這 11 筆列已不存在，重跑 release 後也不在產品中。
- **第二輪（依風險）**：進入任何集合的 AA 列共 15 筆，第一輪已涵蓋 1 筆，其餘 14 筆全部相符，包括唯一的推測檔位列 Qwen4-Max。這次沒有模型新進或退出主畫面。
- **合計**：Terminal-Bench 4.1 與 FrontierPhysics 共 38 筆相符、0 筆不符。

下表是進入集合的 15 筆。AA 的檔位網址會轉址到主模型頁，該頁內嵌各檔位的資料；評測頁圖表預設只顯示部分模型，所以有幾筆沒有圖表數字。

| 網址                                                                                                               | 頁面位置（網站顯示的模型名稱）                             | 欄位                                       | 期望值 | 觀察值（UTC）                        | 結果 |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------ | -----: | ------------------------------------ | ---- |
| [artificialanalysis.ai/models/claude-fable-5-2](https://artificialanalysis.ai/models/claude-fable-5-2)             | 模型頁內嵌資料，Claude Fable 5.2 (Max, Default Fallback)   | FrontierPhysics Score（`frontierphysics`） |  32.9% | 32.9%（評測頁圖表顯示 32.9%），08:24 | 相符 |
| [artificialanalysis.ai/models/gpt-6-2-astra](https://artificialanalysis.ai/models/gpt-6-2-astra)                   | 模型頁內嵌資料，GPT-6.2 Astra (Max)                        | FrontierPhysics Score（`frontierphysics`） |  26.3% | 26.3%（評測頁圖表顯示 26.3%），08:24 | 相符 |
| [artificialanalysis.ai/models/gemini-4-neon](https://artificialanalysis.ai/models/gemini-4-neon)                   | 模型頁內嵌資料，Gemini 4 Neon (Xhigh)                      | FrontierPhysics Score（`frontierphysics`） |  24.6% | 24.6%（評測頁圖表顯示 24.6%），08:24 | 相符 |
| [artificialanalysis.ai/models/claude-opus-5-5](https://artificialanalysis.ai/models/claude-opus-5-5)               | 模型頁內嵌資料，Claude Opus 5.5 (Max, Default Fallback)    | FrontierPhysics Score（`frontierphysics`） |  23.9% | 23.9%（評測頁圖表顯示 23.9%），08:24 | 相符 |
| [artificialanalysis.ai/models/gemini-4-carbon](https://artificialanalysis.ai/models/gemini-4-carbon)               | 模型頁內嵌資料，Gemini 4 Carbon (High)                     | FrontierPhysics Score（`frontierphysics`） |  12.7% | 12.7%（評測頁圖表顯示 12.7%），08:24 | 相符 |
| [artificialanalysis.ai/models/gpt-6-2-sol](https://artificialanalysis.ai/models/gpt-6-2-sol)                       | 模型頁內嵌資料，GPT-6.2 Sol (Max)                          | FrontierPhysics Score（`frontierphysics`） |  21.8% | 21.8%，第一輪                        | 相符 |
| [artificialanalysis.ai/models/claude-sonnet-5-5](https://artificialanalysis.ai/models/claude-sonnet-5-5)           | 模型頁內嵌資料，Claude Sonnet 5.5 (Max, Default Fallback)  | FrontierPhysics Score（`frontierphysics`） |  23.4% | 23.4%（評測頁圖表顯示 23.4%），08:24 | 相符 |
| [artificialanalysis.ai/models/gpt-6-1-sol](https://artificialanalysis.ai/models/gpt-6-1-sol)                       | 模型頁內嵌資料，GPT-6.1 Sol (Max)                          | FrontierPhysics Score（`frontierphysics`） |  16.1% | 16.1%（評測頁圖表顯示 16.1%），08:24 | 相符 |
| [artificialanalysis.ai/models/gemini-4-hydrogen](https://artificialanalysis.ai/models/gemini-4-hydrogen)           | 模型頁內嵌資料，Gemini 4 Hydrogen (Xhigh)                  | Terminal-Bench 4.1（`terminalBench41`）    |  55.1% | 55.1%（評測頁圖表顯示 55.1%），08:24 | 相符 |
| [artificialanalysis.ai/models/qwen4-max](https://artificialanalysis.ai/models/qwen4-max)                           | 模型頁內嵌資料，Qwen4 Max                                  | Terminal-Bench 4.1（`terminalBench41`）    |  47.5% | 47.5%（評測頁圖表顯示 47.5%），08:24 | 相符 |
| [artificialanalysis.ai/models/muse-wonder](https://artificialanalysis.ai/models/muse-wonder)                       | 模型頁內嵌資料，Muse Wonder (Max)                          | Terminal-Bench 4.1（`terminalBench41`）    |  53.5% | 53.5%（評測頁圖表顯示 53.5%），08:24 | 相符 |
| [artificialanalysis.ai/models/muse-spark-1-3](https://artificialanalysis.ai/models/muse-spark-1-3)                 | 模型頁內嵌資料，Muse Spark 1.3 (Max)                       | Terminal-Bench 4.1（`terminalBench41`）    |  33.3% | 33.3%，08:24                         | 相符 |
| [artificialanalysis.ai/models/muse-wonder-full](https://artificialanalysis.ai/models/muse-wonder-full)             | 模型頁內嵌資料，Muse Wonder Full (Max)                     | Terminal-Bench 4.1（`terminalBench41`）    |  55.6% | 55.6%（評測頁圖表顯示 55.6%），08:24 | 相符 |
| [artificialanalysis.ai/models/claude-fable-5-2-xhigh](https://artificialanalysis.ai/models/claude-fable-5-2-xhigh) | 模型頁內嵌資料，Claude Fable 5.2 (Xhigh, Default Fallback) | Terminal-Bench 4.1（`terminalBench41`）    |  61.6% | 61.6%，08:24                         | 相符 |
| [artificialanalysis.ai/models/claude-fable-5-2-high](https://artificialanalysis.ai/models/claude-fable-5-2-high)   | 模型頁內嵌資料，Claude Fable 5.2 (High, Default Fallback)  | Terminal-Bench 4.1（`terminalBench41`）    |  60.1% | 60.1%，08:24                         | 相符 |

## 重大變更判斷

**判定：沒有重大變更，可依流程提交並自動合併。**

- **收錄由使用者決定**：兩個 benchmark 是使用者今天明確指示收錄的，來源採用規則（AA 作為 4.1 第二來源、主辦方優先）沿用 FrontierCode 2.0 已核准的做法。
- **FrontierPhysics 的維度歸屬**：這是代理依 CritPt v2 的前例所做的判斷，已在本報告與 [維度對應](../BENCHMARK_DIMENSION_MAPPING.md) 寫明，使用者可以改。
- **預設集合沒有任何變動**；其他集合的重排都能追溯到新增的兩個 benchmark，或 AA 補上的 4.1 成績。
- **parser 的範圍限制**：把收錄範圍限定在使用者決定的兩個欄位，沒有改變任何既有列。
- **證據庫修復**：通過完整驗證，產品可由輸入重現（release 的 `fresh` 步驟）。
