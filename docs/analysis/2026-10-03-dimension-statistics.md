# Dimension statistics — 2026-10-03

The refreshed evidence retains modest separation under the current five groups. The measured separation does not establish an optimal dimension count. The common 21 benchmarks provide a different task mix, and its candidate partitions change the result when general performance is controlled with a descriptive proxy.

## Evidence and selection

The companion exporter calls `loadWorkspaceCoverageData` and reproduces coverage-matrix steps 1–7: source whitelist, comparison-only exclusion, canonical product-effort policy, included non-null resolved candidates, canonical current-result selection, qualified-model and mapped-benchmark filtering. The optimizer is never invoked. There are 7,096 source candidates, 7,078 after whitelist/comparison filtering, 2,766 eligible candidates and 2,598 effective selected rows. The profile × benchmark uniqueness assertion passes. The population has 201 profiles and 64 base models with scores, drawn from 66 qualified catalog models.

There are 54 active benchmarks and 52 quality-eligible benchmarks after excluding `aime` and `programbench`. `frontier-swe-v2` is comparison-only. The existing limited-benchmark balance rule is retained as metadata; these diagnostics analyze the eligible pool rather than generating a preset. Missing results remain missing.

## SPEC §4.6 reproduction

Spearman rho uses the same observed product profiles for each benchmark pair, with at least 15 rows. Summary correlations are unweighted means over computable pairs. Current primary dimension alone determines within/between assignment.

| Population                            | Benchmarks | Pairs | Within rho | Between rho | Difference |
| ------------------------------------- | ---------: | ----: | ---------: | ----------: | ---------: |
| profilesAll54 (201 rows)              |         54 |   959 |     0.6150 |      0.5351 |     0.0799 |
| profilesQuality52 (201 rows)          |         52 |   873 |     0.6027 |      0.5311 |     0.0716 |
| oneProfilePerModelAll54 (64 rows)     |         54 |   902 |     0.6044 |      0.5269 |     0.0774 |
| oneProfilePerModelQuality52 (64 rows) |         52 |   818 |     0.5936 |      0.5220 |     0.0716 |

The one-profile-per-model sensitivity picks a fixed profile by largest quality52 coverage, highest effort on a tie, then lexicographic profile ID. Its 64 rows are never assembled from per-benchmark best scores. The overall five-group contrast changes little, suggesting repeated effort profiles do not drive this particular contrast. Model family, provider, training, and task dependence remain.

Quality52 profile observations are 76.33% missing; the fixed base-model matrix is 52.76% missing. Of 1,326 possible benchmark pairs, 873 qualify at n≥15 and 683 at n≥20 in the profile matrix. In the base-model matrix, 818 qualify at n≥15 and 540 at n≥20. Eligible pairs therefore measure different model cohorts. Pairwise correlation matrices assembled this way need not be positive semidefinite or describe any single joint sample.

| Current group (quality52) | Profile pair count | Profile mean rho | Base-model pair count | Base-model mean rho |
| ------------------------- | -----------------: | ---------------: | --------------------: | ------------------: |
| agentic                   |                 65 |           0.5137 |                    60 |              0.5016 |
| coding                    |                 34 |           0.6975 |                    31 |              0.7012 |
| knowledge                 |                  9 |           0.5694 |                     9 |              0.5745 |
| language                  |                  6 |           0.3509 |                     6 |              0.3550 |
| reasoning                 |                 70 |           0.6652 |                    63 |              0.6537 |

## General-performance and source diagnostics

For each pair, the residual proxy takes the median empirical percentile rank over the row’s other observed benchmarks, requiring at least five; it excludes the two target scores. Pair-specific benchmark ranks are regressed on that median, and their residuals are correlated. This is a descriptive partial-rank diagnostic, not an estimated latent factor. Changing coverage and source mixtures can bias the median.

On quality52, mean correlation across eligible pairs is 0.5462 before this control and 0.0754 afterward for profiles; it is 0.5368 and 0.0686 for base models. Current-group residual within/between differences are +0.1317 and +0.1472. The residual sample also requires enough other observed scores, so pair counts change slightly. This proxy is consistent with broad performance accounting for much of the raw positive association while task-specific structure remains.

Benchmarks sharing a dominant selected source have profile raw mean rho 0.5390, compared with 0.5488 for different-source pairs. Residual means are 0.1198 and 0.0593. Source is not interchangeable with task: this classification uses each benchmark’s modal selected source, and individual rows may come from different sources. Shared harnesses, source model coverage and published-score selection can all confound comparisons. Correlations establish neither causal capabilities nor cross-source validity.

## MedScribe reevaluation

