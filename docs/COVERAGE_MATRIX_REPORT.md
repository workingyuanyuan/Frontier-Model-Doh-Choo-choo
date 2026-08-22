# Coverage Matrix Report

- **Reference Date**: `2026-08-22`
- **Qualification Window**: 12 months
- **Active Sources (8)**: `arc-prize`, `artificial-analysis`, `deepswe`, `epoch-ai`, `frontier-code`, `livebench`, `vals-ai`, `zapier-automationbench`
- **Qualified Canonical Base Models**: 53
- **Active Benchmarks**: 45
- **Required Benchmarks**: `deepswe-1-1`, `frontier-code-1-1`

> [!NOTE]
> This report is Gate 2 review material (`docs/REFACTOR_SPEC_V2.md` §5.3, `tasks/claude-code-plan.md` D3).
> It details the empirical coverage tradeoff between retained benchmark count and complete qualified base-model count to inform manual configuration of `data-v2/mappings/display-set.json`.
> It does not modify `display-set.json`.
> Coverage is unioned across a canonical base model's product profiles, as required by the §5.3 model bitmask. D2 main-screen eligibility is stricter: one profile must pass the selected matrix and have all eight rendered dimensions. Complete-model counts here are therefore review upper bounds, not predicted main-screen row counts.
>
> Every combination below contains the required benchmarks, so the curve answers how strict the matrix can get while those keep gating the main screen. Without them the optimum is free to drop a source entirely, which reads as a better number and is a worse display set.

## 1. Tradeoff Curve

For each retained benchmark count $N$ from 2 to the active benchmark count, the table below lists the combination that maximizes the number of complete qualified base models. Deterministic tie-breaking favors higher covered dimension count, then lexicographically earlier benchmark ID lists.

