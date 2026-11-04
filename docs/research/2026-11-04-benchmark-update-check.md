# 2026-11-04 模型 Benchmark 聯網查核

以 commit `ea992064c0679b990c56989c29f8606c17576927`、產品 `sha256:b4e69142d30cf90e59f9ce5c01724dc1b9f1edb9eb97fd313e5e6d6052b82393` 為匯入前基準，與 [11/03 紀錄](2026-11-03-benchmark-update-check.md) 比較。來源欄位、版本、時間、SHA-256 及原始回應 manifest 見 [JSON](2026-11-04-benchmark-update-check.json)。本次原始資料保存於 `artifacts/research/2026-11-04-benchmark-check/`。

本次完成 21 個現役來源的查核與物化。AA Index 跟隨 v5.0.1、CritPt v2 Full Set 27 筆既有成績重評，補上 Carbon low 與部分模型覆蓋／成本；Epoch 新增 22 筆可物化成績；Vals 新增 Kimi 的 SREBench 成績及成本。IBM 官方模型卡支持 Granite 4.2 8B 精確身分對應，來源未明示的 effort 保持 null。預設八模型／12 項測試及九集合排名均相符，完整影響與獨立抽查見刷新報告。

完整來源物化、產品差異、release 與獨立代理抽查見 [刷新報告](../refresh/2026-11-04.md)。

本次以 **實際保存的 11/03 raw bytes** 為基準，重新要求昨日 manifest 全部 166 個 URL，另循官方連結追查方法、模型卡與定價，共 189 個 URL。保存 **187 份 HTTP 回應：181×200、4×404、2×403**；兩個 LongCat URL 多次逾時。每份 URL、HTTP status、觀察時間、大小、SHA-256 與基準 hash 保存在 web／vendors manifests。187 份 bytes 全部回讀驗證通過。首次取得的頁面 baseline 為 null，不把首次發現日期當發布日期。

## AA Index v5.0.1 與 CritPt 全模型重評

