# 2026-11-21 資料刷新報告：採用 GBENCH Agentic Coding

完整 release 通過。新增來源 `gbench`，只計分 Agentic Coding GScore（`gbench-agentic-coding`，主維度 Coding）。預設集合 `aa-top-9` 與 `aa-top-3`～`aa-top-10` 完全不變。`aa-top-2`、`coverage-2`～`coverage-8`、`coverage-10` 各多一項共同測試。`coverage-9` 的模型與測試組合改變，原因可依規則完整追溯。判定**沒有重大變更**，依據見「重大變更判斷」。

## 規則（使用者 2026-11-21 裁決）

使用者在 [來源評估](../research/2026-11-21-gbench-source-evaluation.md) 的四個選項中選了 A：

- 只採 GBENCH 的 Agentic Coding GScore，乘以 100 後計分。主維度 Coding，次要 Agentic 與 Reasoning（次要關聯不加權）。
- 綜合分數、One-shot Coding、Decision Making 保存為原始證據，不計分。
- 來源沒有版本，`benchmarkVersion` 為 null；每列都沒有 effort，由現行的跨來源投票推論。

## 實作

- 擷取：`/api/v1/global/rankings?mode=agentic_coding&limit=500`。頁面只顯示前 100 列，加上 limit 才能取得全部 112 列。核對項目：
  - 回傳列數要少於 limit，而且不能剛好是 100 列（剛好一頁時無法確認後面沒有被截斷）。
  - 前 100 列要與畫面列數一致。
  - 每列頂層 GScore 要等於 `agentic_coding.gscore`。
- API 對沒有 user agent 的請求回 403。`captureArtifact` 新增可選的 `headers`，GBENCH 送出通用的 `llm-bench-acquisition`。
- `custom/human`、`baseline/random` 不是模型，不物化。已排名但沒有分數的列保持缺值，不讓整次刷新失敗。
- 身分只以提供者限定的 `model_id` 精確比對；短名稱 `model` 可能對到其他提供者的模型，所以不使用。`models.json` 為既有模型新增 48 個審查過的 `model_id` 別名，例如 `anthropic/claude-fable-5`、`qwen/qwen4-max`。都是同一提供者、同一版本的對應，沒有新增模型身分。GBENCH 同時列出 DeepSeek V4 Flash／Pro 的無日期版與 `-0731`／`-0813` 版，分數差很多（34.44 對 48.16、30.93 對 46.13）。catalog 這兩個模型的發布日是 2026-07-31 與 2026-08-13，ARC Prize 也把帶日期的列對到它們，所以別名只對應帶日期的列，無日期的兩列保持未對應。
- 程式審查由 GPT-6.2 Sol 執行，採納五點：
  - 剛好一頁時判定完整性未知。
  - 以 slug 檢查 candidate ID 是否重複。
  - 不以短名稱比對身分。
  - 沒有分數的列保持缺值。
  - 執行 `materialize:effort-reports`，把推論出的 effort 寫進驗證報告。

  未採納一點：重播時以完整請求網址尋找證據，與其他來源的做法一致。

## 版本與來源基準

