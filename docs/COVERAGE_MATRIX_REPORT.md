# Coverage Matrix Report

- **Reference Date**: `2026-08-22`
- **Qualification Window**: 12 months
- **Active Sources (8)**: `arc-prize`, `artificial-analysis`, `deepswe`, `epoch-ai`, `frontier-code`, `livebench`, `vals-ai`, `zapier-automationbench`
- **Qualified Canonical Base Models**: 53
- **Active Benchmarks**: 45
- **Candidates per Scale ($k$)**: 5
- **Required Benchmarks (Baseline)**: `deepswe-1-1`, `frontier-code-1-1`

> [!NOTE]
> This report is Gate 2 review material (`docs/REFACTOR_SPEC_V2.md` §5.3, `tasks/claude-code-plan.md` D3).
> It details the empirical coverage tradeoff between retained benchmark count and complete qualified base-model count to inform manual configuration of `data-v2/mappings/display-set.json`.
> It does not modify `display-set.json`.
> Coverage is unioned across a canonical base model's product profiles, as required by the §5.3 model bitmask. D2 main-screen eligibility is stricter: one profile must pass the selected matrix and have all eight rendered dimensions. Complete-model counts here are therefore review upper bounds, not predicted main-screen row counts.
>
> Requirements are not pinned by default (ruling R7). The primary tradeoff curve is unconstrained, and the baseline curve below reflects the `--require` constraints for side-by-side cost comparison.

## Definitions

- **`sourceSpan`**: The number of distinct whitelisted data sources providing at least one benchmark in the candidate subset.
- **`exclusiveSources`**: The number of distinct whitelisted data sources that are the sole provider of at least one benchmark in the candidate subset. Higher indicates more sources are load-bearing.
- **`maxSourceShare`**: The maximum proportion of the candidate subset provided exclusively by any single data source ($\max(\text{exclusive benchmarks per source}) / N$, or $0$ when $N = 0$). Lower indicates less concentration in a single source.
- **`deltaVsSourceCompleteBaseline`**: Best unconstrained complete-model count at scale $N$ minus best baseline complete-model count at scale $N$ ($\text{unconstrained} - \text{baseline}$). Evaluated as `null` (N/A) when either curve has no candidate at scale $N$.

> [!NOTE]
> **Search & Pruning Disclosure**: Dynamic programming groups benchmark subsets by model support bitmask and dimension coverage mask, retaining up to $k = 5$ candidate states per $(N, \text{key})$ ordered strictly by complete model count (descending), covered dimension count (descending), exclusive sources count (descending), maximum source share (ascending), and lexicographical benchmark IDs (ascending). The candidates presented at each scale $N$ are the top subsets across retained keys, not an unpruned global exhaustive enumeration across all $2^M$ subsets. Subsets with identical model support and dimension coverage may have different source compositions; DP pruning at intermediate steps retains the top $k$ states per key.

## 1. Tradeoff Curve (Unconstrained)

For each retained benchmark count $N$ from 1 to the active benchmark count, the table below lists up to 5 candidate combinations that maximize the number of complete qualified base models. Deterministic ranking order strictly favors:

1. Complete model count (descending)
2. Covered dimension count (descending)
3. Exclusive sources count (descending)
4. Maximum exclusive source share (ascending)
5. Lexicographical benchmark ID order (ascending)

The chosen benchmark IDs and the complete-model list of every candidate live in the candidate detail sections below; each row links to its own block. Keeping the full 45-item ID lists out of the curve tables is what keeps the curve scannable.

