# 2026-10-31 模型 Benchmark 聯網查核

以 `9e5618bf7c981040cbaca07cce53fc7161811381` 與產品 `sha256:ae42f24bd6f5b77688aafd8659bbc1b756020e8a68dbc135e9c4f57d35c867fa` 為匯入前基準。現役來源逐欄比較使用匯入前保存的實際快照；消息探索以 [10/30 查核](2026-10-30-benchmark-update-check.md)為清單，原始頁面比較使用有保存 bytes 的 10/29 資料。10/30 只有 Mistral 公告有可驗證原文，其餘先前的 unknown 均重新取得今日證據。

本次由來源匯入、官方消息研究與獨立抽查三個代理分工，主代理整合與執行完整驗證。產品、各集合影響與抽查結果見[刷新報告](../refresh/2026-10-31.md)，來源時間與 SHA-256 見[同名 JSON](2026-10-31-benchmark-update-check.json)。

## 現役來源

| 來源                                                              | 本次更新                                                                                                                                                                                                                |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Artificial Analysis](https://artificialanalysis.ai/changelog)    | 目錄 718→719；有效 profiles 219→220。候選新增16、移除3、159筆欄位異動；其中157筆為 GDPval-AA 重算，最大為 Kimi K3.1 Pro 67.286→67.9025。新增 DeepSeek V4.1 Flash 1017 Non-reasoning、Qwen3.8 27B Non-reasoning 等覆蓋。 |
| [AA Carbon](https://artificialanalysis.ai/models/gemini-4-carbon) | `critpt`、`hle`、`scicode` 三個既有欄位明示 null。舊 CritPt／HLE 已由核准政策排除；SciCode 仍是現役測試，因 Carbon 缺值而移出全部九個共同集合。這是個別模型成績撤回；來源仍提供同名欄位與其他模型成績，依缺值規則處理。 |
| [LiveBench](https://livebench.ai/#/)                              | 2.0 32列；1.0含 finetunes 65列。DeepSeek V4.1 Flash 1017 的 AGENTIC 40.9→35.7，Mistral Large 4 1029 的27→27.5；11筆任務成本變動。                                                                                       |
| [Vals](https://www.vals.ai/benchmarks)                            | 新增14筆成績及14筆成本：Baseten Nemotron 3.5 Super VL 11項、Step 5 Preview 3項。Terra 的 Terminal-Bench 4.0 成本2.039693→2.15663、Vals Index成本2.924759→2.939376；另有顯示日期更新。                                   |
| [Epoch](https://epoch.ai/eci)                                     | 258筆 ECI 重算，撤回 Gemini 2.0 Flash (Dec 2024) 與 GPT-5.3 Codex 的 ECI。ECI為外部綜合指數；直接 benchmark 成績穩定。                                                                                                  |

來源候選總數9492→9517、來源成本4847→4863。現役來源413份證據的 SHA-256、大小與列引用全部通過。AA兩個詳細頁逾時已透過有界重試補齊，重新物化快照後完成檔位報告。監測注意項66→74，新增項為上述 Carbon三項測試與Epoch兩個ECI列的覆蓋流失。

## 官方模型與 checkpoint

- **[GPT-6 Rosalind](https://developers.openai.com/api/docs/changelog)**：10/30官方 changelog明示 `gpt-6-rosalind`，用於生物研究推理與科學工具，僅供獲准研究組織。已確認模型公告；Help頁403、模型頁404，完整方法、可採用benchmark與成本仍缺。
- **[NVIDIA DeepSeek 1017 NVFP4](https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4)**：官方卡標10/30發布，屬量化checkpoint。已讀六項自報評測與重複次數；後續需核對benchmark版本、harness與任務成本，不能將其成績套用至base1017。
- **[InclusionAI ZwZ2 GGUF](https://huggingface.co/inclusionAI/ZwZ2-27B-GGUF)**：4B／9B／27B量化格式10/30出現。模型卡可區分既有模型與量化配置。

16個HF組織各最近八個repo的ID與createdAt已保存並比較，13個相同；差異來自Mistral、NVIDIA與InclusionAI。repo建立時間與模型公開日分別記錄。

### Mistral Large 4 身分證據

[Mistral 10/29公告](https://mistral.ai/news/mistral-large-4-oss/)確認Preview後追加訓練並公開改善版權重。今日補齊逐來源checkpoint核對：

| 來源         | Preview依據                                          | 10/29正式版依據                                            |
| ------------ | ---------------------------------------------------- | ---------------------------------------------------------- |
| AA           | `mistral-large-4-preview`標Preview／deprecated、524k | `mistral-large-4`與`-medium`連正式權重、1M                 |
| Vals         | `mistralai_mistral-large-4`標Oct6／512k              | `mistralai_mistral-large-4-oss`標Oct29／1M                 |
| LiveBench    | 舊裸名稱沒有明示checkpoint                           | `mistral-large-4-0`登記VERSION1029，直接連正式公告與HF權重 |
| FrontierCode | 保留列明示Preview                                    | 現行Mistral Vibe三檔位，changelog明示更換Preview結果       |
| Epoch        | `mistral-large-4-0_high`實際標Oct6，run開始於Oct9–15 | 內部`-4-0`字串不足以對應正式版                             |

Mistral docs當前權重連結與標頭Preview日期互相衝突，須以來源明示版本與評測時間辨識。逐項官方網址、artifact、SHA與安全alias範圍保存在`artifacts/research/2026-10-31-benchmark-check/vendors/mistral-identity.json`。

## Benchmark 與方法

- **[FrontierMemory v1.1](https://frontiermemory.com/changelog/)**：原站改版日期10/29；665→750 trajectories，所有模型／harness各跑三次。SII的10/30為同步日期。這是非現役候選，來源方法與採用政策需個別評估。
- **[DataCenterBench](https://robocurve.org/datacenterbench/)**：本次讀到10/28原站方法，包括機械操作、每題三次與LLM照片評分。原站成本涉及fast／ultrafast倍率，不能直接沿用聚合站先前成本。
- **[AA-PersonalityBench](https://artificialanalysis.ai/articles/aa-personalitybench)**：10/19推出且已存在10/29目錄；今日深入讀方法。900題、模型特徵與偏好的相對百分位，不能直接解讀為一般能力accuracy。

AA／Vals／Surge／Scale目錄路徑集合比較為38／62／13／20，與10/29保存基準一致。SII六項變動與來源日期逐欄保存在`web/sii-diff.json`；除上述兩項已重讀原站外，其餘為聚合站探索線索。

## 追蹤項目與補充候選

| 項目                                 | 本次可驗證狀態／後續條件                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vals Immigration                     | 今日可見文字與10/29一致；版本、search／bare配置與採用分類沿用待裁決紀錄。                                                                                                                            |
| Vals CyberOffense                    | 今日可見差異僅圖表Linear／Log文字；現有parser仍無可用成績。restricted Sol Daybreak需要獨立身分證據。                                                                                                 |
| Scale DualChem                       | 今日PDF與10/29同SHA，文章可見文字相同，landing404；accuracy分母、拒答與工具條件仍需採用裁決。                                                                                                        |
| DAYJOB Accounting／Data Science／Law | SII三個board各15列，內容與10/29相同、更新日10/28；Surge原目錄沒有對應頁。                                                                                                                            |
| DeepSeek Cyber                       | 今日取得的官方首頁、API更新與HF目錄沒有這個checkpoint；第三方名稱的官方身分仍未驗證。                                                                                                                |
| 廠商補充分數                         | Mistral OSS與NVIDIA NVFP4已定位並讀到方法；Kimi與Anthropic模型卡重新下載核對。逐benchmark版本、effort、harness、attempts、fallback、成本缺口與完成階段保存在`vendors/supplemental-candidates.json`。 |

## 證據與範圍

原始資料位於`artifacts/research/2026-10-31-benchmark-check/`：`import-baseline/`保存匯入前來源、政策與產品；`refresh/`保存擷取命令、逐欄差異與完整性驗證；`rendered/`保存列數核對；`web/`、`vendors/`保存消息、model card、原始回應與manifest；`spot-check/`保存另一代理直接取得的現站證據。

官方探索共114份當前回應（109個200、2個403、3個404），保存檔案均回讀驗證SHA-256與大小。OpenAI news403；MiniMax news只取得navigation shell；HF探索僅各組織最近八個repo。Vals的`cyber_offense`、`inference_provider`、`mental-health`、`rsi_index`、`vals_router_index`五頁無可解析成績。以上範圍外的狀態保持unknown。
