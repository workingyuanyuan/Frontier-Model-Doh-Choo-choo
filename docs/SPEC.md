# 第二次重構規格

> 狀態：使用者已確認（2026-08-17）
> 本文件是這次重構的唯一權威規格。與 `docs/PROJECT_HANDOFF.md` §8「待使用者決定」衝突時，以本文件為準。
> 執行者：外部代理（Codex）。本文件假設執行者沒有讀過產生它的對話，所有必要事實都寫在裡面。

## 0. 一句話

把資料來源從 13 個收斂到 4 個，把「有幾維算幾維」的顯示規則換成「固定 benchmark 清單、每格都要有資料才顯示」，並讓每個模型的維度明細可以點開逐筆檢視。

## 1. 名詞

本文件避免縮寫。以下是會反覆出現的三個詞：

- **來源（source）**：一個公開的 benchmark 網站，例如 LiveBench。
- **維度（dimension）**：八個能力軸之一，例如 Coding。
- **顯示清單（display set）**：一組固定的 benchmark ID。模型必須在這組清單的**每一項**上都有分數，才會出現在主畫面。

## 2. 分期

| 期別 | 內容                                                   | 完成條件               |
| ---- | ------------------------------------------------------ | ---------------------- |
| 期一 | Artificial Analysis、LiveBench、DeepSWE、Frontier Code | 使用者人工審核資料無誤 |
| 期二 | 加入 Epoch.AI                                          | 同上                   |
| 期三 | 加入 Vals、ARC Prize、Zapier AutomationBench           | 同上                   |

**每一期都必須由使用者人工審核資料才算完成。** 代理不得自行判定某一期已完成。

期一未通過審核前，不得開始期二的擷取工作。

## 3. 來源

### 3.1 現行來源

| 來源 ID                  | 網站                               | 角色              | 進入期別 |
| ------------------------ | ---------------------------------- | ----------------- | -------- |
| `artificial-analysis`    | https://artificialanalysis.ai/     | ORGANIZER         | 期一     |
| `livebench`              | https://livebench.ai/              | ORGANIZER         | 期一     |
| `deepswe`                | https://deepswe.datacurve.ai/      | ORGANIZER         | 期一     |
| `frontier-code`          | https://cognition.com/frontiercode | ORGANIZER（新建） | 期一     |
| `epoch-ai`               | https://epoch.ai/                  | INDEPENDENT       | 期二     |
| `arc-prize`              | https://arcprize.org/leaderboard   | ORGANIZER         | 期三     |
| `zapier-automationbench` | https://zapier.com/benchmarks      | ORGANIZER         | 期三     |
| `vals-ai`                | https://www.vals.ai/benchmarks     | 逐 benchmark 判定 | 期三     |

### 3.2 凍結（不刪除，但不參與建置）

`data/sources/` 底下這些目錄**原地保留、內容不得修改**：

```
lech-writing  llm-stats  openai  osworld
scale-hle  terminal-bench
```

理由：原始快照是某個時間點的實況，重抓不回來。凍結成本為零。

**`epoch-ai` 於 2026-08-21 移出凍結清單**（使用者裁決）。期二正式納入這個來源，因此它的
`candidates.json`、`manifest.json`、`validation-report.md`、`evidence-index.json` 由
`refresh-epoch.ts` 重新產生，**以新抓的快照為準**。

舊快照沒有消失，也不需要另外複製一份：

- 原始 ZIP 位元組留在內容定址 artifact store（`artifacts/sha256/f8/f8ce9598….zip`），
  §8 的保存規則已經涵蓋。
- 舊的 `candidates.json` 留在 git 歷史。

兩者的用途是讓後續執行代理**對照擷取結果**——確認新舊快照之間的差異是來源真的更新了，
而不是擷取程式解析錯了。它們不是現行資料，不得再被讀進計分。

**`arc-prize` 於 2026-08-22 移出凍結清單**（使用者裁決，期三）。處置與 `epoch-ai` 完全相同：
`refresh-arc-prize.ts` 重新產生該目錄的四個檔案，以新抓的快照為準，舊快照留在 git 歷史與內容
定址 artifact store 供對照。

**`zapier-automationbench` 於 2026-08-22 移出凍結清單**（使用者裁決，期三）。處置同上：
`refresh-zapier.ts` 重新產生該目錄的五個檔案（含 `costs.json`），以新抓的快照為準；舊快照
留在 git 歷史與內容定址 artifact store 供對照。

**`vals-ai` 於 2026-08-22 移出凍結清單**（使用者裁決，期三）。`refresh-vals.ts` 從官方
benchmark index 動態枚舉每個榜單頁，再重新產生該目錄的五個檔案（含 `costs.json`）；舊快照
留在 git 歷史與內容定址 artifact store 供對照。

**建置流程必須實作來源白名單**：只讀取白名單內的來源目錄。凍結目錄即使存在也不可能被誤讀進計分。白名單以設定檔表示，不是硬編碼的 if 判斷。

### 3.3 擷取程式碼的去留

| 保留                                          | 刪除                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `materializeArtificialAnalysis`（期一要重寫） | `materializeVals`（約 406 行）                                                                     |
| `materializeEpoch`（期二要用，約 284 行）     | `organizer-materializers.ts` 中的 arc-prize、scale-hle、zapier、osworld、lech-writing（約 613 行） |
|                                               | `materialize-organizers.ts` 的整個擷取層（約 733 行）                                              |

刪除的程式碼在 Git 歷史中可取回，期三需要時再恢復。

期三的 ARC、Zapier 與 Vals 擷取器均依重新驗證後的現行網站契約從頭實作，不直接恢復遭刪除的
舊擷取器；其中 Vals 使用逐 benchmark 頁面的 BenchmarkView 資料島，不沿用舊首頁矩陣。

`materializers.ts` 目前 1,929 行，必須按來源拆成獨立模組，每個模組有自己的測試。

## 4. 五維與計分

### 4.1 維度定義

五個維度：**Reasoning、Knowledge、Coding、Agentic、Language**。

| 維度      | 定義                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| Reasoning | 依題目或輸入資訊進行推導、計算、邏輯分析與跨文件整合。數學與長脈絡推理都在其中。           |
| Knowledge | 答案主要仰賴模型既有的世界、學術或專業領域知識。                                           |
| Coding    | 最終評估端點是程式、程式修改、演算法或可執行產物，不論是否透過 agent harness 完成。        |
| Agentic   | 在可操作環境中多步執行：工具選擇、搜尋、狀態更新與任務完成，且評估端點不由程式碼產物主導。 |
| Language  | 理解與產生自然語言，並依語義、形式與使用者指定的限制控制輸出。                             |

`data/mappings/benchmarks.json` 的 `dimensions` 陣列與每筆 benchmark 的
`primaryDimension` 使用這五個值。`secondaryDimensions` 使用同一組值，維持去重，
目前只由 `coverage-matrix.ts` 讀取，不參與計分。

總分 = 五個維度分數的算術平均；維度分數 = 該維度內所有參與計分 benchmark 的算術平均。

**benchmark 的存在、識別碼與跨維度歸屬由各自的裁決管轄，改動維度集合時一律保持原狀。**
DeepSWE、Frontier Code（`frontier-code-1-1`）、Terminal-Bench 屬 `coding`，
`cyber` 屬 `agentic`。個別 benchmark 的歸屬要改，須另立提案並附該 benchmark 自己的證據。

**不建立權重系統。** 某個 benchmark 影響力過大的問題靠加來源稀釋。

### 4.2 Frontier Code 用新的 benchmark ID

**本節於 2026-08-17 修正。原本寫「直接沿用既有的 `frontierswe`，不要新增 benchmark 定義」，那是錯的。**

`benchmarks.json` 中既有的 `frontierswe` 指的是 **Proximal 的 FrontierSWE**（https://www.frontierswe.com/），與 Cognition 的 Frontier Code 是不同主辦方、不同網站、不同指標——前者是 model+harness 的 avg rank／dominance，後者是加權 rubric 百分比。兩者不可共用識別碼。

因此：

- **新增 benchmark `frontier-code-1-1`**，primary dimension = `coding`，secondary = `agentic, context`。Cognition 的分數全部歸到這個 ID。
- **`frontierswe` 保留給 Proximal**，期一不擷取，留待期三。
- `docs/BENCHMARK_DIMENSION_MAPPING.md` 與 `docs/BENCHMARK_SCORE_SOURCES.md` 要同時反映這兩個是不同的 benchmark。

### 4.3 代表 profile 的選法

同一個模型有多個思考強度的 profile 時，取**該來源測出分數最高**的那一個。

- 不判斷 effort 標籤，不假設「max 一定最好」。
- 排行榜、雷達圖、兩張圖表**全部使用同一個選法**，不得出現同一模型在不同畫面顯示不同 profile 的情況。
- 這取代現行 `SCORING_METHODOLOGY.md` 的「Coverage 高 → 有效結果數多 → Overall 高」規則。

### 4.3.1 同一個 benchmark 被多個來源重複量測時

**2026-08-21 新增（使用者裁決）：取分數較高的那一筆。**

Artificial Analysis 與 Epoch AI 都自己重跑 GPQA Diamond，兩者 `sourceRole` 都是
`INDEPENDENT`。逐模型的分數對照見 `docs/history/GPQA_AA_VS_EPOCH_2026-08-21.md`：26 個重疊的「模型 × 檔位」中，Epoch 較高
13 個、AA 較高 13 個，平均差 −0.99 分，多數落在 ±3 分內。兩邊都不系統性地偏高或偏低，因此
沒有「哪個來源比較準」這種可辯護的排序。

**規則只適用於地位相同的來源。** `sourceRole` 權重不同，或 `acquisitionStatus` 不同時，仍
維持原本的優先序：ORGANIZER 勝過 VENDOR，完整快照勝過部分快照，**再高的分數也不能翻
盤**。廠商自報的數字不會因為好看就取代第三方量測。

**2026-08-22 還原（使用者裁決）。** N5 曾把 `acquisitionStatus` 從「地位相同」的判斷中拿掉，
理由是 Artificial Analysis 的站級狀態是 `PARTIAL_SOURCE`，會讓它在重複量測中一律輸掉。該次
改動要修的實際症狀是**詳細證據面板**把同一個模型的「未標 effort」與「Max」兩列後者覆蓋前者、
顯示成錯的成本與分數——那是呈現層缺陷，已在 `model-detail-panel.tsx` 依貢獻證據 ID 去重修正，
與選取規則無關。選取規則因此還原為原文。

還原的實測影響：26 筆重複列的現行量測由 Artificial Analysis 換成 Vals AI（同為
`INDEPENDENT`，Vals 是 `FULL`），144 個 profile 中 15 個 overall 有變化，全部下降，最大
−0.43（DeepSeek V4 Pro max 與 Qwen3.8 27B xhigh），主畫面名次未變。方向符合本節原意：
**部分快照不因分數好看而翻盤。**

**這條規則之前是「碰巧成立」的。** `selectCurrentResults` 的鍵不含 `sourceId`，實際走的是
「harness 字串不同 → 比分數」這條分支；AA 的 harness 是 `null`、Epoch 是
`Epoch AI Inspect`，剛好不同，於是行為看起來就是取最高分。若哪天兩邊的 harness 欄位一致，
選擇就會靜默改由 `sourceRole` 決定。現在改成直接比 `sourceId`，讓規則不再依賴一個無關欄位
的巧合。

**期三揭露（2026-08-22）**：Vals 加入後，GPQA Diamond 變成 AA／Epoch／Vals 三方重複；
SWE-bench 是 Epoch／Vals，Terminal-Bench 2.1 是 AA／Vals。選取鍵以 `benchmarkId + profile +
metric` 認定同一量測，**不含 `benchmarkVersion`**；各站對同一 benchmark 的版本字串可能一方
缺值、一方寫 `1` 或 `2.1`，不能因此被重複計入維度平均。版本字串仍完整保留在證據中。

**因此「哪些量測算同一個 benchmark」完全由 benchmark ID 決定**（2026-08-22 使用者確認）。
需要分開計分的版本或分割，必須給它自己的 benchmark ID，不能只靠 `benchmarkVersion` 區隔。

這條的代價已由 N9 完成拆分與改名（2026-08-22）：`frontiermath`（標準版，27 筆量測、23 個 profile）與 `frontiermath-tier-4`（Tier 4，28 筆量測、24 個 profile）拆為各自獨立的 benchmark ID，恢復 47 筆獨立量測選取，消除不同難度測驗互相覆蓋之問題；ARC-AGI 亦改為以分割命名的 `arc-agi-2`（91 筆量測、88 筆 INCLUDED）。

逐模型 × 檔位對照見 `docs/history/PHASE3_DUPLICATE_BENCHMARKS_2026-08-22.md`。取最高相對中位數的
平均抬升為：GPQA 在 46 個至少雙來源重疊列為 **0.80 分**（其中 13 個三來源全齊列為 **0.85
分**）；SWE-bench 11 列為 **1.29 分**；Terminal-Bench 2.1 19 列為 **4.24 分**。最大個別抬升
分別為 2.69、4.24、14.23 分。這是「多次量測取最好」的已知向上選擇偏誤，不代表任一來源
造假；本階段維持使用者裁決的取最高規則，但必須隨報告揭露。

