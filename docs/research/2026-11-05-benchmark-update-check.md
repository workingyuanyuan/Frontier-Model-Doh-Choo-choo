# 2026-11-05 模型 Benchmark 聯網查核

以 commit `a958e0484878930652f0bd2c2ef92586b96ec651`、產品 `sha256:e44d51fa19b173bb4fcffeba12d67d3cdbcaac7cd93730d524db142bdfe22dac` 為匯入前基準，與 [11/04 紀錄](2026-11-04-benchmark-update-check.md) 比較。來源欄位、版本、時間、SHA-256 及原始回應 manifest 見 [JSON](2026-11-05-benchmark-update-check.json)。本次原始資料保存於 `artifacts/research/2026-11-05-benchmark-check/`。

本次完成 21 個現役來源查核與物化，依原廠證據新增 Hy4、SWE-2 Flash、Muse Spark Open 三個精確模型身分及八個 profiles。FrontierCode 新增六組成績與任務成本，Vals 新增 Hy4 十組成績／成本，AA 補齊六個既有配置的 v5.0.1 Index 與部分直接測試／成本。Epoch 公告 Bayesian ECI 方法並更新相關資料，另有 Chess 重評；Kimi K3.1 Pro 官方權重庫已可公開取得。完整方法、逐欄差異與產品影響分列於本研究及刷新報告。

完整來源物化、產品差異、release 與獨立代理抽查見 [刷新報告](../refresh/2026-11-05.md)。

以 **實際保存的 11/04 raw bytes** 為比較基準，重新擷取前日189個URL，再循官方發布／模型頁／方法連結查核，共 **230個URL、230份HTTP回應：221×200、6×404、2×401、1×403**。全部raw bytes已回讀核對SHA-256與大小，230份通過；URL、來源header時間、觀察時間、大小、hash與基準hash分別保存在 `web/manifest.json`、`vendors/manifest.json`。擷取失敗曾使11/04沒有raw的LongCat兩頁，今日baseline仍為null，不用較舊回應假冒11/04比較。

## 影響當期來源的三個精確模型身分

| 模型            | 官方身分與發布日                                                                 | 本次新來源覆蓋                               |
| --------------- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| Hy4             | Tencent正式API ID `hy4`；11/04；與 `hy4-preview` 分開                            | Vals `tencent/hy4` 的10個benchmark／index列  |
| SWE-2 Flash     | Cognition；11/04；276B-A12B，以Thinking Machines Inkling-Small再mid-training＋RL | FrontierCode2.0 low／max兩列                 |
| Muse Spark Open | Meta；**10/15**；官方repo `meta-models/Muse-Spark-Open-816B-A42B`                | FrontierCode2.0 low／medium／high／xhigh四列 |

