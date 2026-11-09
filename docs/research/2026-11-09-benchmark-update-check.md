# 2026-11-09 benchmark 聯網查核

## 範圍與基準

以 11/08 已部署產品 `sha256:e52b966e9ff807047b8ce29f0cdb40b43e182162c77c00bd76314c83cacd0cea` 和保存的上游證據為比較基準。查核證據、實際擷取時間、URL、狀態、SHA-256 與逐欄差異保存在 `artifacts/research/2026-11-09-benchmark-check/`，結構化摘要見同名 JSON。來源母體和未覆蓋範圍按下列各項區分。

現役來源 402 個唯一 URL 於 00:34:02–00:40:17 UTC 擷取，皆為 HTTP 200；402 份回應與引用的 331 份基準 artifact 均通過 SHA-256 和長度核對。另一代理獨立驗證其中首輪 166 份來源回應及 63 份研究回應，並重算多個榜單母體和 MaxxBench 算式，結果相符。

## 現役來源

- Artificial Analysis：完整模型榜 282 筆與前次相同；能力分數、token 價格及 Index 每任務成本無差異。169 個模型有 output speed、TTFT 或 Index 耗時欄位變動。另對照 24 個現役 evaluation 頁、`/models` 及前次保存的 225 個模型明細，解析物件的差異均為速度與耗時。
- FrontierCode 2.0 與歷史 1.1 官方匯出、DeepSWE 1.1 官方資料、LiveBench 當前 v1／v2 的六份榜單、分類與成本檔案均與 11/08 逐 byte 相同。
- Surge 八個主榜 248 列使用現有 parser 逐欄對照，結果相同。Vals 現行目錄 62 個 slug 中，57 榜共 3,498 個 overall 模型列及 metadata、成本逐欄相同；五頁仍無可解析 overall 資料。
- FrontierSWE 的 23 個設定與 Zapier AutomationBench 1.0.6 的 129 列分數、成本及註腳均與前次相同。
- ARC Prize 的 evaluations、models、datasets 三個官方 JSON 與前次逐 byte 相同。Epoch 官方 benchmarks.csv 與前次逐 byte 相同；ZIP 的 92 個成員中 10 個變動，為九個 `_external` 檔及 model metadata，正式 Epoch-run 評測檔均相同。
- Fireworks Specialized Intelligence Index 官方完整 JSON 與前次逐 byte 相同。來源監測完成，AA、Vals、Surge 的即時目錄範圍與其他來源的 snapshot-only 範圍分開；監測結果不代表 snapshot-only 來源的全部上游頁面均已檢查。

## 新發現的研究候選

**BioBasicsBench**：OpenAI 於 11/06 發表，涵蓋 100 項濕實驗室資料解讀任務、7 個模型與 37 個模型／effort 設定，每任務嘗試 5 次，指標是平均 rubric reward。官方顯示 xhigh 下 GPT-6 Astra 為 66.7%，GPT-5.6 Sol 為 43.8%。完整圖表、精確 checkpoint、執行環境及配對成本仍待核對。官方正文可經檢索讀取，但本次原始 HTTP 擷取為 403，已保存狀態與可讀摘錄。[官方公告](https://openai.com/index/measuring-how-ai-agents-handle-wet-lab-science/)

**MaxxBench**：本次新定位，官方記錄初版於 10/29 發布、11/07 加入 Qwen3.8 Flash Next xhigh。它修改 89 項 DeepSWE 任務；內嵌資料有 16 個模型設定、每題兩次、共 2,848 次，16 列的分數、通過數與平均成本算式均可重現。伺服器渲染榜單顯示 15 列，內嵌資料多一個 Muse Spark 1.3 設定；billing 語義與呈現差異仍待核對。[主辦方](https://maxxbench.unlap.ai/)

**Into the Unknown**：10/13 發表的開放科學研究評測，本次新定位。論文摘要記錄 9 個 agent 各完成 15 題，135 份提交中沒有一份符合全部條件，114 份未通過 integrity check。PDF 與官方資料已保存，全文方法、結果與 viewer payload 尚待核對。[論文](https://arxiv.org/abs/2610.19159)

以上候選的 benchmark 身分、維度和來源採用規則需經專案決策；目前僅列入研究。VIALS-AA 和 SWE Atlas v1.1 的既有待決事項延續 11/08 記錄。

## 其他探索與證據限制

27 個延續查核的官方入口及候選頁中，25 個正規化文字相同；另兩項分別只有 Anthropic news 日期和 Z.ai 部署 metadata 的變動。20 組 Hugging Face 官方組織 latest8 名單成員相同，欄位差異只有 likes；latest8 是有限樣本。新增及延續探索共保存 63 份回應，62 個 HTTP 200、BioBasics 官方原始擷取 403；全部保存 bytes 的 SHA-256 和長度已核對。

原始資料與逐 URL 紀錄見 `discovery/manifest.json`；候選方法與列級檢查見 `discovery/REPORT.md`、`candidates.json`、`maxxbench-row-checks.json`。現役來源檢查見 `source-review/summary.md`、`manifest.json`、`additional-manifest.json`、`results.json`、`additional-results.json` 和 `aa-full-catalog-diff.json`。Epoch 及 ARC 比較見 `raw/comparison.json` 與 `raw/epoch-zip-content-diff.json`。AA 明細範圍為前次保存的 225 個 URL，未全量探索新增 detail slug；本次網路 payload 查核未重新計數瀏覽器渲染母體。