### 4.4 思考強度檔位

**本節於 2026-08-18 新增**，取代 `DATA_METHODOLOGY.md` 的「未標 effort 的結果歸入可判定的最高強度，不建立 `unspecified`」。那條規則寫在 Artificial Analysis 還沒有 non-reasoning 變體的年代；審核關卡 1 查出它把 110 筆明確標示 `(Non-reasoning)` 的列標成了 `max`，語義完全顛倒。

推理開關與思考檔位是**同一根軸**，不分成兩個維度：

```
non-reasoning  <  low  <  medium  <  high  <  xhigh  <  max
```

加上 `default`：來源只提供一個未命名配置時使用。`default` **不進入階梯排序**，它是「來源沒說」的誠實標記。

歸檔規則，依序套用：

1. **來源明示檔位** → 直接採用。
2. **來源名稱自報配置** → 依名稱歸檔，不需推測。
   - `(Non-reasoning)` → `non-reasoning`
   - `(minimal)` → `low`。Artificial Analysis 對 Gemini 3.5 Flash 用 `minimal`，對 Gemini 3.7 Flash 用 `low`，是同一檔的兩種寫法。
   - **例外（2026-08-22 使用者裁決）：同一個來源對同一個模型同時發布 `minimal` 與 `low` 兩列時，`minimal` 那列標為 `EXCLUDED`。**
     上一條的依據是「兩個字指同一檔」，而那是從兩個不同模型家族的用字推得的。ARC Prize 打破了這個前提——它在同一個分割裡對同一個模型同時發布兩者，而且分數差距極大（Gemini 3.6 Flash 的 `Low` 是 30.42、`Minimal` 是 2.64；Gemini 3.5 Flash-Lite 是 1.53 對 0.83）。來源自己把它們當成兩次不同的量測，就不能再假設是同一檔的兩種寫法。
     `EXCLUDED` 的處置沿用 L6 對 GPT-5.6 Sol Pro 設定列的做法：分數與出處完整保留可供查核，但不計分。沒有 `low` 兄弟列的 `minimal` 不受影響，仍依上一條歸為 `low`。
3. **跨來源推測**（下方 §4.5）。
4. 以上皆不適用 → `default`。

### 4.5 跨來源檔位推測

某來源未標檔位時，**每個其他來源對它發布過的每一個具名檔位各投一票，得票的來源數最多的檔位勝出**；平手時取較高的檔位。

只有 `INCLUDED` 列可以投票。`EXCLUDED` 列仍可為自身保留或推導 product effort 供稽核，但不得
作為其他來源的跨來源依據；否則一個尚未採用的來源仍會透過 profile 歸檔間接改變能力分數。
N5 重跑時發現暫緩採用的 Zapier 曾替 AA 的 MiniMax-M3 投 `max`，本規則已據此補強。

換句話說，問的是「**有幾個來源實際跑過這一檔**」。一個來源掃了整個階梯，也只是對每一檔各投一票，不會因為掃得多就壓過只跑一檔的來源。

**本節於 2026-08-18 從「取最高」改成「每來源一票」。** 原本的寫法讓單一來源替所有人決定：Grok 4.6 在 DeepSWE 掃過 low 到 xhigh，而 Artificial Analysis 與 Frontier Code 都只跑 high，於是 LiveBench 的未標列被判成 `xhigh`——依據是另外兩個來源從未執行過的掃描。

**本節於 2026-08-21 再改一次：從「每來源投它的最高具名檔位」改成「每來源對它發布過的每一個具名檔位各投一票」**（使用者裁決）。2026-08-18 的寫法把每個來源壓成它自己的最高檔，等於丟掉「掃階梯的來源其實也跑了大家共同的那一檔」這個事實。加入 Epoch 之後這個瑕疵才顯形：

| 來源                | 對 Grok 4.6 發布過的具名檔位  |
| ------------------- | ----------------------------- |
| Artificial Analysis | `high`                        |
| Frontier Code       | `high`                        |
| DeepSWE             | `low` `medium` `high` `xhigh` |
| Epoch AI            | `high` `xhigh`                |
| LiveBench           | （未標，就是待推測的那一筆）  |

- 舊寫法（各取最高）：`high` 2 票、`xhigh` 2 票 → 平手 → 取較高 → **`xhigh`**。LiveBench 那筆從 `xai-grok-4-6-high` 移到 `xai-grok-4-6-xhigh`，把原本八維齊全的 profile 拆成兩半，Grok 4.6 掉出主畫面。
- 新寫法（逐檔位計票）：`high` 4 票、`xhigh` 2 票 → **`high`**，而且根本用不到平手規則。

**依據是使用者的判準：其餘四個來源都測過 Grok 4.6 的 `high`。** 平手規則（取較高）保留不變——新寫法讓它幾乎不會被觸發，這正是重點：需要靠平手規則來決定的推測，本來就是證據不足的推測。

**`non-reasoning` 不得作為推測結果。** 推測只在 `low`／`medium`／`high`／`xhigh`／`max` 之間進行；若其他來源沒有任何具名檔位可依據，結果為 `default`。

理由：`non-reasoning` 是**模式宣告**，不是強度高低。把它推測到另一個來源，等於替那個來源宣告「它關掉了推理」，這比推測檔位強得多。實例：Artificial Analysis 對 Qwen3.6 27B 同時有 `(Reasoning)` 與 `(Non-reasoning)`，但前者未標檔位而落在 `default`（`default` 不是檔位），於是 `non-reasoning` 成了唯一的具名檔位，LiveBench 的裸名列因此被判定為關閉推理，該 profile 的分數還反超了真正的推理 profile。

依據：模型廠商送測時通常提供自家分數最高的配置；測試方若沒有掃過每個檔位，通常也只測最高的那一檔。

**這是本規格唯一允許的推測，並附帶強制揭露義務：**

- 每次刷新資料都必須產出**推測說明**，逐筆列出：模型、未標的來源、推測出的檔位、依據來源與依據列。
- 說明必須寫進該來源的 validation report，**不能只出現在對話或回報訊息裡**——半年後要查得到當初的依據。
- 推測結果由**使用者審核後才放行**。代理不得自行認定推測正確。
- 推測只能填**檔位**。它不得用來補分數、成本或任何其他缺值。

**不得對已依 §4.4 規則 2 歸檔的列套用推測。** `(Non-reasoning)` 就是 `non-reasoning`，不會因為別的來源標了 `max` 就被改寫。

### 4.6 維度劃分的驗算依據

維度集合以下列驗算為依據，任何調整維度數量的提案都要重跑同一套驗算。

**方法**：46 個 active benchmark、145 個 product profile。取所有「同一批 profile 同時持有
兩支成績」且 n ≥ 15 的 benchmark 配對，計算 Spearman rho，共 738 組。判準是
「組內平均 rho − 組間平均 rho」：一個維度成立，它的組內相關要明顯高於組間相關。

**整體結構**：組內平均 0.61、組間平均 0.50，分離度 **+0.10**。模型能力有很強的單一因子，
維度切分能額外解釋的部分有限。**維度只能再合併，不得再細分**，這是理由。

**收維前的八維組內相關**：

| 維度        | 可算的組數                          | 組內平均 rho |
| ----------- | ----------------------------------- | -----------: |
| math        | 5                                   |         0.78 |
| coding      | 36                                  |         0.65 |
| reasoning   | 15                                  |         0.65 |
| agentic     | 39                                  |         0.57 |
| knowledge   | 15                                  |         0.55 |
| language    | 1（livebench-language × medscribe） |         0.25 |
| context     | 1（aa-lcr × corpfin）               |         0.13 |
| instruction | 0（ifbench 共同樣本 9，不足採信）   |     無法計算 |

`context` 的兩支互相 0.13，而 aa-lcr × gpqa-diamond 為 0.87：它量的是推理能力。

**飽和度**：`livebench-mathematics` top10 均值 94.9、`aime` 99.5。跨維相關
aime × gpqa-diamond 0.78、livebench-mathematics × livebench-reasoning 0.76、
frontiermath × gpqa-diamond 0.78，與 reasoning 的組內相關（0.65）同級。數學題庫在前沿
無法區分模型，歸入 Reasoning 後由整個維度承擔其信號。

**收維後的覆蓋率**：預設 preset `free-sources-13` 的可計分 profile 為 35，
`all-sources-3` 為 38。前三名為 Fable 5、Opus 5、GPT-5.6 Sol，前 22 名內最大位移 ±2。

**五維的分離度為 +0.086。** `math` 是全表組內相關最高的一群，併入 Reasoning 使整體分離度
低於八維時的 +0.103。若日後 Reasoning 內部出現明顯的雙峰結構，處置方式是停用已飽和的
數學題庫，維度集合維持五個。

**medscribe**：與 `livebench-language` 的 rho 為 0.25，屬 Language 維度中內聚最弱的一支。
待它與其他 Language benchmark 的共同樣本達 n ≥ 20 時重新驗算歸屬（§12）。

## 5. 顯示規則

### 5.1 模型資格

**本節於 2026-08-17 放寬。** 原本要求「`release_date` 在 12 個月內」，實作後發現 `models.json` 38 筆中有 33 筆 `releaseDate` 為 null，於是整個產品母體被壓縮到只剩 5 個模型——決定誰上榜的是「哪筆 catalog 剛好填了日期」，而不是模型實際有多少成績。這與本專案的原始構想相反：**前沿與否應該由實際性能資料決定，不是由推出日期決定。**

一個模型要被納入考慮，必須同時滿足：

1. 未標記為 deprecated。
2. **不存在**「已知且早於時間窗」的 `releaseDate`。也就是說：
   - `releaseDate` 為 null → **通過**（缺欄位不構成淘汰理由）
   - `releaseDate` 在時間窗內 → 通過
   - `releaseDate` 已知且早於時間窗 → 淘汰

時間窗是設定值，預設 12 個月。它只用來**排除已知的舊模型**，不用來挑選前沿模型。

真正決定誰上主畫面的是 §5.2 的完整矩陣門檻——模型必須在顯示清單的每一項上都有分數。那本身就是以實際性能資料為準的篩選器，不需要再疊一層日期條件。

`releaseDate` 仍應盡量回填（Artificial Analysis payload 的 `release_date` 與 Frontier Code export 都有此欄位），但那是資料品質工作，不是上榜的前提。

`data/mappings/frontier.json` 的 `compositeSources`（AA Intelligence Index、Epoch ECI、Vals Index、LLM Stats Coding Index 的 Top-N 選模）**全部移除**。`manualModels` 保留，作為新品尚未被任何綜合榜收錄時的逃生口。

### 5.2 顯示清單與完整矩陣

新增設定檔 `data/mappings/display-set.json`，內容是一組固定的 benchmark ID。

- 模型必須在顯示清單的**每一項**上都有分數，才會出現在主畫面。
- 缺任何一項 → 不進主畫面，進開發者模式。
- 主畫面因此**不會出現 N/A**。
- 顯示清單是**人工維護的設定**。建置流程只驗證，不自動選擇。

移除的舊機制：Coverage 比例、`ESTIMATED` 狀態、「至少一維有分數就顯示」、「Developer mode 放寬到 1–7/8」。這些散落在約 100 處（`view-model.ts`、`leaderboard.tsx`、`table-sort.ts`、`dashboard.tsx`、`globals.css`），必須從程式、schema、測試、文件一併移除，不能只從畫面隱藏。

**完整矩陣門檻只作用於顯示，不得傳染到資料保存。**（2026-08-20 補定）

D2 將 `overallScore` 改為「八維不齊即為 null」後，`buildProduct` 內的成本投影守衛（`index.ts` 的 `materializedCosts`）語意隨之改變：原本是「這個 profile 至少有一維分數」，變成「這個 profile 必須八維全滿」，導致 183 筆成本列被整列刪除，源頭的 445 筆多 effort 成本資料在 ProductVersion 中只剩 52 筆，具備兩個以上帶成本 effort profile 的模型從 21 個變成 0 個。

規則：

- **ProductVersion 必須保存所有 `INCLUDED` 且能解析出 profile 的成本列**，不論該 profile 是否通過顯示門檻。
- `ProductCost.performance` 為 **nullable**。它是給預設圖用的便利欄位，不是保存成本的前提。
- 由**各張圖表**決定要不要濾掉 `performance` 為 null 的點：預設圖以 Overall 為 Y 軸，必須濾；進階圖以來源自己的分數為 Y 軸，不濾。

一般化的原則：**顯示規則不得決定資料保存範圍。**開發者模式與進階圖的存在意義就是呈現主畫面容納不下的資料；讓主畫面的門檻在管線階段就把資料刪掉，會讓這兩者永遠沒有東西可顯示，而且測試全綠。

### 5.2.1 動態 benchmark 集合：選定集合同時是計分基準（2026-08-22 裁決）

