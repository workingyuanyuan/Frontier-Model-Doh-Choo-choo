# 前沿模型能力維度重評 — 2026-10-03

## 建議

整個 benchmark 目錄採六個能力類別；目前 AA 前沿六模型的共同測試，能支撐其中五個計分維度：推理與解題、知識與專業判斷、資料理解與整合、程式與軟體工程、工具與工作流程。第六類「語言與指令遵循」在本次共同集合沒有測試，不能產生該能力分數。

這個區別只涉及分類與測量範圍。所有上榜模型仍使用同一組完整測試、同一組五個軸；主榜使用固定且明示的計分版本。未取得共同測量的能力，不以其他分數替代。未來加入或移除計分軸需審核並升版，不能在日常刷新時悄悄改变總分權重。

## 分析範圍與方法

- 重新檢查 54 項現役 benchmark；品質政策排除 AIME、ProgramBench 後為 52 項候選。比較專用 FrontierSWE V2 不屬於此自動計分母體。
- 依既有來源優先序、effort 歸屬與有效結果選擇，取得 2,598 筆有效成績、201 個 profiles、64 個具成績模型。缺值保留缺值。
- 逐項依「主要評分終點」分類，並核對官方方法；醫療／法律／金融是領域，PDF／Excel 是格式，使用工具是執行條件，這些資訊本身不決定主要能力。
- 重跑 SPEC §4.6 的同 profile Spearman 配對驗算，n≥15；另用每模型固定一個覆蓋最多的 profile 檢查 effort 重複計數敏感性。
- 以 AA 選出的六個模型，只做覆蓋與分數權重敏感性分析；六個樣本不足以估計可靠的潛在維度數。

## AA 前沿資格：本次已核准規則

僅使用 AA Intelligence Index，在同一版本內按 canonical model 合併 effort，保留最高分。檢查前十名的九個相鄰分差；唯一最大正分差達其餘八個分差中位數的兩倍，即以該處分群。沒有唯一清楚邊界則交由使用者稽核。每次保存來源版本、原分數、分差、門檻及裁決，作為下一次調整依據。

本次保存的 v4.3.2 資料有 22 個已解析 AA 模型；第六／七名差 3.740949，其餘分差中位數 1.326792，比例 2.819545。門檻 2 選出 Claude Opus 5.5、Claude Sonnet 5.5、Claude Fable 5.1、GPT-6 Astra、Gemini 4 Argon、GPT-6.1 Sol。這是目前已解析快照的結果；正式更新需確認 AA 領先列完整取得並解析，不能把 catalog 缺漏當作真實榜單缺席。

本次共同測試分析固定每模型在 AA 得到最高分的 product profile；這也是建議採用的可重現配置規則。六個 profile 的最高覆蓋選擇恰與此一致。共同集合有 21 項、126 個分數，既有品質占比限制均通過。[逐筆資料與門檻敏感性](2026-10-03-frontier-cohort.json)

## 維度定義與共同集合

| 維度           | 主要能力與邊界                                                           | 目前共同 benchmark                                                                                        | 數量 |
| -------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---: |
| 推理與解題     | 從題目條件推導答案、研究級科學推理、數學證明；目標是解題本身             | CritPt、ProofBench                                                                                        |    2 |
| 知識與專業判斷 | 回答專業知識問題、正確使用概念和分類規則                                 | AA-Omniscience Accuracy、Humanity’s Last Exam、MedCode                                                    |    3 |
| 資料理解與整合 | 以提供的文件、表格、長文或逐字稿為證據，擷取、對照、推論並轉換成正確結果 | AA-LCR、GDP.pdf、GDP.xlsx、MedScribe                                                                      |    4 |
| 程式與軟體工程 | 產生、修改、遷移、除錯或修補可執行軟體                                   | SciCode、IOI、Code Migration、Vibe Code Bench、CyberBench                                                 |    5 |
| 工具與工作流程 | 完成外部環境中的多步業務任務、操作或交付工作成果                         | Finance Agent v2、GDPval-AA、AA-Briefcase、AutomationBench、H-Lab、EMB、Legal Research                    |    7 |
| 語言與指令遵循 | 理解／產生語言，滿足明確、隱含或條件式輸出約束                           | 共同集合無此類測試；目錄中的代表是 ComplexConstraints、IFBench、LiveBench Language／Instruction Following |    0 |