- 起始 commit：`732d8bd7e4d1c24a28f9783304e73294db0a0c81`（main），於分支 `feat/adopt-gbench-agentic-coding` 進行。
- 舊版本：`sha256:19752c094251c2413f33e7a22f727b1259a061f3a0834ed405fd5ca1e493e6aa`
- 新版本：`sha256:115cc9af565b02d0e63de828ee0e12835b2fc0114adceb3b72019ce4b8c5d9e8`
- Release `2026-11-21T13-05-07-369Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-21-gbench-adoption-receipt.json)
- 前兩次 release 未採用：
  - 第一次在程式審查後要修改，中途停止。
  - `12-47-24` 完成（`sha256:8669b3ae…`），但抽查發現 DeepSeek V4 Flash／Pro 的無日期別名版本不明，改為對應帶日期的列後重跑。集合結果與本次相同，只差這兩個非前沿模型的身分。
- 來源快照：新增 `gbench:2026-11-21T12:40:54.066Z`，Evidence `sha256:c450f6b554136aa2ce0c42279fa87351e9ea8189ae952742a59395414713a076`。112 列中 110 列物化，68 列對到既有模型，42 列沒有對應的模型身分（保存在產品的 evidence，但不列入比較與計分）。重播檢查重現快照，其他來源沒有變化。
- Evidence 11,121 → 11,231（+110），profiles 296、costs 1,100、presets 18 不變。

## Effort 歸屬

前沿 10 個模型中，9 個的 GBENCH 成績經投票落在代表 profile。Gemini 4 Neon 落在 high（依據 Artificial Analysis 的 `aa-briefcase` high 列），代表 profile 是 xhigh。所以含 Neon 的 `aa-top-3`～`aa-top-10` 不會納入 GBENCH，與評估報告的預估一致。

| 模型              | Profile | GBENCH |
| ----------------- | ------- | -----: |
| Claude Fable 5.2  | max     |  85.96 |
| GPT-6.2 Astra     | max     |  89.31 |
| Gemini 4 Neon     | high    |  86.26 |
| Gemini 4 Carbon   | high    |  86.58 |
| Claude Opus 5.5   | max     |  79.62 |
| GPT-6.2 Sol       | max     |  90.89 |
| GPT-6 Astra       | max     |  92.08 |
| GPT-6.1 Sol       | max     |  91.73 |
| Claude Sonnet 5.5 | max     |  69.74 |
| Gemini 4 Hydrogen | xhigh   |  83.75 |

## 集合變化

| 模型數 | `aa-top-N`（前 → 後） | `coverage-N`（前 → 後） |
| -----: | --------------------: | ----------------------: |
|      2 |               25 → 26 |                 48 → 49 |
|      3 |               13 → 13 |                 46 → 47 |
|      4 |               13 → 13 |                 44 → 45 |
|      5 |               13 → 13 |                 34 → 35 |
|      6 |                 9 → 9 |                 32 → 33 |
|      7 |                 9 → 9 |                 28 → 29 |
|      8 |                 9 → 9 |                 23 → 24 |
|      9 |         9 → 9（預設） |                 17 → 17 |
|     10 |                 7 → 7 |                 13 → 14 |

除 `coverage-9` 外，有變化的集合只是多了 `gbench-agentic-coding`，模型、profile 與名次都不變，只有 `coverage-10` 的第 4、5 名互換（Gemini 4 Carbon 54.51、Claude Opus 5.5 54.43）。Overall 變動：`aa-top-2` 的 Fable 67.18 → 68.49、GPT-6.2 Astra 63.16 → 65.40；`coverage-2`～`coverage-8` 各模型 +0.03～+0.83；`coverage-10` 各模型 +2.29～+4.21。

### coverage-9

| 項目     | 前                                                                                                                                                                                                         | 後                                                                                                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 模型     | 不含 Fable，含 Gemini 4 Hydrogen                                                                                                                                                                           | 含 Fable，不含 Hydrogen                                                                                                                                                                        |
| 非代表   | 無                                                                                                                                                                                                         | Gemini 4 Neon high（代表 xhigh）                                                                                                                                                               |
| 共同測試 | 17 項，5 個有效維度                                                                                                                                                                                        | 17 項，6 個有效維度（多了 Language）                                                                                                                                                           |
| 移除     | `hlab`、`legal-research`、`livebench-browser`、`livebench-coding`、`livebench-data-analysis`、`livebench-design`、`livebench-long-agentic`、`livebench-reasoning`、`livebench-research`、`vibe-code-bench` | —                                                                                                                                                                                              |
| 新增     | —                                                                                                                                                                                                          | `automationbench`、`complex-constraints`、`dayjob-finance`、`dayjob-healthcare`、`dayjob-law`、`dayjob-tax`、`enterprisebench-corecraft`、`gbench-agentic-coding`、`gdp-xlsx`、`riemann-bench` |

原因：新組合原本只有 16 項，輸給舊組合的 17 項。加入 GBENCH 後新組合也有 17 項，平手時第二順位比有效維度數，新組合 6 個勝過 5 個。舊組合含 Neon xhigh，而 GBENCH 的 Neon 成績落在 high，所以舊組合不會多這一項。

| 模型              | Profile          | 名次  | Overall       |
| ----------------- | ---------------- | ----- | ------------- |
| Claude Fable 5.2  | max（新加入）    | — → 1 | — → 62.01     |
| Gemini 4 Neon     | **xhigh → high** | 2 → 2 | 70.45 → 60.76 |
| GPT-6.2 Astra     | max              | 1 → 3 | 71.08 → 59.46 |
| Gemini 4 Carbon   | high             | 3 → 4 | 69.17 → 58.34 |
| Claude Opus 5.5   | max              | 4 → 5 | 68.84 → 57.56 |
| GPT-6 Astra       | max              | 5 → 6 | 68.42 → 57.05 |
| GPT-6.2 Sol       | max              | 7 → 7 | 66.75 → 55.64 |
| GPT-6.1 Sol       | max              | 6 → 8 | 66.76 → 55.50 |
| Claude Sonnet 5.5 | max              | 9 → 9 | 61.90 → 52.54 |
| Gemini 4 Hydrogen | xhigh（退出）    | 8 → — | 64.04 → —     |

Overall 普遍下降約 9～11 分，原因是測試組成換成 DayJob 等成績偏低的 Surge 項目，不代表模型退步。

## 重大變更判斷

**沒有重大變更，直接提交並開 PR。** 依據：

- 新增來源與計分口徑由使用者明確裁決（選項 A），實作照裁決執行。
- 預設集合 `aa-top-9` 的測試、分數與名次完全不變；`aa-top-3`～`aa-top-10` 也不變。
- `coverage-9` 的組合改變，可完整追溯到既有的平手規則（同數取有效維度較多），不是無法解釋的變化；評估報告已預告 `coverage-9` 要重新搜尋才知道結果。
- 沒有需要使用者另行決定的事項。

## 代理抽查

抽查由未參與實作的 GPT-6.2 Sol 執行（2026-11-21），分兩輪。

| 項目   | 內容                                                                                                                                                                       | 結果                                                                                           |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| A      | `aa-top-3`～`aa-top-10` 與 HEAD 逐列比對（profile、名次、Overall、維度分數）；`aa-top-2`、`coverage-2`～`coverage-8`、`coverage-10` 成員不變、只多 `gbench-agentic-coding` | 相符                                                                                           |
| B      | 前沿 10 個模型的 `normalizedScore` 等於原始 artifact 同 `model_id` 的 `gscore` × 100，且頂層與 `agentic_coding.gscore` 相等；112 列、2 列非模型、110 筆 candidates         | 相符                                                                                           |
| C      | `coverage-9` 前後都是 17 項，有效維度 5 → 6；窮舉 10 個九模型子集的 8,375,000 種 effort 組合，沒有組合達 18 項                                                             | 相符                                                                                           |
| D      | 48 個新別名的提供者與版本一致                                                                                                                                              | 第一輪不符：無日期的 DeepSeek V4 Flash／Pro 別名版本不明。改對應 `-0731`／`-0813` 後第二輪相符 |
| E      | 9 個模型落在代表 profile、Neon 落在 high；`coverage-9` 匯出的 `nonRepresentativeEfforts` 只有 Neon，`aa-top-*` 皆為空                                                      | 相符                                                                                           |
| F      | 報告的 `coverage-9` 表（名次、Overall）與 HEAD 及工作樹一致                                                                                                                | 相符                                                                                           |
| 第二輪 | Receipt `complete`、versionId 一致；18 個 preset 與修正前版本逐欄相同，只有 4 筆 DeepSeek 證據的身分歸屬改變                                                               | 相符；另指出「不進入產品」的措辭錯誤，已改正                                                   |
