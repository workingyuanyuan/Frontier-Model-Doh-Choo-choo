# 2026-11-24 資料刷新報告：保留列的身分改依目前目錄解析

完整 release 通過，抽查結果見「代理抽查」，判定 **沒有重大變更**。

本次處理 [AA 身分登記報告](2026-11-24-aa-identity-review.md) 記下的缺口：materializer 依「上游移除時保留既有資料」沿用已被上游移除的列時，連擷取當時的模型身分也原樣帶入。`models.json` 之後登記了該模型，這些列仍停在 null，成績進不了對應的 profile。

- **改為依目前目錄重新解析保留列的身分**：重新推導 `canonicalModelId` 與由它推出的 `profileId`；effort 若是在舊規則下存的，也依現行規則重新推導。分數、成本值、evidence、provenance、列 ID 與觀察時間都不變。
- 會保留上游已移除列的 materializer 有三類，都已修正：FrontierCode 1.1（成績與成本）、Surge Riemann-bench 與 ComplexConstraints、AA-Briefcase rubric 列。LiveBench 1.0 與 Vals 每次都由證據重建，不受影響；其他來源只用前一份快照計算增減。
- 只用已保存的 artifact 離線重建，沒有重新抓取任何來源。
- **前沿前 20 名、28 個集合與成本都沒有變化**。產品只有 7 筆 evidence 變動，並新增 1 個 profile。

## 版本與來源基準

作業起始 commit 為 `38e51775dd2b3754b56a7c0ae69d1a260b7328cd`（PR #93 的內容，與合併後的 `main` 相同），在分支 `data/2026-11-24-preserved-identity` 上進行。

