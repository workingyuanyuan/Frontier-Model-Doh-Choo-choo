# 2026-11-17 AA-Briefcase 排行榜解析修正

這次修正 Artificial Analysis（AA）解析器，並用 11/17 已保存的抓取資料離線重建 AA 快照，沒有重新上線抓取。完整 release 通過，**沒有重大變更**：9 組前沿集合的模型、名次與 Overall 全部不變，預設 `aa-top-10` 不變。判斷依據見「重大變更判斷」。

## 起因

使用者審查 Gemini 4 Argon 時發現，AA 上 Medium 檔也有 AA-Briefcase 分數，產品卻沒有收錄。

- 2026-11-14 起，AA 的 model detail payload 只剩 Briefcase Elo。
- `/evaluations/aa-briefcase` 的 rubric pass rate 放在一張排行榜表（`"models":[{id, name, rubricPassRate, releaseDate…}]`）。表中每列只有內部 UUID，沒有 slug。舊解析器讀不到這張表，269 列全數未用。
- `Gemini 4 Argon (Medium)` 這個 profile 在 11/14 之後才出現，沒有可沿用的舊列，因此缺值。
- 另有 165 列一直沿用 11/13 的舊值。其中 8 列已與 AA 現值不同（見下方「數值更新」）。

## 解析器修改

修改位於 `packages/acquisition/src/artificial-analysis-rsc.ts`：

- **擷取排行榜**：新增 `extractArtificialAnalysisLeaderboardRows`，與 profile 列分開保存在 `leaderboardRows` 欄位，因為排行榜列的 UUID 不能當作 profile key。線上刷新與離線重播兩條路徑都會擷取。
- **讀取順序**：同一 slug 只要有任何已擷取列帶 `briefcaseBreakdown.rubricPassRate`，就用那一列（優先取 Briefcase 頁本身的列）。都沒有時，才改用排行榜。
- **比對規則**：排行榜列必須同時符合三點才採用：
  - 名稱與 AA 顯示名稱**完全相同**；
  - 只對到一個 slug；
  - 該 slug 有一列同時寫著同一名稱與同一發布日。

  以下情況一律不採用，也不推論身分：缺發布日、同名對到多個 slug、同一 slug 在表中出現兩次。

- **出處**：排行榜補上的列，`sourceUrl` 與 Evidence 指向 `/evaluations/aa-briefcase`，locator 記錄排行榜列的 UUID 與比對到的 slug。
- **報告**：validation report 新增「AA-Briefcase leaderboard join」一節。
- **測試與審查**：補了 4 個合成資料測試。Codex（`gpt-6.1-sol`）第一輪審查指出三個 P2 問題，已全部修正：
  1. 缺發布日的列仍可比對成功；
  2. 名稱與發布日可能來自不同列；
  3. 其他頁面已有的 rubric 會被排行榜的值取代。

  第二輪審查確認三項都已修正，且沒有新問題。

- **文件**：同步更新 OPERATIONS §2、DATA_METHODOLOGY 與 EVIDENCE_STORE 的說明。

## 版本與 release

- 起始 commit：`1a0f7b5ed65c332bd3329c60224cdb71dc41c708`（工作區既有的 `apps/bench/next-env.d.ts` 修改保留未動）。
- 舊版本：`sha256:2bc8830b86bea82a461df5efe6225f99b9fdec12c44d4f77869930f81d21e819`
- 新版本：`sha256:b72c6c1cefe17040e4a7a3ec815434a0c27595f52ffe5d7fd6057906d87d5427`
- Release `2026-11-17T10-12-41-833Z`：退出碼 0，`status: complete`，8 個步驟全部退出碼 0。[Receipt](2026-11-17-aa-briefcase-leaderboard-receipt.json)
- 較早的 release `2026-11-17T09-57-50-017Z` 跑的是審查修正前的程式，已在 `evidence` 步驟中止，沒有產出產品。
- `pnpm data:check-replay`：`candidates.json` 與 `costs.json` 都可由保存的 Evidence 重現，差異只在報告文字。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| profiles |   281 |   281 |    0 |
| evidence | 10509 | 10521 |  +12 |
| costs    |   992 |   992 |    0 |
| presets  |     9 |     9 |    0 |