**狀態**：已裁決，實作在 N10a／N10b／N10c／N11，尚未落地。本節描述的是目標契約；未完成前
§5.2 的現行行為仍然有效。

期三把 active benchmark 由 24 增為 45 之後，§5.2 的門檻與計分基準分離產生了可觀測的缺陷：
八維分數用的是該 profile **碰巧擁有的全部** benchmark，主畫面 12 個模型各自用 20–42 個，
而多出來的幾乎全部來自單一來源（Vals）。同一張表上的分數因此不可互相比較。

**R1**：**選定的 benchmark 集合同時是計分基準**，不再只是顯示門檻。同一張表上的每個模型
使用同一組 benchmark、同樣的項數。

**R2**：集合內容由使用者從 §5.3 的取捨曲線報告挑選，**代理不得自行決定 preset 組成**。

裁決細目（2026-08-22，編號 D-N10-1 ～ D-N10-6）：

| 編號    | 裁決                                                                                                     |
| ------- | -------------------------------------------------------------------------------------------------------- |
| D-N10-1 | `display-set.json` 升為 `display-set-v2`，內含 `presets` 陣列與 `defaultPresetId`；不另開新檔。          |
| D-N10-2 | 該檔 `notes` 末句「Adding a benchmark here never changes a score」已被 R1 推翻，**使用者授權代理改寫**。 |
| D-N10-3 | preset 必須覆蓋**全部維度**才合法，作為 schema 驗證；不合法即建置失敗。R18 後為 5/5。                    |
| D-N10-4 | 未通過該 preset 門檻的 profile 仍計算分數，但 `rank` 一律 `null`，不與主畫面同表呈現。                   |
| D-N10-5 | preset 切換以 query 參數表示，**不新增頁面**，維持單頁靜態匯出。                                         |
| D-N10-6 | 成本圖的分數基準問題切為獨立任務 N11，不併入 N10。                                                       |

**D-N10-2 的授權範圍**：代理得修改 `display-set.json` 的 `schemaVersion`、外殼結構與 `notes`
文字，**不得修改任何 preset 的 `benchmarkIds`**。§5.3 末句「代理不得自行調整顯示清單」對
清單內容仍然完全有效。

其餘契約：

- 維度分數只用選定集合內的 benchmark 計算；被排除的量測**仍完整保留在證據面板**，缺分仍是
  `null`，不填零。顯示規則不得決定資料保存範圍（§5.2 既有原則）。
- 計分在**建置期**依 preset 各算一次，寫進 ProductVersion；不在瀏覽器計算。理由是產物是經過
  審核、帶雜湊的東西，畫面上的數字必須等於被審核的產物。
- 「同一 preset 下所有主畫面 profile 的每維分量數相同」是門檻與基準合一的推論，不需要另立
  規則，但**必須寫成測試釘住**。
- 切換 preset 時分數與名次改變是預期行為；UI 必須明示當前 preset 的 benchmark 組成與來源組成。

設計細節見 `docs/history/N10_DESIGN_PROPOSAL.md`（該文件於本節寫定後降為考證用）。

### 5.3 coverage-matrix 報告指令

新增一個報告指令（建議 `pnpm report:coverage-matrix`），輸出兩份內容：

1. **模型 × benchmark 的有無矩陣**。
2. **取捨曲線**：對每個「保留 N 個 benchmark」的規模，列出能讓最多模型完整的組合、該組合下的完整模型數、以及涵蓋幾個維度。

演算法：對 benchmark 集合窮舉子集（用 bitmask，模型的資料有無壓成 bitmask 後先做去重計數，速度足夠），對每個規模取完整模型數最大者。

**這份報告必須套用與 5.1 完全相同的資格條件。** 若在全體資料上計算，最佳化會自動選中已停跑的 benchmark 與已淘汰的模型——實測結果是產生一組 103 列、8/8 維度、看起來很漂亮、但**一個 2026 年模型都沒有、其中 63 個已 deprecated** 的答案。這是靜默失效，畫面上看不出來。

報告供使用者在每期審核時判讀，決定是否調整 `display-set.json`。**代理不得自行調整顯示清單。**

**R7（2026-08-22 裁決，取代下段的釘死做法）**：報告**不得把任何 benchmark 釘成全域必選**。
跨來源齊全降級為**預設偏好**——同分時偏好來源分散度高的子集——而不是硬性條件；當某個捨棄
來源的子集能**大幅**提高完整模型數時，該子集必須出現在報告中供使用者挑選，報告要標出每個
候選相對「來源齊全基準」的模型數增減，讓「大幅」與否可被判讀。同時報告每個 N 要列出**多個
候選子集**並標明**來源組成**，不能只給一個最佳解。實作見 N10a。

**R8（2026-08-23 裁決，修訂 R7 的呈現方式）**：報告只給**兩條曲線**，每條每個 N 只給
**一個最優解**。R7 的「每個 N 多個候選」降為選用能力（`--candidates`），預設 1。
原本以 `--require` 指定的「來源齊全基準曲線」由**來源層級的約束**取代：

1. **無約束曲線**：不限制哪些來源存活，逐 N 取完整模型數最大者。
2. **每個來源至少一個 benchmark 的曲線**：凡是持有 active benchmark 的來源，都必須在子集中
   至少出現一個 benchmark。這是**對來源**的約束，不指名任何 benchmark，因此不違反 R7。

兩條曲線並列，加上逐 N 的完整模型數差，就是挑 preset 的依據。

**R9（2026-08-23，實作 N10b 時發現並修正）**：維度覆蓋一律只算 `primaryDimension`。
`scoreProfiles` 把一個 benchmark 併入**唯一一個**維度——它的 primary——`secondaryDimensions`
不參與計分。取捨曲線報告先前用 primary ＋ secondary 計算「涵蓋幾個維度」，因此會把一個
**永遠算不出八維分數**的子集標成 8/8。R1 讓選定集合成為計分基準之後，這個差異從展示瑕疵變成
實質錯誤：那種 preset 之下每個 profile 的 Overall Score 都是 `null`。

因此報告與 preset 生成一律加上 `requireAllDimensions`：只考慮八個維度各有至少一個
primary benchmark 的子集。修正後的實測影響很大——來源齊全曲線的完整模型數上限由 13 降為
**10**，無約束曲線在 N = 8 由 31 降為 24。修正前的數字不可再引用。

技術附註：primary-only 的維度 bitmask 不再像 primary ＋ secondary 那樣迅速飽和成八個 bit，
DP 鍵因此碎裂最多 256 倍（實測來源齊全曲線 103 秒／9.9 GB）。解法是**支配剪枝**：在同一個
benchmark 數與同一個模型支援 bitmask 之下，維度 bitmask（在來源齊全曲線另含來源涵蓋 bitmask）
為另一個超集的狀態必然不劣，可直接丟棄被支配者。加入後為 3.9 秒／930 MB。

**R10（2026-08-23 裁決，釘住模型）**：「完整模型數最大化」只約束**數量**，完全不約束**哪些
模型**。實例：預設 preset 原本落在來源齊全曲線 N = 25，而 Gemini 3.7 Flash 在 46 個 active
benchmark 中有 37 個、只缺 `corpfin` 一個，於是被排除在主畫面之外；使用者裁定那樣的榜單沒有用。

因此新增 `requiredModelIds`：報告與 preset 生成只考慮**讓指定模型維持完整**的子集。清單放在
committed 的 `data/mappings/display-set-policy.json`（`display-set-policy-v1`），連同
`minModelCount`、`maxModelCount`、`defaultPresetId` 一起，生成器與報告都讀它，重跑可重現。
不是合格模型的 ID 會讓命令失敗，不會被靜默忽略。

實測：釘住 `google-gemini-3-7-flash` 之後，來源齊全曲線在 M = 10 由 N = 25 變成 **N = 20**
——**模型數不變，只少測 5 個 benchmark**。無約束曲線在 M = 13／12／11 的 N 完全不變。

**副作用（D-N10-7 的修訂）**：釘住模型對兩條曲線的收窄程度不同，可達的模型數集合因此不再
相同——來源齊全曲線上限 10，無約束曲線仍可到 24。原本「兩條曲線必須提供相同的模型數」會刪掉
無約束曲線最有價值的區段，故改為**各曲線輸出自己可達的模型數**，並在生成結果中標明哪些模型數
兩邊都有、哪些只有一邊。滑桿在只有單邊有 preset 的位置要怎麼表現，屬 N10c 的 UI 裁決。

**R11（2026-08-23 裁決，UI 呈現）**：同一個模型數只有單邊曲線有 preset 時，來源切換鈕
標成**不可用**，並如實顯示當前 preset 是否要求所有來源。兩條曲線在同一模型數產出相同
benchmark 組成時，生成器只留 `requireAllSources: true` 的那一個——留兩個等於給 UI 一個
按了不會變的開關。現況十個模型數各只有一個 preset，切換鈕全部不可用，其角色是**狀態指示**。
preset 以 `?preset=<id>` 帶在 query 參數上（D-N10-5），預設 preset 不寫入參數。

**R12（2026-08-23 裁決，完整性改為逐 profile 判定）**：一個模型算「完整」的條件是
**存在單一 product profile 具備子集中的每一個 benchmark**，不是「該模型的各 profile 聯集
起來具備」。聯集判定會把沒有任何單一 profile 可計分的模型算成完整，滑桿標示的數字因此
系統性高於實際列數（實測預設 preset 為 10 對 8）。

DP 因此改為以 **profile** 為單位：支援 bitmask 的每一位是一個 profile，完整模型數是存活
profile 背後的相異模型數（以支援 bitmask 為鍵記憶化，同一個鍵的狀態共用同一個數字）。
`requiredModelIds` 的剪枝條件相應改為「該模型的 profile bitmask 與支援 bitmask 交集為空」。

**現在 `targetModelCount` 就是主畫面的列數**，不再是上界。實測影響：來源齊全曲線上限由
10 降為 **9**，無約束曲線由 24 降為 22。預設 preset 改為 `all-sources-9`（N = 19）。

`docs/COVERAGE_MATRIX_REPORT.md` 的有無矩陣仍以模型為列、跨 profile 取聯集，另加一欄
**Best profile**（單一 profile 最多覆蓋幾個 benchmark），落差因此在報告中看得見。

**R17（2026-08-23 裁決，不計分的 benchmark 不上主畫面）**：模型明細的維度卡只列出**參與該
維度計分**的 benchmark。preset 以外的量測仍然完整保留、仍然可查，但**改放在開發者模式**。

起因是使用者審查時發現 GPT-5.6 Sol 的 Instruction 卡列出兩個 benchmark，其他模型只有一個。
分數是對的——AA 的 `ifbench` primaryDimension 為 instruction，但不在 preset 內，依 R1 不計分，
`componentCount` 為 1——錯的是顯示：那一列渲染得和計分列一模一樣，於是卡片呈現「一個分數、
兩個子項」，讀者無從得知數字怎麼算出來的。

開發者模式打開時，這些列排在 preset 自己的列之後，並標示 `not scored here`、名稱與分數淡化。
`developerMode` 由 Dashboard 一路傳到明細面板，主表格與「Excluded model cells」清單行為一致。

**R16（2026-08-23 裁決，滑桿放到 22 且預設改到無約束側）**：`maxModelCount` 由 13 改為
**22**，`defaultPresetId` 由 `all-sources-9` 改為 **`free-sources-13`（N = 28）**。

13 這個上限原本是使用者訂的，當時無約束曲線在它之下也只到 12；N13 補上兩個 xAI alias 之後
曲線整體上移，13 才真的變成綁住的那一道限制。放到 22 之後 preset 由 13 個增為 **18 個**，
滑桿位置為 `3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 16, 17, 20, 22`——**刻度不連續且上段間隔
變大**，這是資料的形狀，不是 UI 缺陷：模型數與 benchmark 數是此消彼長的，22 個模型只剩
13 個 benchmark，9 個模型則有 31 個。

預設改到無約束側的理由是主畫面要看得到 Grok 4.5／4.6。它們在**任何**來源齊全 preset 中都
不可能出現：Zapier 的 AutomationBench 沒有任何 xAI 列，而 Zapier 只有 `automationbench`
一個 benchmark，「每來源至少一個」使它成為必選（見 §9.7 與 N13）。選 13 而非 22 或 9，是
在模型數與量測深度之間取的平衡點；`free-sources-13` 同時含 Claude Fable 5、Gemini 3.7
Flash、Grok 4.6／4.5 與 Qwen3.8 Max。

切換鈕現在只在模型數 **9、8、7** 三個位置可用（兩條曲線都有 preset 且組成不同）；其餘位置
仍為狀態指示。10 以上只有無約束曲線可達，6 以下只有來源齊全曲線可達。

**R18（2026-08-24 裁決，維度集合）**：維度為 **Reasoning／Knowledge／Coding／Agentic／
Language**，定義與驗算依據見 **§4.1** 與 **§4.6**。

