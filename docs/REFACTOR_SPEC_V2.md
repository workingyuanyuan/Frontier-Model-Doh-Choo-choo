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
| 期三 | 加入 Vals，以及其他依實際需求追加的來源                | 同上                   |

**每一期都必須由使用者人工審核資料才算完成。** 代理不得自行判定某一期已完成。

期一未通過審核前，不得開始期二的擷取工作。

## 3. 來源

### 3.1 保留（期一）

| 來源 ID               | 網站                               | 角色              |
| --------------------- | ---------------------------------- | ----------------- |
| `artificial-analysis` | https://artificialanalysis.ai/     | ORGANIZER         |
| `livebench`           | https://livebench.ai/              | ORGANIZER         |
| `deepswe`             | https://deepswe.datacurve.ai/      | ORGANIZER         |
| `frontier-code`       | https://cognition.com/frontiercode | ORGANIZER（新建） |

### 3.2 凍結（不刪除，但不參與建置）

`data-v2/sources/` 底下這些目錄**原地保留、內容不得修改**：

```
arc-prize  epoch-ai  lech-writing  llm-stats  openai
osworld    scale-hle terminal-bench vals-ai   zapier-automationbench
```

理由：原始快照是某個時間點的實況，重抓不回來。目錄總共約 3.7 MB，凍結成本為零。

**建置流程必須實作來源白名單**：只讀取白名單內的來源目錄。凍結目錄即使存在也不可能被誤讀進計分。白名單以設定檔表示，不是硬編碼的 if 判斷。

### 3.3 擷取程式碼的去留

| 保留                                          | 刪除                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `materializeArtificialAnalysis`（期一要重寫） | `materializeVals`（約 406 行）                                                                     |
| `materializeEpoch`（期二要用，約 284 行）     | `organizer-materializers.ts` 中的 arc-prize、scale-hle、zapier、osworld、lech-writing（約 613 行） |
|                                               | `materialize-organizers.ts` 的整個擷取層（約 733 行）                                              |

刪除的程式碼在 Git 歷史中可取回，期三需要時再恢復。

`materializers.ts` 目前 1,929 行，必須按來源拆成獨立模組，每個模組有自己的測試。

## 4. 八維與計分

### 4.1 不變的部分

- 八個維度不變：Agentic、Coding、Reasoning、Math、Knowledge、Language、Context、Instruction。
- `data-v2/mappings/benchmarks.json` 的 benchmark 對維度的歸屬**完全不動**。特別是 DeepSWE、Frontier Code（`frontierswe`）、Terminal-Bench 都留在 `coding`。
- 總分 = 八個維度分數的算術平均。
- **不建立權重系統。** 某個 benchmark 影響力過大的問題，靠期二期三加來源稀釋，不靠權重調整。

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
3. **跨來源推測**（下方 §4.5）。
4. 以上皆不適用 → `default`。

### 4.5 跨來源檔位推測

某來源未標檔位時，**每個其他來源投一票（該來源對這個模型發布過的最高具名檔位），得票最多的檔位勝出**；平手時取較高的檔位。

**本節於 2026-08-18 從「取最高」改成「每來源一票的眾數」。** 原本的寫法讓單一來源替所有人決定：Grok 4.6 在 DeepSWE 掃過 low 到 xhigh，而 Artificial Analysis 與 Frontier Code 都只跑 high，於是 LiveBench 的未標列被判成 `xhigh`——依據是另外兩個來源從未執行過的掃描。每來源一票會得到 `high`，那才是有標示的來源實際同意的結果。隨著會掃階梯的來源增加，這個偏差只會更常見。

**`non-reasoning` 不得作為推測結果。** 推測只在 `low`／`medium`／`high`／`xhigh`／`max` 之間進行；若其他來源沒有任何具名檔位可依據，結果為 `default`。

理由：`non-reasoning` 是**模式宣告**，不是強度高低。把它推測到另一個來源，等於替那個來源宣告「它關掉了推理」，這比推測檔位強得多。實例：Artificial Analysis 對 Qwen3.6 27B 同時有 `(Reasoning)` 與 `(Non-reasoning)`，但前者未標檔位而落在 `default`（`default` 不是檔位），於是 `non-reasoning` 成了唯一的具名檔位，LiveBench 的裸名列因此被判定為關閉推理，該 profile 的分數還反超了真正的推理 profile。