## 來源變化（只有 AA）

- **筆數**：候選 3,283 → 3,295（+12，無刪除）；成本不變。除了 `aa-briefcase`，其他 benchmark 的列逐筆完全相同。
- **Briefcase 列的來源**：206 列全部是 11/17 的觀測值，沿用列從 165 降為 0。
  - 109 列取自排行榜；
  - 97 列取自 profile 列的 `briefcaseBreakdown.rubricPassRate`。其中 68 列原本被 Briefcase 頁本身缺值的列遮住，現在改由其他評測頁上同一 slug 的列提供。
  - Profile 列與排行榜的值不一致：0 筆。
- **Evidence 索引**：293 → 134 筆。不再被引用的 11/13 detail 擷取紀錄已移出，artifact 檔案仍保存在 `artifacts/sha256/`。
- **新增 12 列**：

  | 模型（AA 名稱）                                  | canonical                  | Rubric |
  | ------------------------------------------------ | -------------------------- | -----: |
  | Gemini 4 Argon (Medium)                          | `google-gemini-4-argon`    | 62.63% |
  | Qwen3.8 Max                                      | `alibaba-qwen3-8-max`      | 49.60% |
  | DeepSeek V4 Pro 0813 (High)                      | `deepseek-deepseek-v4-pro` | 36.46% |
  | K-EXAONE 2.0                                     | `lg-k-exaone-2-0`          | 12.32% |
  | K2 Horizon 7B                                    | 未對應                     | 26.25% |
  | Ling-3.0-flash-VL                                | 未對應                     | 24.95% |
  | Nemotron 3.5 Bolt 74B-A9B                        | 未對應                     | 24.34% |
  | Granite 4.2 30B                                  | 未對應                     |  9.79% |
  | Qwen3.5 9B (Reasoning)                           | 未對應                     |  7.98% |
  | Qwen3 Coder Next                                 | 未對應                     |  7.87% |
  | HyperNova 60B 2605 (High, Based on gpt-oss-120b) | 未對應                     |  7.07% |
  | Gemma 4 E4B (Reasoning)                          | 未對應                     |  1.92% |

- **數值更新 8 列**：原本沿用 11/13 舊值，現在改為 AA 現值。

  | 列                           |     舊值 |     新值 |
  | ---------------------------- | -------: | -------: |
  | `claude-opus-4-7`            | 0.393375 | 0.386128 |
  | `claude-sonnet-4-6-adaptive` | 0.289199 | 0.289899 |
  | `deepseek-v4-pro-0424`       | 0.239387 | 0.237462 |
  | `gemini-3-1-pro-preview`     | 0.124242 | 0.123596 |
  | `gemini-3-5-flash`           | 0.277321 | 0.279592 |
  | `gpt-5-4-mini`               | 0.125436 | 0.132323 |
  | `grok-4-3`                   | 0.172727 | 0.171717 |
  | `kimi-k2-6`                  | 0.206061 | 0.206755 |

## 集合與逐模型影響

- **前沿集合**：前十名、順序與 AA 指數全部不變。`google-gemini-4-argon` 仍是第 9 名，代表 profile 仍是 `google-gemini-4-argon-high`；它的 Briefcase 分數仍是 64.63，只是 Evidence 改指向 11/17 的擷取。
- **各集合排名**：`aa-top-2`～`aa-top-10` 與 `aa-frontier` 的 benchmark 組成、模型、名次與 Overall 全部 Δ = 0。數值變動的 8 列都不屬於任何集合的代表 profile。
- **手動比較**：Argon Medium（`google-gemini-4-argon-medium`）手動比較時有 AA-Briefcase 了（62.63）。

## 重大變更判斷

**沒有重大變更**，依據如下：

- 所有集合的名次與 Overall 都沒有變；
- 數值更新都來自來源現值，而且經過抽查確認；
- 新增列只補上原本缺的格子；
- 沒有需要使用者裁決的政策事項。