管轄範圍：`DIMENSION_IDS`（`packages/benchmark-data/src/index.ts`）、
`data/mappings/benchmarks.json` 的 `dimensions` 與每筆 `primaryDimension`／
`secondaryDimensions`、`coverage-matrix.ts` 的維度 bitmask、雷達圖軸數、
`docs/SCORING_METHODOLOGY.md`、`docs/BENCHMARK_DIMENSION_MAPPING.md`。

§5.2 的完整性判定逐維度進行，因此維度集合變動時取捨曲線與 `presets[]` 全部重新產生。
preset 的組成依 **R2** 由使用者從曲線報告挑選。

**R19（2026-08-24 裁決，完整性閘門與 partial-coverage 清單）**：`overallScore` 與 `rank`
只給**五個維度全部非 null** 的 profile。

判準依據：

1. **逐維度剔除測試**：對預設 preset 上 35 個完整 profile 各拿掉一個維度重排，
   Spearman rho 為 0.94–0.99，最大名次位移 8 名（35 名中）。名次是榜單的產出，
   這個量級的位移落在可接受範圍之外。
2. **維度補值的精度**：用其餘四維預測缺的那一維，MAE 3.5–8.1 分；`knowledge`
   的 MAE 8.07 對上該維 sd 11.75。缺的維度不具備可補算的精度。
3. **缺失分佈**：覆蓋 5 維的 35 個 profile 在其持有 benchmark 上的平均 z 為 +0.114，
   只覆蓋 4 維的 31 個為 −0.188，且其中 27 個缺的是 Language。維度缺失與能力水準相關，
   缺維計分的分數與主榜不同度量。

「五缺一」的 profile 進入**獨立的 partial-coverage 清單**：標示缺少的維度與已有的各維度
分數，不給 `overallScore`、不給名次、不與主榜同表排序。

**R20（2026-08-25 裁決）：該清單放在開發者模式，預設不顯示。** 它報告的是資料缺口，
與「Excluded model cells」同一性質，位置比照 §5.4：開發者模式關閉時整個區塊不渲染。

**指令介面（N10a／R8 之後）**：

```bash
# 標準審核用法：兩條曲線 ＋ 逐 N 對照，從 N = 來源數起算
pnpm report:coverage-matrix

# 想看每個 N 的多個候選時才加
pnpm report:coverage-matrix -- --candidates=5

# 調整報告起算的最小 N
pnpm report:coverage-matrix -- --min-n=12
```

`--candidates` 預設 1，`--min-n` 預設為「持有 active benchmark 的來源數」。`--min-n` 是
**呈現下限，不是可行性下限**：跨來源的 benchmark（例如 `gpqa-diamond` 同時屬於三個來源）
一格就能覆蓋多個來源，所以來源齊全曲線在更小的 N 也可能有解，只是不列出。
`--require` 仍在，改為同時約束兩條曲線，預設為空；不是 active benchmark 的 ID 會讓命令失敗，
不會被靜默忽略。候選排序仍為：完整模型數 ↓ → 維度覆蓋數 ↓ → `exclusiveSources` ↓ →
`maxSourceShare` ↑ → `benchmarkIds` 字典序 ↑。

**精度限制（報告本文亦有揭露）**：DP 以 `(模型支援 bitmask, 維度 bitmask)` 為鍵（來源齊全
曲線另外把來源涵蓋 bitmask 併入鍵，否則涵蓋不足的狀態會被同支援度的狀態剪掉），每個鍵只保留
前 k 個狀態，因此結果是**每個（鍵, N）的前 k 佳**，不是每個 N 的全域前 k 佳。k = 1 時仍成立。
要在無約束曲線上恢復全域精確性必須把 `exclusiveSources` 併入 DP 鍵，實測代價是狀態數 2.21×、
記憶體 2.68×，需使用者裁決後才可實作。

下段是 R7 之前的做法，保留為沿革：

**必選 benchmark（2026-08-22 新增，已由 R7 取代）**：報告接受 `--require`，把指定的 benchmark 釘進每一個候選組合。未加約束時最佳化可以靠**移除整個來源**來衝高模型數——實例是 2026-08-22 的 N=17，它把 `frontier-code-1-1` 拿掉才到 15 個模型。使用者已裁決 `deepswe-1-1` 與 `frontier-code-1-1` 是必要來源，因此期二之後的審核以
`--require=deepswe-1-1,frontier-code-1-1` 執行。R7 之後這個旗標仍在，但語意改為「基準曲線」，
不再約束主曲線。

### 5.4 開發者模式

只負責一件事：顯示被排除的模型缺哪些格子。

- 顯示模型 × benchmark 矩陣，每格顯示該 benchmark 的**原始 normalized 分數**（有資料時）。
- **不做任何加總**：不算維度分數、不算總分。缺格的模型與主畫面模型的分母不同，聚合出來的數字會被誤用。

### 5.5 ProductVersion 的 `frontier` 是模型集合，不帶 profile

**本節於 2026-08-21 新增。** 先前規格沒有定義 `frontier` 的結構，實作因此替每一列造了一個
`<modelId>-unspecified` 的 `profileId`。那個值不指向任何真實 profile——53 列全部無法解析——
而且正好違反 §4 的「UI 和產品計分不建立 `unspecified` effort」。

`frontier` 回答的是**哪些模型還在追蹤範圍內**（`model-catalog` 中 12 個月資格窗內仍活躍者，
加上 `frontier.json` 的 `manualModels` 逃生口），這是**模型層級**的問題，與思考強度無關。
因此每一列只有：

- `modelId`
- `reasons`：入選理由，至少一條
- `externalCompositeScores`：§8 移除 `compositeSources` 後恆為空物件，保留欄位以免 schema 再變

**不得**有 `profileId`。同一理由適用於 `frontier.json` 的 `manualModels` 條目。

`frontier` 的唯一消費者是主畫面「Dataset at a glance」的 **Frontier models** 與
**Awaiting direct evidence** 兩個計數，兩者都只取 `modelId`。

## 6. 介面

### 6.1 保留的區塊

1. **排行榜**：總分、五維分數（R18 前為八維）、排序、搜尋、思考強度選擇，以及列內展開的模型明細（見 6.2）。
2. **五維雷達圖**（R18 前為八軸）。
3. **性價比圖表**（兩張，見 6.3）。

**三個區塊各自持有自己的選取狀態，互不驅動**（2026-08-21 決定，見 6.4）。

### 6.2 模型明細（列內展開，取代 Evidence 區塊）

參考 LiveBench 的做法：點擊排行榜的模型列，**在該列底下就地展開**該模型的詳細資料，
**按維度列出組成該維度的每一筆 benchmark 分數**。

```
Claude Fable 5 · max                        Overall 73.0

Coding      68.2
  ├ SciCode              (AA)        54.3
  ├ Terminal-Bench 2.1   (AA)        87.6
  └ DeepSWE 1.1          (DeepSWE)   62.7

Context     76.3
  └ AA-LCR               (AA)        76.3

Language    71.0
  └ LiveBench Language   (LiveBench) 71.0
```

- **明細不得是頁面下方的獨立區塊。**它只以展開列的形式存在於表格內。獨立區塊一次只能看
  一個模型，正是要修掉的問題。
- **可同時展開多列**（2026-08-21 決定）。展開一列不會收合其他列，這是「能並排比較多個模型
  明細」的唯一機制。收合由再次點擊同一列完成。
- **展開內容不刪減**：五個維度、逐 benchmark 分數與可點開的出處（§7）全部留在列內。
- **雷達圖上不加任何 benchmark 數量標記。** 軸厚不厚從明細裡自然看得出來。
- **同一個元件同時服務兩種情境**：排行榜與開發者模式清單**都是列內展開**，共用同一個
  展開元件；從開發者模式進來時，缺的格子顯示為空。不要做兩個元件，也不要讓開發者模式
  退回獨立面板。
- 現行 `evidence-detail.tsx`（282 行）的獨立 Evidence 區塊移除，功能併入本明細。

### 6.3 兩張性價比圖表

**預設圖**

- 六個已採用且具任務成本的來源加權合併，X 軸為混合後的正規化成本，Y 軸為 Overall Score。
- 每個模型每個來源取**最佳表現**那一筆（與 §4.3 同一套選法）。
- 未來新增來源時可直接擴充。

**權重：七個來源各 1/7**（2026-08-22 D4；2026-08-23 因 Zapier 採用由六改七）

來源為 Artificial Analysis、LiveBench、DeepSWE、Frontier Code、ARC Prize、Vals AI、
Zapier AutomationBench。**2026-08-23 使用者裁決：Zapier 一併納入成本圖，七個來源各 1/7。**
這符合下列第 4 點——來源採用裁決完成後直接按來源數重算，不對特定站點另給權重。Epoch 沒有成本，
同樣不在權重表。Vals 每個 benchmark 都發布成本，但只有 `vals_index` 的 `cost_per_test` 可作為
來源成本，沒有該列就不以其他 benchmark 成本頂替。

原本的 40／40／20 是三來源時代的遺留值，沒有任何依據，不是決策結果。採等權重的理由：

1. 七個來源都提供每次 task／test 的美元成本；任務大小造成的量級差距由 per-source 的 log min-max 正規化吸收。
2. 權重混合的是「模型在該來源內部的相對貴賤位置」，不是美元。沒有可辯護的證據能對這些來源的量測品質排序。
3. `sourceWeight` 會對該模型**實際具備的來源**重新正規化，缺來源不受懲罰。因此權重只在同一模型有兩個以上來源且排名不一致時才起作用。
4. 等權重讓擴充成為機械操作；來源採用裁決完成後直接按來源數重算，不任意調高特定站點。

不在權重表內的來源（例如 `model-catalog`）權重視為 0，靜默排除，這是預期行為。

**R13 — 每個來源的分數基準必須單一且具名（2026-08-23，N11 落實）**

原本非進階來源的「該來源分數」取的是「該 profile 在該來源所有 INCLUDED 列的 normalized 平均」。
這個定義的**分母會浮動**：Vals 平均二十幾個榜單，ARC／DeepSWE／Frontier Code 各只平均一個，
同一個欄位在不同列代表不同的東西。改為**七個來源各自宣告一個基準**，宣告表在
`apps/bench/lib/view-model.ts` 的 `COST_SOURCE_SCORE_BASES`：

| 來源                | 基準 benchmark                           | 取值              | 理由                                         |
| ------------------- | ---------------------------------------- | ----------------- | -------------------------------------------- |
| Artificial Analysis | `artificial-analysis-intelligence-index` | `rawScore`        | 與 `cost-per-intelligence-index-task` 同源   |
| Vals AI             | `vals-index`                             | `rawScore`        | 與 `cost-per-test` 同源，結構與 AA 相同      |
| DeepSWE             | `deepswe-1-1`                            | `normalizedScore` | 該來源唯一 benchmark                         |
| Frontier Code       | `frontier-code-1-1`                      | `normalizedScore` | 該來源唯一 benchmark                         |
| ARC Prize           | `arc-agi-2`                              | `normalizedScore` | 該來源唯一 benchmark                         |
| Zapier              | `automationbench`                        | `normalizedScore` | 該來源唯一 benchmark                         |
| LiveBench           | **無**                                   | `null`            | 見上方「LiveBench 的成本為何不能與分數配對」 |

- 兩個 composite index（AA、Vals）都是 `EXCLUDED`，值只在 `rawScore`，因此**不會**進入維度分數
  或雷達圖；這正是 `REFACTOR_DISCARD_LIST.md`「composite index 只供選模與展示」的用法。
- **LiveBench 的 `null` 是揭露，不是遺漏。**它的成本是整站一個 `cost_per_successful_task`，
  而分數在產品內拆成四個 benchmark，沒有任何一個是產生該成本的那次量測。UI 必須寫出
  「cost only, no pairable score」，不得以四項平均頂替。
- 新增來源時**必須**在該表登錄一列（可以是 `null`）；漏登錄會由單元測試擋下，不會靜默回到
  平均值。
- 這個分數不是 `ProductCost.performance`。後者是跨來源的 Overall Score，拿它當「該來源的
  分數」會讓欄位自我循環。

**R14 — 預設圖每個點必須揭露它由幾個來源構成（2026-08-23，N11 落實）**

`sourceWeight` 會對模型實際具備的來源重新正規化，缺來源不受懲罰；代價是「七個來源都有」與
「只有一個來源」的兩個點外觀完全相同。因此每個點在懸停卡與資料表都要寫出 `N of 7`，並逐來源
列出成本與分數基準。實測預設 preset（`all-sources-9`）的 9 個點為 7/7 五個、6/7 三個、
5/7 一個。

**進階圖**（按鈕開啟）

**2026-08-21 改定：進階圖從「三個來源的原始散點拼貼」改為「與預設圖同構的聚合圖」。**
原本每個模型每個來源各畫一條線，一張圖上同時存在三套座標系，只能逐條讀、無法互相比較。
現行定義是：進階圖與預設圖是**同一張圖的兩種聚合**，兩者都把各來源的成本與分數聚合成單一
座標，差別只有兩點。

