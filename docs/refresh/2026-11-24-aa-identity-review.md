# 2026-11-24 資料刷新報告：登記 AA 上 26 個未對應名稱（24 個模型）

完整 release 通過，抽查結果見「代理抽查」，判定 **沒有重大變更**。

本次接續同日的 [Haiku 5.5 登記](2026-11-24.md)，處理審核帳 `identity-review.json` 上暫列 `awaiting-evidence` 的 26 個 AA 名稱。逐一查官方證據後，全部都能登記：

- **24 個新模型登記進 `models.json`**（26 個名稱中，Mistral Large 4 的 High／Medium 和 Inkling Small 的兩個名稱各屬同一模型）。審核帳清空，AA Intelligence Index 上已沒有未解析的名稱。
- 只用已保存的 artifact 離線重建，沒有重新抓取任何來源。
- **前沿前 20 名、預設集合 `aa-top-9` 與全部 28 個集合都沒有變化**：這些模型的 AA 分數最高是 Ling 3.1 Flash 1019 的 29.57，低於窗口第 20 名的 36.62。它們出現在網頁的模型清單，可以手動選取比較。
- 其中 6 個模型在其他 6–16 個來源都有成績，情況和 Haiku 5.5 相同：GLM-5.3-Flash、Mistral Large 4、MiniMax M3.1 Flash、Inkling Small、Nemotron 3.5 Super VL、Muse Glimmer。

## 版本與來源基準

作業起始 commit 為 `babc401caceb5aa79b8c9a72eb64424b026ca563`（PR #92 合併後的 `main`），工作區乾淨，在分支 `data/2026-11-24-aa-identity-review` 上進行。

- 舊版本：`sha256:eed344bb68c94aba39b1373dd781d538e7c4fb9121f6b6d6e78abbb5b140c1e2`
- 新版本：`sha256:0f65655bafe325e1233aadfd1424acbdcc49a6b4cf872b727338e07229994055`
- Release `2026-11-24T09-20-27-481Z` 退出碼為 0，`receipt.status` 為 `complete`，八個步驟的退出碼都是 0。[Receipt](2026-11-24-aa-identity-review-receipt.json)
- 共跑了三次 release：
  - 第一次 `2026-11-24T08-01-54-141Z` 在 `tests` 失敗。原因是 `surge-chartography-materializer.test.ts` 把「真實頁面 fixture 對目前目錄解析成功 32 列」寫死，目錄新增模型後變成 35。依測試原則改成不變量（每個解析出的身分都必須是目錄中的模型），沒有更新數字。
  - 第二次 `2026-11-24T08-04-06-313Z` 完成。之後依程式審查修改 LiveBench 的舊版規則（見「程式審查」），再離線重建一次：`data/sources` 與修改前逐位元組相同。
  - 第三次為最終結果。它與第二次的 release 差異報告只差版本與時間戳記。

| 項目     |    舊 |    新 | 增減 |
| -------- | ----: | ----: | ---: |
| 模型     |    92 |   116 |  +24 |
| frontier |    20 |    20 |    0 |
| profiles |   304 |   346 |  +42 |
| evidence | 11638 | 11638 |    0 |
| costs    |  1126 |  1182 |  +56 |
| presets  |    28 |    28 |    0 |

evidence 總數不變：753 筆成績原本就在產品裡，只是沒有模型身分，這次補上身分與 profile；分數、來源欄位都沒變，其中只有 ALE 兩列另由 INCLUDED 改為 EXCLUDED（見下文）。其他 evidence 完全沒變。新舊 `current.json` 的 `frontier`、`presets`、`defaultPresetId`、`benchmarkQuality`、`sourceSnapshotIds` 逐位元組相同。新增成本 56 筆：AA 19、ARC 11、LiveBench 11、FrontierCode 8、Vals 5、MaxxBench 2。

## 身分證據

