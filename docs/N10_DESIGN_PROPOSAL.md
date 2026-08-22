# N10 設計提案：動態 benchmark 集合（多甜蜜點）

狀態：**提案，未定案**。本文件不是架構權威；待使用者裁決後，決定內容才寫回
`docs/REFACTOR_SPEC_V2.md`，本檔隨即降為考證用。

依據：`tasks/claude-code-plan.md` 的裁決 R1、R2、R7。前置任務 N9 已完成。

---

## 1. 問題

現行架構把「顯示門檻」與「計分基準」分成兩件事：

- `data-v2/mappings/display-set.json` 的 17 個 benchmark 只決定**哪些 profile 能進主畫面**。
- 八維分數由 `scoreProfiles()`（`packages/benchmark-data/src/index.ts:1024`）計算，用的是該
  profile **碰巧擁有的全部** benchmark，與 display-set 無關。

期二 active benchmark 有 24 個時，主畫面 12 個模型各自用 19–22 個，差距還小；期三增為 45 個
之後變成 20–42 個，而多出來的幾乎全部來自 Vals——等於「有沒有被 Vals 量過」直接決定名次。
R1 裁決：**選定的集合同時就是計分基準**。

### 1.1 一個必須先看到的數字

45 個 active benchmark 中，**42 個只有單一來源**能提供分數，跨來源可互相印證的只有 3 個
（`gpqa-diamond`、`swe-bench`、`terminal-bench-2-1`）。單一來源的分佈是：

| 來源                | 獨佔的 benchmark 數 |
| ------------------- | ------------------: |
| vals-ai             |                  20 |
| artificial-analysis |                  10 |
| epoch-ai            |                   5 |
| livebench           |                   4 |
| arc-prize           |                   1 |
| deepswe             |                   1 |
| frontier-code       |                   1 |

所以「挑 N 個 benchmark」實質上就是「決定要放進多少 Vals」。這正是使用者「跨來源 benchmark
比同來源內多個 benchmark 更具權威」這個偏好必須進入目標函數的原因：不進去的話，任何以模型數
為唯一目標的搜尋都會被 Vals 那 20 個支配。

---

## 2. 需要使用者裁決的事項

以下六項規格未涵蓋，代理不得自行決定。編號沿用 `D-N10-*`，裁決後寫回規格與測試。

| 編號    | 決策                                                                                                                                      | 建議                                        |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| D-N10-1 | preset 放在哪裡：把 `display-set.json` 升為 `display-set-v2`（內含 `presets` 陣列），或另開 `presets.json` 而把 `display-set.json` 凍結。 | 升為 v2，同一個檔仍是審核關卡產物           |
| D-N10-2 | `display-set.json` 的 `notes` 末句「Adding a benchmark here never changes a score」已被 R1 推翻，誰改、改成什麼。                         | 授權代理在 N10 落地時一併改寫，內容由你核可 |
| D-N10-3 | preset 必須 8/8 維度覆蓋才算合法（否則該 preset 下所有模型 overall 皆 `null`）——是否接受這個硬性驗證。                                    | 接受，作為 schema 驗證                      |
| D-N10-4 | 非合格 profile（未通過該 preset 門檻）是否仍計算並顯示分數。                                                                              | 計算但不排名、不與主畫面同表呈現            |
| D-N10-5 | preset 之間切換時，URL／分享連結是否要帶 preset 參數（靜態匯出下即多一組靜態路徑或 query 參數）。                                         | 帶 query 參數，不新增頁面                   |
| D-N10-6 | 成本圖是否納入本任務，或切成獨立任務（見 §6）。                                                                                           | 切成獨立任務 N11                            |

**D-N10-2 就是先前提到「那個檔我不能改」的意思**：`display-set.json` 是審核關卡產物，內容代表
你審過後的決定，所以代理的邊界是不得修改它。它的 `notes` 欄目前寫著那句話，在 R1 之後會變成
錯的敘述留在資料檔裡。你要做的決策只有一個：**是你自己改，還是授權我改**。內容我會擬好給你
核可，不會自行決定 preset 的組成——那是 R2 明文保留給你的。

---

## 3. 設計

### 3.1 preset 的資料形狀

建議 `display-set.json` 升版：