1. **來源與權重**：預設圖用本節「預設圖」段落所定的全部來源等權重；進階圖依 2026-08-22
   D5 裁決只用 **Artificial Analysis、DeepSWE、Frontier Code、ARC Prize 四個來源，各 1/4**。
   ARC 同時提供可精確配對的 `arc-agi-2` 分數、任務成本與思考強度階梯。排除 LiveBench 的理由見
   下方；Vals 一模型只有一列，實測加入後為 9 個孤立點、0 個可連線模型；Zapier 依 N2 複審
   裁決延後採用。完整量測見 `docs/history/ADVANCED_CHART_SOURCES_2026-08-22.md`。
2. **思考強度**：預設圖每個模型只畫**一種**強度（§4.3 的代表 profile）；進階圖畫出**所有
   具備四來源分數的強度**，同一模型的各強度點連成一條線，讓思考強度的邊際效應看得出來。

- **入選條件逐 profile 判定**：一個 (模型 × 思考強度) 必須在四個來源上**都**有可配對的分數
  與成本才出點；缺任一來源的該強度不出點，缺了什麼由開發者模式揭露。這與預設圖的
  `sourceWeight` 重正規化（缺來源不受懲罰）**不同**，是刻意的：進階圖一條線上的各點必須落在
  同一個座標系，否則不同強度會因為來源組成不同而不可比，線的斜率隨即失去意義。
- 一個模型只有一個合格強度時仍以**孤立的點**呈現，不因為連不成線而剔除——它在同一個座標系
  上仍然可比。
- 實測（2026-08-22）：四來源合格 profile 27 個、模型 12 個，其中 5 個模型有兩個以上強度可
  連線（Claude Opus 5、Gemini 3.7 Flash、GPT-5.6 Luna／Sol／Terra），其餘 7 個為孤立點。

**進階圖的軸定義**（2026-08-21 改定，取代 2026-08-20 的 per-source 軸）

- **X 軸＝四來源各 1/4 加權的正規化成本指數**，與預設圖同一套 per-source log min-max 正規化。
  正規化的母體是該來源在產品檔內的全部任務成本，不是當前繪製的點，因此關閉序列不會讓既有
  點的 X 值移動。
- **Y 軸＝四來源各自分數的算術平均**（各 1/4）。各來源「自己的分數」的定義不變，見下方。
- **聚合只發生在 per-source 配對之後。**AA 的分數配 AA 的成本、DeepSWE 配 DeepSWE、
  Frontier Code 配 Frontier Code、ARC Prize 配 `arc-agi-2`，四組各自成立之後才做 1/4 平均。任一來源內部的成本與效能
  仍必須來自同一次量測——2026-08-20 的這條規則沒有放寬，只是套用層級從「一個點」下移到
  「一個點的四個組成」。同樣不得為了湊出 Y 軸而回頭放寬 §5.2。
- 點依思考強度階梯排序（§4.4 的 `non-reasoning < low < medium < high < xhigh < max`，
  `default` 不上梯子、單獨標示）。

**為何 Y 軸不能用 Overall Score**（2026-08-21 實測確認）

27 個合格 profile 中只有 **12 個**有 Overall Score（八維全齊），而且每個模型**正好一個**——
就是預設圖已經在畫的那一筆代表 profile。若 Y 改用 Overall Score，每條線都會塌成單一點，
進階圖將退化成預設圖的子集，失去存在意義。這是 2026-08-20「多 effort profile 多半不是 8/8」
判斷的量化證實。成因是排除 LiveBench：math 與 language 兩維只有 LiveBench 提供（§9.3），
因此進階圖來源組合本身湊不滿八維，這一點不會隨資料補齊而改變。

**為何採用原始分數平均，而非先正規化再平均**（2026-08-21 決定）

Y 軸用四來源原始分數的算術平均。已知代價：四來源的離散度不同（2026-08-22 實測於 27 個
繪製點，AA sd 7.00、DeepSWE 18.43、Frontier Code 9.29、ARC Prize 25.51），因此 **ARC Prize
與 DeepSWE 對 Y 的變異貢獻大於名目上的 1/4**。仍採用原始平均的理由：

1. **Y 保持是一個「分數」。**軸標題寫得出實際範圍（實測 14.0–68.8），符合下方「軸的縮放規則」
   不另加圖下說明的決定。先正規化的版本會讓 Y 變成相對指數，最高者永遠貼近 100、最低者永遠
   貼近 0，讀者無從得知絕對水準。
2. **不隨母體變動。**先正規化的版本中，新增或移除一個模型會讓既有所有點的 Y 值移動；原始
   平均不會。
3. **離散度代價已明示。**D5 在看過 27 個點的覆蓋與實際軸範圍後仍裁決納入 ARC Prize；不得
   透過未經裁決的 score min-max 暗中改變這個定義。

若日後判定離散度失衡不可接受，處置方式是改為「各來源先在**產品檔全母體**（非當前繪製集合）
內正規化」，而不是調整權重去補償。

**DeepSWE、Frontier Code 與 ARC Prize** 各自一個分數對一個成本，該來源的分數直接用對應
benchmark（`deepswe-1-1`、`frontier-code-1-1`、`arc-agi-2`）的 normalized 分數。

**Artificial Analysis 的 Y 軸＝AA 發布的 Intelligence Index 數值本身**（2026-08-20 決定）

AA 同一個 profile 有 6–12 個 benchmark 分數，卻只有一筆 `intelligenceIndexCostPerTask`，因此「AA 自己的分數」不唯一。定為採用 AA 發布的 Index 值，理由：

1. **與 X 軸同源。**成本 metric 就叫 `cost-per-intelligence-index-task`，它是跑完 Index 那幾項的成本。Y 用 Index 本身是「同一次量測的兩面」最字面的滿足。
2. **不自行重算就不會偏離。**Intelligence Index v4.1.1 由 9 項組成（GDPval-AA v2、τ³-Banking、Terminal-Bench v2.1、SciCode、Humanity's Last Exam、GPQA Diamond、CritPt、AA-Omniscience、AA-LCR）。AA 改版換掉評測時，自行平均會安靜地與官方數字分岔，且不會有任何測試失敗。
3. **既有邊界允許。**`REFACTOR_DISCARD_LIST.md` 的規則是 composite index「只選模和展示，不投入八維」。圖表軸屬於展示。materializer 已將它記為 `benchmarkId: 'artificial-analysis-intelligence-index'`、`inclusion: 'EXCLUDED'`，該標記保證它不會污染雷達圖或 Overall Score。

**明確禁止**：以「該 profile 下所有 INCLUDED 的 AA benchmark 算術平均」作為 Y 軸。產品內 AA 的 INCLUDED benchmark 有 12 個，其中 `aa-briefcase`、`apex-agents`、`ifbench` **不在 Index 內**，成本並未涵蓋它們；且各 profile 的分母在 6–12 之間浮動，導致不同模型、甚至同一模型的不同 effort 落在不同座標系，線的斜率因而失去意義。實測兩種算法最大相差 2.93 分（`google-gemini-3-1-pro-preview-high`：Index 9 項為 52.24，全 AA 平均為 49.31）。

**備案**（僅在 Index 值尚未取得時）：以**恰好那 9 項**的算術平均代替，且 **9 項必須全齊才出點**，缺一項不畫，絕不做部分平均。代價：目前 50 個帶成本的 AA profile 中只有 33 個 9 項齊全，僅 7 個模型保有兩個以上 AA effort 點。

上述兩項擷取缺口（Index 值未擷取、`gdpval-aa` 缺 17 筆）由 §C7 處理。

**LiveBench 的成本為何不能與分數配對**

LiveBench 的成本欄位是 `cost_per_successful_task`（見 `pricing-materializers.ts` 的 `materializeLiveBenchCosts`），有兩個性質使它無法用於進階圖：

1. **它沒有思考強度維度。**LiveBench 的成本 CSV 每個模型只有一列，實測 0 個模型具備兩個以上 effort 的成本。沒有可連成線的點。
2. **它的分母是成功次數，效能已經內含在成本裡。**表現差的模型會因為分母變小而顯得更貴。把它放上「效能 vs. 成本」的散布圖，等於讓 X 軸包含 Y 軸的資訊。AA 的 cost per Intelligence Index task、DeepSWE 的 mean agent task cost、Frontier Code 的 mean rollout cost 都是**每次嘗試**的平均成本，與成功率無關，不具這個性質。
3. 另外，LiveBench 的成本掛在 `benchmarkId: 'livebench'`（整站一個值），但它的分數在本專案是拆成 `livebench-reasoning`、`-mathematics`、`-language`、`-instruction-following` 四個 benchmark 進入產品。**沒有一個「LiveBench 分數」可以和這個成本配對。**

第 2 點對預設圖同樣成立，程度較輕（權重 1/7、且經 log 正規化後只影響相對位置）。**這是一個已知且已揭露的偏誤：它會讓預設圖的品質—成本相關性看起來比實際更乾淨。**目前選擇保留全來源等權重；若日後判定失真不可接受，應另行裁決是否移除 LiveBench，不得暗中調整權重補償。

**成本語意規則（重要）**

- Artificial Analysis 的 **token 單價**（`pricing.price_1m_*`）**不進成本圖**。它與 LiveBench 的 `cost_per_successful_task`、DeepSWE 的 `mean_cost_usd` 是不同的東西，混在同一根軸上會導致錯誤的選模決定，而且看不出來錯在哪。
- Artificial Analysis 進成本圖的是它自己的**任務成本**（`intelligenceIndexCostPerTask`），從 `/models` 或 `/models/<slug>` 頁面取得。
- **Zapier AutomationBench 的成本標記（2026-08-22 使用者裁決）**：來源值 `—` 是缺值，保存為
  `null`，不得填零。`$0.61*` 的星號只標示 Gemini 3.7 Flash 另有至 2026-12-31 的促銷價；
  頁面明示排行榜的 `Cost / task` 仍採標準牌價，因此成本保存為 `0.61`。原始字串 `$0.61*`
  與完整註腳必須保留在出處／validation report 中；促銷價 `$0.30` 不得取代排行榜量測成本。
  `$0.09†` 的註腳明示它是專用部署定價，不能直接與其他列的按 token API 成本比較，因此該列
  的分數值照常保存在 CandidateResult，但不產生 CostRecord。該列的計分狀態依 §9.7 的
  2026-08-23 採用裁決，現為 `INCLUDED`。原始字串與註腳同樣保留供查核。

**軸的縮放規則**（2026-08-21 補定）

兩張圖的四根軸都**依當前繪製的資料動態縮放**，沒有任何一根寫死 0–100：預設圖的 Y
（Overall Score）與 X（成本指數）、進階圖的 Y（四來源平均分數）與 X（四來源成本指數）。

2026-08-21 進階圖改為聚合圖後，它的 X 從 USD 變成與預設圖同單位的成本指數（見上方「進階圖
的軸定義」），因此兩張圖的 X 軸可以直接對照解讀；但兩者的權重組成不同（七來源各 1/7 vs.
四來源各 1/4），數值不等價，軸標題必須各自寫出自己的實際範圍。

- 定義域取自**當前實際畫出來的點**，不是全體資料。進階圖有序列被關閉時（見下），關閉的
  序列不參與定義域計算，軸要跟著重算。
- 上下各留一點邊距，並收斂到整齊的刻度值，避免出現 61.37 這種刻度。
- 只剩一個點、或所有點同值時仍須產生有寬度的定義域，不得除以零或畫出退化的軸。
- **軸標題必須寫出實際範圍**（例如 `Overall Score (60–75, higher is better)`），取代寫死的
  `0–100`。這是截斷軸唯一的揭露方式：2026-08-21 決定不另加圖下說明文字，因此標題與刻度
  是讀圖者判斷比例的全部依據，不得省略。

**進階圖的序列可見性**（2026-08-21 補定）

進階圖的可讀性會被少數高成本模型破壞——它們把 X 軸拉長，其餘曲線全被擠在左緣。右側圖例
因此是**可見性控制**：每一條序列可以個別關閉與開啟，關閉的序列不畫線、不畫點，也不參與軸的
定義域。

2026-08-21 進階圖改為聚合圖後，**一條序列＝一個模型**（原本是一個模型的一個來源），圖例標題
隨之從 `Sources and effort profiles` 改為以模型為單位；實測序列數由 42 降為 13。這本身就是可
讀性的主要改善，可見性控制仍然保留。控制項必須是原生可聚焦元件（例如
`<input type="checkbox">`），不得用 `role` 覆寫 `<li>`——那會同時破壞 list 結構並觸發
nested-interactive，是已經實測過的 axe serious 違規。

**資料點的懸停資訊**（2026-08-21 補定）

兩張圖的資料點不得依賴 SVG 原生 `<title>` 顯示明細。瀏覽器對原生 tooltip 有固定約
一秒的延遲且無法由 CSS 或屬性調整，使得「掃過圖上幾個點比較」這件事實際上做不到。
改為自繪的懸停卡片，指標進入即顯示（無延遲），離開即消失。原有的 `aria-label`
文字說明必須保留，無障礙資訊不得因此變少。

### 6.4 區塊之間的選取解耦（2026-08-21 決定）