[Hy4官方發布動態](https://cloud.tencent.com/document/product/1823/130675)明示11/04新增，原廠[模型列表](https://cloud.tencent.com/document/product/1823/130051)及[呼叫指南](https://cloud.tencent.com/document/product/1823/132252)同時列出正式Hy4與Preview，1M context／960k input／64k output，正式版新增圖片理解。[Vals模型頁](https://www.vals.ai/models/tencent_hy4)也明示新舊版本差異。Vals使用OpenRouter、temperature0.9／top_p1，費用用Tencent list price；per-benchmark可能有不同設定，不能把頁面default設定視為每列完整方法。

[SWE-2 Flash官方原文](https://cognition.com/blog/swe-2-flash)明示與SWE-2及Inkling-Small各自獨立。目前Devin Desktop／CLI可用；原文明示權重尚未公開，計畫與可信研究／產業夥伴分享。不能因文章談透明存取就標成已開放權重。

[Meta原始發布文](https://research.meta.ai/blog/muse-spark-open)與[官方模型頁](https://dev.meta.ai/models/muse-spark-open/)確認Muse Spark Open為816B總參數／42B active、1M context，從Muse Spark額外安全post-training；它是10/15發布的獨立checkpoint，並非今日才發布。官方HF API200／原始README401 gated；發布文與模型頁足以確認身分，NVFP4另保留量化身分。

三筆精確證據、canonical建議、alias、releaseDate及每份artifact的SHA／觀察時間保存於 `artifacts/research/2026-11-05-benchmark-check/vendors/new-model-identities.json`。主流程已依既有政策新增 `tencent-hy4`、`cognition-swe-2-flash`、`meta-muse-spark-open`。主流程依官方身分對全來源精確alias重新物化；最終來源／產品數值與完成狀態以刷新報告及最終release為準。

FrontierCode2.0官方JSON本次新增六列，1.1資料bytes相同。逐列score／paired task cost／harness保存於 `artifacts/research/2026-11-05-benchmark-check/vendors/frontiercode-new-profile-rows.json`：

| 模型／effort           | 分數% | USD/task | 原廠JSON harness |
| ---------------------- | ----: | -------: | ---------------- |
| SWE-2 Flash low        | 23.17 |   0.2030 | devin            |
| SWE-2 Flash max        | 24.00 |   0.2024 | devin            |
| Muse Spark Open low    |  0.42 |    0.593 | devin-cli        |
| Muse Spark Open medium |  1.63 |    1.865 | devin-cli        |
| Muse Spark Open high   |  3.95 |    6.780 | devin-cli        |
| Muse Spark Open xhigh  |  6.24 |    9.157 | devin-cli        |

## Kimi K3.1 Pro：官方權重目前已公開可定位

前日最新8repo清單沒有、今日新增的官方repo是 [moonshotai/Kimi-K3.1-Pro](https://huggingface.co/moonshotai/Kimi-K3.1-Pro)，API／README／LICENSE／tree皆200，private=false、gated=false，列出96個safetensors shards。revision **6d0a0202956796543364d666ab19c6ad1a494ee1**。

官方卡明示2.8T總參數／104B active、1M context、MXFP4 weights／MXFP8 activations（QAT）。repo createdAt／lastModified均11/02，**不能自動當正式權重發布日**；本次證明的是目前可見的公開官方權重repo，不證明11/05才發布，也不宣稱新checkpoint。先前「weights pending」研究狀態已更正。

完整模型卡有 **47列benchmark比較**，另保存為 `artifacts/research/2026-11-05-benchmark-check/vendors/kimi-k31-benchmark-rows.json`，方法腳註見 `artifacts/research/2026-11-05-benchmark-check/vendors/txt/kimi-k31-method-footnotes.md`。重要可比性界線：

- Kimi TB4 **65.7**、TBScience0.1 **38.1**、DeepSWE1.1 **75.5**均使用Claude Code，預設max／T1／top_p0.95；逐列attempts與task costs未完整提供。
- TBScience表面欄名寫DS1017，但腳註明示表中 **15.7其實來自較舊DeepSeek V4.1 Flash**，1017內部run是9.3。不能依表頭把比較列誤歸1017。
- ProgramBench將每題分數達95%才記1；BenchCAD僅1,000／17,900案例subset；GDP.pdf with-python是macro rubric，無工具版本是strict pass，不能混用。
- 外部proprietary模型比較列標示fallback；其他部分分數引用主辦方或廠商報告。數值相同不證明執行環境相同。

## AA Performance Benchmarking v3.0.0

[今日捕獲的changelog](https://artificialanalysis.ai/changelog)新增 **03Nov條目**；[完整效能方法](https://artificialanalysis.ai/methodology/performance-benchmarking)的Version History則標示 **30October2026**。兩個來源日期分別保存；本次首次捕獲不是推出日期。

新方法將Time per Task列為headline，Output Speed納入首token等待，混合單次request與多輪agentic workload，排除工具執行時間。各workload在固定load下量測，再以5日run medians等權平均；此前是10k prompt、72小時median。token數採provider API，包含未回傳文字的reasoning tokens；無API計數時才退回response text。

endpoint的429、timeout等錯誤計入0 output speed及Endpoint Error Rate；自身帳號／quota／sandbox／invalid-request等失敗排除。頻率改為6小時，deprecated模型18小時；Prompt Options舊頁與舊load／vision workload被取代。

這是**效能測量口徑**變動。Index仍 **v5.0.1**，CritPt仍70題Full Set與40題Hard Subset、5repeats；本次完整intelligence方法只刪除原先「效能token採o200k_base」的對比文字，沒有再公告一次CritPt regrade或新題目。

AA完整catalog中有scores物件 **279→279**，沒有新增slug；新效能欄位／舊欄位移除與速度語義一起記錄於 `aa-model-row-diff.json`。另有四個既有model新增Hard CritPt欄位、部分FrontierCode／TBScience／Omniscience缺格補齊，Argon Index成本 **7.682671→9.946609**。不能把所有欄位異動歸因於模型能力提高。

### Haiku4.5是歷史模型的新覆蓋

[Anthropic官方原文](https://www.anthropic.com/news/claude-haiku-4-5)日期 **2025-10-15**、API alias `claude-haiku-4-5`。[AA reasoning詳頁](https://artificialanalysis.ai/models/claude-4-5-haiku-reasoning)目前200、明示October2025與deprecated，Index5.0.1顯示7、每Index任務約$0.53。

主流程新增19筆Haiku Reasoning來源列屬materializer的evaluation／detail union；這與完整catalog279物件不同母體。Reasoning配置不是今天發布的新checkpoint；日期超當期freshness，保留研究候選。

## Epoch Bayesian ECI及新增run

[11/04官方公告](https://epoch.ai/publications/eci-bayesian-methodology)與[當前方法](https://epoch.ai/data/eci-documentation/methodology)明示由frequentist least-squares／bootstrap改為beta-likelihood IRT與MCMC joint posterior，各benchmark有自己的noise，報告posterior mean及90%credible interval。Claude3.5Sonnet130／GPT5150兩anchor保留；raw scale改由全benchmark的幾何平均slope與centered difficulty固定。

ZIP內ECI／EDI／sample／processed data同時有變。按Model key對齊，raw ECI表 **271→253列：252個共同key、1個新增、19個移除**。共同列中 **250列任一欄位有變；其中248列的eci point estimate有變，250列的上下CI各自有變**。另外兩列o3-pro、DeepSeek V4 Pro0813僅CI改變，因此來源scalar計數248與本研究任一欄位計數250可同時成立。57個EDI rows也有變。例如Astra169.06→169.07、Sol167.82→168.94、Opus168.40→168.36、Terra168.11→167.82；較弱歷史模型可下降逾30points。完整數值與CI差異保存於 `epoch-eci-field-diff.json`。

樣本檔仍名 `eci_bootstraps.json`、num_samples500，captured ZIP未明示producer-version。不能僅由檔名推論仍用舊法，也不聲稱已驗證每份檔案的產生程式。ECI是複合估計，不能作單一能力benchmark直接投入本專案計分。

原始run CSV **1818→1827**，新增9列、無移除、42筆既有metadata欄位改變：6個Doubao profiles的Chess，加Terra Max的SpireClimb／STS1／STS2。Terra STS1 A20 Heart為0.05、STS2 A10為0.35；不同遊戲／難度／metric不能合成同一分數。本次沒有追查完整SpireClimb執行方法，不將新model覆蓋宣稱為新benchmark發布。逐run與ZIP差異保存於 `epoch-active-run-diff.json`、`epoch-zip-diff.json`。

Doubao fixed suffix、Evolving rolling alias與Mistral Preview／OSS界線沿用已驗證身分記錄；這次新增run本身不證明新checkpoint。

## 其他官方研究、部署與發布

- [NVIDIA官方1017NVFP4卡](https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4/raw/main/README.md)新增SGLang部署支持，明示2026-11-04起native load、四張GB300驗證；官方PR47935於11/04合併。這是部署方法變更，未證明權重換版。
- Surge原先harness研究URL今日404，已沿官方blog找到[改名後原文](https://surgehq.ai/blog/benchmarking-coding-agent-harnesses)，日期11/04。研究使用既有sudoL7／Opus5.5；不是另一個新benchmark。
- [Anthropic FlashProve](https://www.anthropic.com/research/provable-inference)是可驗證推論研究原型，針對committed weights與integer／greedy decoding做密碼學證明；不是新LLMcheckpoint或一般能力榜。
- [印度PIB官方公告](https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2332315&lang=1&reg=3)明示11/03發布Soket EKA-1及ZenteiQ Dhīr2B／5B。EKA-1為26.3B；Soket專案頁仍有coming soon／未來120B訓練計畫，不能與該模型混同。ZenteiQ官方頁明示2.03B dense／5.09B總、1.79B active MoE、16,384context、Apache2.0；AIKosh profile只取得shell，尚未驗證exact checkpoint revision或完整benchmark方法，列「已定位」候選。

## SII、目錄與補充候選

SII仍66榜，last_updated **11/02→11/04**，11個board objects逐欄有變，包含Traversal ORCA、CorporateBench、BigFinance、LegacyBench、FrontierMemory、sudoL7、ParallelSearch、LAB／LABContracts、tau3Banking及EnterpriseBench，完整before／after保存於 `sii-diff.json`。這是非現役聚合資訊，未新增來源／計分政策。

AA／Vals／Surge／Scale目錄路由仍 **38／62／13／20**，與11/04集合相同；Scale保留query-distinct路由。目錄集合相同僅表示這些官方目錄未新增路徑，不能證明每個既有benchmark方法相同。

`artifacts/research/2026-11-05-benchmark-check/vendors/supplemental-candidates.json`共 **18組**，明示located／method-read／row-verified／scoreIntegrated的範圍。除先前12組，新增SWE-2Flash、MuseSparkOpen、Hy4、歷史Haiku4.5、EKA-1、Dhīr；不是18個新發布模型。

Meta官方8頁eval-method PDF已完整抽取，第4頁渲染目視核對。它把MuseSparkOpen DeepSWE60.0歸於AA／MuseCode，TB2.1 76.4歸於AA／Terminus2；Cognition的新FrontierCode行則用devin-cli，不能跨榜套同一harness。Meta引用的AAIndex是v4.3／10/07，Mistral比較列也不能自動指向10/29OSS。逐row成本／attempts尚缺，維持方法候選。

SWE-2Flash原文另報TB4 20.0／TB2.1 89.2／DeepSWE60.1／SWEPro v2Hard89.9等，但未提供每列effort／harness／repeats／task costs。只有FrontierCode組合具主辦方paired成本與配置，另列核對。

## 有界穩定證據與限制

| 待查項目                            | 本次重新取得的證據                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| FrontierMemory1.1                   | 官方首頁／blog正文相同、changelog bytes相同；SII自身results metadata差異另存                                                    |
| Immigration                         | citation改www與底部推薦links增加；評測正文未見新方法                                                                            |
| CyberOffense                        | 本次正文相同；沒有將此結論擴大到未取得頁面                                                                                      |
| DualChem                            | PDF bytes相同、landing404                                                                                                       |
| DAYJOB Accounting／DataScience／Law | 共享app UI字樣有變，無新Surge catalog路徑；不能當三榜新方法                                                                     |
| DeepSeekCyber                       | 官方homepage bytes相同、updates正文相同；仍無官方exact cyber checkpoint證據                                                     |
| xAI11/07watermarking                | 該文件正文相同；release notes新增11/02的圖像alias遷移，非LLMcheckpoint                                                          |
| Granite／Nanbeige                   | 官方README bytes相同，既有發布日／null界線持續                                                                                  |
| MistralOSS                          | README與technical report bytes相同；Preview／OSS來源alias維持分開                                                               |
| LongCat                             | article／changelog今日200但11/04無raw；2個官方bundles與11/04 bytes相同，TB4 dashboard37.2／fulltable38.5衝突持續，未重新渲染DOM |
| Particle1                           | 官方公告正文相同，base suffix／exactAPI身分缺口仍未補齊                                                                         |
| Rosalind                            | 專屬model404／Help403；官方pricing已重新取得，未把缺失benchmark與任務成本補零                                                   |

ARC evaluations／models／datasets、FrontierCode1.1、DeepSWE1.1、LiveBench table／cost／categories本次raw bytes相同。既有16個HF組織每組最新8repo比較中，只發現Moonshot的KimiK3.1Pro新增；另定向查Meituan、Tencent與Meta-models。這是有界清單，不宣稱全網沒有其他新模型。

本次6個404為DualChem landing、舊Surge harness URL、TerraPro／Rosalind model、先前猜測的Doubao路徑、最初猜測的Meta blog；後兩者已有正確官方新連結證據。2個401為Tencent Hy4 HF API及Meta Spark Open raw README，不能由401推論全網無權重。唯一403為Rosalind Help。所有錯誤回應也保存原始bytes與hash。

完整scope、來源時間、逐欄delta、候選及限制見 `discovery.json`；原始檔驗證見 `raw-integrity-verification.json`。