```jsonc
{
  "schemaVersion": "display-set-v2",
  "defaultPresetId": "balanced-17",
  "presets": [
    {
      "id": "balanced-17",
      "label": "均衡 17 項",
      "benchmarkIds": ["aa-lcr", "..."],
      "notes": "本 preset 的取捨理由，由使用者填寫",
    },
  ],
}
```

- 現行的 17 項原樣成為第一個 preset，`defaultPresetId` 指向它，行為與今天相同。
- 每個 preset 自帶 `notes`，取捨理由跟著集合走，不再擠在單一欄位裡。
- `validateDisplaySet()`（`index.ts:404`）擴充為逐 preset 驗證：ID 唯一、benchmark 存在且
  active、8/8 維度覆蓋（D-N10-3）、`defaultPresetId` 必須存在。

### 3.2 計分：建置期預算，不在瀏覽器算

`scoreProfiles(results, benchmarkDimensions)` 增加第三個參數 `benchmarkIdFilter`，
在累積 `dimensionComponents` 前先過濾。每個 preset 跑一次。

**為什麼在建置期算而不是丟到前端算**：ProductVersion 是經過審核、帶雜湊的產物，計分屬於
`@llm-bench/benchmark-data` 的職責，app 只負責渲染。把計分搬進瀏覽器會讓「畫面上的數字」不再
等於「被審核的產物」，也讓 e2e 無法用產物直接驗證。

**體積代價可接受**：現行 `current.json` 2.96 MB，其中 `evidence` 2.71 MB、`leaderboard`
0.20 MB。preset 只複製 leaderboard 部分，且每個 preset 的 `evidenceResultIds` 只含該集合內的
列，會比現行更短。四個 preset 約 +0.6 MB（+20%），單一靜態檔仍在合理範圍。

### 3.3 ProductVersion schema

```jsonc
{
  "leaderboard": [ ... ],          // 保留：全 benchmark 計分，供開發者路由與診斷
  "presets": [
    {
      "id": "balanced-17",
      "benchmarkIds": [ ... ],
      "leaderboard": [ ... ],      // 只用該集合計分
      "eligibleProfileIds": [ ... ]
    }
  ]
}
```

保留原 `leaderboard` 的理由：開發者清單（`getDeveloperModelRows`）要顯示「還差哪幾項」，
以及證據面板要能呈現被排除的量測——R1 只改計分，不改證據保留（缺分仍是 `null`，不填零）。

### 3.4 「項數一致」是門檻與基準合一的推論，不是額外規則

主畫面門檻要求 profile 必須**擁有該 preset 的每一個 benchmark**
（`hasCompleteDisplaySet`，`view-model.ts:194`）。一旦計分基準等於同一個集合，所有合格 profile
的每個維度分量數就自動相同。R1 的「同樣的項數」因此不需要另寫檢查，但**要寫成測試**：
同一 preset 下任兩個合格 profile 的 `componentCount` 逐維相等。

### 3.5 非合格 profile（D-N10-4）

非合格 profile 在該 preset 下仍可算出分數，但分量數不同，**不可比**。處置：
`rank` 一律 `null`，不進主畫面表格，開發者路由只顯示「缺哪幾項」（維持現況），不顯示分數。

### 3.6 取捨曲線報告（R2、R7）

`packages/benchmark-data/src/coverage-matrix.ts` 目前每個 N 只輸出一個最佳解，DP 以
`(supportMask: bigint, dimensionMask: number)` 為鍵、保留字典序最小的 `benchmarkIds`。要改成：

**(a) 每個 N 輸出多個候選子集**，預設 5 個，`--candidates=<k>` 可調。

**(b) 每個候選標註來源組成**，欄位定義如下（先在報告中定義再使用，不得只給一個沒定義的
分數）：

- `sourceSpan`：子集中至少有一個 benchmark 由該來源提供的來源數。
- `exclusiveSources`：子集中「只有單一來源能提供」的 benchmark 所屬來源的**相異數**。
- `maxSourceShare`：單一來源獨佔的 benchmark 數佔 N 的最大比例（越低越分散）。
- 相對「來源齊全基準」的模型數增減（R7 的「大幅」與否由你據此判讀）。

**(c) 偏好順序**：完整模型數 ↓ → 維度覆蓋 ↓ → `exclusiveSources` ↓ → `maxSourceShare` ↑ →
benchmark ID 字典序。這把使用者「跨來源更具權威」的偏好放進排序，但**不放進硬性條件**。