### 主要重分類理由

MedScribe 要求把提供的醫病對話轉為 SOAP 紀錄，按內容與結構 rubric 評分。這是依據資料的摘要與轉換；它無法單獨代表翻譯、創作與一般指令遵循。[官方方法](https://www.vals.ai/benchmarks/medscribe)

AA-LCR 明確要求跨長文件整合與推論；GDP.pdf 與 GDP.xlsx 分別要求理解提供的文件和試算表。三者與 MedScribe 的共同邊界是答案對輸入證據的依賴，不是單看輸入長度。[AA-LCR](https://artificialanalysis.ai/articles/announcing-aa-lcr)、[GDP.pdf](https://artificialanalysis.ai/evaluations/gdp-pdf)、[GDP.xlsx](https://surgehq.ai/blog/gdp-xlsx)

MedCode 的主要評分終點是依 ICD-10-CM 規則正確編碼，保留在專業判斷；病歷理解是次要能力。AA-Omniscience 本專案採 Accuracy，不採其另列的 Omniscience Index，因此維度不能聲稱量到完整的幻覺校準能力。[MedCode](https://www.vals.ai/benchmarks/medcode)、[Omniscience 指標](https://artificialanalysis.ai/evaluations/omniscience)

CyberBench 的漏洞重現和修補終點是軟體安全工程，建議歸程式與軟體工程。ProofBench 使用 Lean 但終點是證明成立，仍歸推理；使用工具或撰寫形式語言本身不是 Coding 的充分條件。[CyberBench](https://www.vals.ai/benchmarks/cyber)、[ProofBench](https://www.vals.ai/benchmarks/proof_bench)

ComplexConstraints 的主要目標是同時滿足輸出約束。它與依文件取證不同，應保有獨立分類，不因目前共同資料不足而改名混入資料理解。[官方說明](https://surgehq.ai/benchmarks/complex-constraints)

## 數據支持及限制

| 檢查                                        | 結果                                                    |
| ------------------------------------------- | ------------------------------------------------------- |
| 全部 54 項、同 profile、n≥15                | 959 對；現行組內平均 rho 0.6150、組間 0.5351，差 0.0799 |
| 品質候選 52 項                              | 差 0.0716；每模型固定單一 profile 也約 0.0716           |
| MedScribe × LiveBench Language              | rho 0.3488，n=31                                        |
| MedScribe × LiveBench Instruction Following | rho −0.0181，n=31                                       |
| MedScribe × Legal Research                  | rho 0.7939，n=37；同來源可能混入來源因素                |
| 相同 21 欄的歷史資料比較                    | 新五類 raw 分離度約 0.0557，高於舊五類 0.0031           |

這些相關是描述性診斷，不能證明模型真的具有五個獨立心理或認知因子。品質候選矩陣約 76% 的 profile 欄位缺測，每一對 benchmark 的模型母體不同；資料理解新組僅 3／6 對達 n≥15。四類方案合併知識與推理後，raw 分離度更高，但控制共同表現的粗略 proxy 後，五類更高。因此沒有穩定統計證據迫使合併或增加維度。

Cyber 與其他 Coding 測試相關偏弱，也顯示此類別是有明確任務邊界的能力集合，不應宣稱其中各種軟體能力可互換。分類推薦主要依任務含義，統計用來揭露矛盾與待驗證假設。[完整統計方法及結果](2026-10-03-dimension-statistics.md)

## 必須隨維度審核的權重問題

本次六模型 ProofBench 為 99–100（均值 99.5），區辨力已很低。新的推理維度若仍採兩測試平均，ProofBench 占該維 50%；再讓五維等權，它就占總分 10%。舊分類的 MedScribe 單獨占 Language，則占五維等權總分 20%。

建議將 ProofBench 列入品質再審核，優先停止其對目前前沿總分的貢獻；這是品質政策變更，需與新分類一併裁定。移除後目前推理維度僅 CritPt，可展示其狹窄的測量範圍，但不能聲稱已充分覆蓋一般推理。其他推理測試應在六模型都有可比成績時補入，不能為湊數而加上缺值。

等權五維的試算中，保留／移除 ProofBench 會交換第一、二名，分差皆約 0.18。這是權重敏感性，不是模型能力隨時間變化。報告沒有利用「誰排名第一」來挑選分類。[逐模型分數敏感性](2026-10-03-dimension-statistics.json)

## 為何推薦目前五個計分面向

四維需要把知識與推理合併，會弱化「知道什麼」與「能推導什麼」的可解釋差異；統計未提供穩定的必要性。六個計分維度則需要一個六模型皆完整的語言／指令測試，目前不存在。據此，本次建議以五個有共同測量的面向構成單一榜單，目錄保留語言／指令分類供未來評測資料進入。

目前要裁定的是這五個面向的邊界，以及是否將近飽和 ProofBench 暫停計分。共同測試的內容與維度一起版本化；維度數量不應由每天的資料缺口自動變動。

## 重現

```powershell
pnpm exec tsx scripts/analyze-dimension-statistics.ts
python scripts/analyze-frontier-cohort.py
python scripts/analyze-dimension-statistics.py
```

分析腳本檢查 canonical cell 唯一性、模型與 benchmark 數、來源有效結果選擇、六模型完整性、品質占比與分差邊界；所有分析以目前工作區快照為基礎。

## 附錄：54 項逐項分類提案

每項只歸一個主要類別；交叉能力保存在說明。分類依測量終點，並非宣稱群內各測試可互換。現役來源有成績與目前前沿六模型共同有成績是不同範圍。

| Benchmark ID                      | 現行      | 建議           | 六模型共同 | 說明                                                                                  |
| --------------------------------- | --------- | -------------- | ---------- | ------------------------------------------------------------------------------------- |
| `aa-briefcase`                    | agentic   | 工具與工作流程 | 是         | 依主要評分終點歸類。                                                                  |
| `aa-lcr`                          | reasoning | 資料理解與整合 | 是         | 既有品質占比限制；新類別需重新驗證。                                                  |
| `aa-omniscience`                  | knowledge | 知識與專業判斷 | 是         | 本專案計分採 Accuracy，不是 Omniscience Index。                                       |
| `aime`                            | reasoning | 推理與解題     | —          | 既有品質政策排除。                                                                    |
| `apex-agents`                     | agentic   | 工具與工作流程 | —          | 依主要評分終點歸類。                                                                  |
| `arc-agi-2`                       | reasoning | 推理與解題     | —          | 依主要評分終點歸類。                                                                  |
| `automationbench`                 | agentic   | 工具與工作流程 | 是         | 依主要評分終點歸類。                                                                  |
| `chartography`                    | reasoning | 資料理解與整合 | —          | 依主要評分終點歸類。                                                                  |
| `chess-puzzles`                   | reasoning | 推理與解題     | —          | 依主要評分終點歸類。                                                                  |
| `code-migration`                  | coding    | 程式與軟體工程 | 是         | 依主要評分終點歸類。                                                                  |
| `complex-constraints`             | language  | 語言與指令遵循 | —          | 依主要評分終點歸類。                                                                  |
| `corpfin`                         | reasoning | 資料理解與整合 | —          | 依財報材料抽取與推導公司財務結果；專業知識次要。                                      |
| `critpt`                          | reasoning | 推理與解題     | 是         | 依主要評分終點歸類。                                                                  |
| `cursorbench-4`                   | coding    | 程式與軟體工程 | —          | 依主要評分終點歸類。                                                                  |
| `cyber`                           | agentic   | 程式與軟體工程 | 是         | 漏洞重現及修補屬軟體安全工程；與一般 Coding 的弱相關列為異質性限制。                  |
| `dayjob-finance`                  | agentic   | 工具與工作流程 | —          | 依主要評分終點歸類。                                                                  |
| `dayjob-healthcare`               | agentic   | 工具與工作流程 | —          | 依主要評分終點歸類。                                                                  |
| `deepswe-1-1`                     | coding    | 程式與軟體工程 | —          | 依主要評分終點歸類。                                                                  |
| `emb`                             | agentic   | 工具與工作流程 | 是         | 依主要評分終點歸類。                                                                  |
| `enterprisebench-corecraft`       | agentic   | 工具與工作流程 | —          | 依主要評分終點歸類。                                                                  |
| `finance-agent-v2`                | agentic   | 工具與工作流程 | 是         | 依主要評分終點歸類。                                                                  |
| `frontier-code-1-1`               | coding    | 程式與軟體工程 | —          | 依主要評分終點歸類。                                                                  |
| `frontiermath`                    | reasoning | 推理與解題     | —          | 依主要評分終點歸類。                                                                  |
| `frontiermath-tier-4`             | reasoning | 推理與解題     | —          | 依主要評分終點歸類。                                                                  |
| `gdp-pdf`                         | reasoning | 資料理解與整合 | 是         | 依主要評分終點歸類。                                                                  |
| `gdp-xlsx`                        | reasoning | 資料理解與整合 | 是         | 依主要評分終點歸類。                                                                  |
| `gdpval-aa`                       | agentic   | 工具與工作流程 | 是         | 依主要評分終點歸類。                                                                  |
| `gpqa-diamond`                    | reasoning | 推理與解題     | —          | 研究級科学問答需知識及推導，主歸推理；邊界案例。 既有品質占比限制；新類別需重新驗證。 |
| `hlab`                            | agentic   | 工具與工作流程 | 是         | 依主要評分終點歸類。                                                                  |
| `humanitys-last-exam`             | knowledge | 知識與專業判斷 | 是         | 廣泛專家題目；本分類以知識為主，推理交叉。                                            |
| `ifbench`                         | language  | 語言與指令遵循 | —          | 依主要評分終點歸類。                                                                  |
| `ioi`                             | coding    | 程式與軟體工程 | 是         | 依主要評分終點歸類。                                                                  |
| `legal-bench`                     | reasoning | 知識與專業判斷 | —          | 法律規則應用與分類判斷；主歸專業判斷，推理次要。 既有品質占比限制；新類別需重新驗證。 |
| `legal-research`                  | agentic   | 工具與工作流程 | 是         | 依主要評分終點歸類。                                                                  |
| `livebench-instruction-following` | language  | 語言與指令遵循 | —          | 依主要評分終點歸類。                                                                  |
| `livebench-language`              | language  | 語言與指令遵循 | —          | 依主要評分終點歸類。                                                                  |
| `livebench-mathematics`           | reasoning | 推理與解題     | —          | 依主要評分終點歸類。                                                                  |
| `livebench-reasoning`             | reasoning | 推理與解題     | —          | 依主要評分終點歸類。                                                                  |
| `livecodebench`                   | coding    | 程式與軟體工程 | —          | 依主要評分終點歸類。                                                                  |
| `medcode`                         | knowledge | 知識與專業判斷 | 是         | 醫療分類標準應用；與程式碼生成無關。                                                  |
| `medscribe`                       | language  | 資料理解與整合 | 是         | 提供的逐字稿轉為結構化 SOAP 紀錄；資料轉換主要，語言次要。                            |
| `mmlu-pro`                        | knowledge | 知識與專業判斷 | —          | 既有品質占比限制；新類別需重新驗證。                                                  |
| `programbench`                    | coding    | 程式與軟體工程 | —          | 既有品質政策排除。                                                                    |
| `proofbench`                      | reasoning | 推理與解題     | 是         | Lean 為證明媒介；本次六模型 99–100，建議品質再審。                                    |
| `public-benefits-bench`           | agentic   | 工具與工作流程 | —          | 依主要評分終點歸類。                                                                  |
| `riemann-bench`                   | reasoning | 推理與解題     | —          | 依主要評分終點歸類。                                                                  |
| `scicode`                         | coding    | 程式與軟體工程 | 是         | 依主要評分終點歸類。                                                                  |
| `simpleqa-verified`               | knowledge | 知識與專業判斷 | —          | 依主要評分終點歸類。                                                                  |
| `skillsbench`                     | agentic   | 工具與工作流程 | —          | 跨領域工具／技能任務，主歸工作流程。                                                  |
| `swe-bench`                       | coding    | 程式與軟體工程 | —          | 依主要評分終點歸類。                                                                  |
| `tau3-banking`                    | agentic   | 工具與工作流程 | —          | 依主要評分終點歸類。                                                                  |
| `tax-eval-v2`                     | knowledge | 知識與專業判斷 | —          | 既有品質占比限制；新類別需重新驗證。                                                  |
| `terminal-bench-2-1`              | coding    | 工具與工作流程 | —          | 終端環境包含軟體、系統與資料工作；整體測試主歸工具任務完成，程式為次要。              |
| `vibe-code-bench`                 | coding    | 程式與軟體工程 | 是         | 依主要評分終點歸類。                                                                  |

其他目錄項目與比較專用資料不計入54項現役自動計分母體。完整映射由本附錄的 JSON 保存。