先前排行榜有一個全域的「選中模型」，同時決定雷達圖畫誰、成本圖高亮誰、下方明細面板
顯示誰。結果是三個區塊被綁成一組，無法各自比較不同的模型組合。改為：

- **排行榜**：點擊模型列只做展開／收合，是該表格的區域狀態，不影響其他任何區塊。
- **五維雷達圖**：自己持有一組比較模型。預設載入 Overall 第 1 名一個模型，使用者可自行
  新增與移除，上限維持 3 條序列。它不再從排行榜取得 active profile，也沒有
  `onClearActiveProfile` 這類跨區塊回呼。
- **性價比圖表**：自己持有高亮的模型，由圖例或資料點的點擊決定，不再接受外部
  `selectedProfileId`。

三個區塊之間不得再新增任何隱含的選取連動。

## 7. 出處記錄

每一筆分數目前存了 8 組出處記錄（`model.rawName`、`rawScore`、`sourcePublishedAt`、`sourceRole`、`metric.id`、`benchmarkId`、`profile`、`profile.harness`），佔 ProductVersion 檔案的 26.1%。這 8 組在四來源架構下永遠指向同一個地方——LiveBench 一列就是 CSV 的一行，DeepSWE 一列就是 JSON 的一個物件，Artificial Analysis 一列就是 payload 的一個模型物件。

**改成每筆分數存 1 組**：

```json
{
  "sourceUrl": "https://livebench.ai/table_2026_06_25.csv?v=...",
  "locator": "table_2026_06_25.csv row 12 column reasoning",
  "method": "EXPORT",
  "retrievedAt": "2026-08-17T…Z",
  "evidenceId": "sha256:…"
}
```

- `evidenceId` **必須保留**。它指向 `artifacts` 的內容定址存檔，是「這個版本的數字沒有被改過」的憑據，也是不可變版本設計的地基。
- 介面上點開一格時顯示：來源網址（可點）、`rawScore`（擷取到的原始值）、`locator`、`retrievedAt`。使用者的實際審查動作就是打開來源網址、比對分數是否一致，介面只需支援這件事。
- 這是 breaking change，`schemaVersion` 要升版。

## 8. 刪除清單

| 對象                                                            | 數量             | 說明                                                                                          |
| --------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `data/product/versions/*.json`                                  | 21 個，14 MB     | 舊格式，改版後讀不出來。它們是**算出來的結果**不是原始資料，且 Git 有紀錄可取回               |
| `packages/{connectors,contracts,db,presentation,radar,scoring}` | 6 個目錄，1.3 MB | Git 未追蹤，內容只有 `dist`／`.turbo`／`node_modules`，原始碼在 Git 歷史（各 3–11 個 commit） |
| Vals 與 5 個 organizer 的擷取程式                               | 約 1,346 行      | 見 §3.3                                                                                       |
| Coverage／ESTIMATED 相關程式                                    | 約 100 處        | 見 §5.2                                                                                       |
| `evidence-detail.tsx`                                           | 282 行           | 功能併入模型明細面板                                                                          |
| `data/product/pointers/`                                        | 整個目錄         | 發布機制簡化，見 §11                                                                          |
| `LLM_BENCH_CHANNEL` 環境變數與 DRAFT／PUBLISHED 雙軌            | —                | 同上                                                                                          |
| publish／rollback 指令與其狀態機、測試、CI 步驟                 | —                | 同上                                                                                          |

**不刪除**：

- `N:/Coding/codex-gemini-orchestrator/worktrees/llm-bench-frontend`（在倉庫外，內容未經檢視）。
- §3.2 的凍結來源目錄。

**文件修正**：`docs/PROJECT_HANDOFF.md` 目前寫著「有多個舊不可變 Draft 是正常審計歷史，不要為『整理』而刪除」。那句話寫在「舊版本還讀得出來」的前提下，改版後失效，必須一併修正，不要留下互相矛盾的文件。

## 9. 各來源的擷取契約

以下端點與欄位名稱都是 2026-08-17 實測確認的。**開工前必須重新驗證一次**，網站會變。

### 9.1 LiveBench

全自動，完全結構化。目前分數是手工維護的，要改成自動擷取。

| 用途                        | 端點                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| 分數表                      | `https://livebench.ai/table_<release>.csv?v=<cacheVersion>` — 實測 40 列 × 23 個 task 欄 |
| 成本                        | `https://livebench.ai/cost_<release>.csv?v=<cacheVersion>`                               |
| 類別歸屬                    | `https://livebench.ai/categories_<release>.json?v=<cacheVersion>` — 7 個類別             |
| release 清單與 cacheVersion | `https://livebench.ai/static/js/main.<hash>.js`                                          |

- 網站首頁是 JavaScript SPA（HTML 僅約 1 KB），不要用 DOM 擷取。
- `cost_*.csv` 同時含 token 單價欄位與 `cost_per_successful_task`。兩者必須分開保存：前者是 `API_STANDARDIZED`，後者是 `MEASURED_TASK`。
- 目前核准進計分的只有四個類別：`livebench-reasoning`、`livebench-mathematics`、`livebench-language`、`livebench-instruction-following`。**LiveBench Coding、Agentic Coding、Data Analysis 未核准，不得自行納入。**

### 9.2 DeepSWE

全自動，完全結構化。目前分數是手工維護的，要改成自動擷取。

| 用途   | 端點                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| 排行榜 | `https://deepswe.datacurve.ai/artifacts/v1.1/leaderboard-live.json` — 實測 53 個 configuration 列、21 個模型 |

- 這份 JSON **本身就含完整的思考強度階梯**，是進階圖的主要資料來源。實測有 7 個模型具備 2 個以上的思考強度，其中 6 個為完整五階（low／medium／high／xhigh／max）。
- `mean_cost_usd` 保存為 `AGENT_TASK` 成本，harness 資訊留在出處記錄中。

### 9.3 Artificial Analysis

需要兩種管道。這是四個來源中最複雜的一個。

**管道一：頁面內嵌資料（主要資料來源）**

- `https://artificialanalysis.ai/evaluations/<slug>` 每個頁面嵌有 Next.js RSC payload，內含模型列，**每列 134 個欄位**。
- 解析方式：先把 HTML 中的 `\"` 還原成 `"`，再以 `"model_creator_id":` 定位每個模型物件，向外展開至括號平衡。
- **`"$undefined"` 是空值哨符，是字串不是 null。** 判斷欄位有無資料時必須同時排除 `null` 與 `"$undefined"`，否則覆蓋率會被大幅高估（實測 `briefcase` 真實覆蓋 58 列，誤判為 479 列）。
- 已知的 evaluation slug：`omniscience`、`gdpval-aa`、`apex-agents-aa`、`aa-briefcase`、`critpt`、`tau3-banking`、`gpqa-diamond`、`humanitys-last-exam`、`ifbench`、`scicode`、`terminalbench-v2-1`、`artificial-analysis-long-context-reasoning`、`mmmu-pro`、`aa-analyst-agent`、`automationbench-aa`、`enterprise-ops-gym-aa`、`harvey-lab-aa`、`itbench-aa`。
- 任務成本欄位 `intelligenceIndexCostPerTask` 在 `/models` 與 `/models/<slug>` 頁面上，是一個物件，含 `cost.total` 與 `evaluations[].weightedCostPerTask`（每個 benchmark 各自的加權成本）。**在 `/evaluations/omniscience` 頁面上，這個欄位只有舊模型有值。** 開工時必須確認要組合哪幾個頁面才能取得完整的現役模型集。

**管道二：官方 API（交叉驗證用）**

- `GET https://artificialanalysis.ai/api/v2/data/llms/models`，header `x-api-key`。實測回傳 608 列。
- 金鑰以環境變數 `ARTIFICIAL_ANALYSIS_API_KEY` 提供，寫在 gitignored 的 `.env.local`。**絕不進入 Git、artifact 或 ProductVersion。**
- 已探測確認**只有這一個端點存在**；`endpoints`、`intelligence-index`、`costs`、`v2/data`、media 相關端點皆回傳 404。
- API 的 `evaluations` 有 17 個欄位：`artificial_analysis_intelligence_index`、`artificial_analysis_coding_index`、`artificial_analysis_math_index`、`mmlu_pro`、`gpqa`、`hle`、`livecodebench`、`scicode`、`math_500`、`aime`、`aime_25`、`ifbench`、`lcr`、`terminalbench_hard`、`terminalbench_v2_1`、`tau2`、`tau_banking`。
- API 的成本只有 token 單價（`pricing.price_1m_*`），**沒有任務成本**。
- **用途是交叉驗證**：每次刷新時比對兩個管道的重疊欄位（`gpqa`、`hle`、`scicode`、`lcr`、`ifbench` 等），差異寫進 validation report。管道一是未公開的內部結構，改版時不會通知任何人，失效方式是靜默的（欄位改名後解析器仍能跑，只是全部變空）。API 是有版本號的公開契約，用來當煙霧偵測器。
- 金鑰失效時，刷新應視為 warning 而非 error，管道一仍可單獨進行。
- 兩個管道的母體不同（API 608 列 vs 頁面 479 列），比對只在交集上做。

**Artificial Analysis 目前實際跑的 benchmark（限 2026 年、未 deprecated 的 154 個 profile 列）**

| 覆蓋率  | 欄位                                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 154/154 | `gpqa`、`critpt`、`omniscience`、`hle`、`lcr`、`scicode`                                                                                          |
| 部分    | `terminalbench_v2_1` 118、`gdpval`／`gdpval_v2` 114、`ifbench` 104、`tau2` 103、`tau_banking` 96、`mmmu_pro` 91、`briefcase` 35、`apex_agents` 11 |
| 已停跑  | `multilingual_aa` 9、`mmlu_pro` 2、`livecodebench` 1、`aime25` 1                                                                                  |

**結論：Artificial Analysis 現行套件不提供 Math 與 Language。** 這兩個維度只能由 LiveBench 的 `livebench-mathematics` 與 `livebench-language` 提供。不要因為 AA 資料豐富就假設它能撐滿八維。

### 9.4 Frontier Code（新建，已驗證）

| 項目                  | 2026-08-17 實測結論                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| 完整結構化入口        | `https://cognition.com/data/frontiercode-leaderboard/data.json`（頁面前端使用的官方靜態 JSON） |
| FrontierCode 1.1 Main | 28 個模型、77 組模型 × effort 設定；77 組都有 `new_score` 與 `cost`                            |
| 思考強度              | 15 個模型有多個 effort，8 個有五級 effort；來源值 `none` 保持 null，不推測為 max/default       |
| JSON-LD 對照          | `FrontierCode 1.1 Leaderboard (Main)` Top 10 的排名、模型名與一位小數分數和完整資料 10/10 一致 |
| DOM 對照              | 渲染後 Main 榜顯示 28 列；可見 Top 10 與 JSON-LD／靜態 JSON 一致                               |
| 成本語意              | UI 定義為每次 rollout 的平均美元成本；保存為 `AGENT_TASK`／`USD_PER_TASK`                      |

- JSON-LD 仍只有 Top 10 的分數百分比，不含成本與 effort；它只作獨立對照基準。
- 靜態 JSON 同時包含 `main` 與 `extended`。本來源只物化目前預設的 `v1_1` Main；Extended 保留在內容定址 artifact，不混入 `frontier-code-1-1`。
- 19/28 個模型可由 catalog 名稱或精確 alias 解析；其餘 9 個保持 null identity，不做模糊匹配。
- 成本與思考強度皆已取得，因此 §6.3 的進階圖不需要退化成兩來源。

### 9.5 Epoch AI（期二，2026-08-21 實測）

| 項目           | 結論                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| 完整結構化入口 | `https://epoch.ai/data/benchmark_data.zip`（77 個項目，其中 64 個是 `_external` 的外部榜單鏡像）        |
| 可見比對管道   | `https://epoch.ai/data/benchmarks.csv`（渲染後的 benchmark 頁面就是讀這個檔算出「N models evaluated」） |
| 角色           | INDEPENDENT——Epoch 自己用 Inspect harness 重跑外部 benchmark                                            |
| 成本           | **沒有**。因此不進 §7 的成本權重表（權重視為 0），也不進 §6.3 的進階圖                                  |
| 思考強度       | 由 `Model version` 的後綴自報（`_low`／`_medium`／`_high`／`_xhigh`／`_max`／`_promax`）                |

**只有不帶 `_external` 後綴的檔案才算 Epoch 自己跑的證據。** `_external` 是別人榜單的鏡像，
納入等於把 LiveBench、DeepSWE 等來源重複計一次。

**可見比對的做法與其他四個來源不同，理由要寫清楚。** Epoch 的 benchmark 頁面是
client-rendered，伺服器回傳的 HTML 裡沒有任何可數的模型表格，因此無法比照 LiveBench 或
Frontier Code 去數渲染後的列數。但那些頁面顯示的「N models evaluated」是從
`benchmarks.csv` 算出來的，所以刷新改為**比對兩個管道**：ZIP 內每個被 promote 的檔案，
其「有分數的相異 `Model version` 集合」必須與 `benchmarks.csv` 中同一個 task 的集合完全
相同。不相符就讓刷新失敗。這比人工輸入一個數字更嚴格，且不需要人來數。