比對採用「完全相同的名稱加發布日」。這是同一來源內兩張表的連結，不是模型身分推論；canonical 身分仍由既有的 `models.json` 決定。

## 檔位推測揭露表（強制）

新增列中有 2 筆檔位沒有由來源標示：

| 來源 | 模型名稱     | 候選                                                | 推測檔位  | 依據來源  | 依據列                                         |
| ---- | ------------ | --------------------------------------------------- | --------- | --------- | ---------------------------------------------- |
| AA   | Qwen3.8 Max  | `artificial-analysis:aa-briefcase:qwen3-8-max-0803` | `xhigh`   | `deepswe` | `deepswe-1-1:mini-swe-agent-qwen3-8-max-xhigh` |
| AA   | K-EXAONE 2.0 | `artificial-analysis:aa-briefcase:k-exaone-2-0`     | `default` | —         | —                                              |

當日合計從 [上午報告](2026-11-17.md) 的 928 筆增為 930 筆：跨來源推測 541 筆、`default` 389 筆。預設集合 `aa-top-10` 採用推測檔位的列仍為 0 筆。

## 代理抽查

抽查由未參與匯入的 agy（`gemini-4-hydrogen-medium`）執行。它在 2026-11-17T10:00:05Z 上線抓取 `https://artificialanalysis.ai/evaluations/aa-briefcase`（HTTP 200，SHA-256 `0eeaa09e…a05d`），在 Briefcase 排行榜中核對每列的 `rubricPassRate`。

| 模型（網站名稱）                          | 期望值   | 觀察值   | 結果 |
| ----------------------------------------- | -------- | -------- | ---- |
| Gemini 4 Argon (Medium)                   | 0.626263 | 0.626263 | 相符 |
| Gemini 4 Argon (High)                     | 0.646341 | 0.646341 | 相符 |
| Qwen3.8 Max                               | 0.495960 | 0.495960 | 相符 |
| DeepSeek V4 Pro 0813 (High)               | 0.364646 | 0.364646 | 相符 |
| Claude Opus 4.7 (Max)                     | 0.386128 | 0.386128 | 相符 |
| GPT-5.4 mini (Xhigh)                      | 0.132323 | 0.132323 | 相符 |
| Gemini 3.5 Flash (High)                   | 0.279592 | 0.279592 | 相符 |
| Claude Fable 5.2 (High, Default Fallback) | 0.629293 | 0.629293 | 相符 |
| GPT-6.1 Sol (High)                        | 0.490909 | 0.490909 | 相符 |
| Gemini 4 Hydrogen (Medium)                | 0.426263 | 0.426263 | 相符 |
| Gemini 4 Carbon (High)                    | 0.618182 | 0.618182 | 相符 |

- 結果：11 筆全部相符，0 筆不符。
- 主代理另外重算了原始檔的 SHA-256，並抽驗其中 3 筆數值，結果一致。
- 原始檔與結果在 `artifacts/research/2026-11-17-benchmark-check/spot-check-aa-briefcase/`。
- 其他來源本次沒有變動，抽查沿用上午報告。

## 已知未解

- **排行榜有成績、但沒有對應 profile 的已追蹤模型**：排行榜中有 60 個名稱對不到任何已擷取的 AA profile，多數是 2025-08-17 之前或沒有登記的模型。其中 4 個已登記模型：
  - `GPT-5.3 Codex (Xhigh)`
  - `Qwen3.6 27B (Reasoning)`
  - `Kimi K2.7 Code`
  - `Muse Spark 1.1 (Xhigh)`

  這 4 個模型不在 AA 各評測頁或既有 detail 擷取的範圍內，所以沒有 profile 可以接上。要補上，需在下次線上刷新時擷取它們的 `/models/<slug>`。依照不做模糊比對的原則，本次不補。

- **既有 `sourceUrl` 慣例**：從 profile 列讀到的 97 列，`sourceUrl` 沿用 `/models/<slug>`，但該頁已不顯示 rubric。抽查以評測頁核對，數值相符。
- **AA API HTTP 410** 與 **`qwen3-8-27b-low` artifact 損毀警告**：與上午報告相同。