依據：模型廠商送測時通常提供自家分數最高的配置；測試方若沒有掃過每個檔位，通常也只測最高的那一檔。

**這是本規格唯一允許的推測，並附帶強制揭露義務：**

- 每次刷新資料都必須產出**推測說明**，逐筆列出：模型、未標的來源、推測出的檔位、依據來源與依據列。
- 說明必須寫進該來源的 validation report，**不能只出現在對話或回報訊息裡**——半年後要查得到當初的依據。
- 推測結果由**使用者審核後才放行**。代理不得自行認定推測正確。
- 推測只能填**檔位**。它不得用來補分數、成本或任何其他缺值。

**不得對已依 §4.4 規則 2 歸檔的列套用推測。** `(Non-reasoning)` 就是 `non-reasoning`，不會因為別的來源標了 `max` 就被改寫。

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

`data-v2/mappings/frontier.json` 的 `compositeSources`（AA Intelligence Index、Epoch ECI、Vals Index、LLM Stats Coding Index 的 Top-N 選模）**全部移除**。`manualModels` 保留，作為新品尚未被任何綜合榜收錄時的逃生口。

### 5.2 顯示清單與完整矩陣

新增設定檔 `data-v2/mappings/display-set.json`，內容是一組固定的 benchmark ID。

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

### 5.3 coverage-matrix 報告指令

新增一個報告指令（建議 `pnpm report:coverage-matrix`），輸出兩份內容：

1. **模型 × benchmark 的有無矩陣**。
2. **取捨曲線**：對每個「保留 N 個 benchmark」的規模，列出能讓最多模型完整的組合、該組合下的完整模型數、以及涵蓋幾個維度。

演算法：對 benchmark 集合窮舉子集（用 bitmask，模型的資料有無壓成 bitmask 後先做去重計數，速度足夠），對每個規模取完整模型數最大者。

**這份報告必須套用與 5.1 完全相同的資格條件。** 若在全體資料上計算，最佳化會自動選中已停跑的 benchmark 與已淘汰的模型——實測結果是產生一組 103 列、8/8 維度、看起來很漂亮、但**一個 2026 年模型都沒有、其中 63 個已 deprecated** 的答案。這是靜默失效，畫面上看不出來。

報告供使用者在每期審核時判讀，決定是否調整 `display-set.json`。**代理不得自行調整顯示清單。**

### 5.4 開發者模式

只負責一件事：顯示被排除的模型缺哪些格子。

- 顯示模型 × benchmark 矩陣，每格顯示該 benchmark 的**原始 normalized 分數**（有資料時）。
- **不做任何加總**：不算維度分數、不算總分。缺格的模型與主畫面模型的分母不同，聚合出來的數字會被誤用。

## 6. 介面

### 6.1 保留的區塊

1. **排行榜**：總分、八維分數、排序、搜尋、思考強度選擇。
2. **八維雷達圖**。
3. **性價比圖表**（兩張，見 6.3）。

### 6.2 模型明細面板（新增，取代 Evidence 區塊）

參考 LiveBench 的做法：點擊排行榜的模型列，展開該模型的詳細資料，**按維度列出組成該維度的每一筆 benchmark 分數**。

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

- **雷達圖上不加任何 benchmark 數量標記。** 軸厚不厚從明細裡自然看得出來。
- **同一個元件同時服務兩種情境**：從排行榜點進來顯示完整明細；從開發者模式點進來，缺的格子顯示為空。不要做兩個元件。
- 每一格可以點開看出處，內容見 §7。
- 現行 `evidence-detail.tsx`（282 行）的獨立 Evidence 區塊移除，功能併入本面板。

### 6.3 兩張性價比圖表

**預設圖**

- 四個來源加權合併，X 軸為混合後的正規化成本，Y 軸為 Overall Score。
- 每個模型每個來源取**最佳表現**那一筆（與 §4.3 同一套選法）。
- 未來新增來源時可直接擴充。

**權重：四個來源各 25%**（2026-08-20 決定）

原本的 40／40／20 是三來源時代的遺留值，沒有任何依據，不是決策結果。改為等權重的理由：

