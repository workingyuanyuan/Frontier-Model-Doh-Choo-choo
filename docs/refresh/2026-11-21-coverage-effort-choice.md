# 2026-11-21 資料刷新報告：測試覆蓋最佳化集合可改用其他合格 effort

完整 release 通過。來源快照、代表 profile、前沿窗口與預設集合都沒有變化。唯一的產品差異是 `coverage-10`：共同測試由 **7 項增為 13 項**，Gemini 4 Neon 在這個集合改用 `high`。判定**沒有重大變更**，依據見「重大變更判斷」。

## 規則（使用者 2026-11-21 裁決，只適用 Coverage）

使用者注意到 Claude Fable 5.2 在預設集合用 max；若改用 xhigh，預設九模型的共同測試會由 9 項增為 14 項。代表 profile 的規則只看單一模型自己的 benchmark 數（Fable：max 28 項、xhigh 18 項），不看同組其他模型。使用者裁決只改測試覆蓋最佳化集合：

- `coverage-N` 為每個 N 同時挑選模型與每個模型的合格 effort（即代表 profile 的候選），取套用品質政策後共同合格測試最多的組合。
- 同數時依序取：有效維度較多、非代表 effort 較少、窗口名次較前、代表順序較前的 effort。
- 前沿集合 `aa-top-N` 維持每個模型固定用代表 profile。
- 畫面、`/presets/<id>` 靜態頁、Markdown、JSON（`nonRepresentativeEfforts`）與 `llms.txt` 逐一列出改用的 effort 及原代表 effort；排行榜上方的小標改為「Profiles chosen for coverage」，複製的 Markdown 表格前附上集合的範圍說明。
- `frontier-set.json` 的 `coverageCohorts` 另存 `representativeProfileIds`，`cohortPolicy.coverageSelection` 改為新規則名稱。

搜尋是窮舉：每個 N 列舉所有模型組合，再對每個模型的合格 effort 做深度優先搜尋，以原始交集數（品質規則只會減少，不會增加）剪枝；同一模型持有相同測試的 effort 只保留代表順序較前的一個。以目前資料全部 18 組集合約 0.3 秒。

## 版本與來源基準