**promote 的檔案與對應 benchmark ID**（唯一來源是 `EPOCH_DIRECT_FILES`）：

| 檔案                           | benchmarkId              | `benchmarks.csv` 的 task               |
| ------------------------------ | ------------------------ | -------------------------------------- |
| `gpqa_diamond.csv`             | `gpqa-diamond`           | GPQA diamond                           |
| `math_level_5.csv`             | `math-level-5`           | MATH level 5                           |
| `swe_bench_verified.csv`       | `swe-bench`              | SWE-Bench verified                     |
| `otis_mock_aime_2024_2025.csv` | `aime`                   | OTIS Mock AIME 2024-2025               |
| `frontiermath.csv`             | `frontiermath`           | FrontierMath-2025-02-28-Private        |
| `frontiermath_tier_4.csv`      | `frontiermath`（Tier 4） | FrontierMath-Tier-4-2025-07-01-Private |
| `simpleqa_verified.csv`        | `simpleqa-verified`      | SimpleQA Verified                      |
| `chess_puzzles.csv`            | `chess-puzzles`          | Chess Puzzles                          |

- **Epoch Capabilities Index（ECI）恆為 `EXCLUDED`。** 它是綜合指數，納入計分等於把同一批
  成績算兩次。它只作為選模的參考證據。
- `mirrorcode.csv` 與 `mystery_game_puzzles.csv` 存在於匯出檔中，但**不 promote**：兩者都還
  沒有核可的 benchmark ID 與維度對應。要納入必須先走 §5.3 的報告與使用者裁決。
- ECI 有 553 列，涵蓋回溯到 2023 年的模型，多數不在 catalog 內；identity 解析不到的列保持
  `canonicalModelId: null`，**不做模糊匹配**。

**Pro 變體的身分判準（2026-08-22 使用者裁決）**：一個 Pro 版本要成為獨立的 catalog 模型，
必須是 **Epoch 自己把它當成獨立模型發布**——也就是 pro 出現在 `Model version` 的**前綴**、
且有自己的模型名稱。

|                    | Model version                  | 模型名稱    | 判定                             |
| ------------------ | ------------------------------ | ----------- | -------------------------------- |
| GPT-5.5 Pro        | `gpt-5.5-pro_xhigh`            | GPT-5.5 Pro | 獨立模型                         |
| GPT-5.4 Pro        | `gpt-5.4-pro-2026-03-05_xhigh` | GPT-5.4 Pro | 獨立模型                         |
| GPT-5.6 Sol「Pro」 | `gpt-5.6-sol_promax`           | GPT-5.6 Sol | **不獨立**，是基礎模型的一個設定 |

Sol 的 pro 只是同一個 model version 上的後綴，模型名稱仍是「GPT-5.6 Sol」，release date 也
與基礎模型相同，因此**歸在 GPT-5.6 Sol 之下**。

但**設定後綴形式的 pro 列不得代表基礎模型的該檔位**。它與基礎模型的 `_max` 落在同一個產品
profile，同來源、同 harness，選取會退到 `sourcePublishedAt`，於是 Pro 的 Chess Puzzles
64.00 取代了 Sol 自己的 55.00。這類列標為 `EXCLUDED`：出處與分數完整保留可供查核，但不計分。

`docs/history/DECISIONS.md` 不是現行權威，此判準以本節為準。

**`gpqa-diamond` 的跨來源重複已裁決：取最高分。** 規則與理由寫在 §4.3.1，逐模型分數對照
見 `docs/history/GPQA_AA_VS_EPOCH_2026-08-21.md`。

### 9.6 ARC Prize（期三，2026-08-22 實測）

| 項目         | 結論                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 分數         | `https://arcprize.org/media/data/evaluations.json` — 869 列，欄位 `datasetId`／`modelId`／`score`／`costPerTask`／`display` |
| 模型中繼資料 | `https://arcprize.org/media/data/models.json` — 249 列，欄位 `id`／`displayName`／`modelReleaseDate`／`providerId`          |
| 評測分割清單 | `https://arcprize.org/media/data/datasets.json` — 8 個分割                                                                  |
| 角色         | ORGANIZER（ARC Prize 自營 ARC-AGI）                                                                                         |
| 成本         | 有。`costPerTask` 為每次任務的美元成本，保存為 `AGENT_TASK`／`USD_PER_TASK`                                                 |
| 思考強度     | 寫在 `models.json` 的 `displayName` 括號後綴                                                                                |
| 分數尺度     | **0–1 的小數，不是百分比**；`rawScore` 保留原值，`normalizedScore` 為 ×100                                                  |

**只收 `v2_Semi_Private` 這一個分割**（2026-08-22 使用者裁決），對應 benchmark `arc-agi-2`，
`benchmarkVersion` 記為 `ARC-AGI-2-v2_Semi_Private`。ARC Prize 自己把這個分割標示為
「ARC-AGI-2」，它是唯一同時具備成本與完整檔位階梯的一份：214 列 `display=true`，全部帶成本。

其他分割不得混入同一個 benchmark ID：

- `v3_Semi_Private` 只有 27 列、完全沒有成本、22 列低於 1%。要納入必須先走 §5.3 的報告與裁決，
  並使用另一個 benchmark ID。
- `v1_*`、`v2_Public_Eval`、`v2_Private_Eval` 同理，目前只留在內容定址 artifact 中。

**`display=true` 是唯一的入選條件**；隱藏列與預覽列不進候選集。

**可見比對的做法與其他來源不同，理由要寫清楚。** `https://arcprize.org/leaderboard` 是
client-rendered 的 Next.js 頁面，伺服器回傳的 HTML 裡沒有任何模型列，也沒有可數的 RSC
payload，因此無法比照 LiveBench 或 Frontier Code 去數渲染後的列數；三個資料檔之間也沒有
第二個可互相印證的管道。改為兩項機器可查的完整性檢查：

1. 每一列 `display=true` 的 `modelId` 都必須在 `models.json` 中存在，否則刷新失敗。
2. 每個分割的列數變化寫進 snapshot delta，**數字倒退即讓刷新失敗**。

leaderboard 頁面仍以 `DOM` 方法擷取存證，供 §11.4 抽查清單指向一個人眼可讀的頁面。

**名稱括號後綴的判讀規則**（2026-08-22 使用者裁決，兩項）：

| 後綴形態                                          | 判讀                                                       |
| ------------------------------------------------- | ---------------------------------------------------------- |
| `(Max)`／`(XHigh)`／`(High)`／`(Medium)`／`(Low)` | 檔位，直接採用                                             |
| `(None)`、`(Thinking, None)`                      | 來源明示關閉推理 → `non-reasoning`，**不得留 null 走推測** |
| `(Thinking 16K)`、`(120K, High)` 的 `120K`        | token 預算，不是檔位；該段落忽略                           |
| `(Minimal)`                                       | 見 §4.4 規則 2 的例外                                      |
| 其他未經審核的標記，例如 `(Refine.)`              | 該列標為 `EXCLUDED`（僅限已解析出 catalog 身分的列）       |

第二列是 L4 的同一個缺陷換一個來源重演：`(None)` 留成 null 會走 §4.5 推測，實測被判成 `max`，
於是一筆關閉推理的量測代表了模型的 max 檔。§4.4 規則 2 明定來源自報的配置直接歸檔，不推測。

最後一列是 L6 的同一個道理：`GPT-5.2 (Refine.)` 是精修支架的量測，被推測成 `high` 之後以
72.90 蓋過 GPT-5.2 自己的 0.83。規則寫成**白名單**而非逐一列舉要排除的字串：括號段落只有在
是合法檔位、`minimal`、`none`、推理模式字（`thinking`／`reasoning`）或 token 預算時才算已識別；
已解析出 catalog 身分的列若帶有任何未識別的段落，該列標為 `EXCLUDED` 並在 validation report
中列出。未解析身分的列不受此規則影響——它們本來就不計分，而且那些標記正是日後身分裁決的素材。

**身分解析不做模糊匹配。** 214 列中約 123 列解析不到 catalog 身分，多數是 2024–2025 年的舊
模型與非 LLM 條目（Human Panel、Icecuber、ARChitects、NVARC、Tiny Recursion Model）。它們保持
`canonicalModelId: null`，完整名單寫在 validation report 中，供期三的身分裁決使用。

### 9.7 Zapier AutomationBench（期三，2026-08-22 實測）

| 項目       | 結論                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| 入口       | `https://zapier.com/benchmarks`（Framer 站台）                                            |
| 結構化資料 | 頁面列出的 `.mjs` 中，唯一包含 `task_completed_correctly` 的路由模組                      |
| 資料形狀   | 反引號字串四欄陣列：rank、model、score、Cost / task；版本 `1.0.6` 共 84 列                |
| 角色       | ORGANIZER（Zapier 自營 AutomationBench）                                                  |
| 指標       | API mode 的 `task_completed_correctly`，嚴格 pass/fail；`partial_credit` 只供診斷，不擷取 |
| 成本       | 每次 task 的美元成本；`—`、`*`、`†` 依 §6.3「成本語意規則」的使用者裁決處置               |
| 思考強度   | 模型名稱括號後綴；來源未標檔位的裸名保持 null，留待 §4.5                                  |
| 可見比對   | 模組內最大 rank 必須等於解析列數；2026-08-22 實測 `84 = 84`                               |

**模組定位不得寫死 Framer bundle hash。** 刷新必須先從頁面枚舉 `.mjs` URL，再依內容特徵
`task_completed_correctly` 找到唯一的路由模組；找不到或找到多個都讓刷新失敗，不得回退成空表。
測試 fixture 必須在替換 bundle hash 後仍能找到同一個特徵模組。

**成本註腳是擷取契約的一部分。** 帶 `*` 或 `†` 的列若失去對應註腳，刷新必須失敗，不能把
標記默默剝掉。每列原始成本字串連同符號保存在 Candidate provenance；validation report 同時
保存完整註腳與數值處置。

**檔位與例外沿用 §4.4。** 合法 `Max/XHigh/High/Medium/Low` 直接歸檔；同模型同時有
`Minimal` 與 `Low` 時，`Minimal` 列保留但標為 `EXCLUDED`。已解析 catalog 身分的列若日後
出現未審核括號標記，同樣保留為 `EXCLUDED`，不得讓 null effort 進入跨來源推測後代表基礎模型。

**身分解析只走 catalog 與精確 alias。** 未解析列保持 `canonicalModelId: null` 與
`profileId: null`，完整名稱清單及「未解析列數／相異名稱數」分開寫進 validation report。

**2026-08-22 N2 複審裁決：暫不採用 Zapier 來源。** 84 列分數及可比較的成本資料照常擷取、
保存與驗證，但 CandidateResult 與 CostRecord 一律標為 `EXCLUDED`；不得投入五維能力分數、
Overall Score、排行榜資格／名次或成本圖。原因是 AutomationBench 在修正 Claude Fable 5.0 的
精確 alias 後仍只覆蓋現行 12 個主畫面模型中的 9 個；若列入完整性門檻，主畫面會由 12 個降至
9 個（Grok 4.6、DeepSeek V4 Pro、Grok 4.5 退出），若只計分不設門檻，則又會形成 9 個模型被
加入低分項、3 個模型完全不受影響的不對稱。Zapier 是否正式納入來源，延至 N 階段全部完成後
另行討論；在新裁決前不得自動 promote。

**2026-08-23 使用者裁決：採用 Zapier 於產品計分（取代上段的暫緩）。** 上段暫緩的理由是
「若列入完整性門檻，主畫面會由 12 個降至 9 個」。R1／R8 之後這個理由不再成立：顯示集合由
§5.3 的取捨曲線報告挑出，`automationbench` 只是候選 benchmark 之一，被採用不等於被列入門檻。
因此：

- CandidateResult 與 CostRecord 不再因為「來源是 Zapier」而 `EXCLUDED`。**只有逐列的理由**
  才排除：未審核的括號標記，以及同模型同時有 `Minimal` 與 `Low` 時的 `Minimal` 列。
  2026-08-23 實測 84 列中 83 列 `INCLUDED`、1 列因 Minimal／Low 衝突 `EXCLUDED`；
  成本 82 列中 81 列 `INCLUDED`。
- `automationbench` 因此成為第 46 個 active benchmark（`primaryDimension` 為 `agentic`）。
  實測 66 個 profile 的 agentic 分量數 +1；16 個 profile 的 Overall Score 改變，全部下降，
  最大 −1.01（`moonshot-kimi-k2-7-code-default`）；沒有 profile 因此獲得或失去完整性。
  Zapier 另外帶進三個明示檔位的 profile（`google-gemini-3-5-flash-medium`、
  `minimax-minimax-m3-max`、`zai-glm-5-1-max`），並取代兩個 `-default` profile。