The §4.6 n≥20 follow-up condition is reached for all three other current Language benchmarks: LiveBench Language rho 0.3488 (n=31), Complex Constraints 0.3276 (n=22), and LiveBench Instruction Following −0.0181 (n=31). These values are identical after the fixed-profile model collapse. MedScribe has 46 qualifying pairs across all54, including 35 at n≥20; quality52 has 44, including 33 at n≥20.

MedScribe correlates more with professional workflow benchmarks: Legal Research 0.7939 (n=37), Corporate Finance 0.7417 (n=28), Public Benefits 0.7248 (n=28), and Finance Agent v2 0.6172 (n=36). Those four share its source, so task and source explanations remain entangled. Other-source DayJob Healthcare is 0.7766 (n=18), below the follow-up threshold. These observations support reassessing Language, but do not uniquely identify its replacement group.

## Same-common21 candidate partition checks

These checks reuse all historical qualified rows restricted to exactly the same 21 benchmark columns. They do not infer factors from the six currently selected frontier models. Candidate mappings are saved in JSON: four groups combine candidate5 Reasoning and Knowledge into Analytical; the workflow alternative also moves MedScribe from Information to Workflow.

| Partition                   | Profile raw difference | Base raw difference | Profile residual difference | Base residual difference |
| --------------------------- | ---------------------: | ------------------: | --------------------------: | -----------------------: |
| current5                    |                 0.0031 |              0.0114 |                      0.1430 |                   0.2216 |
| candidate5                  |                 0.0557 |              0.0751 |                      0.1589 |                   0.2309 |
| candidate4                  |                 0.0686 |              0.0895 |                      0.1490 |                   0.1977 |
| candidate4MedScribeWorkflow |                 0.0841 |              0.1078 |                      0.1703 |                   0.2151 |

Candidate partitions improve raw contrast over the current common21 grouping. The raw advantage of four groups over candidate5 reverses under the residual control. MedScribe’s workflow alternative raises the raw contrast, but residual preference depends on whether repeated effort profiles are retained. These diagnostics cannot choose the number or names of dimensions.

The proposed Information group has only three of six possible n≥15 pairs: AA LCR × GDP PDF, AA LCR × MedScribe, and GDP PDF × MedScribe. GDP XLSX is too sparsely observed to test any of its three groupmates at this threshold. On the model-aware sensitivity the corresponding rhos are 0.5905 (n=22), 0.3903 (n=15) and 0.6106 (n=15); at n≥20 only the first remains. This is weak evidence for a coherent new group.

Moving Cyber into Software conflicts with raw model-aware task correlations: Cyber × IOI −0.0287 (n=23), × Code Migration 0.1589 (n=25), × Vibe Code Bench 0.1562 (n=25), and × SciCode 0.2821 (n=15). Other computable coding-group pairs range 0.6436–0.8860. Cyber may deserve that grouping by task semantics, but correlation does not support describing it as the same measured capability.

## Current-six coverage and score sensitivity

Each current frontier model’s highest-coverage fixed profile matches the approved AA profile: Opus 5.5 max, Sonnet 5.5 max, Fable 5.1 max, GPT 6 Astra max, Gemini 4 Argon high and GPT-6.1 Sol max. Their exact common core has 21 quality-eligible benchmarks, with all 126 scores present. The centered matrix can have rank at most five, and no benchmark pair can meet n≥15. A latent-dimension-count claim from these six rows would be unsupported.

ProofBench is 99–100 across these six, mean 99.5 and only two distinct scores. Under candidate5 it is half of the Reasoning dimension, hence one tenth of equal-dimension Overall. The remaining CritPt range is 4.57. Candidate4 puts ProofBench among five Analytical tests, reducing its implicit benchmark weight to 1/20. The JSON includes per-benchmark minimum, maximum, range, standard deviation and unique-score counts.

Exploratory scoring takes benchmark arithmetic means within groups and equally averages group means. Under candidate5, Gemini precedes Opus by 0.1783 points; dropping ProofBench makes Opus precede Gemini by 0.1788. Candidate4 retains Gemini then Opus with or without ProofBench. These are weighting sensitivities of the specified common21 matrix, not a proposed leaderboard or dimension validation.

## Reproduction and checks

```powershell
pnpm exec tsx scripts/analyze-dimension-statistics.ts
python scripts/analyze-dimension-statistics.py
```

The exporter rejects duplicate profile×benchmark cells; the Python analysis asserts the 54/52 benchmark counts, profile identity uniqueness, one row per evidenced model, and six-model completeness. JSON serialization rejects NaN. Every pair stores its exact overlap n and both benchmark IDs; the JSON retains the fixed selected-profile list and benchmark source sets.