| $N$ | Rank | Complete Models |                                Covered Dimensions                                 | Sources (Span / Excl / MaxShare) | Chosen Benchmarks                                            |
| --: | :--: | --------------: | :-------------------------------------------------------------------------------: | :------------------------------: | ------------------------------------------------------------ |
|   1 |  #1  |          **47** |                            2/8 (reasoning, knowledge)                             |           3 / 0 / 0.0%           | [list + models](#scale-n--1-candidate-1-47-complete-models)  |
|   1 |  #2  |          **41** |                        3/8 (reasoning, knowledge, context)                        |          1 / 1 / 100.0%          | [list + models](#scale-n--1-candidate-2-41-complete-models)  |
|   1 |  #3  |          **41** |                            2/8 (language, instruction)                            |          1 / 1 / 100.0%          | [list + models](#scale-n--1-candidate-3-41-complete-models)  |
|   1 |  #4  |          **41** |                            2/8 (language, instruction)                            |          1 / 1 / 100.0%          | [list + models](#scale-n--1-candidate-4-41-complete-models)  |
|   1 |  #5  |          **41** |                               2/8 (reasoning, math)                               |          1 / 1 / 100.0%          | [list + models](#scale-n--1-candidate-5-41-complete-models)  |
|   2 |  #1  |          **41** |            5/8 (reasoning, knowledge, language, instruction, context)             |          1 / 1 / 100.0%          | [list + models](#scale-n--2-candidate-1-41-complete-models)  |
|   2 |  #2  |          **41** |            5/8 (reasoning, knowledge, language, instruction, context)             |          1 / 1 / 100.0%          | [list + models](#scale-n--2-candidate-2-41-complete-models)  |
|   2 |  #3  |          **41** |                   4/8 (reasoning, math, language, instruction)                    |          1 / 1 / 100.0%          | [list + models](#scale-n--2-candidate-3-41-complete-models)  |
|   2 |  #4  |          **41** |                   4/8 (reasoning, math, language, instruction)                    |          1 / 1 / 100.0%          | [list + models](#scale-n--2-candidate-4-41-complete-models)  |
|   2 |  #5  |          **41** |                     4/8 (reasoning, math, knowledge, context)                     |          1 / 1 / 100.0%          | [list + models](#scale-n--2-candidate-5-41-complete-models)  |
|   3 |  #1  |          **41** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          1 / 1 / 100.0%          | [list + models](#scale-n--3-candidate-1-41-complete-models)  |
|   3 |  #2  |          **41** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          1 / 1 / 100.0%          | [list + models](#scale-n--3-candidate-2-41-complete-models)  |
|   3 |  #3  |          **41** |            5/8 (reasoning, knowledge, language, instruction, context)             |          1 / 1 / 100.0%          | [list + models](#scale-n--3-candidate-3-41-complete-models)  |
|   3 |  #4  |          **41** |                   4/8 (reasoning, math, language, instruction)                    |          1 / 1 / 100.0%          | [list + models](#scale-n--3-candidate-4-41-complete-models)  |
|   3 |  #5  |          **39** |              5/8 (reasoning, math, knowledge, language, instruction)              |          4 / 1 / 66.7%           | [list + models](#scale-n--3-candidate-5-39-complete-models)  |
|   4 |  #1  |          **41** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          1 / 1 / 100.0%          | [list + models](#scale-n--4-candidate-1-41-complete-models)  |
|   4 |  #2  |          **39** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 1 / 75.0%           | [list + models](#scale-n--4-candidate-2-39-complete-models)  |
|   4 |  #3  |          **39** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 1 / 75.0%           | [list + models](#scale-n--4-candidate-3-39-complete-models)  |
|   4 |  #4  |          **39** |              5/8 (reasoning, math, knowledge, language, instruction)              |          4 / 1 / 75.0%           | [list + models](#scale-n--4-candidate-4-39-complete-models)  |
|   4 |  #5  |          **39** |            5/8 (reasoning, knowledge, language, instruction, context)             |          4 / 1 / 75.0%           | [list + models](#scale-n--4-candidate-5-39-complete-models)  |
|   5 |  #1  |          **39** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 1 / 80.0%           | [list + models](#scale-n--5-candidate-1-39-complete-models)  |
|   5 |  #2  |          **34** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 1 / 60.0%           | [list + models](#scale-n--5-candidate-2-34-complete-models)  |
|   5 |  #3  |          **34** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 1 / 60.0%           | [list + models](#scale-n--5-candidate-3-34-complete-models)  |
|   5 |  #4  |          **34** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 80.0%           | [list + models](#scale-n--5-candidate-4-34-complete-models)  |
|   5 |  #5  |          **34** |     7/8 (reasoning, math, knowledge, language, instruction, coding, agentic)      |          4 / 1 / 60.0%           | [list + models](#scale-n--5-candidate-5-34-complete-models)  |
|   6 |  #1  |          **34** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 1 / 66.7%           | [list + models](#scale-n--6-candidate-1-34-complete-models)  |
|   6 |  #2  |          **34** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 2 / 50.0%           | [list + models](#scale-n--6-candidate-2-34-complete-models)  |
|   6 |  #3  |          **34** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 2 / 50.0%           | [list + models](#scale-n--6-candidate-3-34-complete-models)  |
|   6 |  #4  |          **34** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 2 / 50.0%           | [list + models](#scale-n--6-candidate-4-34-complete-models)  |
|   6 |  #5  |          **34** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          2 / 2 / 66.7%           | [list + models](#scale-n--6-candidate-5-34-complete-models)  |
|   7 |  #1  |          **34** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 2 / 57.1%           | [list + models](#scale-n--7-candidate-1-34-complete-models)  |
|   7 |  #2  |          **31** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 2 / 42.9%           | [list + models](#scale-n--7-candidate-2-31-complete-models)  |
|   7 |  #3  |          **31** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 2 / 42.9%           | [list + models](#scale-n--7-candidate-3-31-complete-models)  |
|   7 |  #4  |          **31** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 2 / 42.9%           | [list + models](#scale-n--7-candidate-4-31-complete-models)  |
|   7 |  #5  |          **31** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          2 / 2 / 57.1%           | [list + models](#scale-n--7-candidate-5-31-complete-models)  |
|   8 |  #1  |          **31** |         6/8 (reasoning, math, knowledge, language, instruction, context)          |          4 / 2 / 50.0%           | [list + models](#scale-n--8-candidate-1-31-complete-models)  |
|   8 |  #2  |          **29** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 50.0%           | [list + models](#scale-n--8-candidate-2-29-complete-models)  |
|   8 |  #3  |          **29** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 62.5%           | [list + models](#scale-n--8-candidate-3-29-complete-models)  |
|   8 |  #4  |          **29** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 62.5%           | [list + models](#scale-n--8-candidate-4-29-complete-models)  |
|   8 |  #5  |          **29** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 62.5%           | [list + models](#scale-n--8-candidate-5-29-complete-models)  |
|   9 |  #1  |          **29** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 66.7%           | [list + models](#scale-n--9-candidate-1-29-complete-models)  |
|   9 |  #2  |          **29** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 66.7%           | [list + models](#scale-n--9-candidate-2-29-complete-models)  |
|   9 |  #3  |          **29** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 66.7%           | [list + models](#scale-n--9-candidate-3-29-complete-models)  |
|   9 |  #4  |          **29** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 66.7%           | [list + models](#scale-n--9-candidate-4-29-complete-models)  |
|   9 |  #5  |          **29** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 66.7%           | [list + models](#scale-n--9-candidate-5-29-complete-models)  |
|  10 |  #1  |          **29** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 70.0%           | [list + models](#scale-n--10-candidate-1-29-complete-models) |
|  10 |  #2  |          **28** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 70.0%           | [list + models](#scale-n--10-candidate-2-28-complete-models) |
|  10 |  #3  |          **28** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 70.0%           | [list + models](#scale-n--10-candidate-3-28-complete-models) |
|  10 |  #4  |          **28** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 70.0%           | [list + models](#scale-n--10-candidate-4-28-complete-models) |
|  10 |  #5  |          **28** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 70.0%           | [list + models](#scale-n--10-candidate-5-28-complete-models) |
|  11 |  #1  |          **28** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 72.7%           | [list + models](#scale-n--11-candidate-1-28-complete-models) |
|  11 |  #2  |          **28** |      7/8 (reasoning, math, knowledge, instruction, coding, agentic, context)      |          3 / 1 / 72.7%           | [list + models](#scale-n--11-candidate-2-28-complete-models) |
|  11 |  #3  |          **27** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 72.7%           | [list + models](#scale-n--11-candidate-3-27-complete-models) |
|  11 |  #4  |          **27** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 72.7%           | [list + models](#scale-n--11-candidate-4-27-complete-models) |
|  11 |  #5  |          **27** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 72.7%           | [list + models](#scale-n--11-candidate-5-27-complete-models) |
|  12 |  #1  |          **27** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          3 / 1 / 75.0%           | [list + models](#scale-n--12-candidate-1-27-complete-models) |
|  12 |  #2  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 41.7%           | [list + models](#scale-n--12-candidate-2-26-complete-models) |
|  12 |  #3  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 41.7%           | [list + models](#scale-n--12-candidate-3-26-complete-models) |
|  12 |  #4  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 41.7%           | [list + models](#scale-n--12-candidate-4-26-complete-models) |
|  12 |  #5  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 41.7%           | [list + models](#scale-n--12-candidate-5-26-complete-models) |
|  13 |  #1  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 46.2%           | [list + models](#scale-n--13-candidate-1-26-complete-models) |
|  13 |  #2  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 46.2%           | [list + models](#scale-n--13-candidate-2-26-complete-models) |
|  13 |  #3  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 46.2%           | [list + models](#scale-n--13-candidate-3-26-complete-models) |
|  13 |  #4  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 46.2%           | [list + models](#scale-n--13-candidate-4-26-complete-models) |
|  13 |  #5  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 46.2%           | [list + models](#scale-n--13-candidate-5-26-complete-models) |
|  14 |  #1  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 50.0%           | [list + models](#scale-n--14-candidate-1-26-complete-models) |
|  14 |  #2  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 50.0%           | [list + models](#scale-n--14-candidate-2-26-complete-models) |
|  14 |  #3  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 50.0%           | [list + models](#scale-n--14-candidate-3-26-complete-models) |
|  14 |  #4  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 50.0%           | [list + models](#scale-n--14-candidate-4-26-complete-models) |
|  14 |  #5  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 50.0%           | [list + models](#scale-n--14-candidate-5-26-complete-models) |
|  15 |  #1  |          **26** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 53.3%           | [list + models](#scale-n--15-candidate-1-26-complete-models) |
|  15 |  #2  |          **25** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 53.3%           | [list + models](#scale-n--15-candidate-2-25-complete-models) |
|  15 |  #3  |          **25** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 53.3%           | [list + models](#scale-n--15-candidate-3-25-complete-models) |
|  15 |  #4  |          **25** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 53.3%           | [list + models](#scale-n--15-candidate-4-25-complete-models) |
|  15 |  #5  |          **25** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 53.3%           | [list + models](#scale-n--15-candidate-5-25-complete-models) |
|  16 |  #1  |          **25** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 56.3%           | [list + models](#scale-n--16-candidate-1-25-complete-models) |
|  16 |  #2  |          **24** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 56.3%           | [list + models](#scale-n--16-candidate-2-24-complete-models) |
|  16 |  #3  |          **24** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 56.3%           | [list + models](#scale-n--16-candidate-3-24-complete-models) |
|  16 |  #4  |          **24** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 56.3%           | [list + models](#scale-n--16-candidate-4-24-complete-models) |
|  16 |  #5  |          **24** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 56.3%           | [list + models](#scale-n--16-candidate-5-24-complete-models) |
|  17 |  #1  |          **24** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 58.8%           | [list + models](#scale-n--17-candidate-1-24-complete-models) |
|  17 |  #2  |          **23** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 58.8%           | [list + models](#scale-n--17-candidate-2-23-complete-models) |
|  17 |  #3  |          **23** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 58.8%           | [list + models](#scale-n--17-candidate-3-23-complete-models) |
|  17 |  #4  |          **23** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 58.8%           | [list + models](#scale-n--17-candidate-4-23-complete-models) |
|  17 |  #5  |          **23** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 58.8%           | [list + models](#scale-n--17-candidate-5-23-complete-models) |
|  18 |  #1  |          **23** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 61.1%           | [list + models](#scale-n--18-candidate-1-23-complete-models) |
|  18 |  #2  |          **22** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 61.1%           | [list + models](#scale-n--18-candidate-2-22-complete-models) |
|  18 |  #3  |          **22** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 61.1%           | [list + models](#scale-n--18-candidate-3-22-complete-models) |
|  18 |  #4  |          **21** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 50.0%           | [list + models](#scale-n--18-candidate-4-21-complete-models) |
|  18 |  #5  |          **21** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 50.0%           | [list + models](#scale-n--18-candidate-5-21-complete-models) |
|  19 |  #1  |          **21** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 63.2%           | [list + models](#scale-n--19-candidate-1-21-complete-models) |
|  19 |  #2  |          **21** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 2 / 63.2%           | [list + models](#scale-n--19-candidate-2-21-complete-models) |
|  19 |  #3  |          **20** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 52.6%           | [list + models](#scale-n--19-candidate-3-20-complete-models) |
|  19 |  #4  |          **20** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 52.6%           | [list + models](#scale-n--19-candidate-4-20-complete-models) |
|  19 |  #5  |          **20** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 52.6%           | [list + models](#scale-n--19-candidate-5-20-complete-models) |
|  20 |  #1  |          **20** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 55.0%           | [list + models](#scale-n--20-candidate-1-20-complete-models) |
|  20 |  #2  |          **19** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 55.0%           | [list + models](#scale-n--20-candidate-2-19-complete-models) |
|  20 |  #3  |          **19** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 55.0%           | [list + models](#scale-n--20-candidate-3-19-complete-models) |
|  20 |  #4  |          **19** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 55.0%           | [list + models](#scale-n--20-candidate-4-19-complete-models) |
|  20 |  #5  |          **19** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 55.0%           | [list + models](#scale-n--20-candidate-5-19-complete-models) |
|  21 |  #1  |          **19** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 57.1%           | [list + models](#scale-n--21-candidate-1-19-complete-models) |
|  21 |  #2  |          **19** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 57.1%           | [list + models](#scale-n--21-candidate-2-19-complete-models) |
|  21 |  #3  |          **18** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 52.4%           | [list + models](#scale-n--21-candidate-3-18-complete-models) |
|  21 |  #4  |          **18** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 57.1%           | [list + models](#scale-n--21-candidate-4-18-complete-models) |
|  21 |  #5  |          **18** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 57.1%           | [list + models](#scale-n--21-candidate-5-18-complete-models) |
|  22 |  #1  |          **18** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 59.1%           | [list + models](#scale-n--22-candidate-1-18-complete-models) |
|  22 |  #2  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 54.5%           | [list + models](#scale-n--22-candidate-2-17-complete-models) |
|  22 |  #3  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 54.5%           | [list + models](#scale-n--22-candidate-3-17-complete-models) |
|  22 |  #4  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 54.5%           | [list + models](#scale-n--22-candidate-4-17-complete-models) |
|  22 |  #5  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 59.1%           | [list + models](#scale-n--22-candidate-5-17-complete-models) |
|  23 |  #1  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 39.1%           | [list + models](#scale-n--23-candidate-1-16-complete-models) |
|  23 |  #2  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 39.1%           | [list + models](#scale-n--23-candidate-2-16-complete-models) |
|  23 |  #3  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 39.1%           | [list + models](#scale-n--23-candidate-3-16-complete-models) |
|  23 |  #4  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 39.1%           | [list + models](#scale-n--23-candidate-4-16-complete-models) |
|  23 |  #5  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 39.1%           | [list + models](#scale-n--23-candidate-5-16-complete-models) |
|  24 |  #1  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 41.7%           | [list + models](#scale-n--24-candidate-1-16-complete-models) |
|  24 |  #2  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 41.7%           | [list + models](#scale-n--24-candidate-2-16-complete-models) |
|  24 |  #3  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 41.7%           | [list + models](#scale-n--24-candidate-3-16-complete-models) |
|  24 |  #4  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 41.7%           | [list + models](#scale-n--24-candidate-4-16-complete-models) |
|  24 |  #5  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 41.7%           | [list + models](#scale-n--24-candidate-5-16-complete-models) |
|  25 |  #1  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 3 / 44.0%           | [list + models](#scale-n--25-candidate-1-16-complete-models) |
|  25 |  #2  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 36.0%           | [list + models](#scale-n--25-candidate-2-14-complete-models) |
|  25 |  #3  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 36.0%           | [list + models](#scale-n--25-candidate-3-14-complete-models) |
|  25 |  #4  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 36.0%           | [list + models](#scale-n--25-candidate-4-14-complete-models) |
|  25 |  #5  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 36.0%           | [list + models](#scale-n--25-candidate-5-14-complete-models) |
|  26 |  #1  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 38.5%           | [list + models](#scale-n--26-candidate-1-14-complete-models) |
|  26 |  #2  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 38.5%           | [list + models](#scale-n--26-candidate-2-14-complete-models) |
|  26 |  #3  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 38.5%           | [list + models](#scale-n--26-candidate-3-14-complete-models) |
|  26 |  #4  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 38.5%           | [list + models](#scale-n--26-candidate-4-14-complete-models) |
|  26 |  #5  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 38.5%           | [list + models](#scale-n--26-candidate-5-14-complete-models) |
|  27 |  #1  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 40.7%           | [list + models](#scale-n--27-candidate-1-14-complete-models) |
|  27 |  #2  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 40.7%           | [list + models](#scale-n--27-candidate-2-13-complete-models) |
|  27 |  #3  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 40.7%           | [list + models](#scale-n--27-candidate-3-13-complete-models) |
|  27 |  #4  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 40.7%           | [list + models](#scale-n--27-candidate-4-13-complete-models) |
|  27 |  #5  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 40.7%           | [list + models](#scale-n--27-candidate-5-13-complete-models) |
|  28 |  #1  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 42.9%           | [list + models](#scale-n--28-candidate-1-13-complete-models) |
|  28 |  #2  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 42.9%           | [list + models](#scale-n--28-candidate-2-13-complete-models) |
|  28 |  #3  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 42.9%           | [list + models](#scale-n--28-candidate-3-13-complete-models) |
|  28 |  #4  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 35.7%           | [list + models](#scale-n--28-candidate-4-12-complete-models) |
|  28 |  #5  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 35.7%           | [list + models](#scale-n--28-candidate-5-12-complete-models) |
|  29 |  #1  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 37.9%           | [list + models](#scale-n--29-candidate-1-12-complete-models) |
|  29 |  #2  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 37.9%           | [list + models](#scale-n--29-candidate-2-12-complete-models) |
|  29 |  #3  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 37.9%           | [list + models](#scale-n--29-candidate-3-12-complete-models) |
|  29 |  #4  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 37.9%           | [list + models](#scale-n--29-candidate-4-12-complete-models) |
|  29 |  #5  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 37.9%           | [list + models](#scale-n--29-candidate-5-12-complete-models) |
|  30 |  #1  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 40.0%           | [list + models](#scale-n--30-candidate-1-12-complete-models) |
|  30 |  #2  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 40.0%           | [list + models](#scale-n--30-candidate-2-11-complete-models) |
|  30 |  #3  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 40.0%           | [list + models](#scale-n--30-candidate-3-11-complete-models) |
|  30 |  #4  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 40.0%           | [list + models](#scale-n--30-candidate-4-11-complete-models) |
|  30 |  #5  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 40.0%           | [list + models](#scale-n--30-candidate-5-11-complete-models) |
|  31 |  #1  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 41.9%           | [list + models](#scale-n--31-candidate-1-11-complete-models) |
|  31 |  #2  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 41.9%           | [list + models](#scale-n--31-candidate-2-11-complete-models) |
|  31 |  #3  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 38.7%           | [list + models](#scale-n--31-candidate-3-10-complete-models) |
|  31 |  #4  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 41.9%           | [list + models](#scale-n--31-candidate-4-10-complete-models) |
|  31 |  #5  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 41.9%           | [list + models](#scale-n--31-candidate-5-10-complete-models) |
|  32 |  #1  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 43.8%           | [list + models](#scale-n--32-candidate-1-10-complete-models) |
|  32 |  #2  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 43.8%           | [list + models](#scale-n--32-candidate-2-10-complete-models) |
|  32 |  #3  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 37.5%           | [list + models](#scale-n--32-candidate-3-9-complete-models)  |
|  32 |  #4  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 40.6%           | [list + models](#scale-n--32-candidate-4-9-complete-models)  |
|  32 |  #5  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 40.6%           | [list + models](#scale-n--32-candidate-5-9-complete-models)  |
|  33 |  #1  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 45.5%           | [list + models](#scale-n--33-candidate-1-9-complete-models)  |
|  33 |  #2  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 45.5%           | [list + models](#scale-n--33-candidate-2-9-complete-models)  |
|  33 |  #3  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 39.4%           | [list + models](#scale-n--33-candidate-3-8-complete-models)  |
|  33 |  #4  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 39.4%           | [list + models](#scale-n--33-candidate-4-8-complete-models)  |
|  33 |  #5  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 42.4%           | [list + models](#scale-n--33-candidate-5-8-complete-models)  |
|  34 |  #1  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          5 / 5 / 47.1%           | [list + models](#scale-n--34-candidate-1-8-complete-models)  |
|  34 |  #2  |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.2%           | [list + models](#scale-n--34-candidate-2-7-complete-models)  |
|  34 |  #3  |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.2%           | [list + models](#scale-n--34-candidate-3-7-complete-models)  |
|  34 |  #4  |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 44.1%           | [list + models](#scale-n--34-candidate-4-7-complete-models)  |
|  34 |  #5  |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 44.1%           | [list + models](#scale-n--34-candidate-5-7-complete-models)  |
|  35 |  #1  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#scale-n--35-candidate-1-6-complete-models)  |
|  35 |  #2  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#scale-n--35-candidate-2-6-complete-models)  |
|  35 |  #3  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#scale-n--35-candidate-3-6-complete-models)  |
|  35 |  #4  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#scale-n--35-candidate-4-6-complete-models)  |
|  35 |  #5  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#scale-n--35-candidate-5-6-complete-models)  |
|  36 |  #1  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#scale-n--36-candidate-1-6-complete-models)  |
|  36 |  #2  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#scale-n--36-candidate-2-5-complete-models)  |
|  36 |  #3  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#scale-n--36-candidate-3-5-complete-models)  |
|  36 |  #4  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#scale-n--36-candidate-4-5-complete-models)  |
|  36 |  #5  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#scale-n--36-candidate-5-5-complete-models)  |
|  37 |  #1  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#scale-n--37-candidate-1-5-complete-models)  |
|  37 |  #2  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#scale-n--37-candidate-2-5-complete-models)  |
|  37 |  #3  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#scale-n--37-candidate-3-4-complete-models)  |
|  37 |  #4  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#scale-n--37-candidate-4-4-complete-models)  |
|  37 |  #5  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#scale-n--37-candidate-5-4-complete-models)  |
|  38 |  #1  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.4%           | [list + models](#scale-n--38-candidate-1-4-complete-models)  |
|  38 |  #2  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.4%           | [list + models](#scale-n--38-candidate-2-4-complete-models)  |
|  38 |  #3  |           **3** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.7%           | [list + models](#scale-n--38-candidate-3-3-complete-models)  |
|  38 |  #4  |           **3** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.7%           | [list + models](#scale-n--38-candidate-4-3-complete-models)  |
|  38 |  #5  |           **3** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.7%           | [list + models](#scale-n--38-candidate-5-3-complete-models)  |
|  39 |  #1  |           **3** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 48.7%           | [list + models](#scale-n--39-candidate-1-3-complete-models)  |
|  39 |  #2  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.6%           | [list + models](#scale-n--39-candidate-2-2-complete-models)  |
|  39 |  #3  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.6%           | [list + models](#scale-n--39-candidate-3-2-complete-models)  |
|  39 |  #4  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.2%           | [list + models](#scale-n--39-candidate-4-2-complete-models)  |
|  39 |  #5  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.2%           | [list + models](#scale-n--39-candidate-5-2-complete-models)  |
|  40 |  #1  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#scale-n--40-candidate-1-2-complete-models)  |
|  40 |  #2  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#scale-n--40-candidate-2-2-complete-models)  |
|  40 |  #3  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#scale-n--40-candidate-3-2-complete-models)  |
|  40 |  #4  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#scale-n--40-candidate-4-2-complete-models)  |
|  40 |  #5  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#scale-n--40-candidate-5-2-complete-models)  |
|  41 |  #1  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 48.8%           | [list + models](#scale-n--41-candidate-1-2-complete-models)  |
|  41 |  #2  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.3%           | [list + models](#scale-n--41-candidate-2-1-complete-models)  |
|  41 |  #3  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.3%           | [list + models](#scale-n--41-candidate-3-1-complete-models)  |
|  41 |  #4  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.3%           | [list + models](#scale-n--41-candidate-4-1-complete-models)  |
|  41 |  #5  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.3%           | [list + models](#scale-n--41-candidate-5-1-complete-models)  |
|  42 |  #1  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.6%           | [list + models](#scale-n--42-candidate-1-1-complete-models)  |
|  42 |  #2  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 40.5%           | [list + models](#scale-n--42-candidate-2-0-complete-models)  |
|  42 |  #3  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 40.5%           | [list + models](#scale-n--42-candidate-3-0-complete-models)  |
|  42 |  #4  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 40.5%           | [list + models](#scale-n--42-candidate-4-0-complete-models)  |
|  42 |  #5  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 40.5%           | [list + models](#scale-n--42-candidate-5-0-complete-models)  |
|  43 |  #1  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#scale-n--43-candidate-1-0-complete-models)  |
|  43 |  #2  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#scale-n--43-candidate-2-0-complete-models)  |
|  43 |  #3  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#scale-n--43-candidate-3-0-complete-models)  |
|  43 |  #4  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#scale-n--43-candidate-4-0-complete-models)  |
|  43 |  #5  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#scale-n--43-candidate-5-0-complete-models)  |
|  44 |  #1  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#scale-n--44-candidate-1-0-complete-models)  |
|  44 |  #2  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#scale-n--44-candidate-2-0-complete-models)  |
|  44 |  #3  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#scale-n--44-candidate-3-0-complete-models)  |
|  44 |  #4  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#scale-n--44-candidate-4-0-complete-models)  |
|  44 |  #5  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#scale-n--44-candidate-5-0-complete-models)  |
|  45 |  #1  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#scale-n--45-candidate-1-0-complete-models)  |