證據由兩個 Agent 工作者查找（Codex 額度用完，依慣例改用 Agent 工具）。每筆證據都保存原始回應與 SHA-256，存在 `artifacts/research/2026-11-24-aa-identity-review/{a,b}/raw/`，共 209 項，我重算雜湊並以 `grep -F` 核對引文，全部相符。另有 4 項標為 agent-reported：ifm.ai 被 Cloudflare 擋下，改用 WebFetch 讀即時頁面；另有一份 Internet Archive 存檔副本有原始檔。發布日採廠商公布的日期；與 AA 不同時，以官方為準。

| 模型（AA 名稱）                             | modelId                           | 發布日     | 官方證據                                                                                                                                                               |
| ------------------------------------------- | --------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mistral Large 4（`(High)`、`(Medium)`）     | `mistral-mistral-large-4`         | 2026-10-29 | [Mistral 開放權重公告](https://mistral.ai/news/mistral-large-4-oss/)、[文件](https://docs.mistral.ai/models/mistral-large-4-0)、HF `mistralai/Mistral-Large-4-1T-A52B` |
| Mistral Large 4 Preview                     | `mistral-mistral-large-4-preview` | 2026-10-06 | [Mistral 預覽公告](https://mistral.ai/news/mistral-large-4/)                                                                                                           |
| Mistral Medium 3.5                          | `mistral-mistral-medium-3-5`      | 2026-04-28 | [Mistral 文件](https://docs.mistral.ai/models/mistral-medium-3-5-26-04)、HF `mistralai/Mistral-Medium-3.5-128B`                                                        |
| Mistral Small 4（`(Reasoning)`）            | `mistral-mistral-small-4`         | 2026-03-16 | [Mistral 公告](https://mistral.ai/news/mistral-small-4/)、HF `mistralai/Mistral-Small-4-119B-2603`                                                                     |
| GLM-5.3-Flash                               | `zai-glm-5-3-flash`               | 2026-08-26 | [Z.ai release notes](https://docs.z.ai/release-notes/new-released)、HF `zai-org/GLM-5.3-Flash`                                                                         |
| MiniMax-M3.1-Flash                          | `minimax-minimax-m3-1-flash`      | 2026-10-19 | [MiniMax 部落格](https://www.minimax.io/blog/minimax-m31f)、HF `MiniMaxAI/MiniMax-M3.1-Flash`                                                                          |
| Inkling Small（含 `(High)`）                | `thinking-machines-inkling-small` | 2026-07-30 | [Thinking Machines 公告](https://thinkingmachines.ai/news/inkling-small/)、HF `thinkingmachines/Inkling-Small`                                                         |
| Nemotron 3.5 Super VL                       | `nvidia-nemotron-3-5-super-vl`    | 2026-10-15 | HF `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`、[build.nvidia.com](https://build.nvidia.com/nvidia/nemotron-3.5-super-vl-120b-a12b)                           |
| Nemotron 3.5 Lightning                      | `nvidia-nemotron-3-5-lightning`   | 2026-08-11 | HF `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`、[build.nvidia.com](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b)                             |
| Muse Glimmer（`(High)`）                    | `meta-muse-glimmer`               | 2026-08-10 | [Meta 研究部落格](https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model)、HF `meta-models/Muse-Glimmer-30B`（組織已驗證為 Meta）                   |
| Gemini 3.1 Flash-Lite                       | `google-gemini-3-1-flash-lite`    | 2026-03-03 | [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog)、[模型頁](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite)                  |
| Gemma 4 31B（`(Reasoning)`）                | `google-gemma-4-31b`              | 2026-04-02 | [Google 部落格](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)、HF `google/gemma-4-31B-it`                                                |
| Gemma 4 E4B（`(Reasoning)`）                | `google-gemma-4-e4b`              | 2026-04-02 | 同上、HF `google/gemma-4-E4B-it`                                                                                                                                       |
| MiMo-V2.6-Flash                             | `xiaomi-mimo-v2-6-flash`          | 2026-09-22 | [小米 MiMo 文件](https://mimo.mi.com/docs/en-US/updates/model)、HF `XiaomiMiMo/MiMo-V2.6-Flash-RL`                                                                     |
| Qwen3.8-Flash-Next                          | `alibaba-qwen3-8-flash-next`      | 2026-08-26 | [Qwen GitHub README](https://github.com/QwenLM/Qwen3.8-Flash-Next)、HF `Qwen/Qwen3.8-Flash-Next`                                                                       |
| Ling 3.1 Flash 1019                         | `inclusionai-ling-3-1-flash-1019` | null       | HF `inclusionAI/Ling-3.1-flash-1019`（官方沒有公布日期，所以留 null）                                                                                                  |
| Granite 4.2 30B                             | `ibm-granite-4-2-30b`             | 2026-08-25 | HF `ibm-granite/granite-4.2-30b` 模型卡、[IBM Granite 部落格](https://huggingface.co/blog/ibm-granite/granite-4-2)                                                     |
| Solar Pro 4                                 | `upstage-solar-pro-4`             | 2026-08-06 | [Upstage 文件](https://console.upstage.ai/docs/models/solar-pro-4)、[部落格](https://www.upstage.ai/blog/en/solar-pro-4)                                               |
| Apodex 1.1                                  | `apodex-apodex-1-1`               | 2026-08-24 | [Apodex 部落格](https://www.apodex.com/blog/apodex-1.1-scaling-agentic-intelligence-for-complex-work)                                                                  |
| A.X-K2                                      | `sk-telecom-a-x-k2`               | 2026-07-29 | [SKT 新聞稿](https://news.sktelecom.com/en/3204)、HF `skt/A.X-K2`                                                                                                      |
| K2 Horizon 375B A23B／32B／7B／MoVA 36B A4B | `ifm-k2-horizon-…`（4 個）        | 2026-09-03 | [IFM 發布文](https://ifm.ai/blog/k2/)（MBZUAI 旗下 Institute of Foundation Models）、HF `IFM/K2-Horizon-*`                                                             |

### 由代理依證據決定的事項

- **Mistral Large 4 與 Preview 拆成兩個模型**：Mistral 10-29 的公告說開放權重版是預覽版「再做三週強化學習」的「improved Mistral Large 4」，並在圖表中把「Mistral Large 4 Preview」另列。AA、Epoch、FrontierCode 1.1 也分開列。這比照 Muse Wonder／Muse Wonder Full 的拆分前例（官方公告支持的模型拆分）。
- **兩個版本共用 API 名稱 `mistral-large-4`**：預覽期間 `mistral-large-4` 指預覽版，10-29 後才指正式版，正式版另有 ID `mistral-large-4-0`。處理方式如下：
  - **LiveBench**：同一張表同時列 `mistral-large-4` 與 `mistral-large-4-0`，兩者分數差很多（coding 44.4 對 79.4）。抽查確認 LiveBench 的 `mistral-large-4-0` 顯示為「Mistral Large 4 1029」，是正式版；裸名稱 `mistral-large-4` 沒有版本標示。比照 DeepSeek V4 的既有做法（2026-08-18 使用者決定：舊 build 解析為 null，不合併），把 LiveBench 的裸名稱 `mistral-large-4` 列入新的 `SUPERSEDED_EXACT_NAMES`。它只比對完全相同的名稱，因此 `mistral-large-4-0`、`mistral-large-4-preview` 或未來的 `mistral-large-4.1` 都不受影響；LiveBench 舊表的 `mistral-large-4-high` 去掉檔位後也會比對到它，同樣解析為 null。`mistral-large-4-0` 依 Mistral 文件列為正式版的 alias。程式見 `packages/acquisition/src/materializer-utils.ts`。
  - **Epoch 內部的 `mistral-large-4-0` 指 Preview**：抽查發現 Epoch 的模型版本 ID 中，`mistral-large-4-0` 是 Preview、`mistral-large-4-0-oss` 是正式版，和 Mistral 官方 ID 的意思不同。Epoch 的列以顯示名稱 `Mistral Large 4 Preview (high)`／`Mistral Large 4 (high)` 解析，不經過這個 ID，所以兩者都對應正確（抽查 s23）。alias `mistral-large-4-0` 只依 Mistral 官方的定義；若日後有來源以 Epoch 的內部 ID 作為標籤，需要另加來源層級的對應。
  - **Vals**：同時有 `mistralai/mistral-large-4`（22 列）與 `mistralai/mistral-large-4-oss`（10 列），原始資料沒有模型名稱或日期，無法證明各是哪一版，所以兩者都不加 alias、保持未解析。
- **Gemini 3.1 Flash-Lite 登記為單一模型**：Google 的 changelog 把 5-07 的 `gemini-3.1-flash-lite` 稱為「Gemini 3.1 Flash-Lite 的 GA 版本」，沒有說它是另一個模型。因此預覽版 ID 列為 alias，發布日用預覽版上線的 03-03。AA 這一列的 slug 是 `-preview`，Vals 是預覽版，GBENCH 是 GA 版。
- **Inkling Small 與 Inkling 2 Small 是不同模型**：Thinking Machines 把 Inkling 2 Small（11-05）稱為第二代。Terminal-Bench 的 `Inkling Small 2` 標籤無法確定指哪一個，所以不加 alias。
- **Mistral Medium 3.5 已被 Mistral 標為 deprecated（10/31/2026）**：目錄沒有使用 `deprecated` 旗標的先例，而且這個旗標會讓模型被排除，所以不設定，只在這裡揭露。
- **新的廠商 ID**：`mistral`、`inclusionai`、`upstage`、`apodex`、`sk-telecom`、`ifm`。
- **其他來源的 alias**：只加入精確的來源標籤或官方 ID（例如 `zai/glm-5.3-flash`、`Muse Glimmer 30B`、`baseten/nemotron-3.5-super-vl-120b-a12b`），沒有模糊比對。`baseten/` 是 Vals 標示的託管商，後半段與 NVIDIA 官方 ID 完全相同。

## 來源變化

用 `pnpm data:materialize-snapshots`、`rematerialize:vals`、`materialize:effort-reports` 離線重建。逐列比對 HEAD 後，所有 candidates／costs 的變動都是「原本 null 的身分補成新模型」：分數、來源欄位與 evidence 都沒變；Epoch 以模型、benchmark、檔位、分數比對內容。列 ID 變更是 ID 含身分的正常結果。

產品 evidence 中補上身分的列數（共 753 列）：

| 新模型                  | evidence 列 | 有計分列的來源數 | 來源                                                                                                                        |
| ----------------------- | ----------: | ---------------: | --------------------------------------------------------------------------------------------------------------------------- |
| GLM-5.3-Flash           |          87 |               14 | Vals 34、AA 19、LiveBench 11、Epoch 7、FrontierCode 4、ARC 3、Terminal-Bench 2、FrontierSWE、GBENCH、MaxxBench、Surge ×4    |
| Inkling Small           |          76 |                6 | Vals 33、AA 27、Epoch 7、ARC 6、FrontierCode 2、Terminal-Bench 1                                                            |
| Gemini 3.1 Flash-Lite   |          55 |                4 | Vals 24、AA 20、Epoch 10、GBENCH 1                                                                                          |
| Mistral Large 4         |          51 |               16 | AA 22、LiveBench 7（`-4-0`）、Epoch 7、FrontierCode 2.0 3、cwe-bench、GBENCH、Scale SWE Atlas、Terminal-Bench、Surge ×8     |
| MiMo V2.6 Flash         |          47 |                4 | Vals 31、AA 14、GBENCH、Terminal-Bench                                                                                      |
| MiniMax M3.1 Flash      |          46 |               10 | AA 16、Vals 14、LiveBench 7、GBENCH、Surge ×6；ALE 2 列為 EXCLUDED（見下）                                                  |
| Gemma 4 31B             |          43 |                4 | AA 27、LiveBench 7、Epoch 4、Zapier 1；Vals 4 列都是 EXCLUDED                                                               |
| Mistral Medium 3.5      |          40 |                2 | Vals 21、AA 18；Epoch 1 列為 EXCLUDED                                                                                       |
| Nemotron 3.5 Super VL   |          32 |                6 | AA 15、Vals 11、ARC 3、GBENCH、Scale SWE Atlas、Terminal-Bench                                                              |
| Mistral Large 4 Preview |          24 |                2 | AA 15、Epoch 9                                                                                                              |
| Qwen3.8 Flash Next      |          23 |                3 | AA 18、LiveBench 4、MaxxBench 1                                                                                             |
| Muse Glimmer            |          22 |                6 | AA 17、GBENCH、Surge ×4                                                                                                     |
| Nemotron 3.5 Lightning  |          21 |                2 | AA 17、LiveBench 4                                                                                                          |
| 其他 11 個              |     各 9–23 |                1 | 只有 AA：Mistral Small 4、Apodex 1.1、A.X-K2、Gemma 4 E4B、Granite 4.2 30B、Solar Pro 4、Ling 3.1 Flash 1019、K2 Horizon ×4 |

Epoch 列 ID 含列位置，以模型、benchmark、檔位與分數比對內容；Epoch 的變動全部是身分補上，沒有內容增減。

- **ALE 的 MiniMax M3.1 Flash 兩列**：Claude Code 與 Codex 兩個 harness 發布同一個 profile。補上身分後，依既有規則改為 EXCLUDED，理由是「multiple harnesses publish this profile; not reviewed」。這兩列原本沒有身分，本來就不進任何計分。
- **FrontierCode 1.1 的 `Mistral Large 4 (Preview)` 兩列仍是 null**：上游已移除這兩列，materializer 依「上游移除時保留既有資料」原樣帶入，連當時的 null 身分也一起保留。這是既有設計的缺口，已另開任務處理。
- **驗證報告**：離線重建會整份重寫 `validation-report.md`。處理方式與 Haiku 那次相同：
  - 沒有身分變化的 3 個來源（DeepSWE、OpenAI／Anthropic 發布頁），報告還原成 HEAD；
  - AA 的「AA-Briefcase rows retained」「Visible comparison」與 LiveBench 的「Visible comparison」原樣加回；
  - 「Snapshot delta」不加回。
- **只有順序改變的檔案已還原**：BioBasicsBench `candidates.json`（列順序）、Vals `manifest.json`（網址順序）。

## 集合與逐模型影響

- **前沿前 20 名**：模型、順序、AA 分數與代表檔位都不變。
- **28 個集合**：`presets` 逐位元組相同，每個集合的共同測試、模型、名次與 Overall 都沒變。預設集合仍是 `aa-top-9`，共同測試 9 項。
- **新模型**：都在前沿窗口外，AA 最高是 Ling 3.1 Flash 1019 的 29.57。新增 42 個 profile，最多的是 Inkling Small（non-reasoning、low、medium、high、xhigh、max）和 Mistral Large 4（low、medium、high、max）。
- **審核帳**：`identity-review.json` 的 `entries` 為空，`frontier` 步驟的身分審核通過。

## 程式審查

`materializer-utils.ts` 與兩個測試的改動，由 Agent 工作者唯讀審查（Codex 額度用完），提出 6 點：

- **採用（風險）**：原本把 `mistral-large-4` 放進以字首比對的 `SUPERSEDED_BUILDS`，範圍太寬。LiveBench 日後若出現 `mistral-large-4-preview` 或 `mistral-large-4.1`，都會被靜默解析為 null；`mistral-large-4-0-high` 這類名稱的價格也會被丟掉。已改為只比對完全相同名稱的 `SUPERSEDED_EXACT_NAMES`，並補上單元測試。
- **採用（nit）**：全域的 `CURRENT_BUILD_ALIASES` 條目會讓 Epoch 走 dated 路徑，產生不同格式的 profileId，也可能觸發 AA 的「只留最新 build」篩選。`mistral-large-4-0` 本來就是 `models.json` 的 alias，所以拿掉這個條目。
- **採用（nit）**：Chartography 測試原本改成「至少一列解析成功」，幾乎驗不到東西。改為「每個解析出的身分都是目錄中的模型」，這個條件不依賴目錄現有內容。
- **已知**：FrontierCode 1.1 保留列的身分，已另開任務處理。

修改後重新離線重建，`data/sources` 與修改前逐位元組相同；acquisition 測試 631 個全數通過，lint 與 typecheck 通過。

## 已知未解

- **Vals 的 `mistralai/mistral-large-4` 與 `-oss`**：無法判定版本，保持未解析。
- **FrontierCode 1.1 保留列的身分不會重新解析**：已另開任務處理。
- **Terminal-Bench 的 `Inkling Small 2`**：不確定指哪個模型，保持未解析。
- **`Workspace integration timing` 檢查**：在 PR #90–#92 都失敗。這不是必要檢查，與本次無關，已另開任務處理。

## 檔位推測揭露表（強制）

新模型都沒有進入預設集合。release 報告的「Effort inferences reaching the default preset」只有原本就有的 Claude Sonnet 5.5／AutomationBench 一列，與本次無關。

來源層級的推測共 1536 筆，比登記前的 HEAD（1068 筆）新增 468 筆，移除 0 筆。新增列全部屬於這次登記的模型：

- **跨來源推測 218 筆**：例如 AA 的 GLM-5.3-Flash 列依 ARC Prize 的 `max`、Inkling Small 依 ARC 的 `xhigh`、Gemma 4 31B 依 LiveBench 的 `max`、Gemini 3.1 Flash-Lite 依 Epoch 的 `high`、GBENCH 的 `mistral-large-4-0` 依 AA-Briefcase 的 `high`。
- **default 250 筆**：來源沒有標示，也沒有可用的跨來源依據。

逐列明細見 [檔位表](2026-11-24-aa-identity-review-effort-inferences.md) 與 [JSON](2026-11-24-aa-identity-review-effort-inferences.json)，新增列在表中標為「新增」。

## 代理抽查

抽查由另一個 Agent 工作者執行（Codex 額度用完）。它沒有參與匯入，也沒有讀 `data/sources` 或 `data/product`，直接向各來源網站取得即時資料比對。第一次嘗試因網路錯誤中斷，重新派出後完成。

樣本由腳本產生：22 個有新身分 INCLUDED 列的來源各 1 筆（優先選有拆分或合併判斷的模型），另加 Epoch 的 Mistral Large 4 Preview 與 LiveBench 的 `mistral-large-4-0` 兩筆，用來確認拆分是否正確。

**結果：數值 24 筆全部相符；身分 24 筆全部相符，0 筆有疑慮，0 筆未查核。** 原始回應 31 份與 SHA-256 清單存在 `artifacts/research/2026-11-24-aa-identity-review/spotcheck/raw/`，`sha256sum -c` 全部通過。

抽查代理回報的方法變更：

- ARC Prize 提示中的 JSON 端點回傳 HTML，改用網站 `data.js` 指向的 `/media/data/evaluations.json`。
- GBENCH 頁面是 SPA 空殼，改用 `/api/v1/global/rankings`。
- Zapier 的排行資料寫在頁面載入的 Framer 模組裡。
- 中斷前已下載、能確定來源網址的檔案直接沿用，觀察時間記為檔案修改時間（08:02–08:03Z）。LiveBench CSV 與 FrontierCode JSON 重抓後位元組相同；Epoch zip 重抓後檔案不同，但用到的列逐字相同。

身分附註（不構成疑慮）：

- CWE-bench、Scale SWE Atlas、Surge 只寫「Mistral Large 4」，沒有標 Preview 或 build 日期，也沒有 Preview 的跡象。Scale 的登錄時間 11-11 晚於正式版。
- CWE-bench 頁面不顯示 effort。
- Epoch 內部的 `mistral-large-4-0` 指 Preview（見「由代理依證據決定的事項」）。

| 樣本 | 來源                      | 來源標籤 → 模型                                                         | 欄位                                   | 期望值                       | 觀察值（UTC）                                       | 數值 | 身分         |
| ---- | ------------------------- | ----------------------------------------------------------------------- | -------------------------------------- | ---------------------------- | --------------------------------------------------- | ---- | ------------ |
| s01  | arc-prize                 | `Nemotron 3.5 Super VL (None)` → `nvidia-nemotron-3-5-super-vl`         | ARC-AGI-2 score（v2 Semi-Private）     | 0.008333333333333333（0.8%） | score 0.008333333333333333（0.8%）（09:12）         | 相符 | 相符         |
| s02  | artificial-analysis       | `GLM-5.3-Flash` → `zai-glm-5-3-flash`                                   | MKA Climb WSR                          | 0.3623837773322437（36.2%）  | mkaClimbWsr 0.3623837773322437（36.2%）（08:03）    | 相符 | 相符         |
| s03  | cwe-bench                 | `Mistral Large 4` → `mistral-mistral-large-4`                           | pass@1（All）                          | 45.6                         | 45.6%（08:02）                                      | 相符 | 相符（附註） |
| s04  | epoch-ai                  | `Inkling Small (xhigh)` → `thinking-machines-inkling-small`             | `mean_score`（FrontierMath Tier 4 v2） | 0.17073170731707318（17.1%） | 0.17073170731707318（17.1%）（08:02）               | 相符 | 相符         |
| s05  | frontier-code             | `Inkling Small` → `thinking-machines-inkling-small`                     | `new_score`（加權 rubric 分數）        | 0.0396（3.96%）              | new_score 0.0396（correct 0.0455）（08:02）         | 相符 | 相符         |
| s06  | frontier-swe              | `GLM-5.3 Flash` → `zai-glm-5-3-flash`                                   | Mean@5 overall                         | 18.125205882352944（18.1%）  | overall 18.125205882352944，頁面顯示 18.1%（08:03） | 相符 | 相符         |
| s07  | gbench                    | `minimax/minimax-m3.1-flash` → `minimax-minimax-m3-1-flash`             | Agentic Coding GScore                  | 0.5156                       | 0.5156（CI 0.4697–0.5576，24 games）（09:17）       | 相符 | 相符         |
| s08  | livebench                 | `gemma-4-31b` → `google-gemma-4-31b`                                    | research                               | 38.1                         | 38.1（08:02）                                       | 相符 | 相符         |
| s09  | maxxbench                 | `Qwen3.8 Flash Next` → `alibaba-qwen3-8-flash-next`                     | MaxxBench score（任務成功率）          | 46.06741573033708（46.1%）   | 46.06741573033708，頁面顯示 46.1%（08:02）          | 相符 | 相符         |
| s10  | scale-swe-atlas           | `Mistral Large 4 (Mistral Vibe) high` → `mistral-mistral-large-4`       | Overall score                          | 45.19                        | 45.19（± 5.83）（08:03）                            | 相符 | 相符（附註） |
| s11  | surge-chartography        | `Muse Glimmer 30B (xHigh reasoning)` → `meta-muse-glimmer`              | 主排行分數                             | 15.4                         | 15.4%（08:03）                                      | 相符 | 相符         |
| s12  | surge-complex-constraints | `Mistral Large 4 (High reasoning)` → `mistral-mistral-large-4`          | 主排行分數                             | 42.4                         | 42.4%（08:03）                                      | 相符 | 相符（附註） |
| s13  | surge-corecraft           | `Muse Glimmer 30B (xHigh reasoning)` → `meta-muse-glimmer`              | 主排行分數                             | 51.8                         | 51.8%（08:03）                                      | 相符 | 相符         |
| s14  | surge-dayjob-finance      | `GLM 5.3 Flash (Max reasoning)` → `zai-glm-5-3-flash`                   | 主排行分數                             | 7.3                          | 7.3%（08:02）                                       | 相符 | 相符         |
| s15  | surge-dayjob-healthcare   | `MiniMax M3.1 Flash (Max reasoning)` → `minimax-minimax-m3-1-flash`     | 主排行分數                             | 4                            | 4%（08:03）                                         | 相符 | 相符         |
| s16  | surge-dayjob-law          | `Mistral Large 4 (High reasoning)` → `mistral-mistral-large-4`          | 主排行分數                             | 0.6                          | 0.6%（08:03）                                       | 相符 | 相符（附註） |
| s17  | surge-dayjob-tax          | `Mistral Large 4 (High reasoning)` → `mistral-mistral-large-4`          | 主排行分數                             | 0                            | 0%（08:03）                                         | 相符 | 相符（附註） |
| s18  | surge-gdp-xlsx            | `MiniMax M3.1 Flash (Max reasoning)` → `minimax-minimax-m3-1-flash`     | 主排行分數                             | 12                           | 12%（08:03）                                        | 相符 | 相符         |
| s19  | surge-riemann             | `Mistral Large 4 (High reasoning)` → `mistral-mistral-large-4`          | 主排行分數                             | 20                           | 20%（08:02）                                        | 相符 | 相符（附註） |
| s20  | terminal-bench            | `MiMo V2.6 Flash` → `xiaomi-mimo-v2-6-flash`                            | accuracy                               | 16.06                        | accuracy 16.06，畫面 "16.1% ± 3.4%"（08:03）        | 相符 | 相符         |
| s21  | vals-ai                   | `google/gemini-3.1-flash-lite-preview` → `google-gemini-3-1-flash-lite` | Overall accuracy                       | 0                            | accuracy 0.0（頁面內嵌同值 0）（09:19）             | 相符 | 相符（附註） |
| s22  | zapier-automationbench    | `Gemma 4 31B (Max)` → `google-gemma-4-31b`                              | task_completed_correctly               | 1.7                          | 1.7%（09:20）                                       | 相符 | 相符         |
| s23  | epoch-ai                  | `Mistral Large 4 Preview (high)` → `mistral-mistral-large-4-preview`    | `mean_score`                           | 0.9833333333333333（98.3%）  | 0.9833333333333333（98.3%）（08:02）                | 相符 | 相符         |
| s24  | livebench                 | `mistral-large-4-0` → `mistral-mistral-large-4`                         | coding                                 | 79.4                         | 79.4（08:02）                                       | 相符 | 相符         |

## 重大變更判斷

**沒有重大變更**。依據：

- 前沿、28 個集合與預設集合逐位元組相同，沒有任何既有模型的分數、名次或 Overall 改變。
- 產品差異只有 24 個新模型的身分、42 個 profile 與 56 筆成本，屬於「新模型尚未滿足門檻」的正常情形（OPERATIONS §5）。
- 每個身分都有官方證據。拆分與合併的判斷屬於代理可依證據自行決定的範圍，依據已寫在上文。
- LiveBench 舊版名稱的處理沿用使用者既有決定。

## UI 驗證

release 的 `site` 與 `e2e` 步驟通過，產品 `versionId` 為 `sha256:0f65655bafe325e1233aadfd1424acbdcc49a6b4cf872b727338e07229994055`。
