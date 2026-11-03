# 2026-11-03 模型 Benchmark 聯網查核

以 commit `3fb37323595e3c09de7800c2d64709fa835e5367`、產品 `sha256:55f64db3614e982ba46c2279d929dfae6f825f3e197360f072ea90236a89f258` 為匯入前基準，與 [11/02 紀錄](2026-11-02-benchmark-update-check.md) 比較。現役來源逐欄差異、各來源時間與 SHA-256 見 [JSON](2026-11-03-benchmark-update-check.json)；原始擷取位於 `artifacts/research/2026-11-03-benchmark-check/`。

本次刷新全部 21 個現役來源範圍，18 個線上命令及檔位報告成功，並完成來源與產品 release。ComplexConstraints／Riemann-bench 跟隨官方 v1.1；AA 新增 45 筆候選與 5 筆成本；Vals 更新 14 筆 GLM 5.3 Flash 任務成本。共 9578 筆候選、4869 筆來源成本，418 份 Evidence artifact 雜湊、大小及引用全部通過。

預設集合因 Wonder Full 新增 Riemann 成績、通過第二個獨立組織門檻，從十模型／11 項共同測試改為八模型／12 項。判定為需使用者審核的重大展示變化，完整差異與驗證見 [刷新報告](../refresh/2026-11-03.md)。

AA 來源物化涵蓋 Carbon Medium、DeepSeek 1017 High、Granite 4.2 8B 與 Nanbeige4.3-33B 的新增欄位；其中 Granite 原先即在 catalog，這次明細才出現可物化分數。Nanbeige 在完整 AA catalog 已有分數，但 evaluation／既有 model-detail union 未包含；本次依官方明示 URL 額外擷取詳細頁，匯入九筆候選。這與 catalog 三列增加是不同的比較母體。Nanbeige 官方模型卡支持精確身分新增，catalog 發布日保持 null；AA 明示的 2026-10-25 僅保存在來源 Evidence，未以第三方日期取代官方發布日。

來源日期採 UTC，這次 `2026-11-02T23:xxZ` 對應台北 11/03 上午。來源更新日期與本次觀測日期分別保存。

本次重新取得 11/02 保存的 144 個 URL，沿目前官方連結、搜尋線索及新增模型名稱查到其他原始頁面，共 **166 份 HTTP 回應（159 個 200、4 個 404、3 個 403）**。每份 raw bytes 的 URL、HTTP status、時間、大小與 SHA-256 分別保存在 `web/manifest.json`、`vendors/manifest.json`；全部回讀驗證通過。比較基準是 **實際 11/02 raw bytes**，新增發現的頁面 baseline 為 null，不把首次取得當作今天推出。

## Surge 兩個現役評測升至 v1.1