## 2. Curve Comparison (Unconstrained vs. Baseline)

Comparison of the best complete-model count at each scale $N$ between the unconstrained curve and the source-complete baseline curve (`deepswe-1-1`, `frontier-code-1-1`).
`deltaVsSourceCompleteBaseline` is defined as best unconstrained complete-model count at this $N$ minus best baseline complete-model count at this $N$. This report states the difference and never labels it large or small; that judgement belongs to the review gate.

| $N$ | Unconstrained Complete Models | Baseline Complete Models | $\Delta$ vs. Baseline |
| --: | ----------------------------: | -----------------------: | --------------------: |
|   1 |                        **47** |                        — |                     — |
|   2 |                        **41** |                   **17** |                   +24 |
|   3 |                        **41** |                   **17** |                   +24 |
|   4 |                        **41** |                   **17** |                   +24 |
|   5 |                        **39** |                   **17** |                   +22 |
|   6 |                        **34** |                   **17** |                   +17 |
|   7 |                        **34** |                   **17** |                   +17 |
|   8 |                        **31** |                   **17** |                   +14 |
|   9 |                        **29** |                   **17** |                   +12 |
|  10 |                        **29** |                   **17** |                   +12 |
|  11 |                        **28** |                   **17** |                   +11 |
|  12 |                        **27** |                   **16** |                   +11 |
|  13 |                        **26** |                   **14** |                   +12 |
|  14 |                        **26** |                   **14** |                   +12 |
|  15 |                        **26** |                   **14** |                   +12 |
|  16 |                        **25** |                   **14** |                   +11 |
|  17 |                        **24** |                   **14** |                   +10 |
|  18 |                        **23** |                   **14** |                    +9 |
|  19 |                        **21** |                   **13** |                    +8 |
|  20 |                        **20** |                   **13** |                    +7 |
|  21 |                        **19** |                   **13** |                    +6 |
|  22 |                        **18** |                   **13** |                    +5 |
|  23 |                        **16** |                   **12** |                    +4 |
|  24 |                        **16** |                   **12** |                    +4 |
|  25 |                        **16** |                   **11** |                    +5 |
|  26 |                        **14** |                   **10** |                    +4 |
|  27 |                        **14** |                   **10** |                    +4 |
|  28 |                        **13** |                   **10** |                    +3 |
|  29 |                        **12** |                   **10** |                    +2 |
|  30 |                        **12** |                   **10** |                    +2 |
|  31 |                        **11** |                   **10** |                    +1 |
|  32 |                        **10** |                    **9** |                    +1 |
|  33 |                         **9** |                    **8** |                    +1 |
|  34 |                         **8** |                    **7** |                    +1 |
|  35 |                         **6** |                    **6** |                     0 |
|  36 |                         **6** |                    **6** |                     0 |
|  37 |                         **5** |                    **5** |                     0 |
|  38 |                         **4** |                    **4** |                     0 |
|  39 |                         **3** |                    **3** |                     0 |
|  40 |                         **2** |                    **2** |                     0 |
|  41 |                         **2** |                    **2** |                     0 |
|  42 |                         **1** |                    **1** |                     0 |
|  43 |                         **0** |                    **0** |                     0 |
|  44 |                         **0** |                    **0** |                     0 |
|  45 |                         **0** |                    **0** |                     0 |

## 3. Baseline Tradeoff Curve (`deepswe-1-1`, `frontier-code-1-1`)

For each retained benchmark count $N$ from 2 to the active benchmark count, the table below lists up to 5 candidate combinations subject to the required benchmarks baseline.

