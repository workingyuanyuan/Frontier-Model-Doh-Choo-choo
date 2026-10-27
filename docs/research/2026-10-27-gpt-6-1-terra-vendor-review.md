# GPT-6.1 Terra 官方發布頁查核

查核日期：2026-10-27（Asia/Taipei）。[官方發布頁](https://openai.com/index/introducing-gpt-6-1-terra/)已透過新安裝的WSL Linux Chrome成功擷取（HTTP200），取得六張圖、143列底層Vega-Lite資料，其中Terra30列。來源原始值、chart definition、方法與SHA-256見[查核JSON](2026-10-27-gpt-6-1-terra-vendor-review.json)。

## 圖表原始資料

下表每格為「分數百分比／圖表成本USD」。成本欄名為Cost，未在chart schema另列每題或每任務分母；不能把所有成本一律當成已核准USD_PER_TASK。事實錯誤率越低越好，其餘分數越高越好。

| 評測                      |            low |         medium |         high |          xhigh |           max |
| ------------------------- | -------------: | -------------: | -----------: | -------------: | ------------: |
| Agents’ Last Exam v1      |   55.9%／$0.16 |   57.6%／$0.29 | 57.2%／$0.39 |   58.5%／$0.66 |    60%／$1.01 |
| MMMU-Pro（Vision）        | 83.7%／$0.0038 | 84.6%／$0.0041 | 85%／$0.0045 | 85.4%／$0.0055 | 85.5%／$0.012 |
| OSWorld2.1 offline        |   53.8%／$0.36 |    66.7%／$0.5 | 68.7%／$0.51 |   71.3%／$0.62 |  74.2%／$1.19 |
| 內部事實錯誤率↓           |  16.7%／$0.024 |  10.1%／$0.029 | 7.7%／$0.036 |      5%／$0.05 |   4.3%／$0.12 |
| Terminal-Bench4.0         |   24.8%／$0.24 |   35.8%／$0.46 | 41.8%／$0.65 |   46.4%／$0.99 |  50.3%／$1.84 |
| Terminal-Bench-Science0.1 |   24.3%／$0.47 |   34.3%／$0.95 | 39.7%／$1.24 |   43.4%／$1.72 |  58.3%／$4.15 |

六圖原始列數依序26／25／30／25／21／16，與渲染SVG點數逐一相同。全部143列包含競品與明示effort，完整保留在JSON；Opus5.5 w/ fallbacks的混合系統名稱照原文保存。各列locator指向chart與data.values索引，分數fraction乘100轉百分比，沒有由圖片座標估值。

## 方法與採用條件

系統卡HTML與完整PDF已讀，是安全評測增補，未提供這六項能力測試的逐項配置。圖表取得後仍無法確立harness、tools、attempts、fallback頻率及執行日期，未知欄維持null；captured schema沒有token或耗時series。

- [MMMU-Pro方法](https://github.com/MMMU-Benchmark/MMMU/tree/main/mmmu-pro)區分Vision與standard；目前Vals的MMMU Pro overall沒有Vision切分證據。
- OSWorld入口仍標2.0，本頁圖表為2.1 offline；partial/full reward與dataset release尚需核對。
- TB-Science主辦方run guide使用Harbor，Vals列為Mini-SWE-agent，兩者不能直接當作OpenAI本次run設定。
- 內部事實錯誤率與AA-Omniscience的幻覺率母體不同。

現行OpenAI發布頁採用清單審核的是DeepSWE1.1、AutomationBench1.0.6、FrontierCode1.1。這六項仍需計分／來源採用裁決；Vals的MMMU Pro、TB4、TB-Science共191列皆EXCLUDED，沒有Terra或主辦方matching列。原始數據與跨來源比較候選已備妥，取得圖表不等於已通過採用審核。

## 安裝與擷取驗證

已從Google官方下載並安裝google-chrome-stable156.0.8078.47-1，使用獨立的`~/.cache/agy-chrome-profile`。Chrome啟動、CDP版本回應、公開頁面開啟，以及Chrome DevTools MCP的list_pages均通過；此次MCP驗證明確指定browserUrl，agy內建autoConnect設定仍為原設定。

原始HTTP、渲染DOM、畫面、六個chart definitions、143列與雜湊清單保存於`artifacts/research/2026-10-27-benchmark-check/terra-vendor-review/chrome-wsl/`。圖表母體與畫面點數全部相符，另有三項正文明示值核對通過：TB4max50.3%、事實錯誤率low16.7%／max4.3%。

## agy 嘗試紀錄

先前已依使用者指定調用`gemini-3.8-flash-medium`，其browser子代理實際呼叫Chrome DevTools後因預設profile缺少DevToolsActivePort而失敗。這次成功擷取來自安裝後的Linux Chrome專用profile與明確CDP連線。原始agy紀錄仍保存在`terra-vendor-review/agy/`；第二次模型的工具不可用敘述已由第三次真實工具呼叫紀錄取代。