- 舊版本：`sha256:0f65655bafe325e1233aadfd1424acbdcc49a6b4cf872b727338e07229994055`
- 新版本：`sha256:d5f7b4daae9e06b9518382c7e0623ede5debd0845336eab83dfb8db14b06c66c`
- Release `2026-11-24T10-48-37-438Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-24-preserved-identity-receipt.json)
- 共跑了三次 release：
  - 第一次 `2026-11-24T09-59-50-375Z` 在 `evidence` 步驟失敗：worktree 缺少 `artifacts/research/` 下的歷史原檔。以 hard link 補上後重跑，資料與程式都沒有改動。
  - 第二次 `2026-11-24T10-02-17-119Z` 完成。之後依程式審查修改（見「程式審查」），從 HEAD 再離線重建一次：所有 `candidates.json`／`costs.json` 與修改前逐位元組相同，只有三份驗證報告的措辭改變。
  - 第三次為最終結果。它和第二次的 release 差異報告，除了版本、時間與步驟耗時之外逐字相同。`versionId` 不同，是因為 `generatedAt` 也算進雜湊。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| frontier |    20 |    20 |    0 |
| profiles |   346 |   347 |   +1 |
| evidence | 11638 | 11638 |    0 |
| costs    |  1182 |  1182 |    0 |
| presets  |    28 |    28 |    0 |

新舊 `current.json` 的 `frontier`、`presets`、`costs`、`defaultPresetId`、`benchmarkQuality`、`sourceSnapshotIds` 逐位元組相同。`comparisonEvidenceIds` 增加 6 筆，就是下表補上身分的 6 列。

## 程式變更

- `materializer-utils.ts` 新增 `withCurrentIdentity`：用來源自己的解析規則，重新推導保留列的身分，並回報身分有變動的列，供驗證報告記錄。
- **FrontierCode 1.1**（`materializeFrontierCode11`）：保留的成績與成本列，以原始名稱與 effort 重新解析身分。effort 也依現行規則，從 provenance locator 中的原始 effort 鍵重新推導（與新擷取的列共用同一個函式）。原因是 `Mistral Large 4 (Preview)` 的 `none` 列在 10-28 擷取，早於 11-12 定下的「同一模型有多個選項時，`none` 即 `non-reasoning`」規則，所以 effort 一直是 null。若只補上身分而 effort 仍是 null，C6 會從其他來源推測成 `high`，讓不推理的 27.87 分和真正 `high` 的 39.43 分擠進同一個 profile。
- **Surge**（`retainSurgeRows`）：新增身分解析參數，由 `riemannIdentity` 與 `complexConstraintsIdentity` 提供。它們與新擷取的列共用同一個設定解析器，從原始名稱推導 effort、模型與 profile ID。身分在「目前列已涵蓋相同模型與 effort」的取代判斷之前重新解析，所以剛登記的模型若已有目前列，舊的保留列會依既有規則被取代。
- **AA-Briefcase**（`retainArtificialAnalysisBriefcaseRows`）：新增身分解析參數，正式流程傳入 `artificialAnalysisIdentity`（與 materializer 相同的 `resolveModel`），同樣在取代判斷之前解析。這次 AA 沒有保留列，所以資料沒有變化。
- 線上刷新（`refresh-*.ts`）與離線重建（`materialize-snapshots.ts`）都改用同一組解析函式，驗證報告會列出重新解析的列。
- **測試**：只用合成資料。AA 與 Surge 的保留函式改成注入解析器，測試不依賴 `models.json`。新增 6 個案例：每條路徑各驗證「身分更新，其餘欄位不變」；AA 與 Surge 另驗證「重新解析後被目前列取代」；FrontierCode 另驗證 effort 依原始鍵重新推導，以及模型只被部分移除時成績與成本的 effort 一致；Surge 另以正式解析器驗證 effort 從名稱重新推導。

## 來源變化

用 `pnpm data:materialize-snapshots`、`rematerialize:vals`、`materialize:effort-reports` 離線重建後，以腳本逐列比對 HEAD。8 列有變動，除了 `model` 與 `profile.effort` 之外，所有欄位都與 HEAD 相同（分數、成本、evidence、provenance、ID、觀察時間）：

| 來源列                                                                           | 原始名稱                           | 值             | 身分（前 → 後）                                                                               |
| -------------------------------------------------------------------------------- | ---------------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| `frontier-code:frontier-code-1-1:mistral-large-4-preview-high`                   | Mistral Large 4 (Preview)          | 0.3943         | null → `mistral-mistral-large-4-preview` / `…-high`                                           |
| `frontier-code:frontier-code-1-1:mistral-large-4-preview-none`                   | Mistral Large 4 (Preview)          | 0.2787         | null → `mistral-mistral-large-4-preview` / `…-non-reasoning`（effort null → `non-reasoning`） |
| `frontier-code:mean-rollout-cost:mistral-large-4-preview-high`                   | Mistral Large 4 (Preview)          | 成本，EXCLUDED | null → `mistral-mistral-large-4-preview` / `…-high`                                           |
| `frontier-code:mean-rollout-cost:mistral-large-4-preview-none`                   | Mistral Large 4 (Preview)          | 成本，EXCLUDED | null → `mistral-mistral-large-4-preview` / `…-non-reasoning`（effort null → `non-reasoning`） |
| `surge-riemann:riemann-bench:glm-5-3-flash-max-reasoning`                        | GLM 5.3 Flash (Max reasoning)      | 8.8            | null → `zai-glm-5-3-flash` / `zai-glm-5-3-flash-max`                                          |
| `surge-riemann:riemann-bench:muse-glimmer-30b-xhigh-reasoning`                   | Muse Glimmer 30B (xHigh reasoning) | 13.6           | null → `meta-muse-glimmer` / `meta-muse-glimmer-xhigh`                                        |
| `surge-complex-constraints:complex-constraints:glm-5-3-flash-max-reasoning`      | GLM 5.3 Flash (Max reasoning)      | 27.6           | null → `zai-glm-5-3-flash` / `zai-glm-5-3-flash-max`                                          |
| `surge-complex-constraints:complex-constraints:muse-glimmer-30b-xhigh-reasoning` | Muse Glimmer 30B (xHigh reasoning) | 23.9           | null → `meta-muse-glimmer` / `meta-muse-glimmer-xhigh`                                        |

- 1.1 的成本本來就因被 2.0 取代而 EXCLUDED，不進產品，所以產品 `costs` 沒有變化。
- 這 4 列 Surge 保留列對應的模型與 effort 都沒有目前列，所以全部保留，沒有被取代。
- FrontierCode 驗證報告的「Canonically unresolved models」由 9 降為 8，並新增一行逐列列出重新解析的結果。兩份 Surge 驗證報告也列出重新解析的列。
- **驗證報告**：離線重建會整份重寫 `validation-report.md`。沒有資料變化的 5 個來源（AA、DeepSWE、LiveBench、OpenAI／Anthropic 發布頁），報告還原成 HEAD，因此保留原有的「AA-Briefcase rows retained」「Visible comparison」與「Snapshot delta」。Vals 的報告與 `manifest.json` 同樣還原：前者只有「前次數值」欄被離線重算覆蓋，後者只有網址順序不同。
- **只有順序改變的檔案已還原**：BioBasicsBench `candidates.json`（列順序）、Vals `manifest.json`（網址順序）。

## 集合與逐模型影響

- **前沿前 20 名**：模型、順序、AA 分數與代表檔位都不變。
- **28 個集合**：`presets` 逐位元組相同，每個集合的共同測試、模型、名次與 Overall 都沒變。預設集合仍是 `aa-top-9`，共同測試 9 項。
- 三個受影響的模型都在前沿窗口外（AA 身分登記報告已列出），這次只是把它們的成績接上 profile，可在模型清單手動選取時看到：
  - Mistral Large 4 Preview：`-high` profile 多了 FrontierCode 1.1 39.43%；新增 `-non-reasoning` profile，有 FrontierCode 1.1 27.87%。
  - GLM-5.3-Flash `max`：多了 Riemann-bench 8.8% 與 ComplexConstraints 27.6%。
  - Muse Glimmer `xhigh`：多了 Riemann-bench 13.6% 與 ComplexConstraints 23.9%。

## 檔位推測揭露

相對 HEAD 只有 1 筆推測改變，其他 C6 推測列與 HEAD 完全相同：

| 來源     | 模型                    | 目標列                                                                                           | 前        | 後     | 依據列                                                                   |
| -------- | ----------------------- | ------------------------------------------------------------------------------------------------ | --------- | ------ | ------------------------------------------------------------------------ |
| epoch-ai | Mistral Large 4 Preview | `epoch-ai:epoch-capabilities-index:mistral-mistral-large-4-preview-default-epoch-inspect-row-59` | `default` | `high` | `frontier-code:frontier-code-1-1:mistral-large-4-preview-high`（跨來源） |

FrontierCode 的兩列 Mistral 是來源直接標示的 effort（`high` 與由 `none` 推導的 `non-reasoning`），不是推測。Surge 的四列也是來源直接標示（`Max reasoning`、`xHigh reasoning`）。預設集合內的推測與 HEAD 相同（release 報告只列出 Sonnet 5.5 在 AutomationBench 的 `max`）。

## 代理抽查

抽查由未參與這次修改的 agy（`gemini-4-neon-medium`）執行。樣本由腳本從變動列產生，存在 `artifacts/research/2026-11-24-preserved-identity/samples.json`，8 列全部抽查。結果存在同目錄的 `spot-check.md`（`artifacts/` 不納入版控）。

這 8 列都是上游已移除、只存在於保留快照的資料：FrontierCode 頁面不再呈現 1.1，`v1_1` export 也已刪除這個模型；Surge 的兩張排行榜目前也沒有這些列。網站上已看不到，所以改用擷取時保存的 content-addressed 原檔比對，網址為 artifact 對應的原始頁面。

| 列                         | 網址／原檔                                                                              | 頁面位置與網站模型名稱                                 | 欄位        | 期望值 | 觀察值 | 結果 |
| -------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------- | -----: | -----: | ---- |
| FrontierCode 1.1 high      | <https://cognition.com/data/frontiercode-leaderboard/data.json>（`sha256:ff0040…d75f`） | `v1_1.data["Mistral Large 4 (Preview)"]["high"].main`  | `new_score` | 0.3943 | 0.3943 | 相符 |
| FrontierCode 1.1 none      | 同上                                                                                    | `v1_1.data["Mistral Large 4 (Preview)"]["none"].main`  | `new_score` | 0.2787 | 0.2787 | 相符 |
| FrontierCode 1.1 成本 high | 同上                                                                                    | `v1_1.data["Mistral Large 4 (Preview)"]["high"].main`  | `cost`      | 4.1341 | 4.1341 | 相符 |
| FrontierCode 1.1 成本 none | 同上                                                                                    | `v1_1.data["Mistral Large 4 (Preview)"]["none"].main`  | `cost`      | 2.3574 | 2.3574 | 相符 |
| Riemann-bench              | <https://surgehq.ai/benchmarks/riemann-bench>（11-02 擷取）                             | 主排行榜第 40 列「GLM 5.3 Flash (Max reasoning)」      | Pass rate   |  8.8 % |  8.8 % | 相符 |
| Riemann-bench              | 同上                                                                                    | 主排行榜第 33 列「Muse Glimmer 30B (xHigh reasoning)」 | Pass rate   | 13.6 % | 13.6 % | 相符 |
| ComplexConstraints         | <https://surgehq.ai/benchmarks/complex-constraints>（11-02 擷取）                       | 主排行榜第 34 列「GLM 5.3 Flash (Max reasoning)」      | Pass@1      | 27.6 % | 27.6 % | 相符 |
| ComplexConstraints         | 同上                                                                                    | 主排行榜第 35 列「Muse Glimmer 30B (xHigh reasoning)」 | Pass@1      | 23.9 % | 23.9 % | 相符 |

身分也逐列核對 `models.json`：`Mistral Large 4 (Preview)` 對應 displayName「Mistral Large 4 Preview」（不是正式版 `mistral-mistral-large-4`）；`GLM 5.3 Flash` 對應「GLM-5.3-Flash」與 alias `glm-5.3-flash`；`Muse Glimmer 30B` 對應 alias「Muse Glimmer 30B」。profile ID 都等於「模型 ID-effort」。export 中這個 Mistral 模型有 `high`、`none` 兩個 effort 鍵，所以 `none` 依規則是 `non-reasoning`。FrontierCode 的四個值我另外用 `jq` 直接讀原檔複核，結果相符。抽查結論：8/8 相符。

## 程式審查

程式由 Codex（`gpt-6.2-sol`）唯讀審查。typecheck 通過；審查時沙箱無法建立 Vitest 暫存目錄，改用 `--pool=threads --no-cache` 執行三個測試檔，76 項全部通過。提出 3 點，全部採用：

- **採用（bug）**：模型只被上游部分移除時（例如 export 只留下 `none` 成績、刪掉它的成本），保留的成本列會以「export 加上保留列」的 effort 鍵判斷，得到 `non-reasoning`；而重新擷取的成績列只看 export，得到 null，兩者不一致。已改為：模型仍在 export 時用 export 的鍵，和新擷取的列相同；整個模型被移除時，才用保留列帶的鍵。補上一個合成案例。
- **採用（防呆）**：locator 中的 effort 鍵若是無效的 JSON 字串，`JSON.parse` 會中斷整個 materialize。locator 都由 `JSON.stringify` 產生，實務上不會發生；仍改為解析失敗時回傳 null，沿用原本的 effort。
- **採用（風險）**：Surge 保留列原本沿用儲存的 effort 來推 profile ID。若 effort 是在舊規則下存的，就會和現在擷取的結果不同。已改為與新擷取的列共用設定解析器，從原始名稱重新推導 effort，並補上一個使用正式解析器的案例。目前資料沒有這種列，所以資料不受影響。

修改後，`withCurrentIdentity` 的解析器同時回傳 effort，FrontierCode 與 Surge 都走同一套程式。AA 的 effort 原本取自 AA 列上的 `effort` 欄位，保留列已沒有這個欄位，所以 AA 沿用儲存值。

## 重大變更判斷

**沒有重大變更**，依據如下：

- 計分口徑沒變。前沿、28 個集合與成本逐位元組相同，沒有任何重排。
- 所有變化都可追溯到本次修正：6 列保留成績補上身分，其中 1 列依既有規則補上 effort，連帶 1 筆 Epoch 推測由 `default` 改為 `high`。
- effort 重新推導套用的是 11-12 已採用的 FrontierCode 規則，不是新政策；模型身分沿用 PR #93 依官方證據完成的登記。
- 沒有需要使用者裁決的來源或計分政策。

## 已知未解

- FrontierCode 1.1 仍有 8 個名稱解析不到身分（Composer 2.5、DeepSeek V4.1 Flash、GLM 5.3、Kimi K2.7、Mistral 3.5 Medium、SWE-1.6、SWE-1.7、SWE-2），這次沒有變化。
- FrontierCode 驗證報告中「Models removed upstream and preserved unchanged」的措辭沿用舊版；下一行已註明保留列的 effort 與身分會依現行規則更新，分數不變。