| $N$ | Rank | Complete Models |                                Covered Dimensions                                 | Sources (Span / Excl / MaxShare) | Chosen Benchmarks                                                     |
| --: | :--: | --------------: | :-------------------------------------------------------------------------------: | :------------------------------: | --------------------------------------------------------------------- |
|   2 |  #1  |          **17** |                          3/8 (coding, agentic, context)                           |          2 / 2 / 50.0%           | [list + models](#baseline-scale-n--2-candidate-1-17-complete-models)  |
|   3 |  #1  |          **17** |                  5/8 (reasoning, math, coding, agentic, context)                  |          3 / 3 / 33.3%           | [list + models](#baseline-scale-n--3-candidate-1-17-complete-models)  |
|   3 |  #2  |          **17** |               5/8 (reasoning, knowledge, coding, agentic, context)                |          3 / 3 / 33.3%           | [list + models](#baseline-scale-n--3-candidate-2-17-complete-models)  |
|   3 |  #3  |          **17** |               5/8 (language, instruction, coding, agentic, context)               |          3 / 3 / 33.3%           | [list + models](#baseline-scale-n--3-candidate-3-17-complete-models)  |
|   3 |  #4  |          **17** |               5/8 (language, instruction, coding, agentic, context)               |          3 / 3 / 33.3%           | [list + models](#baseline-scale-n--3-candidate-4-17-complete-models)  |
|   3 |  #5  |          **17** |                  5/8 (reasoning, math, coding, agentic, context)                  |          3 / 3 / 33.3%           | [list + models](#baseline-scale-n--3-candidate-5-17-complete-models)  |
|   4 |  #1  |          **17** |      7/8 (reasoning, math, language, instruction, coding, agentic, context)       |          4 / 4 / 25.0%           | [list + models](#baseline-scale-n--4-candidate-1-17-complete-models)  |
|   4 |  #2  |          **17** |      7/8 (reasoning, math, language, instruction, coding, agentic, context)       |          4 / 4 / 25.0%           | [list + models](#baseline-scale-n--4-candidate-2-17-complete-models)  |
|   4 |  #3  |          **17** |    7/8 (reasoning, knowledge, language, instruction, coding, agentic, context)    |          4 / 4 / 25.0%           | [list + models](#baseline-scale-n--4-candidate-3-17-complete-models)  |
|   4 |  #4  |          **17** |    7/8 (reasoning, knowledge, language, instruction, coding, agentic, context)    |          4 / 4 / 25.0%           | [list + models](#baseline-scale-n--4-candidate-4-17-complete-models)  |
|   4 |  #5  |          **17** |       7/8 (reasoning, math, knowledge, language, coding, agentic, context)        |          4 / 4 / 25.0%           | [list + models](#baseline-scale-n--4-candidate-5-17-complete-models)  |
|   5 |  #1  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 20.0%           | [list + models](#baseline-scale-n--5-candidate-1-17-complete-models)  |
|   5 |  #2  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 20.0%           | [list + models](#baseline-scale-n--5-candidate-2-17-complete-models)  |
|   5 |  #3  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 40.0%           | [list + models](#baseline-scale-n--5-candidate-3-17-complete-models)  |
|   5 |  #4  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 40.0%           | [list + models](#baseline-scale-n--5-candidate-4-17-complete-models)  |
|   5 |  #5  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 40.0%           | [list + models](#baseline-scale-n--5-candidate-5-17-complete-models)  |
|   6 |  #1  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 16.7%           | [list + models](#baseline-scale-n--6-candidate-1-17-complete-models)  |
|   6 |  #2  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 16.7%           | [list + models](#baseline-scale-n--6-candidate-2-17-complete-models)  |
|   6 |  #3  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 33.3%           | [list + models](#baseline-scale-n--6-candidate-3-17-complete-models)  |
|   6 |  #4  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 33.3%           | [list + models](#baseline-scale-n--6-candidate-4-17-complete-models)  |
|   6 |  #5  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          4 / 4 / 33.3%           | [list + models](#baseline-scale-n--6-candidate-5-17-complete-models)  |
|   7 |  #1  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 28.6%           | [list + models](#baseline-scale-n--7-candidate-1-17-complete-models)  |
|   7 |  #2  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 28.6%           | [list + models](#baseline-scale-n--7-candidate-2-17-complete-models)  |
|   7 |  #3  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 28.6%           | [list + models](#baseline-scale-n--7-candidate-3-17-complete-models)  |
|   7 |  #4  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 28.6%           | [list + models](#baseline-scale-n--7-candidate-4-17-complete-models)  |
|   7 |  #5  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 28.6%           | [list + models](#baseline-scale-n--7-candidate-5-17-complete-models)  |
|   8 |  #1  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 25.0%           | [list + models](#baseline-scale-n--8-candidate-1-17-complete-models)  |
|   8 |  #2  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 25.0%           | [list + models](#baseline-scale-n--8-candidate-2-17-complete-models)  |
|   8 |  #3  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 25.0%           | [list + models](#baseline-scale-n--8-candidate-3-17-complete-models)  |
|   8 |  #4  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 25.0%           | [list + models](#baseline-scale-n--8-candidate-4-17-complete-models)  |
|   8 |  #5  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 25.0%           | [list + models](#baseline-scale-n--8-candidate-5-17-complete-models)  |
|   9 |  #1  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 33.3%           | [list + models](#baseline-scale-n--9-candidate-1-17-complete-models)  |
|   9 |  #2  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 33.3%           | [list + models](#baseline-scale-n--9-candidate-2-17-complete-models)  |
|   9 |  #3  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 33.3%           | [list + models](#baseline-scale-n--9-candidate-3-17-complete-models)  |
|   9 |  #4  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 33.3%           | [list + models](#baseline-scale-n--9-candidate-4-17-complete-models)  |
|   9 |  #5  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 33.3%           | [list + models](#baseline-scale-n--9-candidate-5-17-complete-models)  |
|  10 |  #1  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 30.0%           | [list + models](#baseline-scale-n--10-candidate-1-17-complete-models) |
|  10 |  #2  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 30.0%           | [list + models](#baseline-scale-n--10-candidate-2-17-complete-models) |
|  10 |  #3  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 30.0%           | [list + models](#baseline-scale-n--10-candidate-3-17-complete-models) |
|  10 |  #4  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 30.0%           | [list + models](#baseline-scale-n--10-candidate-4-17-complete-models) |
|  10 |  #5  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 40.0%           | [list + models](#baseline-scale-n--10-candidate-5-17-complete-models) |
|  11 |  #1  |          **17** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 4 / 36.4%           | [list + models](#baseline-scale-n--11-candidate-1-17-complete-models) |
|  11 |  #2  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 5 / 27.3%           | [list + models](#baseline-scale-n--11-candidate-2-16-complete-models) |
|  11 |  #3  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 5 / 27.3%           | [list + models](#baseline-scale-n--11-candidate-3-16-complete-models) |
|  11 |  #4  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 5 / 27.3%           | [list + models](#baseline-scale-n--11-candidate-4-16-complete-models) |
|  11 |  #5  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 5 / 27.3%           | [list + models](#baseline-scale-n--11-candidate-5-16-complete-models) |
|  12 |  #1  |          **16** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 5 / 33.3%           | [list + models](#baseline-scale-n--12-candidate-1-16-complete-models) |
|  12 |  #2  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 25.0%           | [list + models](#baseline-scale-n--12-candidate-2-14-complete-models) |
|  12 |  #3  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 25.0%           | [list + models](#baseline-scale-n--12-candidate-3-14-complete-models) |
|  12 |  #4  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 25.0%           | [list + models](#baseline-scale-n--12-candidate-4-14-complete-models) |
|  12 |  #5  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 25.0%           | [list + models](#baseline-scale-n--12-candidate-5-14-complete-models) |
|  13 |  #1  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 23.1%           | [list + models](#baseline-scale-n--13-candidate-1-14-complete-models) |
|  13 |  #2  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 23.1%           | [list + models](#baseline-scale-n--13-candidate-2-14-complete-models) |
|  13 |  #3  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 23.1%           | [list + models](#baseline-scale-n--13-candidate-3-14-complete-models) |
|  13 |  #4  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 23.1%           | [list + models](#baseline-scale-n--13-candidate-4-14-complete-models) |
|  13 |  #5  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 23.1%           | [list + models](#baseline-scale-n--13-candidate-5-14-complete-models) |
|  14 |  #1  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 28.6%           | [list + models](#baseline-scale-n--14-candidate-1-14-complete-models) |
|  14 |  #2  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 28.6%           | [list + models](#baseline-scale-n--14-candidate-2-14-complete-models) |
|  14 |  #3  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 28.6%           | [list + models](#baseline-scale-n--14-candidate-3-14-complete-models) |
|  14 |  #4  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 28.6%           | [list + models](#baseline-scale-n--14-candidate-4-14-complete-models) |
|  14 |  #5  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 28.6%           | [list + models](#baseline-scale-n--14-candidate-5-14-complete-models) |
|  15 |  #1  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 26.7%           | [list + models](#baseline-scale-n--15-candidate-1-14-complete-models) |
|  15 |  #2  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 26.7%           | [list + models](#baseline-scale-n--15-candidate-2-14-complete-models) |
|  15 |  #3  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 26.7%           | [list + models](#baseline-scale-n--15-candidate-3-14-complete-models) |
|  15 |  #4  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 26.7%           | [list + models](#baseline-scale-n--15-candidate-4-14-complete-models) |
|  15 |  #5  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 26.7%           | [list + models](#baseline-scale-n--15-candidate-5-14-complete-models) |
|  16 |  #1  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 31.3%           | [list + models](#baseline-scale-n--16-candidate-1-14-complete-models) |
|  16 |  #2  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 31.3%           | [list + models](#baseline-scale-n--16-candidate-2-14-complete-models) |
|  16 |  #3  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 31.3%           | [list + models](#baseline-scale-n--16-candidate-3-14-complete-models) |
|  16 |  #4  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 31.3%           | [list + models](#baseline-scale-n--16-candidate-4-14-complete-models) |
|  16 |  #5  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 31.3%           | [list + models](#baseline-scale-n--16-candidate-5-14-complete-models) |
|  17 |  #1  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 35.3%           | [list + models](#baseline-scale-n--17-candidate-1-14-complete-models) |
|  17 |  #2  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 35.3%           | [list + models](#baseline-scale-n--17-candidate-2-14-complete-models) |
|  17 |  #3  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 35.3%           | [list + models](#baseline-scale-n--17-candidate-3-14-complete-models) |
|  17 |  #4  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 35.3%           | [list + models](#baseline-scale-n--17-candidate-4-14-complete-models) |
|  17 |  #5  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 35.3%           | [list + models](#baseline-scale-n--17-candidate-5-14-complete-models) |
|  18 |  #1  |          **14** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 38.9%           | [list + models](#baseline-scale-n--18-candidate-1-14-complete-models) |
|  18 |  #2  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 33.3%           | [list + models](#baseline-scale-n--18-candidate-2-13-complete-models) |
|  18 |  #3  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 33.3%           | [list + models](#baseline-scale-n--18-candidate-3-13-complete-models) |
|  18 |  #4  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 33.3%           | [list + models](#baseline-scale-n--18-candidate-4-13-complete-models) |
|  18 |  #5  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 33.3%           | [list + models](#baseline-scale-n--18-candidate-5-13-complete-models) |
|  19 |  #1  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 36.8%           | [list + models](#baseline-scale-n--19-candidate-1-13-complete-models) |
|  19 |  #2  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 36.8%           | [list + models](#baseline-scale-n--19-candidate-2-13-complete-models) |
|  19 |  #3  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 36.8%           | [list + models](#baseline-scale-n--19-candidate-3-13-complete-models) |
|  19 |  #4  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 36.8%           | [list + models](#baseline-scale-n--19-candidate-4-13-complete-models) |
|  19 |  #5  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 36.8%           | [list + models](#baseline-scale-n--19-candidate-5-13-complete-models) |
|  20 |  #1  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 40.0%           | [list + models](#baseline-scale-n--20-candidate-1-13-complete-models) |
|  20 |  #2  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 40.0%           | [list + models](#baseline-scale-n--20-candidate-2-13-complete-models) |
|  20 |  #3  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 40.0%           | [list + models](#baseline-scale-n--20-candidate-3-13-complete-models) |
|  20 |  #4  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 40.0%           | [list + models](#baseline-scale-n--20-candidate-4-13-complete-models) |
|  20 |  #5  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 40.0%           | [list + models](#baseline-scale-n--20-candidate-5-13-complete-models) |
|  21 |  #1  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 42.9%           | [list + models](#baseline-scale-n--21-candidate-1-13-complete-models) |
|  21 |  #2  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 42.9%           | [list + models](#baseline-scale-n--21-candidate-2-13-complete-models) |
|  21 |  #3  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 42.9%           | [list + models](#baseline-scale-n--21-candidate-3-13-complete-models) |
|  21 |  #4  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 42.9%           | [list + models](#baseline-scale-n--21-candidate-4-13-complete-models) |
|  21 |  #5  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 42.9%           | [list + models](#baseline-scale-n--21-candidate-5-13-complete-models) |
|  22 |  #1  |          **13** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 45.5%           | [list + models](#baseline-scale-n--22-candidate-1-13-complete-models) |
|  22 |  #2  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 40.9%           | [list + models](#baseline-scale-n--22-candidate-2-12-complete-models) |
|  22 |  #3  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 40.9%           | [list + models](#baseline-scale-n--22-candidate-3-12-complete-models) |
|  22 |  #4  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 40.9%           | [list + models](#baseline-scale-n--22-candidate-4-12-complete-models) |
|  22 |  #5  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 40.9%           | [list + models](#baseline-scale-n--22-candidate-5-12-complete-models) |
|  23 |  #1  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 43.5%           | [list + models](#baseline-scale-n--23-candidate-1-12-complete-models) |
|  23 |  #2  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 47.8%           | [list + models](#baseline-scale-n--23-candidate-2-12-complete-models) |
|  23 |  #3  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 47.8%           | [list + models](#baseline-scale-n--23-candidate-3-12-complete-models) |
|  23 |  #4  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 47.8%           | [list + models](#baseline-scale-n--23-candidate-4-12-complete-models) |
|  23 |  #5  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 47.8%           | [list + models](#baseline-scale-n--23-candidate-5-12-complete-models) |
|  24 |  #1  |          **12** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 50.0%           | [list + models](#baseline-scale-n--24-candidate-1-12-complete-models) |
|  24 |  #2  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 45.8%           | [list + models](#baseline-scale-n--24-candidate-2-11-complete-models) |
|  24 |  #3  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 45.8%           | [list + models](#baseline-scale-n--24-candidate-3-11-complete-models) |
|  24 |  #4  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 45.8%           | [list + models](#baseline-scale-n--24-candidate-4-11-complete-models) |
|  24 |  #5  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 45.8%           | [list + models](#baseline-scale-n--24-candidate-5-11-complete-models) |
|  25 |  #1  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 6 / 48.0%           | [list + models](#baseline-scale-n--25-candidate-1-11-complete-models) |
|  25 |  #2  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 52.0%           | [list + models](#baseline-scale-n--25-candidate-2-11-complete-models) |
|  25 |  #3  |          **11** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 5 / 52.0%           | [list + models](#baseline-scale-n--25-candidate-3-11-complete-models) |
|  25 |  #4  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 28.0%           | [list + models](#baseline-scale-n--25-candidate-4-10-complete-models) |
|  25 |  #5  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 28.0%           | [list + models](#baseline-scale-n--25-candidate-5-10-complete-models) |
|  26 |  #1  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 26.9%           | [list + models](#baseline-scale-n--26-candidate-1-10-complete-models) |
|  26 |  #2  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 26.9%           | [list + models](#baseline-scale-n--26-candidate-2-10-complete-models) |
|  26 |  #3  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 26.9%           | [list + models](#baseline-scale-n--26-candidate-3-10-complete-models) |
|  26 |  #4  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 26.9%           | [list + models](#baseline-scale-n--26-candidate-4-10-complete-models) |
|  26 |  #5  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 26.9%           | [list + models](#baseline-scale-n--26-candidate-5-10-complete-models) |
|  27 |  #1  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 29.6%           | [list + models](#baseline-scale-n--27-candidate-1-10-complete-models) |
|  27 |  #2  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 29.6%           | [list + models](#baseline-scale-n--27-candidate-2-10-complete-models) |
|  27 |  #3  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 29.6%           | [list + models](#baseline-scale-n--27-candidate-3-10-complete-models) |
|  27 |  #4  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 29.6%           | [list + models](#baseline-scale-n--27-candidate-4-10-complete-models) |
|  27 |  #5  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 29.6%           | [list + models](#baseline-scale-n--27-candidate-5-10-complete-models) |
|  28 |  #1  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 32.1%           | [list + models](#baseline-scale-n--28-candidate-1-10-complete-models) |
|  28 |  #2  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 32.1%           | [list + models](#baseline-scale-n--28-candidate-2-10-complete-models) |
|  28 |  #3  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 32.1%           | [list + models](#baseline-scale-n--28-candidate-3-10-complete-models) |
|  28 |  #4  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 32.1%           | [list + models](#baseline-scale-n--28-candidate-4-10-complete-models) |
|  28 |  #5  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 32.1%           | [list + models](#baseline-scale-n--28-candidate-5-10-complete-models) |
|  29 |  #1  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 34.5%           | [list + models](#baseline-scale-n--29-candidate-1-10-complete-models) |
|  29 |  #2  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 34.5%           | [list + models](#baseline-scale-n--29-candidate-2-10-complete-models) |
|  29 |  #3  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 34.5%           | [list + models](#baseline-scale-n--29-candidate-3-10-complete-models) |
|  29 |  #4  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 34.5%           | [list + models](#baseline-scale-n--29-candidate-4-10-complete-models) |
|  29 |  #5  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 34.5%           | [list + models](#baseline-scale-n--29-candidate-5-10-complete-models) |
|  30 |  #1  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 36.7%           | [list + models](#baseline-scale-n--30-candidate-1-10-complete-models) |
|  30 |  #2  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 36.7%           | [list + models](#baseline-scale-n--30-candidate-2-10-complete-models) |
|  30 |  #3  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 36.7%           | [list + models](#baseline-scale-n--30-candidate-3-10-complete-models) |
|  30 |  #4  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 36.7%           | [list + models](#baseline-scale-n--30-candidate-4-10-complete-models) |
|  30 |  #5  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 36.7%           | [list + models](#baseline-scale-n--30-candidate-5-10-complete-models) |
|  31 |  #1  |          **10** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 38.7%           | [list + models](#baseline-scale-n--31-candidate-1-10-complete-models) |
|  31 |  #2  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 35.5%           | [list + models](#baseline-scale-n--31-candidate-2-9-complete-models)  |
|  31 |  #3  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 35.5%           | [list + models](#baseline-scale-n--31-candidate-3-9-complete-models)  |
|  31 |  #4  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 35.5%           | [list + models](#baseline-scale-n--31-candidate-4-9-complete-models)  |
|  31 |  #5  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 35.5%           | [list + models](#baseline-scale-n--31-candidate-5-9-complete-models)  |
|  32 |  #1  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 37.5%           | [list + models](#baseline-scale-n--32-candidate-1-9-complete-models)  |
|  32 |  #2  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 40.6%           | [list + models](#baseline-scale-n--32-candidate-2-9-complete-models)  |
|  32 |  #3  |           **9** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 40.6%           | [list + models](#baseline-scale-n--32-candidate-3-9-complete-models)  |
|  32 |  #4  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 37.5%           | [list + models](#baseline-scale-n--32-candidate-4-8-complete-models)  |
|  32 |  #5  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 37.5%           | [list + models](#baseline-scale-n--32-candidate-5-8-complete-models)  |
|  33 |  #1  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 39.4%           | [list + models](#baseline-scale-n--33-candidate-1-8-complete-models)  |
|  33 |  #2  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 39.4%           | [list + models](#baseline-scale-n--33-candidate-2-8-complete-models)  |
|  33 |  #3  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 42.4%           | [list + models](#baseline-scale-n--33-candidate-3-8-complete-models)  |
|  33 |  #4  |           **8** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 42.4%           | [list + models](#baseline-scale-n--33-candidate-4-8-complete-models)  |
|  33 |  #5  |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 39.4%           | [list + models](#baseline-scale-n--33-candidate-5-7-complete-models)  |
|  34 |  #1  |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.2%           | [list + models](#baseline-scale-n--34-candidate-1-7-complete-models)  |
|  34 |  #2  |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.2%           | [list + models](#baseline-scale-n--34-candidate-2-7-complete-models)  |
|  34 |  #3  |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 44.1%           | [list + models](#baseline-scale-n--34-candidate-3-7-complete-models)  |
|  34 |  #4  |           **7** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          6 / 6 / 44.1%           | [list + models](#baseline-scale-n--34-candidate-4-7-complete-models)  |
|  34 |  #5  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 38.2%           | [list + models](#baseline-scale-n--34-candidate-5-6-complete-models)  |
|  35 |  #1  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#baseline-scale-n--35-candidate-1-6-complete-models)  |
|  35 |  #2  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#baseline-scale-n--35-candidate-2-6-complete-models)  |
|  35 |  #3  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#baseline-scale-n--35-candidate-3-6-complete-models)  |
|  35 |  #4  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#baseline-scale-n--35-candidate-4-6-complete-models)  |
|  35 |  #5  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 42.9%           | [list + models](#baseline-scale-n--35-candidate-5-6-complete-models)  |
|  36 |  #1  |           **6** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#baseline-scale-n--36-candidate-1-6-complete-models)  |
|  36 |  #2  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#baseline-scale-n--36-candidate-2-5-complete-models)  |
|  36 |  #3  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#baseline-scale-n--36-candidate-3-5-complete-models)  |
|  36 |  #4  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#baseline-scale-n--36-candidate-4-5-complete-models)  |
|  36 |  #5  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#baseline-scale-n--36-candidate-5-5-complete-models)  |
|  37 |  #1  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#baseline-scale-n--37-candidate-1-5-complete-models)  |
|  37 |  #2  |           **5** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#baseline-scale-n--37-candidate-2-5-complete-models)  |
|  37 |  #3  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#baseline-scale-n--37-candidate-3-4-complete-models)  |
|  37 |  #4  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#baseline-scale-n--37-candidate-4-4-complete-models)  |
|  37 |  #5  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 45.9%           | [list + models](#baseline-scale-n--37-candidate-5-4-complete-models)  |
|  38 |  #1  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.4%           | [list + models](#baseline-scale-n--38-candidate-1-4-complete-models)  |
|  38 |  #2  |           **4** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.4%           | [list + models](#baseline-scale-n--38-candidate-2-4-complete-models)  |
|  38 |  #3  |           **3** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.7%           | [list + models](#baseline-scale-n--38-candidate-3-3-complete-models)  |
|  38 |  #4  |           **3** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.7%           | [list + models](#baseline-scale-n--38-candidate-4-3-complete-models)  |
|  38 |  #5  |           **3** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.7%           | [list + models](#baseline-scale-n--38-candidate-5-3-complete-models)  |
|  39 |  #1  |           **3** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 48.7%           | [list + models](#baseline-scale-n--39-candidate-1-3-complete-models)  |
|  39 |  #2  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.6%           | [list + models](#baseline-scale-n--39-candidate-2-2-complete-models)  |
|  39 |  #3  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.6%           | [list + models](#baseline-scale-n--39-candidate-3-2-complete-models)  |
|  39 |  #4  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.2%           | [list + models](#baseline-scale-n--39-candidate-4-2-complete-models)  |
|  39 |  #5  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.2%           | [list + models](#baseline-scale-n--39-candidate-5-2-complete-models)  |
|  40 |  #1  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#baseline-scale-n--40-candidate-1-2-complete-models)  |
|  40 |  #2  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#baseline-scale-n--40-candidate-2-2-complete-models)  |
|  40 |  #3  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#baseline-scale-n--40-candidate-3-2-complete-models)  |
|  40 |  #4  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#baseline-scale-n--40-candidate-4-2-complete-models)  |
|  40 |  #5  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.5%           | [list + models](#baseline-scale-n--40-candidate-5-2-complete-models)  |
|  41 |  #1  |           **2** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 48.8%           | [list + models](#baseline-scale-n--41-candidate-1-2-complete-models)  |
|  41 |  #2  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.3%           | [list + models](#baseline-scale-n--41-candidate-2-1-complete-models)  |
|  41 |  #3  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.3%           | [list + models](#baseline-scale-n--41-candidate-3-1-complete-models)  |
|  41 |  #4  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.3%           | [list + models](#baseline-scale-n--41-candidate-4-1-complete-models)  |
|  41 |  #5  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 46.3%           | [list + models](#baseline-scale-n--41-candidate-5-1-complete-models)  |
|  42 |  #1  |           **1** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 47.6%           | [list + models](#baseline-scale-n--42-candidate-1-1-complete-models)  |
|  42 |  #2  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 40.5%           | [list + models](#baseline-scale-n--42-candidate-2-0-complete-models)  |
|  42 |  #3  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 40.5%           | [list + models](#baseline-scale-n--42-candidate-3-0-complete-models)  |
|  42 |  #4  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 40.5%           | [list + models](#baseline-scale-n--42-candidate-4-0-complete-models)  |
|  42 |  #5  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 40.5%           | [list + models](#baseline-scale-n--42-candidate-5-0-complete-models)  |
|  43 |  #1  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#baseline-scale-n--43-candidate-1-0-complete-models)  |
|  43 |  #2  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#baseline-scale-n--43-candidate-2-0-complete-models)  |
|  43 |  #3  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#baseline-scale-n--43-candidate-3-0-complete-models)  |
|  43 |  #4  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#baseline-scale-n--43-candidate-4-0-complete-models)  |
|  43 |  #5  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 41.9%           | [list + models](#baseline-scale-n--43-candidate-5-0-complete-models)  |
|  44 |  #1  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#baseline-scale-n--44-candidate-1-0-complete-models)  |
|  44 |  #2  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#baseline-scale-n--44-candidate-2-0-complete-models)  |
|  44 |  #3  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#baseline-scale-n--44-candidate-3-0-complete-models)  |
|  44 |  #4  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#baseline-scale-n--44-candidate-4-0-complete-models)  |
|  44 |  #5  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 43.2%           | [list + models](#baseline-scale-n--44-candidate-5-0-complete-models)  |
|  45 |  #1  |           **0** | 8/8 (reasoning, math, knowledge, language, instruction, coding, agentic, context) |          7 / 7 / 44.4%           | [list + models](#baseline-scale-n--45-candidate-1-0-complete-models)  |

