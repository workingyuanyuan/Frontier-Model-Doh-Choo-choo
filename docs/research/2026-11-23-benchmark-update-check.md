# 2026-11-23 benchmark 聯網查核

Z.ai 今天發布 GLM-5.4，但目前只開放給 Coding Plan 訂閱者，沒有公開 API，也沒有任何 benchmark 成績，所以今天不新增模型身分。現役來源的實質變化有：Epoch 新增 Muse Ember (max) 的成績，AA 的 GDPval-AA 有少量微調。結果已匯入並依 `pnpm data:release` 重建產品，資料更新見 [刷新報告](../refresh/2026-11-23.md)。

## 範圍與基準

- **起始狀態**：起始 commit `b3358606d3fe0f3f80459791de160483c1104a62`，工作區乾淨。
- **比較基準**：比較對象是 11-22 的擷取與 `data/product/current.json`（`sha256:7faa487eb94d402e83b4cd4fa8047a43de47cfd0e35ca5a0d2e5a625299188b0`）。這個版本已包含 11-22 之後收錄的 FrontierMath v2、Mystery Game Puzzles 與 Furniture Assembly。
- **擷取方式**：沿用 11-22 的 URL 清單：廠商頁 62 個，benchmark 主辦方與線索頁 57 個。擷取時間為 2026-11-23 13:27 UTC，每頁存 SHA-256。與 11-22 相比，內容雜湊改變的有廠商頁 56 個、主辦方頁 23 個。
  - 原始檔與清單：`artifacts/research/2026-11-23-benchmark-check/web/{V,L}/`。
  - 逐頁差異：由 agy（Gemini 4 Hydrogen High）比對 11-22 與今天的可見文字，也解析了 Next.js 頁面內嵌的 RSC 資料。結果在 `web/discovery-notes.md`。
  - 下文引用的實質變化（GLM-5.4、LingSante-3.1-flash、Epoch 新增的列）都已用原始檔重新核對。
- **無法取得的頁面**：
  - `ai.meta.com/blog/` 回 400，Perplexity WANDR 回 403，LiveBench 的舊 bundle 回 404，三頁 11-22 也取不到。LiveBench 的資料由現役 materializer 直接取得，不受影響。
  - DeepSeek 的 `api-docs.deepseek.com/news/news1106` 由 200 變成 404，看起來是文件改版搬了網址。DeepSeek 的 Hugging Face 清單沒有變化。
- **只換建置雜湊的頁面**：其餘頁面（含 14 個 Hugging Face 清單）只有建置雜湊、nonce、存取日期、按讚數或下載數改變。

## 各廠商新模型

- **GLM-5.4（Z.ai，11-23）**：BenchLM 的「Latest confirmed releases」新增「GLM-5.4 released · Z.AI · Nov 23, 2026」。
  - 我另外搜尋確認：多家媒體報導 Z.ai 於 11-23 在 Z.ai Chat、ZCode 與 GLM Coding Plan 推出 GLM-5.4，新增圖片輸入。
  - 目前沒有按量計費的 API，Hugging Face 也還沒有權重，官方沒有公布 benchmark 成績。
  - 現役來源都沒有 GLM-5.4 的列，所以今天不新增身分。等任一現役來源出現成績時，再依官方公告建立身分。
- **LingSante-3.1-flash（InclusionAI，11-22）**：AA 的變更紀錄新增這個模型，AA 模型目錄由 764 增為 765 個。
  - AA 沒有給它 Intelligence Index 或任何 benchmark 分數（`intelligenceIndex: null`），所以沒有產生成績列。
  - 名稱與 InclusionAI 先前的醫療專用版（`Ling-3.0-flash-Sante`）同一系列，不是通用前沿模型。
- **Hugging Face**：14 個廠商組織的最新 repo 清單與 11-22 相同，沒有新 repo。
- **廠商頁**：Anthropic、Google、Meta、xAI、Mistral、MiniMax、Thinking Machines、LG 的新聞與模型頁都沒有新模型。
  - OpenAI 新聞頁新增一篇研究文章「Perplexity and Intelligence」（11-22），不是模型發布。
  - Claude 支援頁與 Agnes 價目頁只有與模型發布無關的文字修改。

## 現役來源

詳細列數與差異見 [刷新報告](../refresh/2026-11-23.md#來源變化)。

- **有數值變化**：
  - **Epoch**：`benchmarks.csv` 由 1,931 列增為 1,940 列，新增 9 次評測，沒有移除。
    - Muse Ember (max) 新增 8 項，其中 4 項是本站追蹤的 benchmark：OTIS Mock AIME 98.89%、Chess Puzzles 43%、Furniture Assembly 48.33%、Mystery Game Puzzles 28%，已匯入。
    - 另外 4 項不在追蹤範圍內：EBR-bench 與三個 SpireClimb。
    - Gemini 4 Hydrogen (xhigh) 新增 FrontierMath-Erdos 一列（`0.0294`），不在追蹤範圍內。
  - **AA**：9 筆 GDPval-AA 分數微調，最大是 Kimi K3.1 Pro `0.680285 → 0.677885`。
- **只有中繼資料變化**：LiveBench 的 CSV 快取參數改變，分數與成本都不變。
- **沒有變化**：DeepSWE、MaxxBench、Scale SWE Atlas、FrontierCode、FrontierSWE、Surge 九榜、Zapier、ALE、ARC、Vals、BioBasicsBench、CWE-bench、Terminal-Bench、GBENCH 與四個廠商發布來源。
  - GBENCH 的 Agentic Coding 排名與分數都沒有變，API 只更新了平均成本與 token 數。
  - AA Vials 頁的 GDPval 與 Briefcase Elo 有小幅重算，Vials 分數不變；本站不從這頁取值。

## 新 benchmark／版本與待查線索

今天沒有新的 benchmark 線索。以下是既有線索的狀態：

| 線索                                                                 | 今天的狀態                                                                                                                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fireworks Specialized Intelligence Index（非現役）                   | Harvey 的 LAB 新增 Gemini 4 Carbon（18.06%，第 3 名）與 GPT-6.1 Sol（7.64%）；LAB: Contracts 新增 Gemini 4 Carbon（14%，第 1 名）。它彙整的是其他主辦方的 benchmark，仍不採用。 |
| BenchLM                                                              | 追蹤模型數由 1,035 增為 1,036，前 25 名不變。它是綜合排名網站，不是主辦方來源，不採用。                                                                                         |
| Vals RollerCoasterTycoonBench、OpenAI MedChemBench、Epoch SpireClimb | 不變，見 [11-21 查核](2026-11-21-benchmark-update-check.md#新-benchmark版本與待查線索)。SpireClimb 今天多了 Muse Ember 與 Gemini 4 Hydrogen 的成績。                            |
| SEC-bench Pro、CursorBench 4.1                                       | 不變。                                                                                                                                                                          |

## 證據與覆蓋限制

- 原始擷取、清單與差異筆記：`artifacts/research/2026-11-23-benchmark-check/web/`。
- GLM-5.4 的發布資訊來自 BenchLM 與新聞報導；Z.ai 的官方發布頁不在固定 URL 清單上，今天沒有擷取。等現役來源出現 GLM-5.4 成績、需要建立身分時，再取官方頁作為證據。
- 廠商頁清單沿用固定 URL；不在清單上的廠商公告，只能從現役來源出現的新模型名稱回頭查找。今天現役來源沒有出現新的未對應名稱。
