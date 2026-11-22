# 2026-11-22 benchmark 聯網查核

今天各廠商沒有發布新模型，也沒有新的 benchmark 線索。現役來源只有 AA 與 MaxxBench 的少量數值、Vals 的模型對應有變化。結果已匯入並依 `pnpm data:release` 重建產品，資料更新見 [刷新報告](../refresh/2026-11-22.md)。

## 範圍與基準

- **起始狀態**：起始 commit `64aed5313118caca35aea01f015b133a4104d061`，工作區乾淨。
- **比較基準**：比較對象是 11-21 的擷取與 `data/product/current.json`（`sha256:115cc9af565b02d0e63de828ee0e12835b2fc0114adceb3b72019ce4b8c5d9e8`）。
- **擷取方式**：沿用 11-21 的 URL 清單（廠商頁 62 個，benchmark 主辦方與線索頁 55 個），另加 GBENCH 的排行頁與 API（11-21 才收錄，沒有前一天的擷取）。擷取時間為 2026-11-22 04:08 UTC，每頁存 SHA-256。與 11-21 相比，內容雜湊改變的有廠商頁 41 個、主辦方頁 16 個。
  - 原始檔與清單：`artifacts/research/2026-11-22-benchmark-check/web/{V,L}/`。
  - 逐頁差異：由 agy（Gemini 4 Hydrogen High）比對 11-21 與今天的可見文字，網頁也解析了內嵌的 RSC 資料。結果在 `web/discovery-notes.md`，下文引用的實質變化都已用原始檔重新核對。
- **無法取得的頁面**：`ai.meta.com/blog/` 回 400，Perplexity WANDR 回 403，LiveBench 的舊 bundle 由 503 變成 404。前兩頁 11-21 也取不到；LiveBench 的資料改由現役 materializer 直接取得，不受影響。
- **只換建置雜湊的頁面**：其餘 52 頁（含 13 個 Hugging Face 清單）只有建置雜湊、nonce、存取日期或按讚數改變。

## 各廠商新模型

沒有新模型。

- **Hugging Face**：13 個廠商組織的最新 repo 清單與 11-21 相同，沒有新 repo。
- **廠商頁**：Anthropic、OpenAI、Google、Meta、xAI、Mistral、MiniMax、Thinking Machines、LG 的新聞與模型頁都沒有可見內容改變。
- **非模型的文件變動**：Claude 發布說明新增一則組織 webhook 事件（11-16），Claude 支援頁換了一個相關文章連結，都與模型無關。
- **BenchLM 的發布清單**：多了「GPT-Live-1.1 in the API」（OpenAI，11-19），11-21 已判定為語音模型，不在範圍內。

## 現役來源

詳細列數與差異見 [刷新報告](../refresh/2026-11-22.md#來源變化)。

- **有數值或對應變化**：
  - **AA**：14 筆 GDPval-AA 分數微調，最大是 GLM-5.2 non-reasoning `0.375905 → 0.374355`。
  - **MaxxBench**：Muse Ember 1.0 max 的平均成本微調（`0.182199 → 0.181735`），頁面上的步數也由 110 變成 109。
  - **Vals**：95 筆分數與 95 筆成本首次對上模型，數值本身不變（見刷新報告）。
- **Epoch**：`benchmarks.csv` 新增 Gemini 4 Neon (xhigh) 的 EBR-bench 一列（`0.981`）。EBR-bench 不在本站追蹤的 benchmark 內，所以不產生成績列。
- **AA Vials 頁**：Briefcase Elo 與 personality 細項有小幅重算，Vials 分數不變。本站不從這頁取值。
- **沒有變化**：LiveBench、DeepSWE、Scale SWE Atlas、FrontierCode、FrontierSWE、Surge 九榜、Zapier、ALE、BioBasicsBench、CWE-bench、Terminal-Bench、GBENCH 與四個廠商發布來源。GBENCH 這次是第一次每日刷新，API 回傳 112 列，前 100 列與畫面一致，分數沒有變。

## 新 benchmark／版本與待查線索

今天沒有新線索。以下是既有線索的狀態：

| 線索                                                                 | 今天的狀態                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Vals RollerCoasterTycoonBench、OpenAI MedChemBench、Epoch SpireClimb | 不變，見 [11-21 查核](2026-11-21-benchmark-update-check.md#新-benchmark版本與待查線索)。         |
| BenchLM                                                              | 追蹤數由 828 增為 835 個 benchmark、排名分數小幅更新。它是綜合排名網站，不是主辦方來源，不採用。 |
| SEC-bench Pro、CursorBench 4.1                                       | 不變。                                                                                           |

## 證據與覆蓋限制

- 原始擷取、清單與差異筆記：`artifacts/research/2026-11-22-benchmark-check/web/`。
- 廠商頁清單沿用固定 URL；不在清單上的廠商公告，只能從現役來源出現的新模型名稱回頭查找。今天現役來源沒有出現新的未對應名稱。
