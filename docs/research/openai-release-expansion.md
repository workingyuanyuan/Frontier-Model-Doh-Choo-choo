# OpenAI 發布頁補充來源

研究與擷取日期：2026-10-04（Asia/Taipei）。已完成逐圖表方法查核、模型／effort 核對、主辦方重疊列比較及來源整合。四篇發布頁共保存 207 筆分數及同列 USD per task 成本；187 筆 INCLUDED、20 筆 EXCLUDED。逐列結果見 [cross-checks.json](../../data/sources/openai-releases/cross-checks.json)。

## GPT-6 Luna DeepSWE 1.1

[GPT-6 Sol／Luna 發布頁](https://openai.com/zh-Hant/index/introducing-gpt-6-sol-and-luna/) 的 `linkId=deepswe` Vega `data.values` 提供完整五檔分數與任務成本。以下數字直接取自底層資料，分數由 fraction 乘 100；成本保留資料精度。

| 明示 effort | Pass@1（%） | USD per task |
| ----------- | ----------: | -----------: |
| low         |        2.43 |       0.0057 |
| medium      |       44.47 |       0.0518 |
| high        |       59.29 |       0.0838 |
| xhigh       |       61.28 |       0.1096 |
| max         |       66.59 |       0.2169 |

現有 DeepSWE 主辦方快照尚缺這五檔，因此它們是 VENDOR／PARTIAL_SOURCE 的 SUPPLEMENT。相同圖表有 20 筆主辦方重疊列符合公開精度，支持該圖表作補缺來源。GPT-6 Sol 另外五檔也屬 SUPPLEMENT；harness、tools、attempts 未在此發布圖表逐列提供，保存 null。發布頁說明 GPT 評估在研究環境或 API 執行，競品取自公開報告；不能由數值一致推定共同評測者。

## 已採用圖表與重疊核對

| 發布頁                                                                              | 圖表／版本                        | 保留列數 | MATCH | SUPPLEMENT | EXCLUDED |
| ----------------------------------------------------------------------------------- | --------------------------------- | -------: | ----: | ---------: | -------: |
| [GPT-6.1 Sol](https://openai.com/zh-Hant/index/introducing-gpt-6-1-sol/)            | DeepSWE 1.1                       |       15 |     5 |         10 |        0 |
| GPT-6.1 Sol                                                                         | AutomationBench 1.0.6             |       21 |    10 |          5 |        6 |
| [GPT-6 Sol／Luna](https://openai.com/zh-Hant/index/introducing-gpt-6-sol-and-luna/) | DeepSWE 1.1                       |       35 |    20 |         10 |        5 |
| GPT-6 Sol／Luna                                                                     | AutomationBench 1.0.6             |       31 |    30 |          0 |        1 |
| GPT-6 Sol／Luna                                                                     | FrontierCode 1.1 Main             |       35 |    35 |          0 |        0 |
| [GPT-6 Astra](https://openai.com/zh-Hant/index/gpt-6-astra/)                        | DeepSWE 1.1 USD cost series       |       22 |    21 |          0 |        1 |
| GPT-6 Astra                                                                         | AutomationBench 1.0.6 Cost series |       15 |     9 |          0 |        6 |
| [GPT-5.6](https://openai.com/index/gpt-5-6/)                                        | DeepSWE 1.1 USD cost series       |       33 |    29 |          3 |        1 |
| 合計                                                                                |                                   |      207 |   159 |         28 |       20 |

参照快照為 [DeepSWE](https://deepswe.datacurve.ai/)、[Zapier AutomationBench](https://zapier.com/benchmarks) 與 [Cognition FrontierCode](https://cognition.com/frontiercode)。核對使用相同 benchmark release、metric、canonical model、明示 effort。MATCH 表示分數符合公開四捨五入精度；SUPPLEMENT 表示該官方快照沒有對應列。

Sol／Luna 的 FrontierCode payload `linkId` 為 `frontiercode-extended`，但文章圖說明示 **FrontierCode 1.1 Main**，35 列全數符合主辦方 Main。GPT-6 Luna 的五檔分數為 25.66／35.53／37.26／37.10／42.42%，同列成本為 $0.021／0.0533／0.0672／0.0728／0.1072。來源 locator 保留原 linkId；benchmark ID 依圖說與主辦方核對設為 `frontier-code-1-1`。

精度依已保存圖表資料及呈現設定審核：AutomationBench 為 0.1 個百分點；Sol／Luna DeepSWE 為 0.01；Main 的 GPT-6 Sol／Luna 為 0.01、其餘模型為 0.1；Astra 的 DeepSWE cost series 為 0.1；GPT-5.6 DeepSWE 為 0.0001。每筆新列保存 `scorePrecisionPercent` provenance；核對容差僅允許公開精度的一半。不同模型的 precision 不由數字尾端零自動推導。

## 排除與隔離證據

20 筆 EXCLUDED 仍保留原始分數、成本、設定與引用。六筆 GPT-6.1 Sol 文章 fallback 列與一筆 Sol／Luna 文章 Fable 5.1＋Opus 5 fallback 為混合模型系統；canonical model 為 null，成本同步排除。Sol／Luna 註腳還說明該 fallback 點未計入約 40% 任務的備援成本。

13 筆歷史數值衝突保留已對應模型與明示 effort，但分數及成本均 EXCLUDED；解析器固定原始 fraction 與逐列參照，不允許任意新增排除標記：

- Sol／Luna 文章的 GPT-5.6 Luna DeepSWE 五檔為 1.22／9.29／42.37／56.19／62.17%，與現有主辦方 1.548673／11.283186／44.247788／56.858408／67.1875% 不符。
- Astra 文章 DeepSWE Astra max 的 cost series 為 73.0%，與主辦方 73.230088% 不符；來源的另一 token／code series 也顯示歷史 73.008850%，保存在原始 chart capture。
- Astra 文章 AutomationBench GPT-5.6 Sol 五檔 9.6／12.6／12.3／17.0／18.1% 與現行主辦方不同；同頁 Fable 5 max 17.4% 對主辦方 17.05% 也超出精度。
- GPT-5.6 文章 DeepSWE Gemini 3.1 Pro Preview high 11.7517% 對主辦方 11.725664%，超出來源精度。

其餘圖表完整底層資料保存在 `release-sol-luna-dom.json`、`release-astra-dom.json`、`release-gpt56-dom.json`，以下項目仍為隔離研究證據：

| 項目                                                      | 採用條件缺口                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Astra FrontierCode 1.1 Extended                           | 圖表明示 Extended，與目前 Main 不同；不得共用 Main benchmark ID                                      |
| OSWorld 2.0                                               | Sol／Luna 明示 v2026.08.08 離線 partial reward；現有口徑需核對切分與 metric                          |
| Terminal-Bench 2.1／4.0／Science 0.1                      | 已取得原始圖表，需建立相同版本、harness、attempts 的主辦方重疊核對；GPT-5.6 Sol Ultra 為四智慧體設定 |
| GPT-5.6／Astra AA Coding／Intelligence indices            | 複合指數與不同版本需依既有指數政策獨立處理                                                           |
| Agents’ Last Exam、內部可靠性／對齊、GPQA、科學與資安圖表 | 原始資料已保存；須逐 benchmark 確認主辦方、metric、版本、工具配置及框架                              |
| GPT-5.6 AutomationBench                                   | 發布當時 18.1／15.2／14.9% 摘要與現行同名模型結果不同；版本與配置無法裁決                            |

GPT-5.6 註腳 4 說明 API 任務成本與延遲由離線模擬估算，成本按一般 API 定價；已採用 DeepSWE 成本保留此屬性。文章原始 request 為英文 URL，瀏覽器依語言設定導向繁中 URL，兩個 URL 屬同一來源血緣。

## 擷取、重建與驗證

Sol／Luna 與 Astra 從已載入 DOM script 的 `self.__next_f.push` 解碼 RSC JSON，完整保存 chart definition 與 `data.values`。GPT-5.6 在渲染 DOM 中沒有留下 RSC scripts，改用瀏覽器 CDP `Page.getResourceContent` 保存已載入 HTML，再解碼同樣的 Vega charts；DeepSWE tab 的可見圖表、模型圖例與 cost 軸也完成核對。原始 HTML 保存在 `release-gpt56-response.html`。沒有從圖像估計座標。

`reviewed-capture-index.json` 列出四份有界摘錄與各自實際觀測時間。原 GPT-6.1 摘錄與列 ID 保留；新頁使用頁面前綴，以避免跨頁覆寫。內容定址 evidence-index 包含四份摘錄，離線物化依各份 bytes 與原觀測時間重建。新列保留底層 rawRow、sourceLocator、score fraction、cost、effort 與原 order；none effort 與單點 fallback order 的格式各自驗證。

```bash
pnpm --filter @llm-bench/acquisition materialize:vendor-releases -- --openai-capture-index ../../data/sources/openai-releases/reviewed-capture-index.json
pnpm --filter @llm-bench/acquisition test:run src/vendor-openai.test.ts src/vendor-release-audit.test.ts
pnpm --filter @llm-bench/acquisition typecheck
```

Focused verification：兩個測試檔共 55 tests 通過；acquisition typecheck 通過。測試核對精確 Luna 五檔分數／任務成本、完整列數、歷史衝突及其成本排除、none effort、原 ID／取得時間、四頁 aggregation 與異常漂移拒絕。聯合 refresh 已成功完成 207 OpenAI 列，來源逐列 cross-check 記錄完整保存。