## 4. Unconstrained Candidate Details

Complete qualified base-model lists and source composition for each optimal candidate combination in the unconstrained tradeoff curve.

### Scale N = 1, Candidate #1 (47 complete models)

- **Chosen Benchmarks (1)**: `gpqa-diamond`
- **Covered Dimensions (2/8)**: reasoning, knowledge
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 0, `maxSourceShare` 0.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 1 (0 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (47)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-7-plus`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `google-gemini-3-pro-preview`, `meta-muse-spark`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-4-pro`, `openai-gpt-5-5`, `openai-gpt-5-5-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 1, Candidate #2 (41 complete models)

- **Chosen Benchmarks (1)**: `livebench-reasoning`
- **Covered Dimensions (3/8)**: reasoning, knowledge, context
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 1 (1 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 1, Candidate #3 (41 complete models)

- **Chosen Benchmarks (1)**: `livebench-instruction-following`
- **Covered Dimensions (2/8)**: language, instruction
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 1 (1 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 1, Candidate #4 (41 complete models)

- **Chosen Benchmarks (1)**: `livebench-language`
- **Covered Dimensions (2/8)**: language, instruction
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 1 (1 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 1, Candidate #5 (41 complete models)

- **Chosen Benchmarks (1)**: `livebench-mathematics`
- **Covered Dimensions (2/8)**: reasoning, math
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 1 (1 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 2, Candidate #1 (41 complete models)

- **Chosen Benchmarks (2)**: `livebench-instruction-following`, `livebench-reasoning`
- **Covered Dimensions (5/8)**: reasoning, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 2 (2 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 2, Candidate #2 (41 complete models)

- **Chosen Benchmarks (2)**: `livebench-language`, `livebench-reasoning`
- **Covered Dimensions (5/8)**: reasoning, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 2 (2 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 2, Candidate #3 (41 complete models)

- **Chosen Benchmarks (2)**: `livebench-instruction-following`, `livebench-mathematics`
- **Covered Dimensions (4/8)**: reasoning, math, language, instruction
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 2 (2 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 2, Candidate #4 (41 complete models)

- **Chosen Benchmarks (2)**: `livebench-language`, `livebench-mathematics`
- **Covered Dimensions (4/8)**: reasoning, math, language, instruction
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 2 (2 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 2, Candidate #5 (41 complete models)

- **Chosen Benchmarks (2)**: `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (4/8)**: reasoning, math, knowledge, context
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 2 (2 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 3, Candidate #1 (41 complete models)

- **Chosen Benchmarks (3)**: `livebench-instruction-following`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 3 (3 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 3, Candidate #2 (41 complete models)

- **Chosen Benchmarks (3)**: `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 3 (3 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 3, Candidate #3 (41 complete models)

- **Chosen Benchmarks (3)**: `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`
- **Covered Dimensions (5/8)**: reasoning, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 3 (3 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 3, Candidate #4 (41 complete models)

- **Chosen Benchmarks (3)**: `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`
- **Covered Dimensions (4/8)**: reasoning, math, language, instruction
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 3 (3 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 3, Candidate #5 (39 complete models)

- **Chosen Benchmarks (3)**: `gpqa-diamond`, `livebench-instruction-following`, `livebench-mathematics`
- **Covered Dimensions (5/8)**: reasoning, math, knowledge, language, instruction
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 66.7% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (39)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 4, Candidate #1 (41 complete models)

- **Chosen Benchmarks (4)**: `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 1, `exclusiveSources` 1, `maxSourceShare` 100.0% -- `livebench` 4 (4 exclusive)
- **Complete Models (41)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-2-codex`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `xai-grok-build-0-1`, `zai-glm-5-2`

### Scale N = 4, Candidate #2 (39 complete models)

- **Chosen Benchmarks (4)**: `gpqa-diamond`, `livebench-instruction-following`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 75.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (39)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 4, Candidate #3 (39 complete models)

- **Chosen Benchmarks (4)**: `gpqa-diamond`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 75.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (39)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 4, Candidate #4 (39 complete models)

- **Chosen Benchmarks (4)**: `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`
- **Covered Dimensions (5/8)**: reasoning, math, knowledge, language, instruction
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 75.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (39)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 4, Candidate #5 (39 complete models)

- **Chosen Benchmarks (4)**: `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`
- **Covered Dimensions (5/8)**: reasoning, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 75.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (39)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 5, Candidate #1 (39 complete models)

- **Chosen Benchmarks (5)**: `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 80.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (39)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 5, Candidate #2 (34 complete models)

- **Chosen Benchmarks (5)**: `gpqa-diamond`, `livebench-instruction-following`, `livebench-mathematics`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 60.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 5, Candidate #3 (34 complete models)

- **Chosen Benchmarks (5)**: `gpqa-diamond`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 60.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 5, Candidate #4 (34 complete models)

- **Chosen Benchmarks (5)**: `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 80.0% -- `artificial-analysis` 1 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 5, Candidate #5 (34 complete models)

- **Chosen Benchmarks (5)**: `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `terminal-bench-2-1`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, language, instruction, coding, agentic
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 60.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 6, Candidate #1 (34 complete models)

- **Chosen Benchmarks (6)**: `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 1, `maxSourceShare` 66.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 1 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-3`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 6, Candidate #2 (34 complete models)

- **Chosen Benchmarks (6)**: `aime`, `chess-puzzles`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 3 (2 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 6, Candidate #3 (34 complete models)

- **Chosen Benchmarks (6)**: `aime`, `chess-puzzles`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 3 (2 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 6, Candidate #4 (34 complete models)

- **Chosen Benchmarks (6)**: `aime`, `chess-puzzles`, `gpqa-diamond`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 3 (2 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 6, Candidate #5 (34 complete models)

- **Chosen Benchmarks (6)**: `aime`, `chess-puzzles`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 2, `exclusiveSources` 2, `maxSourceShare` 66.7% -- `epoch-ai` 2 (2 exclusive), `livebench` 4 (4 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 7, Candidate #1 (34 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 57.1% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 3 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (34)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 7, Candidate #2 (31 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 42.9% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 4 (3 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (31)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 7, Candidate #3 (31 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 42.9% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 4 (3 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (31)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 7, Candidate #4 (31 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `gpqa-diamond`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 42.9% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 4 (3 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (31)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 7, Candidate #5 (31 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 2, `exclusiveSources` 2, `maxSourceShare` 57.1% -- `epoch-ai` 3 (3 exclusive), `livebench` 4 (4 exclusive)
- **Complete Models (31)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 8, Candidate #1 (31 complete models)

- **Chosen Benchmarks (8)**: `aime`, `chess-puzzles`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (6/8)**: reasoning, math, knowledge, language, instruction, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 1 (0 exclusive), `epoch-ai` 4 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (31)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-5`, `anthropic-claude-opus-4-6`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-2`, `openai-gpt-5-4`, `openai-gpt-5-4-mini`, `openai-gpt-5-4-nano`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 8, Candidate #2 (29 complete models)

- **Chosen Benchmarks (8)**: `aime`, `chess-puzzles`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 3 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-27b`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `moonshot-kimi-k2-7-code`, `moonshot-kimi-k3`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `thinking-machines-inkling`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Scale N = 8, Candidate #3 (29 complete models)

- **Chosen Benchmarks (8)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 62.5% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 8 (5 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 8, Candidate #4 (29 complete models)

- **Chosen Benchmarks (8)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 62.5% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 8 (5 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 8, Candidate #5 (29 complete models)

- **Chosen Benchmarks (8)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 62.5% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 8 (5 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 9, Candidate #1 (29 complete models)

- **Chosen Benchmarks (9)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 66.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 9, Candidate #2 (29 complete models)

- **Chosen Benchmarks (9)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 66.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 9, Candidate #3 (29 complete models)

- **Chosen Benchmarks (9)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 66.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 9, Candidate #4 (29 complete models)

- **Chosen Benchmarks (9)**: `code-migration`, `gpqa-diamond`, `hlab`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 66.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 9, Candidate #5 (29 complete models)

- **Chosen Benchmarks (9)**: `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 66.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 10, Candidate #1 (29 complete models)

- **Chosen Benchmarks (10)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 70.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (29)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 10, Candidate #2 (28 complete models)

- **Chosen Benchmarks (10)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 70.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (28)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 10, Candidate #3 (28 complete models)

- **Chosen Benchmarks (10)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 70.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (28)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 10, Candidate #4 (28 complete models)

- **Chosen Benchmarks (10)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 70.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (28)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 10, Candidate #5 (28 complete models)

- **Chosen Benchmarks (10)**: `code-migration`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 70.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (28)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 11, Candidate #1 (28 complete models)

- **Chosen Benchmarks (11)**: `code-migration`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 72.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (28)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-1`, `zai-glm-5-2`

### Scale N = 11, Candidate #2 (28 complete models)

- **Chosen Benchmarks (11)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 72.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (28)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-2`

### Scale N = 11, Candidate #3 (27 complete models)

- **Chosen Benchmarks (11)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 72.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (27)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-2`

### Scale N = 11, Candidate #4 (27 complete models)

- **Chosen Benchmarks (11)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 72.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (27)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-2`

### Scale N = 11, Candidate #5 (27 complete models)

- **Chosen Benchmarks (11)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 72.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (27)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-2`

### Scale N = 12, Candidate #1 (27 complete models)

- **Chosen Benchmarks (12)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 1, `maxSourceShare` 75.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (27)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `nvidia-nemotron-3-ultra`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xiaomi-mimo-v2-5-pro`, `zai-glm-5-2`

### Scale N = 12, Candidate #2 (26 complete models)

- **Chosen Benchmarks (12)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `swe-bench`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 41.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 8 (5 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 12, Candidate #3 (26 complete models)

- **Chosen Benchmarks (12)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 41.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 8 (5 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 12, Candidate #4 (26 complete models)

- **Chosen Benchmarks (12)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 41.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 8 (5 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 12, Candidate #5 (26 complete models)

- **Chosen Benchmarks (12)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 41.7% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 8 (5 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 13, Candidate #1 (26 complete models)

- **Chosen Benchmarks (13)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 46.2% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 13, Candidate #2 (26 complete models)

- **Chosen Benchmarks (13)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 46.2% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 13, Candidate #3 (26 complete models)

- **Chosen Benchmarks (13)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 46.2% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 13, Candidate #4 (26 complete models)

- **Chosen Benchmarks (13)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 46.2% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 13, Candidate #5 (26 complete models)

- **Chosen Benchmarks (13)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 46.2% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 9 (6 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 14, Candidate #1 (26 complete models)

- **Chosen Benchmarks (14)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 14, Candidate #2 (26 complete models)

- **Chosen Benchmarks (14)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 14, Candidate #3 (26 complete models)

- **Chosen Benchmarks (14)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 14, Candidate #4 (26 complete models)

- **Chosen Benchmarks (14)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 14, Candidate #5 (26 complete models)

- **Chosen Benchmarks (14)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 15, Candidate #1 (26 complete models)

- **Chosen Benchmarks (15)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 53.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (26)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 15, Candidate #2 (25 complete models)

- **Chosen Benchmarks (15)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 53.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (25)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 15, Candidate #3 (25 complete models)

- **Chosen Benchmarks (15)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 53.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (25)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 15, Candidate #4 (25 complete models)

- **Chosen Benchmarks (15)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 53.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (25)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 15, Candidate #5 (25 complete models)

- **Chosen Benchmarks (15)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 53.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (25)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 16, Candidate #1 (25 complete models)

- **Chosen Benchmarks (16)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 56.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (25)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 16, Candidate #2 (24 complete models)

- **Chosen Benchmarks (16)**: `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 56.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (24)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 16, Candidate #3 (24 complete models)

- **Chosen Benchmarks (16)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 56.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (24)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 16, Candidate #4 (24 complete models)

- **Chosen Benchmarks (16)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medscribe`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 56.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (24)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 16, Candidate #5 (24 complete models)

- **Chosen Benchmarks (16)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medscribe`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 56.3% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (24)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 17, Candidate #1 (24 complete models)

- **Chosen Benchmarks (17)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 58.8% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (24)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 17, Candidate #2 (23 complete models)

- **Chosen Benchmarks (17)**: `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 58.8% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (23)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 17, Candidate #3 (23 complete models)

- **Chosen Benchmarks (17)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 58.8% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (23)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 17, Candidate #4 (23 complete models)

- **Chosen Benchmarks (17)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 58.8% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (23)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 17, Candidate #5 (23 complete models)

- **Chosen Benchmarks (17)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 58.8% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (23)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 18, Candidate #1 (23 complete models)

- **Chosen Benchmarks (18)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 61.1% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (23)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 18, Candidate #2 (22 complete models)

- **Chosen Benchmarks (18)**: `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 61.1% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (22)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `meta-muse-spark-1-1`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 18, Candidate #3 (22 complete models)

- **Chosen Benchmarks (18)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 61.1% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (22)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-1`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 18, Candidate #4 (21 complete models)

- **Chosen Benchmarks (18)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 50.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (21)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 18, Candidate #5 (21 complete models)

- **Chosen Benchmarks (18)**: `aime`, `chess-puzzles`, `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 50.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (21)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 19, Candidate #1 (21 complete models)

- **Chosen Benchmarks (19)**: `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 63.2% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (21)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 19, Candidate #2 (21 complete models)

- **Chosen Benchmarks (19)**: `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 2, `maxSourceShare` 63.2% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (21)**: `alibaba-qwen3-6-plus`, `alibaba-qwen3-7-max`, `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 19, Candidate #3 (20 complete models)

- **Chosen Benchmarks (19)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 52.6% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (20)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 19, Candidate #4 (20 complete models)

- **Chosen Benchmarks (19)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 52.6% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (20)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-4-mini`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 19, Candidate #5 (20 complete models)

- **Chosen Benchmarks (19)**: `aime`, `chess-puzzles`, `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 52.6% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (20)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 20, Candidate #1 (20 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 55.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (20)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 20, Candidate #2 (19 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 55.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (19)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 20, Candidate #3 (19 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 55.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (19)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 20, Candidate #4 (19 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 55.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (19)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 20, Candidate #5 (19 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 55.0% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (19)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 21, Candidate #1 (19 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 57.1% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (19)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 21, Candidate #2 (19 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 57.1% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (19)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 21, Candidate #3 (18 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 52.4% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (18)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 21, Candidate #4 (18 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 57.1% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (18)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 21, Candidate #5 (18 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 57.1% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (18)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 22, Candidate #1 (18 complete models)

- **Chosen Benchmarks (22)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 59.1% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (18)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 22, Candidate #2 (17 complete models)

- **Chosen Benchmarks (22)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 54.5% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (17)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-6-flash`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 22, Candidate #3 (17 complete models)

- **Chosen Benchmarks (22)**: `aime`, `chess-puzzles`, `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 54.5% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (17)**: `alibaba-qwen3-7-max`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 22, Candidate #4 (17 complete models)

- **Chosen Benchmarks (22)**: `aime`, `chess-puzzles`, `code-migration`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 54.5% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (17)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 22, Candidate #5 (17 complete models)

- **Chosen Benchmarks (22)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `emb`, `finance-agent-v2`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 59.1% -- `artificial-analysis` 2 (0 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (17)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-4-7`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `moonshot-kimi-k2-6`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 23, Candidate #1 (16 complete models)

- **Chosen Benchmarks (23)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 39.1% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 23, Candidate #2 (16 complete models)

- **Chosen Benchmarks (23)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 39.1% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 23, Candidate #3 (16 complete models)

- **Chosen Benchmarks (23)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 39.1% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 23, Candidate #4 (16 complete models)

- **Chosen Benchmarks (23)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 39.1% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 23, Candidate #5 (16 complete models)

- **Chosen Benchmarks (23)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 39.1% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 24, Candidate #1 (16 complete models)

- **Chosen Benchmarks (24)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 41.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 24, Candidate #2 (16 complete models)

- **Chosen Benchmarks (24)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 41.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 24, Candidate #3 (16 complete models)

- **Chosen Benchmarks (24)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 41.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 24, Candidate #4 (16 complete models)

- **Chosen Benchmarks (24)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 41.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 24, Candidate #5 (16 complete models)

- **Chosen Benchmarks (24)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 41.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 25, Candidate #1 (16 complete models)

- **Chosen Benchmarks (25)**: `aa-lcr`, `aa-omniscience`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 3, `maxSourceShare` 44.0% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 2 (0 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (16)**: `alibaba-qwen3-8-27b`, `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `meta-muse-spark-1-2`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 25, Candidate #2 (14 complete models)

- **Chosen Benchmarks (25)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 36.0% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 25, Candidate #3 (14 complete models)

- **Chosen Benchmarks (25)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 36.0% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 25, Candidate #4 (14 complete models)

- **Chosen Benchmarks (25)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 36.0% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 25, Candidate #5 (14 complete models)

- **Chosen Benchmarks (25)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 36.0% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 26, Candidate #1 (14 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 38.5% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 26, Candidate #2 (14 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 38.5% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 26, Candidate #3 (14 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 38.5% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 26, Candidate #4 (14 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 38.5% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 26, Candidate #5 (14 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 38.5% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 27, Candidate #1 (14 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 40.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (14)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 27, Candidate #2 (13 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 40.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (13)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 27, Candidate #3 (13 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 40.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (13)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 27, Candidate #4 (13 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 40.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (13)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 27, Candidate #5 (13 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 40.7% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (13)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 28, Candidate #1 (13 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 42.9% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (13)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 28, Candidate #2 (13 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 42.9% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (13)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `minimax-minimax-m3`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 28, Candidate #3 (13 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 42.9% -- `artificial-analysis` 9 (7 exclusive), `epoch-ai` 4 (2 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (13)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-5-flash-lite`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 28, Candidate #4 (12 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 35.7% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (12)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 28, Candidate #5 (12 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 35.7% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (12)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 29, Candidate #1 (12 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 37.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (12)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 29, Candidate #2 (12 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 37.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (12)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 29, Candidate #3 (12 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 37.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (12)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 29, Candidate #4 (12 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 37.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (12)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 29, Candidate #5 (12 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 37.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (12)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 30, Candidate #1 (12 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (12)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 30, Candidate #2 (11 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (11)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 30, Candidate #3 (11 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (11)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 30, Candidate #4 (11 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (11)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 30, Candidate #5 (11 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (11)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 31, Candidate #1 (11 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 41.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (11)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 31, Candidate #2 (11 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 41.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (11)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 31, Candidate #3 (10 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 38.7% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 31, Candidate #4 (10 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 41.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (10)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 31, Candidate #5 (10 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 41.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (10)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 32, Candidate #1 (10 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 43.8% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 17 (14 exclusive)
- **Complete Models (10)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 32, Candidate #2 (10 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 43.8% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 17 (14 exclusive)
- **Complete Models (10)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 32, Candidate #3 (9 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 37.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 32, Candidate #4 (9 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 40.6% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 32, Candidate #5 (9 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 40.6% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 33, Candidate #1 (9 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 45.5% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (9)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 33, Candidate #2 (9 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 45.5% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (9)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 33, Candidate #3 (8 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 39.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (8)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 33, Candidate #4 (8 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 39.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (8)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 33, Candidate #5 (8 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 42.4% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 17 (14 exclusive)
- **Complete Models (8)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 34, Candidate #1 (8 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 5, `exclusiveSources` 5, `maxSourceShare` 47.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (8)**: `alibaba-qwen3-8-max`, `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-1-pro-preview`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 34, Candidate #2 (7 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 17 (14 exclusive)
- **Complete Models (7)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Scale N = 34, Candidate #3 (7 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 17 (14 exclusive)
- **Complete Models (7)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 34, Candidate #4 (7 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 44.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (7)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 34, Candidate #5 (7 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 44.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (7)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 35, Candidate #1 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 35, Candidate #2 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 35, Candidate #3 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 35, Candidate #4 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 35, Candidate #5 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 36, Candidate #1 (6 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 36, Candidate #2 (5 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 36, Candidate #3 (5 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 36, Candidate #4 (5 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 36, Candidate #5 (5 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 37, Candidate #1 (5 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 37, Candidate #2 (5 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (5)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 37, Candidate #3 (4 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`

### Scale N = 37, Candidate #4 (4 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`

### Scale N = 37, Candidate #5 (4 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`

### Scale N = 38, Candidate #1 (4 complete models)

- **Chosen Benchmarks (38)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`

### Scale N = 38, Candidate #2 (4 complete models)

- **Chosen Benchmarks (38)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 38, Candidate #3 (3 complete models)

- **Chosen Benchmarks (38)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.7% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (3)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`, `zai-glm-5-2`

### Scale N = 38, Candidate #4 (3 complete models)

- **Chosen Benchmarks (38)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.7% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (3)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Scale N = 38, Candidate #5 (3 complete models)

- **Chosen Benchmarks (38)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.7% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (3)**: `anthropic-claude-fable-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Scale N = 39, Candidate #1 (3 complete models)

- **Chosen Benchmarks (39)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 48.7% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (3)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`

### Scale N = 39, Candidate #2 (2 complete models)

- **Chosen Benchmarks (39)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.6% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (2)**: `openai-gpt-5-6-sol`, `zai-glm-5-2`

### Scale N = 39, Candidate #3 (2 complete models)

- **Chosen Benchmarks (39)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.6% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (2)**: `anthropic-claude-fable-5`, `openai-gpt-5-6-sol`

### Scale N = 39, Candidate #4 (2 complete models)

- **Chosen Benchmarks (39)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Scale N = 39, Candidate #5 (2 complete models)

- **Chosen Benchmarks (39)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Scale N = 40, Candidate #1 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Scale N = 40, Candidate #2 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Scale N = 40, Candidate #3 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Scale N = 40, Candidate #4 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Scale N = 40, Candidate #5 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Scale N = 41, Candidate #1 (2 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 48.8% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 23 (20 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Scale N = 41, Candidate #2 (1 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Scale N = 41, Candidate #3 (1 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Scale N = 41, Candidate #4 (1 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Scale N = 41, Candidate #5 (1 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Scale N = 42, Candidate #1 (1 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.6% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 23 (20 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Scale N = 42, Candidate #2 (0 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 40.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 42, Candidate #3 (0 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 40.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 42, Candidate #4 (0 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 40.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 42, Candidate #5 (0 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 40.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 43, Candidate #1 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 43, Candidate #2 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 43, Candidate #3 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 43, Candidate #4 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 43, Candidate #5 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 44, Candidate #1 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 44, Candidate #2 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 44, Candidate #3 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 44, Candidate #4 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 44, Candidate #5 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Scale N = 45, Candidate #1 (0 complete models)

- **Chosen Benchmarks (45)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 23 (20 exclusive)
- **Complete Models (0)**: _(none)_

## 5. Baseline Candidate Details

Complete qualified base-model lists and source composition for each candidate combination in the baseline tradeoff curve.

### Baseline Scale N = 2, Candidate #1 (17 complete models)

- **Chosen Benchmarks (2)**: `deepswe-1-1`, `frontier-code-1-1`
- **Covered Dimensions (3/8)**: coding, agentic, context
- **Source Composition**: `sourceSpan` 2, `exclusiveSources` 2, `maxSourceShare` 50.0% -- `deepswe` 1 (1 exclusive), `frontier-code` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 3, Candidate #1 (17 complete models)

- **Chosen Benchmarks (3)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`
- **Covered Dimensions (5/8)**: reasoning, math, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 3, `maxSourceShare` 33.3% -- `deepswe` 1 (1 exclusive), `epoch-ai` 1 (1 exclusive), `frontier-code` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 3, Candidate #2 (17 complete models)

- **Chosen Benchmarks (3)**: `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`
- **Covered Dimensions (5/8)**: reasoning, knowledge, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 3, `maxSourceShare` 33.3% -- `deepswe` 1 (1 exclusive), `epoch-ai` 1 (1 exclusive), `frontier-code` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 3, Candidate #3 (17 complete models)

- **Chosen Benchmarks (3)**: `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`
- **Covered Dimensions (5/8)**: language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 3, `maxSourceShare` 33.3% -- `deepswe` 1 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 3, Candidate #4 (17 complete models)

- **Chosen Benchmarks (3)**: `deepswe-1-1`, `frontier-code-1-1`, `livebench-language`
- **Covered Dimensions (5/8)**: language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 3, `maxSourceShare` 33.3% -- `deepswe` 1 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 3, Candidate #5 (17 complete models)

- **Chosen Benchmarks (3)**: `deepswe-1-1`, `frontier-code-1-1`, `livebench-mathematics`
- **Covered Dimensions (5/8)**: reasoning, math, coding, agentic, context
- **Source Composition**: `sourceSpan` 3, `exclusiveSources` 3, `maxSourceShare` 33.3% -- `deepswe` 1 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 4, Candidate #1 (17 complete models)

- **Chosen Benchmarks (4)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`
- **Covered Dimensions (7/8)**: reasoning, math, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `deepswe` 1 (1 exclusive), `epoch-ai` 1 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 4, Candidate #2 (17 complete models)

- **Chosen Benchmarks (4)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-language`
- **Covered Dimensions (7/8)**: reasoning, math, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `deepswe` 1 (1 exclusive), `epoch-ai` 1 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 4, Candidate #3 (17 complete models)

- **Chosen Benchmarks (4)**: `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`
- **Covered Dimensions (7/8)**: reasoning, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `deepswe` 1 (1 exclusive), `epoch-ai` 1 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 4, Candidate #4 (17 complete models)

- **Chosen Benchmarks (4)**: `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-language`
- **Covered Dimensions (7/8)**: reasoning, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `deepswe` 1 (1 exclusive), `epoch-ai` 1 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 4, Candidate #5 (17 complete models)

- **Chosen Benchmarks (4)**: `deepswe-1-1`, `frontier-code-1-1`, `livebench-mathematics`, `simpleqa-verified`
- **Covered Dimensions (7/8)**: reasoning, math, knowledge, language, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `deepswe` 1 (1 exclusive), `epoch-ai` 1 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 5, Candidate #1 (17 complete models)

- **Chosen Benchmarks (5)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 20.0% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 2 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 5, Candidate #2 (17 complete models)

- **Chosen Benchmarks (5)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-language`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 20.0% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 2 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 5, Candidate #3 (17 complete models)

- **Chosen Benchmarks (5)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 40.0% -- `deepswe` 1 (1 exclusive), `epoch-ai` 2 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 5, Candidate #4 (17 complete models)

- **Chosen Benchmarks (5)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-language`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 40.0% -- `deepswe` 1 (1 exclusive), `epoch-ai` 2 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 5, Candidate #5 (17 complete models)

- **Chosen Benchmarks (5)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`, `livebench-reasoning`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 40.0% -- `deepswe` 1 (1 exclusive), `epoch-ai` 1 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 6, Candidate #1 (17 complete models)

- **Chosen Benchmarks (6)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 16.7% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 2 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 6, Candidate #2 (17 complete models)

- **Chosen Benchmarks (6)**: `aime`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-language`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 16.7% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 2 (1 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 6, Candidate #3 (17 complete models)

- **Chosen Benchmarks (6)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 33.3% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 6, Candidate #4 (17 complete models)

- **Chosen Benchmarks (6)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-language`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 33.3% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 6, Candidate #5 (17 complete models)

- **Chosen Benchmarks (6)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `livebench-instruction-following`, `livebench-language`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 4, `exclusiveSources` 4, `maxSourceShare` 33.3% -- `deepswe` 1 (1 exclusive), `epoch-ai` 2 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 7, Candidate #1 (17 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 28.6% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 7, Candidate #2 (17 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-mathematics`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 28.6% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 7, Candidate #3 (17 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-reasoning`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 28.6% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 7, Candidate #4 (17 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 28.6% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 1 (1 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 7, Candidate #5 (17 complete models)

- **Chosen Benchmarks (7)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-language`, `livebench-mathematics`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 28.6% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 8, Candidate #1 (17 complete models)

- **Chosen Benchmarks (8)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 8, Candidate #2 (17 complete models)

- **Chosen Benchmarks (8)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-mathematics`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 8, Candidate #3 (17 complete models)

- **Chosen Benchmarks (8)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 8, Candidate #4 (17 complete models)

- **Chosen Benchmarks (8)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-language`, `livebench-mathematics`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 8, Candidate #5 (17 complete models)

- **Chosen Benchmarks (8)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-language`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 25.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 9, Candidate #1 (17 complete models)

- **Chosen Benchmarks (9)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 33.3% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 9, Candidate #2 (17 complete models)

- **Chosen Benchmarks (9)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 33.3% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 9, Candidate #3 (17 complete models)

- **Chosen Benchmarks (9)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 33.3% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 9, Candidate #4 (17 complete models)

- **Chosen Benchmarks (9)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 33.3% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 9, Candidate #5 (17 complete models)

- **Chosen Benchmarks (9)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 33.3% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 2 (2 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 10, Candidate #1 (17 complete models)

- **Chosen Benchmarks (10)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 30.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 10, Candidate #2 (17 complete models)

- **Chosen Benchmarks (10)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 30.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 10, Candidate #3 (17 complete models)

- **Chosen Benchmarks (10)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 30.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 10, Candidate #4 (17 complete models)

- **Chosen Benchmarks (10)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 30.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 10, Candidate #5 (17 complete models)

- **Chosen Benchmarks (10)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 40.0% -- `artificial-analysis` 1 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 11, Candidate #1 (17 complete models)

- **Chosen Benchmarks (11)**: `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 4, `maxSourceShare` 36.4% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (17)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 11, Candidate #2 (16 complete models)

- **Chosen Benchmarks (11)**: `aime`, `arc-agi-2`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 5, `maxSourceShare` 27.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (16)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 11, Candidate #3 (16 complete models)

- **Chosen Benchmarks (11)**: `aime`, `arc-agi-2`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 5, `maxSourceShare` 27.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (16)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 11, Candidate #4 (16 complete models)

- **Chosen Benchmarks (11)**: `aime`, `arc-agi-2`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 5, `maxSourceShare` 27.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (16)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 11, Candidate #5 (16 complete models)

- **Chosen Benchmarks (11)**: `aime`, `arc-agi-2`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 5, `maxSourceShare` 27.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (16)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 12, Candidate #1 (16 complete models)

- **Chosen Benchmarks (12)**: `aime`, `arc-agi-2`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 5, `maxSourceShare` 33.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (16)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 12, Candidate #2 (14 complete models)

- **Chosen Benchmarks (12)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 25.0% -- `artificial-analysis` 4 (3 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 12, Candidate #3 (14 complete models)

- **Chosen Benchmarks (12)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 25.0% -- `artificial-analysis` 5 (3 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 12, Candidate #4 (14 complete models)

- **Chosen Benchmarks (12)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 25.0% -- `artificial-analysis` 4 (3 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 12, Candidate #5 (14 complete models)

- **Chosen Benchmarks (12)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 25.0% -- `artificial-analysis` 5 (3 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 13, Candidate #1 (14 complete models)

- **Chosen Benchmarks (13)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 23.1% -- `artificial-analysis` 5 (3 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 13, Candidate #2 (14 complete models)

- **Chosen Benchmarks (13)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 23.1% -- `artificial-analysis` 5 (3 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 13, Candidate #3 (14 complete models)

- **Chosen Benchmarks (13)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 23.1% -- `artificial-analysis` 5 (3 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 13, Candidate #4 (14 complete models)

- **Chosen Benchmarks (13)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 23.1% -- `artificial-analysis` 5 (3 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 13, Candidate #5 (14 complete models)

- **Chosen Benchmarks (13)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 23.1% -- `artificial-analysis` 5 (3 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 14, Candidate #1 (14 complete models)

- **Chosen Benchmarks (14)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 28.6% -- `artificial-analysis` 5 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 14, Candidate #2 (14 complete models)

- **Chosen Benchmarks (14)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 28.6% -- `artificial-analysis` 6 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 14, Candidate #3 (14 complete models)

- **Chosen Benchmarks (14)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 28.6% -- `artificial-analysis` 6 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 3 (3 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 14, Candidate #4 (14 complete models)

- **Chosen Benchmarks (14)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 28.6% -- `artificial-analysis` 5 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 1 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 14, Candidate #5 (14 complete models)

- **Chosen Benchmarks (14)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 28.6% -- `artificial-analysis` 6 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 3 (2 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 15, Candidate #1 (14 complete models)

- **Chosen Benchmarks (15)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 26.7% -- `artificial-analysis` 6 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 15, Candidate #2 (14 complete models)

- **Chosen Benchmarks (15)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 26.7% -- `artificial-analysis` 6 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 15, Candidate #3 (14 complete models)

- **Chosen Benchmarks (15)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 26.7% -- `artificial-analysis` 6 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 15, Candidate #4 (14 complete models)

- **Chosen Benchmarks (15)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 26.7% -- `artificial-analysis` 6 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 15, Candidate #5 (14 complete models)

- **Chosen Benchmarks (15)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 26.7% -- `artificial-analysis` 6 (4 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 16, Candidate #1 (14 complete models)

- **Chosen Benchmarks (16)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 31.3% -- `artificial-analysis` 7 (5 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 16, Candidate #2 (14 complete models)

- **Chosen Benchmarks (16)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 31.3% -- `artificial-analysis` 7 (5 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 16, Candidate #3 (14 complete models)

- **Chosen Benchmarks (16)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 31.3% -- `artificial-analysis` 7 (5 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 16, Candidate #4 (14 complete models)

- **Chosen Benchmarks (16)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 31.3% -- `artificial-analysis` 7 (5 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 16, Candidate #5 (14 complete models)

- **Chosen Benchmarks (16)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 31.3% -- `artificial-analysis` 7 (5 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 17, Candidate #1 (14 complete models)

- **Chosen Benchmarks (17)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 35.3% -- `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 17, Candidate #2 (14 complete models)

- **Chosen Benchmarks (17)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 35.3% -- `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 17, Candidate #3 (14 complete models)

- **Chosen Benchmarks (17)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 35.3% -- `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 17, Candidate #4 (14 complete models)

- **Chosen Benchmarks (17)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 35.3% -- `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 17, Candidate #5 (14 complete models)

- **Chosen Benchmarks (17)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 35.3% -- `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 18, Candidate #1 (14 complete models)

- **Chosen Benchmarks (18)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 38.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (14)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 18, Candidate #2 (13 complete models)

- **Chosen Benchmarks (18)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 33.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 18, Candidate #3 (13 complete models)

- **Chosen Benchmarks (18)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 33.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 18, Candidate #4 (13 complete models)

- **Chosen Benchmarks (18)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 33.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 18, Candidate #5 (13 complete models)

- **Chosen Benchmarks (18)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 33.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 19, Candidate #1 (13 complete models)

- **Chosen Benchmarks (19)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `critpt`, `deepswe-1-1`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `humanitys-last-exam`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 36.8% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 4 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 2 (0 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-flash`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `moonshot-kimi-k3`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `xai-grok-4-5`, `xai-grok-4-6`, `zai-glm-5-2`

### Baseline Scale N = 19, Candidate #2 (13 complete models)

- **Chosen Benchmarks (19)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 36.8% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 19, Candidate #3 (13 complete models)

- **Chosen Benchmarks (19)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `programbench`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 36.8% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 19, Candidate #4 (13 complete models)

- **Chosen Benchmarks (19)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 36.8% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 19, Candidate #5 (13 complete models)

- **Chosen Benchmarks (19)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 36.8% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 20, Candidate #1 (13 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 20, Candidate #2 (13 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 20, Candidate #3 (13 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 20, Candidate #4 (13 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 20, Candidate #5 (13 complete models)

- **Chosen Benchmarks (20)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `programbench`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 40.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 21, Candidate #1 (13 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 42.9% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 21, Candidate #2 (13 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 42.9% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 21, Candidate #3 (13 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 42.9% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 21, Candidate #4 (13 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 42.9% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 21, Candidate #5 (13 complete models)

- **Chosen Benchmarks (21)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 42.9% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 22, Candidate #1 (13 complete models)

- **Chosen Benchmarks (22)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 45.5% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (13)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 22, Candidate #2 (12 complete models)

- **Chosen Benchmarks (22)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 40.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 22, Candidate #3 (12 complete models)

- **Chosen Benchmarks (22)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 40.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 22, Candidate #4 (12 complete models)

- **Chosen Benchmarks (22)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 40.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 22, Candidate #5 (12 complete models)

- **Chosen Benchmarks (22)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 40.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 23, Candidate #1 (12 complete models)

- **Chosen Benchmarks (23)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 43.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 23, Candidate #2 (12 complete models)

- **Chosen Benchmarks (23)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 47.8% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 23, Candidate #3 (12 complete models)

- **Chosen Benchmarks (23)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 47.8% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 23, Candidate #4 (12 complete models)

- **Chosen Benchmarks (23)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 47.8% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 23, Candidate #5 (12 complete models)

- **Chosen Benchmarks (23)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 47.8% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 24, Candidate #1 (12 complete models)

- **Chosen Benchmarks (24)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 50.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (12)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 24, Candidate #2 (11 complete models)

- **Chosen Benchmarks (24)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 45.8% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (11)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 24, Candidate #3 (11 complete models)

- **Chosen Benchmarks (24)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 45.8% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (11)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-4-6`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 24, Candidate #4 (11 complete models)

- **Chosen Benchmarks (24)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 45.8% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (11)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 24, Candidate #5 (11 complete models)

- **Chosen Benchmarks (24)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 45.8% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (11)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 25, Candidate #1 (11 complete models)

- **Chosen Benchmarks (25)**: `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 6, `maxSourceShare` 48.0% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (11)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 25, Candidate #2 (11 complete models)

- **Chosen Benchmarks (25)**: `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 52.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (11)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 25, Candidate #3 (11 complete models)

- **Chosen Benchmarks (25)**: `aime`, `chess-puzzles`, `code-migration`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gpqa-diamond`, `hlab`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `simpleqa-verified`, `swe-bench`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 5, `maxSourceShare` 52.0% -- `artificial-analysis` 2 (0 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (11)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-4-8`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 25, Candidate #4 (10 complete models)

- **Chosen Benchmarks (25)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 28.0% -- `artificial-analysis` 8 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 9 (7 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 25, Candidate #5 (10 complete models)

- **Chosen Benchmarks (25)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `scicode`, `simpleqa-verified`, `swe-bench`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 28.0% -- `artificial-analysis` 8 (6 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 26, Candidate #1 (10 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 26.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 26, Candidate #2 (10 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medscribe`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 26.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 26, Candidate #3 (10 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 26.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 26, Candidate #4 (10 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 26.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 26, Candidate #5 (10 complete models)

- **Chosen Benchmarks (26)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 26.9% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 10 (7 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 27, Candidate #1 (10 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 29.6% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 27, Candidate #2 (10 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 29.6% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 27, Candidate #3 (10 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 29.6% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 27, Candidate #4 (10 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 29.6% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 27, Candidate #5 (10 complete models)

- **Chosen Benchmarks (27)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 29.6% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 11 (8 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 28, Candidate #1 (10 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 32.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 28, Candidate #2 (10 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 32.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 28, Candidate #3 (10 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 32.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 28, Candidate #4 (10 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 32.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 28, Candidate #5 (10 complete models)

- **Chosen Benchmarks (28)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 32.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 12 (9 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 29, Candidate #1 (10 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 34.5% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 29, Candidate #2 (10 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 34.5% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 29, Candidate #3 (10 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 34.5% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 29, Candidate #4 (10 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 34.5% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 29, Candidate #5 (10 complete models)

- **Chosen Benchmarks (29)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 34.5% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 13 (10 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 30, Candidate #1 (10 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 36.7% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 30, Candidate #2 (10 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 36.7% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 30, Candidate #3 (10 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 36.7% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 30, Candidate #4 (10 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 36.7% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 30, Candidate #5 (10 complete models)

- **Chosen Benchmarks (30)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 36.7% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 31, Candidate #1 (10 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 38.7% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (10)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 31, Candidate #2 (9 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 35.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 31, Candidate #3 (9 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 35.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 31, Candidate #4 (9 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 35.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 31, Candidate #5 (9 complete models)

- **Chosen Benchmarks (31)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 35.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 14 (11 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 32, Candidate #1 (9 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 37.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 32, Candidate #2 (9 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 40.6% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 32, Candidate #3 (9 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 40.6% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (9)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 32, Candidate #4 (8 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 37.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (8)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 32, Candidate #5 (8 complete models)

- **Chosen Benchmarks (32)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 37.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 15 (12 exclusive)
- **Complete Models (8)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 33, Candidate #1 (8 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 39.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (8)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 33, Candidate #2 (8 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 39.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (8)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 33, Candidate #3 (8 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 42.4% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 17 (14 exclusive)
- **Complete Models (8)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 33, Candidate #4 (8 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 42.4% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 17 (14 exclusive)
- **Complete Models (8)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 33, Candidate #5 (7 complete models)

- **Chosen Benchmarks (33)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 39.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (7)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 34, Candidate #1 (7 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 17 (14 exclusive)
- **Complete Models (7)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`, `zai-glm-5-2`

### Baseline Scale N = 34, Candidate #2 (7 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 17 (14 exclusive)
- **Complete Models (7)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 34, Candidate #3 (7 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 44.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (7)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `google-gemini-3-6-flash`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 34, Candidate #4 (7 complete models)

- **Chosen Benchmarks (34)**: `aa-lcr`, `aa-omniscience`, `aime`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 6, `exclusiveSources` 6, `maxSourceShare` 44.1% -- `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (7)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `anthropic-claude-sonnet-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 34, Candidate #5 (6 complete models)

- **Chosen Benchmarks (34)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 38.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 16 (13 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `google-gemini-3-6-flash`, `google-gemini-3-7-flash`, `openai-gpt-5-6-sol`, `zai-glm-5-2`

### Baseline Scale N = 35, Candidate #1 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 35, Candidate #2 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 35, Candidate #3 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 35, Candidate #4 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 35, Candidate #5 (6 complete models)

- **Chosen Benchmarks (35)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 42.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 18 (15 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 36, Candidate #1 (6 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (6)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 36, Candidate #2 (5 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 36, Candidate #3 (5 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 36, Candidate #4 (5 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 36, Candidate #5 (5 complete models)

- **Chosen Benchmarks (36)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 19 (16 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 37, Candidate #1 (5 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (5)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 37, Candidate #2 (5 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (5)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 37, Candidate #3 (4 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`

### Baseline Scale N = 37, Candidate #4 (4 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`

### Baseline Scale N = 37, Candidate #5 (4 complete models)

- **Chosen Benchmarks (37)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 45.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`

### Baseline Scale N = 38, Candidate #1 (4 complete models)

- **Chosen Benchmarks (38)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-luna`, `openai-gpt-5-6-sol`

### Baseline Scale N = 38, Candidate #2 (4 complete models)

- **Chosen Benchmarks (38)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (4)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 38, Candidate #3 (3 complete models)

- **Chosen Benchmarks (38)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.7% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (3)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`, `zai-glm-5-2`

### Baseline Scale N = 38, Candidate #4 (3 complete models)

- **Chosen Benchmarks (38)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.7% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (3)**: `anthropic-claude-fable-5`, `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 38, Candidate #5 (3 complete models)

- **Chosen Benchmarks (38)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.7% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (3)**: `anthropic-claude-fable-5`, `openai-gpt-5-6-sol`, `openai-gpt-5-6-terra`

### Baseline Scale N = 39, Candidate #1 (3 complete models)

- **Chosen Benchmarks (39)**: `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 48.7% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 9 (7 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (3)**: `anthropic-claude-opus-5`, `deepseek-deepseek-v4-pro`, `openai-gpt-5-6-sol`

### Baseline Scale N = 39, Candidate #2 (2 complete models)

- **Chosen Benchmarks (39)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.6% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (2)**: `openai-gpt-5-6-sol`, `zai-glm-5-2`

### Baseline Scale N = 39, Candidate #3 (2 complete models)

- **Chosen Benchmarks (39)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.6% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (2)**: `anthropic-claude-fable-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 39, Candidate #4 (2 complete models)

- **Chosen Benchmarks (39)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 39, Candidate #5 (2 complete models)

- **Chosen Benchmarks (39)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 40, Candidate #1 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 40, Candidate #2 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 40, Candidate #3 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 40, Candidate #4 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 40, Candidate #5 (2 complete models)

- **Chosen Benchmarks (40)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 41, Candidate #1 (2 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 48.8% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 10 (8 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 23 (20 exclusive)
- **Complete Models (2)**: `anthropic-claude-opus-5`, `openai-gpt-5-6-sol`

### Baseline Scale N = 41, Candidate #2 (1 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Baseline Scale N = 41, Candidate #3 (1 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Baseline Scale N = 41, Candidate #4 (1 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Baseline Scale N = 41, Candidate #5 (1 complete models)

- **Chosen Benchmarks (41)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 46.3% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Baseline Scale N = 42, Candidate #1 (1 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 47.6% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 11 (9 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 5 (3 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 23 (20 exclusive)
- **Complete Models (1)**: `openai-gpt-5-6-sol`

### Baseline Scale N = 42, Candidate #2 (0 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 40.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 42, Candidate #3 (0 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 40.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 42, Candidate #4 (0 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 40.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 42, Candidate #5 (0 complete models)

- **Chosen Benchmarks (42)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 40.5% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 20 (17 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 43, Candidate #1 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 43, Candidate #2 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 43, Candidate #3 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 43, Candidate #4 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 43, Candidate #5 (0 complete models)

- **Chosen Benchmarks (43)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 41.9% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 21 (18 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 44, Candidate #1 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 44, Candidate #2 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 44, Candidate #3 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 44, Candidate #4 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 44, Candidate #5 (0 complete models)

- **Chosen Benchmarks (44)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 43.2% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 22 (19 exclusive)
- **Complete Models (0)**: _(none)_

### Baseline Scale N = 45, Candidate #1 (0 complete models)

- **Chosen Benchmarks (45)**: `aa-briefcase`, `aa-lcr`, `aa-omniscience`, `aime`, `apex-agents`, `arc-agi-2`, `chess-puzzles`, `code-migration`, `corpfin`, `critpt`, `cyber`, `deepswe-1-1`, `emb`, `finance-agent-v2`, `frontier-code-1-1`, `frontiermath`, `frontiermath-tier-4`, `gdpval-aa`, `gpqa-diamond`, `hlab`, `humanitys-last-exam`, `ifbench`, `ioi`, `legal-bench`, `legal-research`, `livebench-instruction-following`, `livebench-language`, `livebench-mathematics`, `livebench-reasoning`, `livecodebench`, `medcode`, `medscribe`, `mmlu-pro`, `programbench`, `proofbench`, `public-benefits-bench`, `reverse-eng`, `scicode`, `simpleqa-verified`, `skillsbench`, `swe-bench`, `tau3-banking`, `tax-eval-v2`, `terminal-bench-2-1`, `vibe-code-bench`
- **Covered Dimensions (8/8)**: reasoning, math, knowledge, language, instruction, coding, agentic, context
- **Source Composition**: `sourceSpan` 7, `exclusiveSources` 7, `maxSourceShare` 44.4% -- `arc-prize` 1 (1 exclusive), `artificial-analysis` 12 (10 exclusive), `deepswe` 1 (1 exclusive), `epoch-ai` 7 (5 exclusive), `frontier-code` 1 (1 exclusive), `livebench` 4 (4 exclusive), `vals-ai` 23 (20 exclusive)
- **Complete Models (0)**: _(none)_

## 6. Qualified Model × Active Benchmark Presence Matrix

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