[ComplexConstraints](https://surgehq.ai/benchmarks/complex-constraints) 與 [Riemann-bench](https://surgehq.ai/benchmarks/riemann-bench) 的目前原始 HTML 均新增 page-specific 2026-11-02 註記及插入 v1.1 badge／changelog 的 JavaScript。這些字樣需渲染後才在畫面出現；只抽靜態可見文字會漏掉。

| 評測               | 官方 v1.1 方法變化                                   |    現行列數 | 具體成績                                                                                                                |
| ------------------ | ---------------------------------------------------- | ----------: | ----------------------------------------------------------------------------------------------------------------------- |
| ComplexConstraints | 修改 10 個任務的部分 rubrics，使更多正確答案可被接受 | 15（原 44） | Astra Max 70.8、Argon High 70.3、Sol6.1 Max 70.1、Wonder Max67.9、Sonnet Max67.2、Opus Max64.4、Fable Max60.4           |
| Riemann-bench      | 解決原題歧義後修改 4 題 answer keys                  | 21（原 44） | Sol5.6 Max83.2、Astra Max81.6、Carbon High80、Opus Max80、Sol6.1 Max79.2、Sonnet Max76.8、Argon High74.4、Fable Max71.2 |

完整原文、版本證據與逐列設定／分數保存在 `surge-version-changes.json`、`complexconstraints-v1-1-rows.json`、`riemann-v1-1-rows.json`。

目前官方同一頁面已呈現新版，沒有發現可用的另存舊版 leaderboard 連結。可依既有「benchmark 改版跟隨新版」政策處理；保留未重跑的舊列時必須保留其 **舊版** 身分，不能改標 1.1，也不能把這次分數提升全解讀為模型能力提升。跨版 rubrics／answer keys 已變，不是直接可比較的同一次量測。

## AA 新評測檔位與模型

[AA changelog](https://artificialanalysis.ai/changelog) 來源日期：

- **11/01**：Carbon Medium（Index58）、DeepSeek V4.1 Flash1017 High（Index29）。
- **11/02**：Nanbeige4.3-33B（Index20）、Carbon Low（Index54）。

對目前完整 leaderboard 內有 `scores` 的模型物件逐 slug 比較，**275→278**，精確新增三列：

| slug                          |       Index 原值 |
| ----------------------------- | ---------------: |
| gemini-4-carbon-medium        | 57.7087824022788 |
| deepseek-v4-1-flash-1017-high | 28.5437391540402 |
| nanbeige4-3-33b               | 20.4071119588083 |

三者詳細原列在 `aa-model-row-diff.json`。這與頁面總數 719→722 的三列增加相符。Carbon Low 只有新增目錄選擇連結／changelog，當前 [detail URL](https://artificialanalysis.ai/models/gemini-4-carbon-low) 回 404，也未出現在有 scores 的 catalog row；不能自行補造第四列成績。跨整個 payload 的 `public-ai` slug 移除屬 provider 清單，不能當模型流失。

Carbon Medium 及 DS1017 High 是既有 checkpoint 的不同 effort，非新 checkpoint。[Carbon Medium](https://artificialanalysis.ai/models/gemini-4-carbon-medium) 公開 Index 每任務成本 $6.59、token 單價 $4／$20 每百萬 tokens；[DS1017 High](https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017-high) token 單價 $0.30／$1.20，但 Index 任務成本 N/A，缺值保留。

### Nanbeige4.3-33B 精確身分

[官方模型卡](https://huggingface.co/Nanbeige/Nanbeige4.3-33B) 明示 Nanbeige4.3 系列的 33B flagship teacher，base 是 `Nanbeige/Nanbeige4.3-33B-Base`，Apache2.0、524,288 context。AA 詳頁直接連到同一官方 repo，可精確新增 catalog 身分／alias；沒有需要模糊比對的理由。

HF repo createdAt 為 10/24、lastModified 10/28；**兩者不自動等於發布日**。官方 README 只有 2026 年 citation，AA 頁面摘要只顯示 October2026，結構化 metadata 另有 2026-10-25，因此 releaseDate 建議保留 null。新的是本次 AA 評測發現，不宣稱它於 11/02 才發行。API／README、revision `df919e1e2cf077a22204c78b6c826bf3db18bc08` 及建議 alias 保存於 `artifacts/research/2026-11-03-benchmark-check/vendors/new-model-identities.json`。

官方自報：TB2.1 80.9（Terminus2）、TB4 23.8／DeepSWE65.5（mini-swe-agent2.4.6）、SciCode52.6、AutomationBench54.2。全部最高 thinking，`preserve_thinking=true`。AutomationBench 明示 **v1.0.6 的 600 個公開任務**，不可等同 657 私有全題；attempts、部分版本、每任務成本仍缺。列為已讀方法候選。

## 新發現的 LongCat-2.5 官方發布

[官方 release article](https://longcat.ai/blog/longcat-2.5) 已渲染保存為 `artifacts/research/2026-11-03-benchmark-check/vendors/longcat-rendered.txt`，日期 **2026-11-1**；[API changelog](https://longcat.ai/platform/docs/ChangeLog.html) 明示 **11/02 LongCat-2.5 available**，並另列 **9/25 LongCat-2.5-Preview**。兩個 exact ID 分開。

官方宣告為原生多模態 MoE、1.6T total／約48B active；API ID `LongCat-2.5`、1M context。文章 GitHub／HuggingFace 按鈕均為 **Coming soon**，官方 org 最近八 repo 沒有2.5，不能宣稱本模型權重已發布。模型查詢文件的示範 JSON 有較舊 created timestamp／text-only modality，與本次 release article 有衝突，不能以示範 metadata 覆蓋正式多模態公告。

[官方定價](https://longcat.ai/platform/docs/pricing/longcat-2.5) 限時 USD／百萬 tokens：input **0.30**、cached **0.006**、output **1.20**；未取得 paired task costs。

文章本身是 SPA shell；本次保存 shell 與它明示載入的兩份完整 JS bundles，再以瀏覽器渲染正文。DOM 產物單獨標示為 bounded-rendered-DOM，不冒充 HTTP bytes。

官方完整 benchmark 表目前 31 列，保存 `artifacts/research/2026-11-03-benchmark-check/vendors/longcat-benchmark-rows.json`。方法腳註另存 `artifacts/research/2026-11-03-benchmark-check/vendors/txt/longcat-footnotes.txt`：

- 預設 thinking on、T1.0／top_p0.95。
- TB2.1／TB4 使用 Claude Code2.1.280、512K；TB2.1 三個 run。完整表 TB2.1 **88.4**、TB4 **38.5**。
- DeepSWE1.1 **64.6**，mini-swe-agent、1M、三個 run。
- AutomationBench1.0.6 **51.8**，600 個公開任務。
- HLE with tools **63.1** 只有 text subset，Claude Code2.1.116。
- 帶星號的競品分數來自外部 report／blog／leaderboard，其他為自跑。

**同頁 dashboard 的 TB4 是37.2，完整表是38.5**，另有部分其他指標差異。先保存並揭露這個不一致，採用前須裁定；不能只選較高值。這是已讀方法候選，尚未完成主辦方逐列核對或整合。

## Mistral 完整 technical report 新增公開連結

[OSS 公告](https://mistral.ai/news/mistral-large-4-oss/) 由 coming soon 改連完整 report；[官方 README](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/raw/main/README.md) 也新連 [30頁 PDF](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/resolve/main/assets/technical_report.pdf)。已重新下載、保存 hash、抽取30頁，並渲染目視核對第19頁 Tables3–6。

repo revision 改為 `af26e7869af601441d5cdf75a1272469ddc3d059`，lastModified11/02T18:30:59Z；本次證據證明 report／README 改變，**不能只由 repo revision 推論模型權重改變**。

新增可供補充研究的自報包括 TB2.1 **90.2%**、DeepSWE1.1 **65.2%**、Finch internal73.30、Vals FinanceAgent2.1 61.72、HLAB-Vals1.1 15.83。Tables 特別區分 AA／Cognition／Vals／internal 執行來源：

- report 的 BrowseComp **internal subset85.00** 與 blog84.5 不是可直接合併的同一量測。
- AA CritPt v2 明示 **Hard Subset**，不能套到本專案 Full Set。
- TB2.1／DeepSWE 的 row-specific effort、harness、attempts 及 paired task costs 未提供；不能因與其他站相同分數便宣稱環境相同。
- 安全拒答／attack-resistance 數值不轉作一般能力分數。

補充候選已升為「已讀完整 technical-report 方法」，仍未完成所有 organizer overlap 核對。

## 來源身分與配置變動

### Mistral 名稱整理

Vals 的同一 OSS URL 現在 display **Mistral Large4**（仍 Oct29／1M），原 Preview URL 現在明示 **Mistral Large4 Preview**（Oct6／512K）；目前捕獲的分數表數值相同。Epoch 八筆 own-run display name 也改為 **Preview(high)**。

Epoch `model_metadata.csv` 按 `model_version` 對齊後，新增 `mistral-large-4-0-oss_unknown`／`_oss_high`，五筆既有 metadata 改變。不能使用逐行位置比較，因同時重排 rows。詳見 `epoch-model-metadata-diff.json`。

Epoch run table 維持1793，無新增／移除／score 欄異動；256筆新增 logs 連結、8筆 Mistral display／compute metadata 更新。ZIP20成員的變更仍屬 logs／模型 metadata，ECI score 成員不變。

### Cognition 與 ARC

Cognition2.0 JSON 把 **DeepSeek V4.1 Flash → DeepSeek V4.1 Flash1017** 明示改名，相關 name／color／harness／data key 一起改，數值未變。這提供來源對 checkpoint 的明示標示。

[ARC 官方結果頁](https://arcprize.org/results/deepseek-v4-1-flash-1017) 新增兩個 DS1017 max 的 ARC-AGI3 Semi-Private rows，原始 JSON 見 `arc-diff.json`：

| Harness          |             raw score |            raw cost |
| ---------------- | --------------------: | ------------------: |
| Standard         | 0.0021958291788019067 | $1003.8696329999999 |
| Provider Adapter |  0.058082710084347296 |       $1179.1379751 |

官方說明 Standard 攜帶模型選擇保存的 notes；Provider Adapter 保留 opaque reasoning state，長對話會 compaction。必須保留兩種 harness，不把它們視為新 checkpoint 或把分數混成一列。

## SII 與新追蹤的廠商候選

SII仍66榜，last_updated11/02；15個board objects發生變動，完整逐欄 before／after 在 `sii-diff.json`。DAYJOB Tax 方法敘述終於改成 Surge 已公開 leaderboard，修正先前「尚未公開」衝突。Accounting／DataScience／Law 三頁沒有正文改動，也沒有新 Surge catalog 路徑。

其他變動包含 TaxCalc、Parallel Search、Voice、VCX、FrontierSWE、SWEbenchPro、DesignArena、SecIT、BioBench、AutomationBench 等；大多是新模型覆蓋／分數／成本／來源時間更新。它們是非現役聚合站資訊，不直接採入本專案計分。新增名字已追查原始來源：

- **[Particle-1 官方公告](https://particle.ai/blog/introducing-particle-1)** 日期 **10/28**，本次新定位；以 DeepSeek V4.1 Flash 為 base 做 rank64 LoRA／coding及data-engineering RL，base 的 checkpoint suffix 未說明，不能直接歸入1017。DeepSWE1.1 **72.57%／$0.2211／59,580 output tokens**，當前原文腳註明示 mini-swe-agent；另外三榜才是 Terminus2。512K、T1／top_p.95、max、每題16rollouts，成本包含失敗且固定95%cache hit，與一般 live cost 的語義不同。已讀方法，exact API checkpoint 仍待補。
- **[Phonic 官方 docs](https://docs.phonic.co/docs/get-started/overview)** 明示 exact API ID `phonic-1`，是 speech-to-speech agent；首次取得不當作今天才發布，精確 releaseDate null。
- **Pine Voice1.0** 目前僅由 SII保存的 Sierra submission metadata 定位，未找到可驗證官方模型發布頁；保留 unresolved，未新增一般LLM身分。

## 目錄、HF 與待查狀態

AA／Vals／Surge／Scale 的目前 benchmark 路徑數為 **38／62／13／20**，與11/02逐連結相同。這次 Surge 版本變化發生在既有路徑，因此不能由「路徑集合相同」推論方法沒有改變。

既有16個HF組織各最新八repo的 ID／createdAt 都相同；Meituan LongCat是額外首次加入的有界探索，不宣稱與昨日比較。已知候選最新狀態：

| 項目                              | 本次重新取得證據                                                          |
| --------------------------------- | ------------------------------------------------------------------------- |
| Rosalind                          | changelog只新增導覽字樣，Help403／model404；方法、benchmark、成本仍缺     |
| FrontierMemory1.1                 | changelog bytes相同，首頁與blog正文相同，仍750trajectories／3runs         |
| NVIDIA1017NVFP4                   | 官方卡bytes相同，量化與base身分分開                                       |
| Immigration                       | 正文變更為 Mistral Preview display label，未見新評測方法                  |
| CyberOffense                      | 正文相同；現有parser與採用政策待處理                                      |
| DualChem                          | 文章正文相同、PDF bytes相同；landing404                                   |
| DeepSeekCyber                     | 官方首頁／updates／HF latest8未出現該checkpoint；仍只有第三方修改版本線索 |
| xAI watermarking                  | 文件／release notes正文相同；11/07事件尚未生效                            |
| AA-PersonalityBench               | article／method正文相同；評測頁隨機範例輪換                               |
| Anthropic三卡、Kimi、DeepSeek1017 | 本次PDF bytes或文章正文相同，既有方法缺口持續                             |

`artifacts/research/2026-11-03-benchmark-check/vendors/supplemental-candidates.json` 現有 **10組**：既有7組加 Nanbeige、LongCat、Particle。全部明示 located／method-read／尚缺逐列核對，沒有將研究筆記冒充已整合。

## 覆蓋限制

OpenAI news、xAI news、Rosalind Help為403；Rosalind／TerraPro model、DualChem landing及新增CarbonLow detail為404。MiniMax news取得shell，Meta舊目錄亦限制覆蓋；相同結論只針對這次成功取得的頁面及指定HF最新八repo。

LongCat DOM擷取與HTTP raw分開保存，頁內表／dashboard衝突已記錄。Mistral PDF只對第19頁進行視覺核對；其他方法資訊以完整文字抽取和表格版本標註為依據。SII15項變動保存逐欄證據，但沒有宣稱已完成全部主辦方方法審核。

來源物化、模型 mapping、release 及產品影響已由主流程驗證，詳見刷新報告。