**(d) `--require` 解除釘死**：改為可選、可為空，報告**必須**同時輸出一份完全不加 require 的
曲線。今天釘死 `deepswe-1-1,frontier-code-1-1` 使得「拿掉 Frontier Code 能多顯示幾個模型」
問不出來，這正是 R7 要解決的。

**(e) 一個必須誠實揭露的精度限制**：DP 每個鍵保留 k 個候選，只保證「每個 (鍵, N) 的前 k 佳」，
不保證「每個 N 的全域前 k 佳」——兩個鍵相同的子集對後續擴充等價，但來源組成不同，剪枝時會丟掉
其中一些。這對「提供給人審閱的候選清單」是可接受的取捨，但**報告本身要寫明這一點**，不能讓
讀者誤以為是窮舉結果。若實測記憶體允許，可改為把 `exclusiveSources` 併入 DP 鍵以恢復精確性；
這要先量測狀態數再決定。

---

## 4. 成本圖（建議切為 N11）

§6.3 的兩個缺陷與 R1 同源，但可獨立驗收，建議分開做：

- `getSourcePerformance`（`view-model.ts:451` 一帶）對非進階來源取「該來源所有 INCLUDED
  normalized 列的平均」。Vals 是 20 多個榜單的平均，ARC／DeepSWE／Frontier Code 各只有 1 個
  benchmark——同一張圖上的 X 軸不是同一種東西。改為每個來源在每個 preset 下有**單一且明示的
  分數基準**（單一 benchmark 或明確子集合）。
- 預設圖權重只在該模型實際有的來源上重新歸一，31 個上圖模型的來源數是 6/5/4/3/2/1 各
  6/5/9/4/5/2 個，其中兩個模型只由單一來源定位。要在每個點上揭露「由幾個來源構成」。

---

## 5. 不做的事

- 不改 `data-v2/sources/` 任何內容，不重抓資料。
- 不改證據保留規則：被 preset 排除的量測仍完整保留在證據面板，缺分仍是 `null`。
- 不由代理決定任何 preset 的組成（R2）。
- 不改 `display-set.json` 的 `benchmarkIds`；只在 D-N10-2 授權下改 `notes` 與 schema 外殼。

---

## 6. 任務拆分

| 任務 | 內容                                                                             | 可否獨立驗收 |
| ---- | -------------------------------------------------------------------------------- | ------------ |
| N10a | 取捨曲線報告：多候選、來源組成、`--require` 解除（§3.6）                         | 是           |
| N10b | preset schema 與驗證、`scoreProfiles` 過濾、ProductVersion `presets`（§3.1–3.3） | 是           |
| N10c | UI：preset 切換、組成揭露、非合格 profile 處置（§3.4–3.5、D-N10-5）              | 是           |
| N11  | 成本圖分數基準與來源數揭露（§4）                                                 | 是           |

**順序**：N10a 先做，因為它產出的報告是你挑 preset 的依據；N10b 需要你挑完才有第二個 preset
可放，但 schema 與計分過濾可以先用「現行 17 項為唯一 preset」落地並保持行為不變。N10c 在
N10b 之後。N11 隨時可插。

---

## 7. 驗收條件

- 同一 preset 下，所有主畫面 profile 的每個維度 `componentCount` 相等（測試釘住）。
- 切換 preset 只改分數與名次，不改證據內容。
- 取捨曲線報告每個 N 含多個候選子集、來源組成欄位、相對基準的增減，並含一份無 require 的曲線。
- 報告寫明 §3.6(e) 的精度限制。
- 基準驗證全綠，順序不變。

## 8. 風險

- **名次會變，而且應該變。** R1 落地後主畫面分數會整體重算；DeepSeek V4 Pro 之類原本被 Vals
  的 `proofbench` 拉低的模型會回升（實測：只用現行 17 項重算，它由第 12 名回到第 9 名，
  Gemini 3.6 Flash 由第 8 名降到第 10 名）。這是修正，不是回歸，但要在文件中明說。
- **搜尋空間**：45 個 active benchmark，DP 保留 k 個候選會使記憶體乘上 k，須先量測。
- **preset 數量膨脹**：每個 preset 約 +0.2 MB 產物。建議上限 4 個，超過要重新評估。