1. 四個來源的成本語意一致，全部是 `USD_PER_TASK`。量級差距（LiveBench ~0.016、AA ~0.047、DeepSWE ~0.10、Frontier Code ~0.36）來自任務大小不同，已由 per-source 的 log min-max 正規化吸收。
2. 權重混合的是「模型在該來源內部的相對貴賤位置」，不是美元。沒有可辯護的證據能對四個來源的量測品質排序。
3. `sourceWeight` 會對該模型**實際具備的來源**重新正規化，缺來源不受懲罰。因此權重只在同一模型有兩個以上來源且排名不一致時才起作用。
4. 等權重讓擴充成為機械操作：Phase 2 加入 Epoch 為各 20%，Phase 3 加入 Vals 為各 16.7%，不需要重新談判。

不在權重表內的來源（例如 `model-catalog`）權重視為 0，靜默排除，這是預期行為。

**進階圖**（按鈕開啟）

- 顯示各模型**多種思考強度**的性價比曲線，同一模型的各強度點要連成線，讓思考強度的邊際效應看得出來。
- 只用 **Artificial Analysis、DeepSWE、Frontier Code** 三個來源。排除 LiveBench 的理由見下方「LiveBench 的成本為何不能與分數配對」。
- **缺任一來源資料的模型不顯示**；缺了什麼由開發者模式揭露。

**進階圖的軸定義**（2026-08-20 補定）

進階圖的多 effort profile 多半不是 8/8 完整，因此**沒有 Overall Score 可用**。軸定義為：

- **X 軸＝該來源自己的成本，Y 軸＝該來源自己的分數。**一條曲線只屬於一個來源，不跨來源聚合。
- 一個模型在一個來源上連成一條線，點依思考強度階梯排序（§4.4 的 `non-reasoning < low < medium < high < xhigh < max`，`default` 不上梯子、單獨標示）。
- 不得為了湊出 Y 軸而回頭放寬 §5.2，也不得用跨來源 Overall 去配單一來源的成本。同一個點的成本與效能必須來自同一次量測。

**DeepSWE 與 Frontier Code** 各自一個分數對一個成本，Y 軸直接用該來源的 normalized 分數。

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

第 2 點對預設圖同樣成立，程度較輕（權重 25%、且經 log 正規化後只影響相對位置）。**這是一個已知且已揭露的偏誤：它會讓預設圖的品質—成本相關性看起來比實際更乾淨。**目前選擇保留四來源等權重；若日後判定失真不可接受，處置方式是把預設圖也改為三來源各 33.3%，不是調整權重去補償。

**成本語意規則（重要）**

- Artificial Analysis 的 **token 單價**（`pricing.price_1m_*`）**不進成本圖**。它與 LiveBench 的 `cost_per_successful_task`、DeepSWE 的 `mean_cost_usd` 是不同的東西，混在同一根軸上會導致錯誤的選模決定，而且看不出來錯在哪。
- Artificial Analysis 進成本圖的是它自己的**任務成本**（`intelligenceIndexCostPerTask`），從 `/models` 或 `/models/<slug>` 頁面取得。

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

- `evidenceId` **必須保留**。它指向 `artifacts-v2` 的內容定址存檔，是「這個版本的數字沒有被改過」的憑據，也是不可變版本設計的地基。
- 介面上點開一格時顯示：來源網址（可點）、`rawScore`（擷取到的原始值）、`locator`、`retrievedAt`。使用者的實際審查動作就是打開來源網址、比對分數是否一致，介面只需支援這件事。
- 這是 breaking change，`schemaVersion` 要升版。

## 8. 刪除清單

| 對象                                                            | 數量             | 說明                                                                                          |
| --------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| `data-v2/product/versions/*.json`                               | 21 個，14 MB     | 舊格式，改版後讀不出來。它們是**算出來的結果**不是原始資料，且 Git 有紀錄可取回               |
| `packages/{connectors,contracts,db,presentation,radar,scoring}` | 6 個目錄，1.3 MB | Git 未追蹤，內容只有 `dist`／`.turbo`／`node_modules`，原始碼在 Git 歷史（各 3–11 個 commit） |
| Vals 與 5 個 organizer 的擷取程式                               | 約 1,346 行      | 見 §3.3                                                                                       |
| Coverage／ESTIMATED 相關程式                                    | 約 100 處        | 見 §5.2                                                                                       |
| `evidence-detail.tsx`                                           | 282 行           | 功能併入模型明細面板                                                                          |
| `data-v2/product/pointers/`                                     | 整個目錄         | 發布機制簡化，見 §11                                                                          |
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