- **主畫面不受影響**：`display-set.json` 未含 `automationbench`，完整性門檻不變。
- **成本圖一併納入（2026-08-23 使用者裁決）**：`COST_SOURCE_WEIGHTS` 由六個來源各 1/6 改為
  **七個來源各 1/7**，Zapier 加入權重表。進階成本圖的四來源（D5 裁決）不受影響——它要求
  一個 profile 在四個來源上都有可配對的分數與成本，Zapier 不在那四個之內。

### 9.8 Vals AI（期三，2026-08-22 實測）

| 項目     | 結論                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| 榜單清單 | `https://www.vals.ai/benchmarks` 的 `/benchmarks/<slug>` 連結；刷新時動態枚舉，不硬編碼頁數                   |
| 單榜資料 | 各頁唯一的 `BenchmarkView` Astro island；`props` 先做 HTML entity decode，再遞迴剝除 `[type, value]`          |
| 完整性   | 每個可解析頁面的 `metadata.total_models` 必須等於 `tasks.overall` 的列數，不符即刷新失敗                      |
| 分數     | 核可榜的 `tasks.overall.*.accuracy` 是 0–100 百分比；未核可頁若使用其他量尺，只保存 raw，normalized 保持 null |
| 成本     | 保存每頁 `cost_per_test`，但依 D4 只有 `vals_index` 成本可作 Vals 的來源成本，其餘保留為 EXCLUDED             |
| effort   | 先讀 `reasoning_effort`，缺值才讀 `compute_effort`；非法值如 `0.99` 保持 null                                 |
| 角色     | 逐 benchmark 判定：Vals 自營為 ORGANIZER，重跑外部 benchmark 為 INDEPENDENT                                   |

Capability score 採單一明確白名單。N3a 核可的 13 項與 D2 核可的 10 項可產生 INCLUDED；
`aime`、N3a 未核可項目、執行時新出現但未裁決的頁面一律保存 Candidate 並標為 EXCLUDED。
`vals_index`、`vals_multimodal_index`、`time_horizon_index`、`web_search` 四個綜合指數恆不進
五維能力分數。若 index 出現新 slug，validation report 必須單獨列出，禁止自動 promote。

身分只用 catalog 與已審核精確 alias；D6 要求所有未知名稱保留原始列，但
`canonicalModelId: null`、`profileId: null`。完整未解析名稱清單每次刷新重建並寫入
`data/sources/vals-ai/validation-report.md`，來源刷新本身不得新增 catalog 或推導 alias。

**D-N13-1（2026-08-23 使用者裁決，依 D6 另開資料品質 task）**：登錄
`xai-grok-4-5` 的 alias `grok/grok-4.5` 與 `xai-grok-4-6` 的 alias `grok/grok-4.6`。

Vals 的識別走 `slugify(rawName)`，`grok/grok-4.5` 得到 `grok-grok-4-5`，對不上 modelId
`xai-grok-4-5`，也對不上 displayName `Grok 4.5`。同儕條目早已登錄同形式的 alias
（`kimi/kimi-k2.6`、`zai/glm-5.1`、`openai/gpt-5.4-mini-2026-03-17`），這兩個沒有，因此
Grok 4.5／4.6 各 21 個 INCLUDED benchmark 全數 unresolved。**只登錄這兩個**：
`grok/grok-4.5-exa`、`grok/grok-4.3` 等鄰近列維持 null，不得由此推廣成 pattern。

**R15 — alias 變更要用離線重新 materialize，不重新連網（2026-08-23）**

身分在 materialize 當下解析並寫死進 `candidates.json`，事後新增 alias 不會自己生效。重跑
網路 refresh 也能生效，但會同時帶進上游自上次刷新以來的所有變動，兩種效果在 diff 裡分不開。
因此改用 `pnpm --filter @llm-bench/acquisition rematerialize:vals`：只讀
`artifacts/sha256/` 既有 bytes，**每個 artifact 重新雜湊並必須等於
`evidence-index.json` 記錄的 id**，上游內容因而被釘住，輸出的任何差異都只能來自身分層。

實測（本次）：`candidates.json` 與 `costs.json` 各 **恰好 50 列**變動，變動欄位**只有**
`model.canonicalModelId` 與 `model.profileId`，受影響模型只有 `grok/grok-4.5` 與
`grok/grok-4.6`，列數與任何分數、inclusion、benchmarkId 皆未變。

離線與連網兩條路徑共用 `writeValsSnapshot`，不得各自寫出不同形狀的 snapshot。

## 10. 不可跨越的邊界

以下規則沿用自 `CLAUDE.md` 與 `docs/REFACTOR_DISCARD_LIST.md`，這次重構不改變它們：

- 唯一支援的 runtime app 是 `apps/bench`。
- 不得恢復舊 Web、Worker、DB、PostgreSQL、Drizzle、Docker／Compose、Edition、PREVIEW／FORMAL、Remotion/video、雙語、雙主題或多頁架構。
- 缺失分數保持 `null`／N/A，不得填零、不得推測 identity、不得用綜合指數代替五維成績。
- Model identity 只允許 canonical catalog 與精確審核過的 alias，不得 fuzzy match，不得把舊型號猜成新版。
- **D6（2026-08-22）**：期三新來源帶入的未知模型一律保留原始 Candidate，但保持
  `canonicalModelId: null`、`profileId: null`；來源刷新不得順手新增 catalog 或推測 alias。
  未解析完整名單寫入各來源 validation report；任何新增身分必須另開資料品質 task，由使用者
  逐項裁決。
- 綜合指數（AA Intelligence Index、Epoch ECI、Vals Index、LLM Stats Coding Index）不投入五維總分。
- 不重寫或刪除凍結的來源資料。
- 代理不得 push、deploy、release。commit 的規則見 §11。
- production build 不需要網路、artifact store、資料庫、Docker 或背景程序。

## 11. 發布機制

三段式的 Draft／Published／rollback pointer 狀態機**整個移除**。改成單一當前版本，由部署的 commit 決定。

### 11.1 機制

- 建置只讀 **`data/product/current.json`** 這一個固定路徑。沒有 channel、沒有 pointer、沒有環境變數切換。
- **`versionId`（內容的 SHA-256）保留**。它不是 pointer 機制的一部分，是「這個檔案沒被改過」的指紋，計算成本為零，顯示在頁尾。
- **Rollback = `git revert` 那個資料 commit，然後重新部署。** 不另外做 rollback 指令。這一點必須寫進 `docs/OPERATIONS.md`。

### 11.2 審核閘門

因為「部署 = commit」，commit 本身就是發布動作，所以它必須是審核閘門：

1. 代理刷新資料，把新的 `current.json` **寫進工作目錄，不 commit**。
2. 使用者人工審核。
3. 使用者審核通過後**明確指示**代理 commit。
4. 代理才執行 commit。

**代理不得在未獲得使用者明確指示的情況下 commit `current.json`。** 未經審核的資料因此不可能存在於 `main` 上，`main` 永遠處於「已審核、可部署」狀態。

這取代了原本「三段式流程 + 人工切 pointer」所提供的保護。把發布壓縮成一個 commit 的同時，閘門必須跟著移到 commit 上，否則保護就消失了。

### 11.3 為什麼可以這樣簡化

`versionId` 的不可變性原本靠「內容定址檔名 + 只新增不覆寫」保證。改成單一檔案後，這個保證由 **Git 本身**提供：每次資料變更是一個 commit，歷史完整、可 diff、可 revert。原本那套 pointer 狀態機是在重複 Git 已經做好的事。

### 11.4 來源刷新的常態程序

§11.2 定義了閘門，本節定義**每一次來源刷新都要走的固定流程**。它適用於所有會改動 `current.json` 的工作：定期刷新、新模型上市的臨時刷新、以及像 C7 那樣的擷取修正。

**代理的四個步驟**

1. 刷新來源，重跑 `pnpm data:build-current`，把新的 `current.json` 留在工作目錄，**不 commit**。
2. 產出一份刷新報告（`docs/refresh/<YYYY-MM-DD>.md`），內容見下。
3. **主動提示使用者抽查，並指名該查哪幾筆、怎麼查。**不得只說「請審核」。
4. 等使用者明確指示後才 commit `current.json` 與報告。

**刷新報告必須包含**

- 新舊 `versionId`、模型數、排行榜列數、evidence 筆數、成本筆數，以及各項的增減。
- **主畫面的進出**：這次新進、退出主畫面的模型，各附原因（缺哪一格 / 補上哪一格）。
- **變動最大的分數**：既有模型分數變化的絕對值前幾名。
- **檔位推測揭露表**：這次有哪些 profile 的 effort 是推測出來的，依 §4.5 的規則列出推測依據。這一項是強制的。
- **抽查清單**（見下）。
- 已知未解：擷取失敗、來源改版、無法解析的名稱。

**抽查清單的寫法**

使用者只會抽查幾筆，所以清單必須**依風險排序**，不是隨機抽樣。順序為：

1. 這次新進主畫面的模型，每個至少一筆。
2. 分數變動最大的幾筆。
3. 檔位為推測而非來源標示的 profile。
4. 每個來源至少一筆，確保四個來源都被碰到。

每一筆必須寫成**人眼可直接驗證**的形式，不是給機器用的 locator：

| 欄位     | 要求                                                         |
| -------- | ------------------------------------------------------------ |
| 網址     | 可直接點開的頁面，落在該數字所在的那一頁                     |
| 頁面位置 | 該頁上的區塊或表格名稱，以及**網站上顯示的那個模型名稱字串** |
| 欄位     | 網站上該欄的顯示名稱                                         |
| 期望值   | 我們存的值，四捨五入到與網站相同的位數                       |

驗證動作必須能被壓縮成「打開連結、找到這一列、比對一個數字」。**先前的審核已證實locator 形式的出處對人類不可讀**，代理不得把 `benchmarkId`、`profileId`、`evidenceId` 或 CSS 選擇器當成抽查指示交給使用者。

代理可先自行以子代理完成全量核對並附上結果，但那不取代使用者抽查，也不得據此自行 commit。

**使用者的決定只有三種**：通過並指示 commit、指出錯誤要求修正後重跑、或退回整批刷新。代理不得替使用者做這個決定，也不得因為「數字看起來合理」而略過提示。

## 12. 已知風險與待查項目

1. **Frontier Code 的成本與思考強度已驗證可取得**：FrontierCode 1.1 Main 有 28 個模型、77 組設定，全部有分數與成本；15 個模型有多 effort。D5 後進階圖採 AA／DeepSWE／Frontier Code／ARC Prize 四來源。
2. **Frontier Code 完整榜長度已確認為 28 個模型**；目前 9 個名稱尚無可精確解析的 catalog identity，保持 null，不影響原始 Candidate／CostRecord 的保存。
3. **Artificial Analysis 的頁面組合已於 C3 確認**：18 個 evaluation 頁面聯集取得完整現役 profile 母體，任務成本則必須另外抓 `/models/<slug>` 明細頁；`/evaluations/omniscience` 的成本欄位對現役模型是稀疏的。
4. **Artificial Analysis 的 API 交叉驗證目前無效**：3,680 次比對報出 2,335 次不一致，全部是精度差（頁面全精度 vs API 三位小數）。63% 的比對都在報警，真正的結構漂移會被雜訊淹沒。必須加容差後才具備煙霧偵測器的作用。
5. **`models.json` 的 `releaseDate` 大量缺漏**（38 筆中 33 筆為 null）。§5.1 已放寬成「缺欄位不淘汰」，但回填仍是資料品質工作。
6. **Frontier Code 的 export 會產生非法 effort 值**：Inkling 一列的 effort 被解析成 `"0.99"`，造出 `thinking-machines-inkling-0-99` 這個不存在的思考強度 profile。`profile-policy.json` 的合法值只有 `max/xhigh/high/medium/low`。
7. **Frontier Code 有 10 列 `effort` 為 null**（單一未標示設定的模型）。產品層的 fallback 會替它們推導出一個 effort，§6.3 的進階圖不得把這種推導值呈現成來源原生的思考強度階梯。
8. **一筆待查的資料異常**：Claude Opus 4.6 的 max 強度總分 53.7，high 強度 81.1，相差 27.4 分。「思考強度調高、總分掉 27 分」不合常理，可能是 profile 歸屬錯誤或稀疏證據所致。列入期一人工審核的必查項。
9. **Artificial Analysis 的金鑰曾出現在對話記錄中**，MVP 穩定後建議使用者輪換。
10. **Artificial Analysis 有兩套 Intelligence Index 欄位並存**（`intelligence_index` 與 `intelligence_index_v4_1`）。取錯欄位會排出完全不同的名單。本規格的模型資格條件（§5.1）刻意不依賴任何指數版本，正是為了避開這個坑。
11. **`medscribe` 的維度歸屬待驗**：與 `livebench-language` 的 Spearman rho 為 0.25（n=23），是 Language 維度內最弱的一支。等它與其他 Language benchmark 的共同樣本達 n ≥ 20 時重新驗算它屬於 Language、Knowledge 還是 Agentic（§4.6）。
12. **Reasoning 維度的內部結構待觀察**：五維分離度為 +0.086（§4.6）。若 Reasoning 內部出現明顯雙峰，處置方式是停用已飽和的數學題庫。
