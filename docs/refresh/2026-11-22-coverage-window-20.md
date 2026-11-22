# 2026-11-22 資料刷新報告：測試覆蓋最佳化集合的模型窗口放寬到 20 個

完整 release 通過。來源快照沒有任何變更；差異全部來自使用者 2026-11-22 的裁決：

- **測試覆蓋最佳化集合 `coverage-N`** 的模型範圍由 AA 排名前 10 個合格模型，放寬為最多前 20 個（`COVERAGE_WINDOW_MODELS = 20`），N = 2～20。
- **前沿集合 `aa-top-N`** 不變：仍是前 10 個合格模型的前 N 名（N = 2～10）。預設集合仍是 `aa-top-9`。
- **搜尋方法**維持精確搜尋（使用者選擇），規則與同分處理順序不變。

判定為**沒有重大變更**，依據見文末。

## 版本與來源基準

- 起始 commit：`90eed021fb899ff622500559f91e7272f7263566`（main），於分支 `feat/coverage-window-20` 進行。
- 舊版本：`sha256:ff4f9c578973b6d036387a3be72a54ecbf05f34b877d2103a92d6190398344c2`
- 新版本：`sha256:7faa487eb94d402e83b4cd4fa8047a43de47cfd0e35ca5a0d2e5a625299188b0`
- Release `2026-11-22T15-18-33-200Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-22-coverage-window-20-receipt.json)
- 前兩次 release 失敗，修正後重跑：
  - `15-11-18`：e2e「keeps the tenth frontier model when the ninth is manually excluded」把整個窗口當成前十名。改為只取窗口前 10 個。
  - `15-13-47`：通過，但之後依程式審查修正了四項問題（見「程式與測試」），所以重跑。
- 來源快照：無新增、無移除。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| frontier |    10 |    20 |  +10 |
| profiles |   299 |   299 |    0 |
| evidence | 11634 | 11634 |    0 |
| costs    |  1102 |  1102 |    0 |
| presets  |    18 |    28 |  +10 |

## 新進窗口的模型（#11～#20）

AA 排名中共有 41 個模型符合「至少 2 個獨立組織」的資格；依名次取前 20 個。第 1～10 名與舊版完全相同。

| 窗口 # | 模型             | AA 分數 | 代表 effort | 可計分 benchmark 數 | 獨立組織數 |
| -----: | ---------------- | ------: | ----------- | ------------------: | ---------: |
|     11 | GPT-6.1 Terra    |   51.33 | max         |                  32 |          8 |
|     12 | Gemini 4 Argon   |   50.41 | high        |                  56 |         13 |
|     13 | Muse Wonder Full |   50.08 | max         |                  23 |          2 |
|     14 | Claude Fable 5.1 |   50.02 | max         |                  58 |         10 |
|     15 | Kimi K3.1 Pro    |   46.45 | max         |                  39 |          8 |
|     16 | Claude Opus 5    |   44.16 | max         |                  51 |         11 |
|     17 | GPT-6 Sol        |   44.16 | max         |                  42 |          9 |
|     18 | Muse Wonder      |   43.57 | max         |                  43 |          6 |
|     19 | Qwen4 Max        |   42.89 | xhigh       |                  29 |          5 |
|     20 | Muse Spark 1.3   |   36.62 | max         |                  41 |          6 |

## 測試覆蓋最佳化集合

「窗口 #」是集合內模型在窗口中的名次。N = 2～4 與舊版相同；N = 5～10 因為可以選入第 11～20 名，共同測試數增加；N = 11～20 是新集合。

| 模型數 | 舊測試數 | 新測試數 | 有效維度 | 選出的模型（窗口 #）                                                  | 改用非代表 effort      |
| -----: | -------: | -------: | -------: | --------------------------------------------------------------------- | ---------------------- |
|      2 |       53 |       53 |        6 | 5、9                                                                  | —                      |
|      3 |       51 |       51 |        6 | 5、8、9                                                               | —                      |
|      4 |       49 |       49 |        6 | 5、7、8、9                                                            | —                      |
|      5 |       39 |       47 |        6 | 5、7、8、9、14                                                        | —                      |
|      6 |       37 |       44 |        6 | 5、7、8、9、12、14                                                    | —                      |
|      7 |       31 |       36 |        6 | 2、4、5、7、8、9、12                                                  | —                      |
|      8 |       24 |       34 |        6 | 2、4、5、7、8、9、12、14                                              | —                      |
|      9 |       17 |       32 |        5 | 2、4、5、7、8、9、12、14、15                                          | —                      |
|     10 |       14 |       29 |        5 | 2、4、5、7、8、9、10、12、14、15                                      | —                      |
|     11 |        — |       27 |        5 | 2、4、5、7、8、9、10、12、14、15、20                                  | —                      |
|     12 |        — |       25 |        5 | 2、4、5、7、8、9、10、12、14、15、18、20                              | —                      |
|     13 |        — |       23 |        6 | 2、4、5、6、7、8、9、10、12、14、18、19、20                           | —                      |
|     14 |        — |       22 |        5 | 2、4、5、6、7、8、9、10、12、14、15、18、19、20                       | —                      |
|     15 |        — |       17 |        5 | 2、4、5、6、7、8、9、10、11、12、14、15、18、19、20                   | —                      |
|     16 |        — |       16 |        5 | 2、3、4、5、6、7、8、9、10、11、12、14、15、18、19、20                | —                      |
|     17 |        — |       13 |        5 | 1、2、3、4、5、6、7、8、9、10、11、12、14、15、18、19、20             | Claude Fable 5.2 xhigh |
|     18 |        — |       10 |        5 | 1、2、3、4、5、6、7、8、9、10、12、14、15、16、17、18、19、20         | Gemini 4 Neon high     |
|     19 |        — |        9 |        5 | 2、3、4、5、6、7、8、9、10、11、12、13、14、15、16、17、18、19、20    | —                      |
|     20 |        — |        8 |        4 | 1、2、3、4、5、6、7、8、9、10、11、12、13、14、15、16、17、18、19、20 | Claude Fable 5.2 high  |

前沿集合 `aa-top-2`～`aa-top-10` 的 benchmark、排行列、分數與名次全部不變（release 報告各列 Δ 皆為 0）。

## 主畫面

預設集合 `aa-top-9` 不變，沒有模型進出主畫面。Coverage 的拉桿範圍改為 2～20；從 `coverage-11` 以上切回 Frontier 時，會落在最接近的 `aa-top-10`。

## 檔位推測揭露

本次沒有新增檔位推測。以下 27 筆既有推測（各來源 `validation-report.md`）因為所屬模型進入測試覆蓋最佳化集合，首次被集合計分。預設集合的推測與前一版相同（Claude Sonnet 5.5 的 `automationbench`）。

| Profile                        | 推測的 candidate                                                                             | 來源                     | Effort | 依據來源：依據列                                                                                 | 使用的 `coverage-N` |
| ------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------ | ------ | ------------------------------------------------------------------------------------------------ | ------------------- |
| anthropic-claude-fable-5-1-max | `zapier-automationbench:automationbench:claude-fable-5-1-with-opus-5-fallback-rank-37:1-0-6` | `zapier-automationbench` | max    | anthropic-releases：`anthropic-releases:cursorbench-4:fable51-max`                               | 5～8                |
| anthropic-claude-fable-5-1-max | `gbench:gbench-agentic-coding:anthropic-claude-fable-5-1`                                    | `gbench`                 | max    | anthropic-releases：`anthropic-releases:cursorbench-4:fable51-max`                               | 5～18               |
| google-gemini-4-argon-high     | `gbench:gbench-agentic-coding:google-gemini-4-argon`                                         | `gbench`                 | high   | agents-last-exam：`agents-last-exam:agents-last-exam:ale-claw-gemini-4-argon-reasoning-high:1-1` | 6～18               |
| moonshot-kimi-k3-1-pro-max     | `artificial-analysis:aa-briefcase:kimi-k3-1-pro`                                             | `artificial-analysis`    | max    | epoch-ai：`epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4`                         | 9～20               |
| moonshot-kimi-k3-1-pro-max     | `artificial-analysis:aa-omniscience:kimi-k3-1-pro`                                           | `artificial-analysis`    | max    | epoch-ai：`epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4`                         | 9～20               |
| moonshot-kimi-k3-1-pro-max     | `artificial-analysis:aa-omniscience:kimi-k3-1-pro:index`                                     | `artificial-analysis`    | max    | epoch-ai：`epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4`                         | 9～20               |
| moonshot-kimi-k3-1-pro-max     | `artificial-analysis:critpt-v2:kimi-k3-1-pro`                                                | `artificial-analysis`    | max    | epoch-ai：`epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4`                         | 9～19               |
| moonshot-kimi-k3-1-pro-max     | `artificial-analysis:frontier-code-2-0:kimi-k3-1-pro`                                        | `artificial-analysis`    | max    | epoch-ai：`epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4`                         | 9～20               |
| moonshot-kimi-k3-1-pro-max     | `artificial-analysis:gdp-pdf:kimi-k3-1-pro`                                                  | `artificial-analysis`    | max    | epoch-ai：`epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4`                         | 9～20               |
| moonshot-kimi-k3-1-pro-max     | `artificial-analysis:hle-diamond:kimi-k3-1-pro`                                              | `artificial-analysis`    | max    | epoch-ai：`epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4`                         | 9～20               |
| moonshot-kimi-k3-1-pro-max     | `artificial-analysis:terminal-bench-science:kimi-k3-1-pro`                                   | `artificial-analysis`    | max    | epoch-ai：`epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4`                         | 9～20               |
| moonshot-kimi-k3-1-pro-max     | `gbench:gbench-agentic-coding:moonshot-kimi-k3-1-pro`                                        | `gbench`                 | max    | epoch-ai：`epoch-ai:aime:moonshot-kimi-k3-1-pro-max-epoch-inspect-row-4`                         | 9～18               |
| meta-muse-spark-1-3-max        | `gbench:gbench-agentic-coding:meta-muse-spark-1-3`                                           | `gbench`                 | max    | artificial-analysis：`artificial-analysis:aa-briefcase:muse-spark-1-3`                           | 11～18              |
| meta-muse-wonder-max           | `gbench:gbench-agentic-coding:meta-muse-wonder`                                              | `gbench`                 | max    | artificial-analysis：`artificial-analysis:aa-briefcase:muse-wonder`                              | 12～18              |
| alibaba-qwen4-max-xhigh        | `artificial-analysis:aa-briefcase:qwen4-max`                                                 | `artificial-analysis`    | xhigh  | livebench：`livebench-2026-11-06:livebench-browser:qwen4-max`                                    | 13～20              |
| alibaba-qwen4-max-xhigh        | `artificial-analysis:aa-omniscience:qwen4-max`                                               | `artificial-analysis`    | xhigh  | livebench：`livebench-2026-11-06:livebench-browser:qwen4-max`                                    | 13～20              |
| alibaba-qwen4-max-xhigh        | `artificial-analysis:aa-omniscience:qwen4-max:index`                                         | `artificial-analysis`    | xhigh  | livebench：`livebench-2026-11-06:livebench-browser:qwen4-max`                                    | 13～20              |
| alibaba-qwen4-max-xhigh        | `artificial-analysis:critpt-v2:qwen4-max`                                                    | `artificial-analysis`    | xhigh  | livebench：`livebench-2026-11-06:livebench-browser:qwen4-max`                                    | 13～19              |
| alibaba-qwen4-max-xhigh        | `artificial-analysis:frontier-code-2-0:qwen4-max`                                            | `artificial-analysis`    | xhigh  | livebench：`livebench-2026-11-06:livebench-browser:qwen4-max`                                    | 13～20              |
| alibaba-qwen4-max-xhigh        | `artificial-analysis:gdp-pdf:qwen4-max`                                                      | `artificial-analysis`    | xhigh  | livebench：`livebench-2026-11-06:livebench-browser:qwen4-max`                                    | 13～20              |
| alibaba-qwen4-max-xhigh        | `artificial-analysis:hle-diamond:qwen4-max`                                                  | `artificial-analysis`    | xhigh  | livebench：`livebench-2026-11-06:livebench-browser:qwen4-max`                                    | 13～20              |
| alibaba-qwen4-max-xhigh        | `artificial-analysis:terminal-bench-science:qwen4-max`                                       | `artificial-analysis`    | xhigh  | livebench：`livebench-2026-11-06:livebench-browser:qwen4-max`                                    | 13～20              |
| alibaba-qwen4-max-xhigh        | `gbench:gbench-agentic-coding:qwen-qwen4-max`                                                | `gbench`                 | xhigh  | livebench：`livebench-2026-11-06:livebench-browser:qwen4-max`                                    | 13～18              |
| openai-gpt-6-1-terra-max       | `gbench:gbench-agentic-coding:openai-gpt-6-1-terra`                                          | `gbench`                 | max    | agents-last-exam：`agents-last-exam:agents-last-exam:codex-gpt-6-1-terra-reasoning-max:1-1`      | 15～15              |
| anthropic-claude-opus-5-max    | `gbench:gbench-agentic-coding:anthropic-claude-opus-5`                                       | `gbench`                 | max    | anthropic-releases：`anthropic-releases:cursorbench-4:opus5-max`                                 | 18～18              |
| openai-gpt-6-sol-max           | `gbench:gbench-agentic-coding:openai-gpt-6-sol`                                              | `gbench`                 | max    | anthropic-releases：`anthropic-releases:sonnet-5-5:frontier-code-1-1:gpt6sol-max`                | 18～18              |
| anthropic-claude-opus-5-max    | `vals-ai:vibe-code-bench:anthropic-claude-opus-5`                                            | `vals-ai`                | max    | anthropic-releases：`anthropic-releases:cursorbench-4:opus5-max`                                 | 19～20              |

## 程式與測試

- `generate-frontier-set.ts`：資格掃描取最多 20 個合格模型（至少 10 個）；前沿集合用前 10 個。Coverage 搜尋改為依窗口名次深度優先展開，組合前綴的原始交集已少於目前最佳者時整支剪掉。品質上限只取決於共同測試，所以搜尋時直接由交集計算並快取，只為勝出組合建立完整 cohort。同分規則改為明確比較，不依賴列舉順序。真實資料下，新舊演算法在窗口 10 與 20 的輸出完全相同，生成時間由約 25 秒降到 1.8 秒。
- 產品 `frontier` 每列新增 `representativeProfileId`。畫面與 agent 頁面據此揭露窗口第 11～20 名改用的非代表 effort。
- 範圍說明句只列出未納入的 AA 前 10 名，避免小集合列出十多個低名次模型；JSON 的 `omittedFrontierModels` 仍列出全部。agent 頁面的集合大小改由資料讀出。Models 拉桿加寬到 10rem（手機 7.5rem），讓 19 段可以拖曳。
- GPT-6.2 Sol 審查程式後，採納以下修正：
  - 有重複現行成績的 effort 改在搜尋前剔除，避免選中後建置中止。已補測試，並確認拿掉修正時該測試會失敗。
  - 第 11～20 名的 effort 揭露。
  - release 報告在窗口縮小時保留舊名次。
  - e2e 的 URL 比對 `coverage-2` 會誤配 `coverage-20`，已修正。
  - 文件用詞。
- 審查另建議範圍句依同模型數的 AA 前 N 名列出遺漏，未採納：句子已明寫「from the AA top 10」，內容正確，也與原本列出前 10 名中所有未納入模型的做法一致。
- 單元測試：benchmark-data 150 項、bench 203 項。e2e 146 項，含新增的 Coverage 拉桿最大值、20 列與無水平捲動檢查。

## 代理抽查

抽查由未參與實作的 GPT-6.2 Sol 執行（2026-11-22），以自寫的唯讀腳本進行，未使用生成器程式碼。A～D 全部相符。

**方法異動**：一開始的委派呼叫經過修正；Vals 的第一個網址回 404，改用正式網址後載入。各項都完成。

### A. 窗口 #11～#20 的資格與代表 profile

抽查代理從 AA v5.0.1 快照重建名次，依 mapping 解析身分與 effort，重算組織數（不計 AA 與 `VENDOR`，`surge-*` 算一個）與可計分 benchmark 數。窗口 20 個模型、66 個合格 profile 全部相符；#11～#20 的 AA 分數、組織數、benchmark 數與代表 effort 都和上表一致。

- 第 20 名以上沒有被錯誤略過的模型。
- 沒有未解析的 AA 列達到門檻；最高的是 Claude Haiku 5.5 (Max)，36.484544。
- #14 Claude Fable 5.1 的 AA 名次來自 `xhigh`，但 `max` 有 58 項 benchmark（`xhigh` 只有 18 項），所以代表 profile 是 `max`。

### B. 測試覆蓋最佳化集合

抽查代理用動態規劃精確搜尋整個選擇空間：合併「已處理的模型前綴、已選模型數、benchmark 交集」相同的狀態，保留依同分規則最佳者。結果 19 組 `coverage-N` 的模型與順序、所用 profile、品質上限後的完整 benchmark 清單、有效維度全部相符，非代表 effort 也與上表相同。

### C. 新舊產品比對

`aa-top-2`～`aa-top-10` 九個 preset 物件完全相同，包括 benchmark、排行列、分數與名次。兩版的 `defaultPresetId` 都是 `aa-top-9`。evidence（11,634）、profiles（299）、costs（1,102）與 29 個來源快照 ID 完全相同。

### D. 公開來源值

10 個新進窗口模型都在 `coverage-20` 中，且 `legal-research` 通過品質上限保留下來，因此各抽一筆 Vals 成績比對。觀察時間：2026-11-22 15:21:39 UTC。

| 網址                                                                       | 頁面位置與網站上的模型名稱                      | 欄位     | 期望值 | 觀察值 | 結果 |
| -------------------------------------------------------------------------- | ----------------------------------------------- | -------- | -----: | -----: | ---- |
| [Vals Legal Research Bench](https://www.vals.ai/benchmarks/legal_research) | Legal Research Bench leaderboard：GPT-6.1 Terra | All-Pass | 25.96% | 25.96% | 相符 |
| 同上                                                                       | 同上：Gemini 4 Argon                            | All-Pass | 54.81% | 54.81% | 相符 |
| 同上                                                                       | 同上：Wonder Full                               | All-Pass | 53.37% | 53.37% | 相符 |
| 同上                                                                       | 同上：Claude Fable 5.1                          | All-Pass | 55.29% | 55.29% | 相符 |
| 同上                                                                       | 同上：Kimi K3.1 Pro                             | All-Pass | 37.50% | 37.50% | 相符 |
| 同上                                                                       | 同上：Claude Opus 5                             | All-Pass | 55.29% | 55.29% | 相符 |
| 同上                                                                       | 同上：GPT-6 Sol                                 | All-Pass | 28.85% | 28.85% | 相符 |
| 同上                                                                       | 同上：Wonder                                    | All-Pass | 50.48% | 50.48% | 相符 |
| 同上                                                                       | 同上：Qwen 4 Max                                | All-Pass | 41.35% | 41.35% | 相符 |
| 同上                                                                       | 同上：Muse Spark 1.3 Max                        | All-Pass | 55.29% | 55.29% | 相符 |

AA Intelligence Index（網站顯示到整數）。觀察時間：2026-11-22 15:21:40 UTC。

| 網址                                                                 | 頁面位置與網站上的模型名稱           | 欄位                                   | 期望值 | 觀察值 | 結果 |
| -------------------------------------------------------------------- | ------------------------------------ | -------------------------------------- | -----: | -----: | ---- |
| [AA leaderboard](https://artificialanalysis.ai/leaderboards/models)  | LLM Leaderboard：GPT-6.1 Terra Max   | Artificial Analysis Intelligence Index |     51 |     51 | 相符 |
| 同上                                                                 | LLM Leaderboard：Kimi K3.1 Pro       | 同上                                   |     46 |     46 | 相符 |
| [AA model page](https://artificialanalysis.ai/models/muse-spark-1-3) | Model overview：Muse Spark 1.3 (Max) | 同上                                   |     37 |     37 | 相符 |

### E. 介面

實作代理以 Playwright 檢查（桌面 1440×900、手機 390×844）。開發模式下切到 Coverage 並把拉桿移到最右端，顯示 20 列。範圍句為「Max coverage: 20 of the 20 frontier-window models…」，並列出 Claude Fable 5.2 改用 high；頁面沒有水平捲動。拉桿移到最左端時為 `coverage-2`，範圍句列出未納入的 AA 前 10 名（#1、#2、#3、#4、#6、#7、#8、#10）。e2e 也自動檢查同一流程。顯示的 `versionId` 與本報告一致，由 release 的 e2e 對同一份匯出驗證。

## 重大變更判斷

**沒有重大變更**，依據如下：

- 所有差異都直接來自使用者 2026-11-22 的裁決：放寬窗口到 20、維持精確搜尋、只改測試覆蓋最佳化集合。
- 預設集合與前沿集合完全不變，主畫面沒有模型進出。
- 來源快照、evidence 與成本筆數不變，也沒有新增檔位推測。
- 沒有無法解釋的變化。