## 10. 不可跨越的邊界

以下規則沿用自 `CLAUDE.md` 與 `docs/REFACTOR_DISCARD_LIST.md`，這次重構不改變它們：

- 唯一支援的 runtime app 是 `apps/bench`。
- 不得恢復舊 Web、Worker、DB、PostgreSQL、Drizzle、Docker／Compose、Edition、PREVIEW／FORMAL、Remotion/video、雙語、雙主題或多頁架構。
- 缺失分數保持 `null`／N/A，不得填零、不得推測 identity、不得用綜合指數代替八維成績。
- Model identity 只允許 canonical catalog 與精確審核過的 alias，不得 fuzzy match，不得把舊型號猜成新版。
- 綜合指數（AA Intelligence Index、Epoch ECI、Vals Index、LLM Stats Coding Index）不投入八維總分。
- 不重寫或刪除凍結的來源資料。
- 代理不得 push、deploy、release。commit 的規則見 §11。
- production build 不需要網路、artifact store、資料庫、Docker 或背景程序。

## 11. 發布機制

三段式的 Draft／Published／rollback pointer 狀態機**整個移除**。改成單一當前版本，由部署的 commit 決定。

### 11.1 機制

- 建置只讀 **`data-v2/product/current.json`** 這一個固定路徑。沒有 channel、沒有 pointer、沒有環境變數切換。
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

1. 刷新來源，重跑 `pnpm data:v2:build-current`，把新的 `current.json` 留在工作目錄，**不 commit**。
2. 產出一份刷新報告（`docs/REFRESH_<YYYY-MM-DD>.md`），內容見下。
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

1. **Frontier Code 的成本與思考強度已驗證可取得**：FrontierCode 1.1 Main 有 28 個模型、77 組設定，全部有分數與成本；15 個模型有多 effort。進階圖可維持三來源形態。
2. **Frontier Code 完整榜長度已確認為 28 個模型**；目前 9 個名稱尚無可精確解析的 catalog identity，保持 null，不影響原始 Candidate／CostRecord 的保存。
3. **Artificial Analysis 的頁面組合已於 C3 確認**：18 個 evaluation 頁面聯集取得完整現役 profile 母體，任務成本則必須另外抓 `/models/<slug>` 明細頁；`/evaluations/omniscience` 的成本欄位對現役模型是稀疏的。
4. **Artificial Analysis 的 API 交叉驗證目前無效**：3,680 次比對報出 2,335 次不一致，全部是精度差（頁面全精度 vs API 三位小數）。63% 的比對都在報警，真正的結構漂移會被雜訊淹沒。必須加容差後才具備煙霧偵測器的作用。
5. **`models.json` 的 `releaseDate` 大量缺漏**（38 筆中 33 筆為 null）。§5.1 已放寬成「缺欄位不淘汰」，但回填仍是資料品質工作。
6. **Frontier Code 的 export 會產生非法 effort 值**：Inkling 一列的 effort 被解析成 `"0.99"`，造出 `thinking-machines-inkling-0-99` 這個不存在的思考強度 profile。`profile-policy.json` 的合法值只有 `max/xhigh/high/medium/low`。
7. **Frontier Code 有 10 列 `effort` 為 null**（單一未標示設定的模型）。產品層的 fallback 會替它們推導出一個 effort，§6.3 的進階圖不得把這種推導值呈現成來源原生的思考強度階梯。
8. **一筆待查的資料異常**：Claude Opus 4.6 的 max 強度總分 53.7，high 強度 81.1，相差 27.4 分。「思考強度調高、總分掉 27 分」不合常理，可能是 profile 歸屬錯誤或稀疏證據所致。列入期一人工審核的必查項。
9. **Artificial Analysis 的金鑰曾出現在對話記錄中**，MVP 穩定後建議使用者輪換。
10. **Artificial Analysis 有兩套 Intelligence Index 欄位並存**（`intelligence_index` 與 `intelligence_index_v4_1`）。取錯欄位會排出完全不同的名單。本規格的模型資格條件（§5.1）刻意不依賴任何指數版本，正是為了避開這個坑。