- 起始 commit：`d8fde2a1fc2d079de27c767fc84d6c149dad9ae8`（main），於分支 `feat/coverage-effort-choice` 進行。
- 舊版本：`sha256:837f83ad769f4a6e004373d782eb839995191e36b57987eba6f2da93471d1df0`
- 新版本：`sha256:19752c094251c2413f33e7a22f727b1259a061f3a0834ed405fd5ca1e493e6aa`
- Release `2026-11-21T11-49-34-715Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-21-coverage-effort-choice-receipt.json)
- 前兩次 release 未完成，修正後重跑：
  - `11-39-58`：程式審查後還要修改，中途停止。
  - `11-45-36`：e2e 的 Markdown 複製測試失敗。複製的表格前多了一行集合範圍說明，測試改為預期這一行。
- 來源快照：無新增、無移除。profiles 296、evidence 11,121、costs 1,100、presets 18，前後相同。

## 集合變化

| 模型數 | `aa-top-N` | `coverage-N`（前 → 後） | 改用非代表 effort                |
| -----: | ---------: | ----------------------: | -------------------------------- |
|      2 |         25 |                 48 → 48 | —                                |
|      3 |         13 |                 46 → 46 | —                                |
|      4 |         13 |                 44 → 44 | —                                |
|      5 |         13 |                 34 → 34 | —                                |
|      6 |          9 |                 32 → 32 | —                                |
|      7 |          9 |                 28 → 28 | —                                |
|      8 |          9 |                 23 → 23 | —                                |
|      9 |  9（預設） |                 17 → 17 | —                                |
|     10 |          7 |              **7 → 13** | Gemini 4 Neon high（代表 xhigh） |

`coverage-10` 新增 `complex-constraints`、`dayjob-finance`、`dayjob-healthcare`、`dayjob-law`、`dayjob-tax`、`gdp-xlsx`，沒有移除任何測試。Neon 的 high 有 19 項可計分 benchmark、4 個組織；代表的 xhigh 有 23 項、6 個組織。xhigh 缺少 Surge 以「High reasoning」測的項目，而其他 9 個模型的代表 profile 都有這些項目，所以改用 high 時共同測試較多。

| 模型              | Profile          | 名次   | Overall       |
| ----------------- | ---------------- | ------ | ------------- |
| Claude Fable 5.2  | max              | 1 → 1  | 65.35 → 56.17 |
| GPT-6.2 Astra     | max              | 2 → 2  | 62.25 → 54.13 |
| Gemini 4 Neon     | **xhigh → high** | 3 → 3  | 59.15 → 54.10 |
| Claude Opus 5.5   | max              | 4 → 4  | 58.42 → 51.63 |
| Gemini 4 Carbon   | high             | 5 → 5  | 58.18 → 50.95 |
| GPT-6 Astra       | max              | 6 → 6  | 56.98 → 50.15 |
| GPT-6.2 Sol       | max              | 7 → 7  | 56.90 → 48.78 |
| GPT-6.1 Sol       | max              | 8 → 8  | 55.37 → 48.37 |
| Gemini 4 Hydrogen | xhigh            | 10 → 9 | 51.68 → 47.93 |
| Claude Sonnet 5.5 | max              | 9 → 10 | 52.43 → 46.85 |

新增的 DayJob 等測試各模型成績偏低，Overall 普遍下降 3.8～9.2 分；第 9、10 名互換。

**Fable 為何沒有改用 xhigh**：把預設九模型中的 Fable 換成 xhigh 確實有 14 項共同測試，但 `coverage-9` 不含 Fable、全部用代表 profile 就有 17 項，所以搜尋選了後者。`coverage-10` 必須包含 Fable，Fable 用 max 搭配 Neon high 的 13 項是最大值。

## 重大變更判斷

**沒有重大變更，直接提交並開 PR。** 依據：

- 計分口徑的改變只作用於測試覆蓋最佳化集合，由使用者明確裁決；前沿集合、代表 profile、預設集合 `aa-top-9` 的測試、分數與名次完全不變。
- 唯一的產品差異是 `coverage-10`，原因可完整追溯到新規則（Neon 改用 high），沒有無法解釋的變化。
- 沒有需要使用者另行決定的事項。

## 代理抽查

抽查由未參與實作的 GPT-6.2 Sol 執行（2026-11-21），A～E 全部相符。比對基準是 HEAD `d8fde2a` 的產品，其 `versionId` 與 receipt 的舊版本一致。

| 項目 | 內容                                                                                                                                                                 | 結果                                                                               |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A    | `coverage-10` 以外 17 組集合與 HEAD 比對 benchmark 與全部 98 列（profile、名次、Overall、維度分數）                                                                  | 完全相同                                                                           |
| B    | `coverage-10` 的 13 項 × 10 個 profile 共 130 組都有已採用且非 null 的成績；`google-gemini-4-neon-high` 在 Neon 的合格候選中                                         | 相符                                                                               |
| C    | 以獨立腳本窮舉 10 個模型全部 3,750,000 種合格 effort 組合的原始交集                                                                                                  | 最大值 13，發布的組合是其中之一；全用代表 profile 為 7；受限測試上限未移除任何項目 |
| D    | Neon high 的 `complex-constraints` 72.9、`dayjob-finance` 50.5、`gdp-xlsx` 43.1，對照保存的 `candidates.json` 與 Surge 線上榜單                                      | 三處一致                                                                           |
| E    | 匯出的 `coverage-10.json` 的 `nonRepresentativeEfforts` 列出 Neon high（代表 xhigh），`coverage-10` Markdown 與 `llms.txt` 都有揭露；九個 `aa-top-*.json` 都是空陣列 | 相符                                                                               |

C 找到兩個 13 項的組合。另一組是 Fable 改用 xhigh、Neon 維持 xhigh，靠 LiveBench 的 7 項湊到 13 項，但只有 5 個有效維度；發布的組合（Neon high）有 6 個。依「同數取有效維度較多」的規則，發布的組合勝出（實作代理另以腳本確認）。

實作在 release 前另經 GPT-6.2 Sol 程式審查，五點意見全部採納：同一模型持有相同測試的 effort 先去重以免搜尋爆量、`llms.txt` 逐集合列出改用的 effort、排行榜小標與複製的 Markdown 附上範圍說明、規則文字補上「同數但維度較多」與最後的 effort 順序 tie-break、補兩個 tie-break 測試（已用突變測試確認拿掉「非代表 effort 較少」的比較時會失敗）。審查後 dashboard 單元測試又抓到前沿集合被誤判為改用其他 effort 的問題，已改為只對 coverage 集合比對。