[AA changelog](https://artificialanalysis.ai/changelog) 的 **2026-11-03** 條目明示：採用 CritPt 作者的 grading robustness 改進，對所有模型的 CritPt v2 成績重新評分；Index 版本從 **5.0 → 5.0.1**。目前[完整方法](https://artificialanalysis.ai/methodology/intelligence-benchmarking)也更新版本與 November2026 grading update。

| 項目                  | 目前方法                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| CritPt v2 Full Set    | 70 題、每題5 repeats、mean pass@1；獨立評測，不在 Index 中                                          |
| CritPt v2 Hard Subset | 固定40題；排除推出時7個前沿模型在5次嘗試均解出的30題；Index權重10%                                  |
| 執行                  | Stirrup、離線Linux、Python3.13及numpy/scipy/sympy/matplotlib、最多50turns                           |
| 評分                  | 官方 grading server；先執行與評分70題，再分別報告 Full Set／Hard Subset                             |
| 已證實異動            | grading robustness 與既有輸出的重新評分；未公告新 checkpoint、重新生成模型輸出或改變題數／Index權重 |

目前 [CritPt v2 詳頁](https://artificialanalysis.ai/evaluations/critpt-v2)同時保有 Full Set／Hard Subset。AA資料的 `critpt-v2` 與 `critpt-v2-hard` 必須分開。不能用 Index 的40題分數取代70題成績。可依既有來源 benchmark 改版跟隨新版政策處理，再由主流程核對影響。

本次跟到[作者 GitHub](https://github.com/CritPt-Benchmark/CritPt)、[原始 README](https://raw.githubusercontent.com/CritPt-Benchmark/CritPt/main/README.md)、HF及 commits。README確認 deployed v2、5×70題；最新 commit **c998cd7（11/03）只改 AA連結**，較早 **bc37a22（10/22）** 是v2資料修訂。捕獲的作者公開文件未公開本次 grading-server patch 細節，不能把10/22 dataset commit當成11/03 grader patch。版本與重新評分日期以AA當前明示為據。

完整逐欄差異見 `aa-model-row-diff.json`。完整 catalog 中有 scores 的物件 **278→279**；既有61筆 Hard Subset及61筆Index有變，65筆Briefcase Elo也有小幅變動，另外有 latency／throughput與少數獨立成績／成本異動。不能把所有欄位變化都歸因於CritPt。

- Grok4.7 Terminal-Bench-Science：0.047619→0.114286；Index每任務成本7.51177→7.77154。
- DeepSeek1017 High新增Index每任務成本 **$0.456194498**。
- 新增部分模型的TBScience、HLE-Diamond、FrontierCode2.0欄位，完整 before／after已保存。
- AA Index只屬外部指標／選模依據；對產品Overall或預設集合的影響由正式release逐一核對。

## Carbon Low 詳頁正式可用

昨日404的[Carbon Low](https://artificialanalysis.ai/models/gemini-4-carbon-low)現在200，正是 catalog總數 **722→723** 唯一新增的模型slug `gemini-4-carbon-low`。已即時通知來源刷新代理補擷取。

官方payload：Index **54.2206114502924**、Index每任務成本 **$7.186577262951972**、Hard Subset **0.65**；token單價 input$4／output$20／cached$0.20每百萬tokens，1Mcontext。這是既有Carbon的Low effort，非新checkpoint。

完整catalog有scores物件與來源materializer的evaluation／detail union是不同母體。昨日Granite8B新增可物化欄位、Nanbeige需單獨detail補擷取，與昨日catalog新增三列並不矛盾；本次catalog唯一新增列是CarbonLow。

## Epoch 新列與精確身分證據

本次ZIP新增 **25個run rows**：6個Doubao profiles各3個benchmark，加Mistral OSS High的7個benchmark。原始run CSV同樣1793→1818、增加25列；主流程回報新增22個候選，另外3個Chess／Mystery Game／Furniture Assembly rows屬materializer範圍之外。詳見 `epoch-added-runs.json`、`epoch-zip-diff.json`。

Mistral新列使用明示 `mistral-large-4-0-oss_high`，可與原Preview分開追蹤；本次保存的官方OSS公告／README／technical report繼續支持10/29的獨立OSS身分。主流程本次保留Epoch這些未整合的alias作研究紀錄；不能由generic label或數值相同擴大全域mapping。

ZIP metadata另新增28個Doubao effort／unknown變體，只有6個profile帶本次新增run；不能稱28個新checkpoint。既有3筆DeepSeek metadata主要是training compute變動。

### Doubao 官方原始證據

[官方模型列表](https://console.volcengine.com/ark/region%3Acn-beijing/docs/model-list)與[發布紀錄](https://console.volcengine.com/ark/region%3Acn-beijing/docs/model-release-announcement)明示下列API ID：

- `doubao-seed-2-0-lite-260428`
- `doubao-seed-2-0-pro-260215`
- `doubao-seed-2-1-pro-260628`
- `doubao-seed-2-1-turbo-260628`

Epoch用2.0／2.1 punctuation；官方ID用2-0／2-1。已保存exact suffix及provider證據，逐checkpoint發布日／評測設定仍待補。

[Seed Evolving官方模型卡](https://ark.volcengine.com/models/doubao-seed-evolving.md)明示 `doubao-seed-evolving` 是 **latest-version滾動alias**，首次推出 **6/23**、最新顯示升級 **9/09**，metadata更新10/16。[專屬方法](https://ark.volcengine.com/region:cn-beijing/docs/latest-model.md)支持1Mcontext、none／minimal／low／medium／high／xhigh／max，default high，並建議回傳加密思考內容。Epoch的11/02日期不能證明一個11/02固定checkpoint或發布日。

## Granite 4.2 8B 官方身分已補齊

[IBM官方模型卡](https://huggingface.co/ibm-granite/granite-4.2-8b/raw/main/README.md)明示 **Release Date August25,2026**；provider IBM／Granite Team，exact repo `ibm-granite/granite-4.2-8b`，Apache2.0、bfloat16、base `granite-4.1-8b-base`、128K原生／512K延伸context。revision **a7042144125ce5ae64f89610e8289647fc000b9a**。[AA詳頁](https://artificialanalysis.ai/models/granite-4-2-8b)直接連到同一官方repo。

主流程已依這份證據新增canonical `ibm-granite-4-2-8b`，正式重物化17筆來源記錄。整合的是精確模型身分；source effort null仍保留其語義。這是8月發布的模型，本次補齊官方證據。

官方自報TB2.1 **20.56**、SWE Verified47.67、SWE Pro19.11、SciCode36.09列為補充候選。README只說NeMo Evaluator SDK及一般generation設定，未完整提供逐row coding harness／mode／attempts／每任務成本，不宣稱這些自報分數已整合。

## 新的 effort 與 harness 比較研究

[Vals 11/03文章](https://www.vals.ai/blogs/reasoning-effort)測試7個模型、各3個efforts、8個Vals Index benchmark。每個setting跑固定 **約一半任務的subset**，大多只有1run；subset選擇用於重現full benchmark的模型排序。價格按list price，Code Migration由tokens估計，Index成本為8榜plain mean。使用paired bootstrap、BH多重比較校正；過去主榜runs與10月lower-effort runs不同時點也可能受provider更新影響。

文章的22/56較低effort同分或更好且更省、事後最佳effort增加6points等是這個實驗的結果；不能把subset成績覆蓋正式全榜。今日Vals Tax頁也改用provider原生effort標示。完整畫面文字差異保存於 `visible-word-deltas.json`。

[Surge 11/03 harness研究](https://surgehq.ai/blog/coding-agent-harnesses-comparison)使用既有sudoL7、Opus5.5。Vanilla xhigh比medium提高11.3points、成本3.5倍；Superpowers+2.4／1.1倍，goal+review+3.3／1.8倍；Compound Engineering成本8倍且未證明統計上改善。這是固定模型的harness／effort研究，沒有新增benchmark身分。

## 補充廠商分數、價格與待查

`artifacts/research/2026-11-04-benchmark-check/vendors/supplemental-candidates.json`共12組，明示 located／method-read／row-verified／integrated狀態與缺口。先前已讀方法只在本次bytes或正文比較支持下保留其階段。

| 項目                                | 本次可檢查的現況                                                                                                                                                                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mistral OSS                         | technical report與README bytes相同；公告global model card新增cached input$0.07/M。PDF仍將CritPt Hard Subset、internal BrowseComp85與blog84.5分開                                                                                         |
| Nanbeige4.3                         | 官方README bytes相同；精確發布日仍null，最高thinking與公開600題AutomationBench限制持續                                                                                                                                                   |
| DeepSeek1017／NVFP4                 | 官方README bytes相同；量化repo與base身分分開                                                                                                                                                                                             |
| Kimi／Anthropic                     | Kimi文章正文及三份system-card PDF bytes相同；既有逐row設定缺口仍記錄                                                                                                                                                                     |
| Particle1                           | 官方公告bytes相同；base只明示DeepSeekV4.1Flash，未確認1017suffix或exactAPI checkpoint                                                                                                                                                    |
| LongCat2.5                          | 兩個官方app bundles bytes相同；pricing、modeldocs及首頁已重新取得。release／changelog多次45秒逾時，未聲稱今天重新渲染DOM。相同bundle仍含TB4 dashboard37.2／fulltable38.5衝突                                                             |
| Rosalind                            | 首次取得[官方定價](https://developers.openai.com/api/docs/pricing)：短contextinput$15／output$75／cached$1.50每1Mtokens；30m／12hcache-write$18.75／$37.50。不是已證明的今日價格調整；專屬model404、Help403，benchmark方法與任務成本仍缺 |
| FrontierMemory1.1                   | changelog bytes相同、blog正文相同；當前首次首頁擷取遇DNS失敗後重試成功                                                                                                                                                                   |
| Immigration／CyberOffense           | 重新取得200；UI／文字delta已保存，未發現新catalog路徑；不以路徑相同推論方法相同                                                                                                                                                          |
| DualChem                            | PDF bytes相同；landing仍404                                                                                                                                                                                                              |
| DAYJOB Accounting／DataScience／Law | 三個SII頁正文相同；Surge catalog沒有新對應路徑                                                                                                                                                                                           |
| DeepSeekCyber                       | 官方homepage／updates bytes與latest8 repo持續未支持exactcheckpoint；第三方頁新增latest推薦不構成官方身分                                                                                                                                 |
| xAI watermarking11/07               | 官方文件與release notes正文相同；事件日期尚未到                                                                                                                                                                                          |

## 有界覆蓋與保存

目前AA／Vals／Surge／Scale的benchmark路徑集合分別 **38／62／13／20**，與11/03相同；Scale保留query-distinct large／small及full／hard路由。Surge兩個v1.1榜的當前可見列／方法文字相同，沒有把昨日版本切換重算成今日更新。

SII的66個board objects與昨日逐欄相同，last_updated仍11/02；昨日15榜變動不是本次新增。ARC evaluations／datasets／models、Cognition兩版data、LiveBench table／cost／categories及DeepSWE1.1 JSON本次bytes相同。16個已追蹤HF組織各最新8repo的ID／createdAt集合相同；另查Meituan最新8repo。這只限制在目前捕獲範圍，不能推論全網沒有其他新模型。

OpenAI news、Rosalind Help為403；TerraPro／Rosalind model、DualChem landing與最初猜測的Doubao路徑為404。Doubao後續已沿官方index找到正確頁面。Google兩份HTML回傳gzip，保留原始壓縮bytes計算hash，再解壓作正文比較。LongCat兩個失敗URL的時間／錯誤有明確紀錄，未用昨日bytes冒充今日回應。

逐欄delta、來源時間、模型身分候選、supplemental方法狀態與所有限制集中在 `discovery.json`；原始完整性回讀結果見 `raw-integrity-verification.json`。