| $N$ | Complete Models |                                Covered Dimensions                                 | Chosen Benchmark IDs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Matching Model Count & Details               |
| --: | --------------: | :-------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
|   2 |          **17** |                          3/8 (coding, agentic, context)                           | `deepswe-1-1`, `frontier-code-1-1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [17 models](#scale-n--2-17-complete-models)  |
|   3 |          **17** |                  5/8 (reasoning, math, coding, agentic, context)                  | `aime`, `deepswe-1-1`, `frontier-code-1-1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | [17 models](#scale-n--3-17-complete-models)  |
|   4 |          **17** |      7/8 (reasoning, math, language, instruction, coding, agentic, context)       | `aime`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | [17 models](#scale-n--4-17-complete-models)  |
|   5 |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [17 models](#scale-n--5-17-complete-models)  |
|   6 |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [17 models](#scale-n--6-17-complete-models)  |
|   7 |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [17 models](#scale-n--7-17-complete-models)  |
|   8 |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | [17 models](#scale-n--8-17-complete-models)  |
|   9 |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [17 models](#scale-n--9-17-complete-models)  |
|  10 |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [17 models](#scale-n--10-17-complete-models) |
|  11 |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [17 models](#scale-n--11-17-complete-models) |
|  12 |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `arc-agi-2`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | [16 models](#scale-n--12-16-complete-models) |
|  13 |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | [14 models](#scale-n--13-14-complete-models) |
|  14 |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [14 models](#scale-n--14-14-complete-models) |
|  15 |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [14 models](#scale-n--15-14-complete-models) |
|  16 |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`                                                                                                                                                                                                                                                                                                                                                                                                                                               | [14 models](#scale-n--16-14-complete-models) |
|  17 |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`                                                                                                                                                                                                                                                                                                                                                                                                                               | [14 models](#scale-n--17-14-complete-models) |
|  18 |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`                                                                                                                                                                                                                                                                                                                                                                                                         | [14 models](#scale-n--18-14-complete-models) |
|  19 |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`                                                                                                                                                                                                                                                                                                                                                                                            | [13 models](#scale-n--19-13-complete-models) |
|  20 |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`                                                                                                                                                                                                                                                                                                                                                                                      | [13 models](#scale-n--20-13-complete-models) |
|  21 |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`                                                                                                                                                                                                                                                                                                                                                                | [13 models](#scale-n--21-13-complete-models) |
|  22 |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                                                                                                                                                                                                                                             | [13 models](#scale-n--22-13-complete-models) |
|  23 |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                                                                                                                                                                                                                                | [12 models](#scale-n--23-12-complete-models) |
|  24 |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                                                                                                                                                                                                                     | [12 models](#scale-n--24-12-complete-models) |
|  25 |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                                                                                                                                                                                                        | [11 models](#scale-n--25-11-complete-models) |
|  26 |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`                                                                                                                                                                                                                                                                                                     | [10 models](#scale-n--26-10-complete-models) |
|  27 |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`                                                                                                                                                                                                                                                                                        | [10 models](#scale-n--27-10-complete-models) |
|  28 |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`                                                                                                                                                                                                                                                                        | [10 models](#scale-n--28-10-complete-models) |
|  29 |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`                                                                                                                                                                                                                                                         | [10 models](#scale-n--29-10-complete-models) |
|  30 |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`                                                                                                                                                                                                                                   | [10 models](#scale-n--30-10-complete-models) |
|  31 |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                                                                                                                | [10 models](#scale-n--31-10-complete-models) |
|  32 |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                                                                                                   | [9 models](#scale-n--32-9-complete-models)   |
|  33 |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                                                                                        | [8 models](#scale-n--33-8-complete-models)   |
|  34 |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                                                                       | [7 models](#scale-n--34-7-complete-models)   |
|  35 |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`                                                                                                                                                             | [6 models](#scale-n--35-6-complete-models)   |
|  36 |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                                          | [6 models](#scale-n--36-6-complete-models)   |
|  37 |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                         | [5 models](#scale-n--37-5-complete-models)   |
|  38 |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                                  | [4 models](#scale-n--38-4-complete-models)   |
|  39 |           **3** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                                                 | [3 models](#scale-n--39-3-complete-models)   |
|  40 |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`                                                                                     | [2 models](#scale-n--40-2-complete-models)   |
|  41 |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                                  | [2 models](#scale-n--41-2-complete-models)   |
|  42 |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`                                                       | [1 models](#scale-n--42-1-complete-models)   |
|  43 |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`                                          | [0 models](#scale-n--43-0-complete-models)   |
|  44 |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`                    | [0 models](#scale-n--44-0-complete-models)   |
|  45 |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) | `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench` | [0 models](#scale-n--45-0-complete-models)   |

## 2. Tradeoff Combination Model Details

Complete qualified base-model lists for each optimal combination in the tradeoff curve.

### Scale N = 2 (17 complete models)

- **Chosen Benchmarks (2)**: `deepswe-1-1`, `frontier-code-1-1`
- **Covered Dimensions (3/8)**: coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 3 (17 complete models)

- **Chosen Benchmarks (3)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`
- **Covered Dimensions (5/8)**: reasoning, math, coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 4 (17 complete models)

- **Chosen Benchmarks (4)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`
- **Covered Dimensions (7/8)**: reasoning, math, language, instruction, coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 5 (17 complete models)

- **Chosen Benchmarks (5)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 6 (17 complete models)

- **Chosen Benchmarks (6)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 7 (17 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 8 (17 complete models)

- **Chosen Benchmarks (8)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 9 (17 complete models)

- **Chosen Benchmarks (9)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 10 (17 complete models)

- **Chosen Benchmarks (10)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 11 (17 complete models)

- **Chosen Benchmarks (11)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (17)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 12 (16 complete models)

- **Chosen Benchmarks (12)**: `aime`, `arc-agi-2`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (16)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 13 (14 complete models)

- **Chosen Benchmarks (13)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (14)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 14 (14 complete models)

- **Chosen Benchmarks (14)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (14)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 15 (14 complete models)

- **Chosen Benchmarks (15)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (14)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 16 (14 complete models)

- **Chosen Benchmarks (16)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (14)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 17 (14 complete models)

- **Chosen Benchmarks (17)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (14)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 18 (14 complete models)

- **Chosen Benchmarks (18)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (14)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 19 (13 complete models)

- **Chosen Benchmarks (19)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (13)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-flash` (DeepSeek V4 Flash)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `moonshot-kimi-k3` (Kimi K3)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `xai-grok-4-5` (Grok 4.5)
  - `xai-grok-4-6` (Grok 4.6)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 20 (13 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (13)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 21 (13 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (13)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 22 (13 complete models)

- **Chosen Benchmarks (22)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (13)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 23 (12 complete models)

- **Chosen Benchmarks (23)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (12)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-4-6` (Claude Sonnet 4.6)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 24 (12 complete models)

- **Chosen Benchmarks (24)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (12)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 25 (11 complete models)

- **Chosen Benchmarks (25)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (11)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-4-8` (Claude Opus 4.8)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-5` (GPT-5.5)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 26 (10 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (10)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 27 (10 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (10)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 28 (10 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (10)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 29 (10 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (10)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 30 (10 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (10)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 31 (10 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (10)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `anthropic-claude-sonnet-5` (Claude Sonnet 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 32 (9 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (9)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `google-gemini-3-7-flash` (Gemini 3.7 Flash)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 33 (8 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (8)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 34 (7 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (7)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `google-gemini-3-6-flash` (Gemini 3.6 Flash)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)
  - `zai-glm-5-2` (GLM-5.2)

### Scale N = 35 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (6)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)

### Scale N = 36 (6 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (6)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)

### Scale N = 37 (5 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (5)**:
  - `anthropic-claude-fable-5` (Claude Fable 5)
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)
  - `openai-gpt-5-6-terra` (GPT-5.6 Terra)

### Scale N = 38 (4 complete models)

- **Chosen Benchmarks (38)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (4)**:
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `openai-gpt-5-6-luna` (GPT-5.6 Luna)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)

### Scale N = 39 (3 complete models)

- **Chosen Benchmarks (39)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (3)**:
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `deepseek-deepseek-v4-pro` (DeepSeek V4 Pro)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)

### Scale N = 40 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (2)**:
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)

### Scale N = 41 (2 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (2)**:
  - `anthropic-claude-opus-5` (Claude Opus 5)
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)

### Scale N = 42 (1 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (1)**:
  - `openai-gpt-5-6-sol` (GPT-5.6 Sol)

### Scale N = 43 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (0)**:
  - _(None)_

### Scale N = 44 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (0)**:
  - _(None)_

### Scale N = 45 (0 complete models)

- **Chosen Benchmarks (45)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Complete Models (0)**:
  - _(None)_

## 3. Qualified Model × Active Benchmark Presence Matrix

Presence indicates that the qualified base model has an eligible current result with non-null normalized score for the benchmark in an active whitelisted source.

| Model                    | Model ID                          | Total | `aa-briefcase` | `aa-lcr` | `aa-omniscience` | `aime` | `apex-agents` | `arc-agi-2` | `chess-puzzles` | `code-migration` | `corpfin` | `critpt` | `cyber` | `deepswe-1-1` | `emb`  | `finance-agent-v2` | `frontier-code-1-1` | `frontiermath` | `frontiermath-tier-4` | `gdpval-aa` | `gpqa-diamond` | `hlab` | `humanitys-last-exam` | `ifbench` | `ioi`  | `legal-bench` | `legal-research` | `livebench-instruction-following` | `livebench-language` | `livebench-mathematics` | `livebench-reasoning` | `livecodebench` | `medcode` | `medscribe` | `mmlu-pro` | `programbench` | `proofbench` | `public-benefits-bench` | `reverse-eng` | `scicode` | `simpleqa-verified` | `skillsbench` | `swe-bench` | `tau3-banking` | `tax-eval-v2` | `terminal-bench-2-1` | `vibe-code-bench` |
| ------------------------ | --------------------------------- | ----: | :------------: | :------: | :--------------: | :----: | :-----------: | :---------: | :-------------: | :--------------: | :-------: | :------: | :-----: | :-----------: | :----: | :----------------: | :-----------------: | :------------: | :-------------------: | :---------: | :------------: | :----: | :-------------------: | :-------: | :----: | :-----------: | :--------------: | :-------------------------------: | :------------------: | :---------------------: | :-------------------: | :-------------: | :-------: | :---------: | :--------: | :------------: | :----------: | :---------------------: | :-----------: | :-------: | :-----------------: | :-----------: | :---------: | :------------: | :-----------: | :------------------: | :---------------: |
| Qwen3.6 27B              | `alibaba-qwen3-6-27b`             | 21/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      -      |        ✓        |        -         |     ✓     |    ✓     |    -    |       -       |   -    |         -          |          -          |       -        |           -           |      ✓      |       ✓        |   -    |           ✓           |     ✓     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     ✓     |          -          |       -       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Qwen3.6 Plus             | `alibaba-qwen3-6-plus`            | 21/45 |       -        |    -     |        -         |   -    |       -       |      -      |        -        |        ✓         |     ✓     |    -     |    -    |       -       |   ✓    |         ✓          |          -          |       -        |           -           |      -      |       ✓        |   ✓    |           -           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      -       |            -            |       -       |     -     |          -          |       -       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| Qwen 3.7 Max             | `alibaba-qwen3-7-max`             | 24/45 |       -        |    -     |        -         |   ✓    |       -       |      -      |        ✓        |        ✓         |     ✓     |    -     |    -    |       -       |   ✓    |         ✓          |          -          |       -        |           -           |      -      |       ✓        |   ✓    |           -           |     -     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| Qwen3.7 Plus             | `alibaba-qwen3-7-plus`            | 22/45 |       -        |    ✓     |        ✓         |   ✓    |       ✓       |      -      |        ✓        |        ✓         |     -     |    ✓     |    ✓    |       -       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     ✓     |   -    |       -       |        ✓         |                 -                 |          -           |            -            |           -           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     ✓     |          -          |       ✓       |      -      |       ✓        |       -       |          ✓           |         ✓         |
| Qwen3.8 27B              | `alibaba-qwen3-8-27b`             | 29/45 |       -        |    ✓     |        ✓         |   -    |       -       |      -      |        -        |        ✓         |     -     |    ✓     |    -    |       -       |   ✓    |         ✓          |          -          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            -            |       -       |     ✓     |          -          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Qwen3.8 Max              | `alibaba-qwen3-8-max`             | 37/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      -      |        ✓        |        ✓         |     ✓     |    ✓     |    -    |       ✓       |   ✓    |         ✓          |          -          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       -       |     ✓     |          ✓          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Claude Fable 5           | `anthropic-claude-fable-5`        | 39/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    ✓     |    -    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     ✓     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       -       |     ✓     |          ✓          |       -       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Claude Mythos Preview    | `anthropic-claude-mythos-preview` |  0/45 |       -        |    -     |        -         |   -    |       -       |      -      |        -        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       -        |           -           |      -      |       -        |   -    |           -           |     -     |   -    |       -       |        -         |                 -                 |          -           |            -            |           -           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          -          |       -       |      -      |       -        |       -       |          -           |         -         |
| Claude Opus 4.5          | `anthropic-claude-opus-4-5`       | 11/45 |       -        |    -     |        -         |   ✓    |       -       |      -      |        ✓        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       ✓        |           ✓           |      -      |       ✓        |   -    |           -           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       -       |          -           |         -         |
| Claude Opus 4.6          | `anthropic-claude-opus-4-6`       | 16/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          ✓          |       ✓        |           ✓           |      -      |       ✓        |   -    |           -           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     ✓     |      ✓      |     -      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       -       |          -           |         ✓         |
| Claude Opus 4.7          | `anthropic-claude-opus-4-7`       | 29/45 |       -        |    -     |        -         |   ✓    |       -       |      -      |        ✓        |        ✓         |     ✓     |    -     |    ✓    |       -       |   ✓    |         ✓          |          ✓          |       ✓        |           ✓           |      -      |       ✓        |   ✓    |           -           |     -     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      -       |            -            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| Claude Opus 4.8          | `anthropic-claude-opus-4-8`       | 32/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    -     |    ✓    |       ✓       |   ✓    |         ✓          |          ✓          |       ✓        |           ✓           |      -      |       ✓        |   ✓    |           -           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      -       |            ✓            |       -       |     -     |          ✓          |       ✓       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| Claude Opus 5            | `anthropic-claude-opus-5`         | 41/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    ✓     |    ✓    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       ✓       |     ✓     |          ✓          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Claude Sonnet 4.6        | `anthropic-claude-sonnet-4-6`     | 29/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    -     |    -    |       ✓       |   ✓    |         ✓          |          ✓          |       ✓        |           ✓           |      -      |       ✓        |   ✓    |           -           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     -     |      -      |     ✓      |       ✓        |      -       |            ✓            |       -       |     -     |          ✓          |       ✓       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| Claude Sonnet 5          | `anthropic-claude-sonnet-5`       | 37/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      -      |        ✓        |        ✓         |     ✓     |    ✓     |    -    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       -       |     ✓     |          ✓          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| DeepSeek V4              | `deepseek-deepseek-v4`            |  0/45 |       -        |    -     |        -         |   -    |       -       |      -      |        -        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       -        |           -           |      -      |       -        |   -    |           -           |     -     |   -    |       -       |        -         |                 -                 |          -           |            -            |           -           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          -          |       -       |      -      |       -        |       -       |          -           |         -         |
| DeepSeek V4 Flash        | `deepseek-deepseek-v4-flash`      | 21/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        -         |     -     |    ✓     |    ✓    |       ✓       |   -    |         -          |          ✓          |       -        |           -           |      ✓      |       ✓        |   -    |           ✓           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     ✓     |          ✓          |       -       |      -      |       ✓        |       -       |          ✓           |         -         |
| DeepSeek V4 Pro          | `deepseek-deepseek-v4-pro`        | 39/45 |       -        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    ✓     |    ✓    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       -       |     ✓     |          ✓          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Gemini 3.1 Pro Preview   | `google-gemini-3-1-pro-preview`   | 40/45 |       ✓        |    ✓     |        ✓         |   ✓    |       ✓       |      -      |        ✓        |        ✓         |     ✓     |    ✓     |    ✓    |       ✓       |   ✓    |         ✓          |          -          |       ✓        |           ✓           |      ✓      |       ✓        |   ✓    |           ✓           |     ✓     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       -       |     ✓     |          ✓          |       -       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Gemini 3.5 Flash         | `google-gemini-3-5-flash`         | 32/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    -     |    ✓    |       ✓       |   ✓    |         ✓          |          -          |       ✓        |           ✓           |      -      |       ✓        |   ✓    |           -           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       -       |     -     |          ✓          |       ✓       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| Gemini 3.5 Flash-Lite    | `google-gemini-3-5-flash-lite`    | 35/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    ✓     |    ✓    |       -       |   ✓    |         ✓          |          -          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      -       |            ✓            |       -       |     ✓     |          -          |       -       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Gemini 3.6 Flash         | `google-gemini-3-6-flash`         | 37/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    ✓     |    ✓    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      -       |            ✓            |       -       |     ✓     |          ✓          |       -       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Gemini 3.7 Flash         | `google-gemini-3-7-flash`         | 36/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     -     |    ✓     |    -    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            -            |       -       |     ✓     |          ✓          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Gemini 3 Pro Preview     | `google-gemini-3-pro-preview`     | 16/45 |       -        |    -     |        -         |   ✓    |       -       |      -      |        ✓        |        -         |     ✓     |    -     |    -    |       -       |   -    |         -          |          -          |       ✓        |           ✓           |      -      |       ✓        |   -    |           -           |     -     |   ✓    |       ✓       |        -         |                 -                 |          -           |            -            |           -           |        ✓        |     ✓     |      ✓      |     ✓      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       ✓       |          -           |         ✓         |
| Muse Spark               | `meta-muse-spark`                 | 13/45 |       -        |    -     |        -         |   ✓    |       -       |      -      |        -        |        -         |     ✓     |    -     |    -    |       -       |   -    |         -          |          -          |       ✓        |           ✓           |      -      |       ✓        |   -    |           -           |     -     |   -    |       ✓       |        -         |                 -                 |          -           |            -            |           -           |        -        |     ✓     |      ✓      |     ✓      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       ✓       |          -           |         ✓         |
| Muse Spark 1.1           | `meta-muse-spark-1-1`             | 23/45 |       -        |    -     |        -         |   -    |       -       |      -      |        -        |        ✓         |     ✓     |    -     |    -    |       ✓       |   ✓    |         ✓          |          -          |       -        |           -           |      -      |       ✓        |   ✓    |           -           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     -     |      ✓      |     ✓      |       ✓        |      -       |            ✓            |       -       |     -     |          -          |       ✓       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| Muse Spark 1.2           | `meta-muse-spark-1-2`             | 32/45 |       ✓        |    ✓     |        ✓         |   -    |       -       |      -      |        -        |        ✓         |     ✓     |    ✓     |    -    |       ✓       |   ✓    |         ✓          |          -          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     ✓     |      ✓      |     ✓      |       -        |      ✓       |            ✓            |       -       |     ✓     |          -          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| MiniMax M3               | `minimax-minimax-m3`              | 36/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      -      |        ✓        |        ✓         |     ✓     |    ✓     |    ✓    |       -       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     ✓     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       -        |      ✓       |            ✓            |       -       |     ✓     |          -          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Kimi K2.6                | `moonshot-kimi-k2-6`              | 28/45 |       -        |    -     |        -         |   ✓    |       -       |      -      |        ✓        |        ✓         |     ✓     |    -     |    ✓    |       -       |   ✓    |         ✓          |          -          |       ✓        |           ✓           |      -      |       ✓        |   ✓    |           -           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      -       |            ✓            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| Kimi K2.7 Code           | `moonshot-kimi-k2-7-code`         | 18/45 |       -        |    ✓     |        ✓         |   ✓    |       -       |      -      |        ✓        |        -         |     -     |    ✓     |    -    |       ✓       |   -    |         -          |          -          |       -        |           -           |      ✓      |       ✓        |   -    |           ✓           |     ✓     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     ✓     |          ✓          |       -       |      -      |       ✓        |       -       |          ✓           |         -         |
| Kimi K3                  | `moonshot-kimi-k3`                | 21/45 |       ✓        |    ✓     |        ✓         |   ✓    |       ✓       |      ✓      |        ✓        |        -         |     -     |    ✓     |    -    |       ✓       |   -    |         -          |          ✓          |       -        |           -           |      ✓      |       ✓        |   -    |           ✓           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     ✓     |          ✓          |       -       |      -      |       ✓        |       -       |          ✓           |         -         |
| Nemotron 3 Ultra         | `nvidia-nemotron-3-ultra`         | 25/45 |       ✓        |    ✓     |        ✓         |   -    |       -       |      -      |        -        |        ✓         |     ✓     |    ✓     |    -    |       -       |   ✓    |         ✓          |          -          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     ✓     |   -    |       ✓       |        ✓         |                 -                 |          -           |            -            |           -           |        ✓        |     ✓     |      -      |     ✓      |       ✓        |      -       |            -            |       -       |     ✓     |          -          |       -       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| GPT-5.2                  | `openai-gpt-5-2`                  | 12/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       ✓        |           ✓           |      -      |       ✓        |   -    |           -           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       -       |          -           |         -         |
| GPT-5.2 Codex            | `openai-gpt-5-2-codex`            |  7/45 |       -        |    -     |        -         |   -    |       -       |      -      |        -        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       -        |           -           |      -      |       -        |   -    |           -           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          -          |       -       |      ✓      |       -        |       -       |          -           |         ✓         |
| GPT-5.2 Pro              | `openai-gpt-5-2-pro`              |  2/45 |       -        |    -     |        -         |   -    |       -       |      ✓      |        -        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       -        |           ✓           |      -      |       -        |   -    |           -           |     -     |   -    |       -       |        -         |                 -                 |          -           |            -            |           -           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          -          |       -       |      -      |       -        |       -       |          -           |         -         |
| GPT-5.3 Codex            | `openai-gpt-5-3-codex`            |  4/45 |       -        |    -     |        -         |   -    |       -       |      -      |        -        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       -        |           -           |      -      |       -        |   -    |           -           |     -     |   ✓    |       -       |        -         |                 -                 |          -           |            -            |           -           |        ✓        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          -          |       -       |      ✓      |       -        |       -       |          -           |         ✓         |
| GPT-5.4                  | `openai-gpt-5-4`                  | 14/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        -         |     -     |    -     |    -    |       ✓       |   -    |         -          |          -          |       ✓        |           ✓           |      -      |       ✓        |   -    |           -           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       -       |          -           |         ✓         |
| GPT-5.4 mini             | `openai-gpt-5-4-mini`             | 26/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    -     |    -    |       -       |   ✓    |         ✓          |          ✓          |       ✓        |           ✓           |      -      |       ✓        |   ✓    |           -           |     -     |   ✓    |       -       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     -     |      -      |     ✓      |       ✓        |      -       |            -            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| GPT-5.4 nano             | `openai-gpt-5-4-nano`             | 11/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       ✓        |           ✓           |      -      |       ✓        |   -    |           -           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      -      |       -        |       -       |          -           |         -         |
| GPT-5.4 Pro              | `openai-gpt-5-4-pro`              |  6/45 |       -        |    -     |        -         |   -    |       -       |      ✓      |        ✓        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       ✓        |           ✓           |      -      |       ✓        |   -    |           -           |     -     |   -    |       -       |        -         |                 -                 |          -           |            -            |           -           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      -      |       -        |       -       |          -           |         -         |
| GPT-5.5                  | `openai-gpt-5-5`                  | 33/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    -     |    ✓    |       ✓       |   ✓    |         ✓          |          ✓          |       ✓        |           ✓           |      -      |       ✓        |   ✓    |           -           |     -     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      -       |            ✓            |       ✓       |     -     |          ✓          |       ✓       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| GPT-5.5 Pro              | `openai-gpt-5-5-pro`              |  8/45 |       -        |    -     |        -         |   ✓    |       -       |      ✓      |        ✓        |        -         |     -     |    ✓     |    -    |       -       |   -    |         -          |          -          |       ✓        |           ✓           |      -      |       ✓        |   -    |           -           |     -     |   -    |       -       |        -         |                 -                 |          -           |            -            |           -           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          ✓          |       -       |      -      |       -        |       -       |          -           |         -         |
| GPT-5.6 Luna             | `openai-gpt-5-6-luna`             | 39/45 |       -        |    ✓     |        ✓         |   ✓    |       ✓       |      ✓      |        ✓        |        ✓         |     ✓     |    ✓     |    ✓    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     -     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       -       |     ✓     |          ✓          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| GPT-5.6 Sol              | `openai-gpt-5-6-sol`              | 42/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        ✓         |     ✓     |    ✓     |    ✓    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     ✓     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       ✓       |     ✓     |          ✓          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| GPT-5.6 Terra            | `openai-gpt-5-6-terra`            | 40/45 |       -        |    ✓     |        ✓         |   ✓    |       ✓       |      ✓      |        ✓        |        ✓         |     ✓     |    ✓     |    -    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     ✓     |   ✓    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      ✓       |            ✓            |       -       |     ✓     |          ✓          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| Inkling                  | `thinking-machines-inkling`       | 19/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        -         |     -     |    ✓     |    -    |       -       |   -    |         -          |          ✓          |       -        |           -           |      ✓      |       ✓        |   -    |           ✓           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     ✓     |          ✓          |       -       |      -      |       ✓        |       -       |          ✓           |         -         |
| Grok 4.3                 | `xai-grok-4-3`                    | 14/45 |       -        |    ✓     |        ✓         |   -    |       -       |      -      |        -        |        -         |     -     |    ✓     |    -    |       -       |   -    |         -          |          -          |       -        |           -           |      ✓      |       ✓        |   -    |           ✓           |     ✓     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     ✓     |          -          |       -       |      -      |       ✓        |       -       |          ✓           |         -         |
| Grok 4.5                 | `xai-grok-4-5`                    | 20/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        -         |     -     |    ✓     |    -    |       ✓       |   -    |         -          |          ✓          |       -        |           -           |      ✓      |       ✓        |   -    |           ✓           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     ✓     |          ✓          |       -       |      -      |       ✓        |       -       |          ✓           |         -         |
| Grok 4.6                 | `xai-grok-4-6`                    | 20/45 |       ✓        |    ✓     |        ✓         |   ✓    |       -       |      ✓      |        ✓        |        -         |     -     |    ✓     |    -    |       ✓       |   -    |         -          |          ✓          |       -        |           -           |      ✓      |       ✓        |   -    |           ✓           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     ✓     |          ✓          |       -       |      -      |       ✓        |       -       |          ✓           |         -         |
| Grok Build 0.1           | `xai-grok-build-0-1`              |  4/45 |       -        |    -     |        -         |   -    |       -       |      -      |        -        |        -         |     -     |    -     |    -    |       -       |   -    |         -          |          -          |       -        |           -           |      -      |       -        |   -    |           -           |     -     |   -    |       -       |        -         |                 ✓                 |          ✓           |            ✓            |           ✓           |        -        |     -     |      -      |     -      |       -        |      -       |            -            |       -       |     -     |          -          |       -       |      -      |       -        |       -       |          -           |         -         |
| MiMo V2.5 Pro            | `xiaomi-mimo-v2-5-pro`            | 27/45 |       ✓        |    ✓     |        ✓         |   -    |       ✓       |      -      |        -        |        ✓         |     ✓     |    ✓     |    -    |       -       |   ✓    |         ✓          |          -          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     ✓     |   -    |       ✓       |        ✓         |                 -                 |          -           |            -            |           -           |        ✓        |     ✓     |      ✓      |     ✓      |       -        |      ✓       |            -            |       -       |     ✓     |          -          |       -       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| GLM-5.1                  | `zai-glm-5-1`                     | 22/45 |       -        |    -     |        -         |   ✓    |       -       |      -      |        ✓        |        ✓         |     ✓     |    -     |    -    |       -       |   -    |         ✓          |          -          |       ✓        |           ✓           |      -      |       ✓        |   ✓    |           -           |     -     |   -    |       ✓       |        ✓         |                 -                 |          -           |            -            |           -           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      -       |            ✓            |       -       |     -     |          ✓          |       -       |      ✓      |       -        |       ✓       |          ✓           |         ✓         |
| GLM-5.2                  | `zai-glm-5-2`                     | 40/45 |       ✓        |    ✓     |        ✓         |   ✓    |       ✓       |      ✓      |        ✓        |        ✓         |     ✓     |    ✓     |    ✓    |       ✓       |   ✓    |         ✓          |          ✓          |       -        |           -           |      ✓      |       ✓        |   ✓    |           ✓           |     ✓     |   -    |       ✓       |        ✓         |                 ✓                 |          ✓           |            ✓            |           ✓           |        ✓        |     ✓     |      ✓      |     ✓      |       ✓        |      -       |            -            |       ✓       |     ✓     |          ✓          |       ✓       |      ✓      |       ✓        |       ✓       |          ✓           |         ✓         |
| **Total Models Covered** | —                                 |     — |     **20**     |  **27**  |      **27**      | **39** |     **7**     |   **27**    |     **39**      |      **30**      |  **30**   |  **28**  | **16**  |    **24**     | **29** |       **30**       |       **23**        |     **18**     |        **19**         |   **27**    |     **47**     | **30** |        **27**         |  **12**   | **14** |    **30**     |      **30**      |              **41**               |        **41**        |         **41**          |        **41**         |     **30**      |  **29**   |   **29**    |   **31**   |     **25**     |    **15**    |         **20**          |     **4**     |  **27**   |       **36**        |    **18**     |   **38**    |     **27**     |    **32**     |        **38**        |      **37**       |
