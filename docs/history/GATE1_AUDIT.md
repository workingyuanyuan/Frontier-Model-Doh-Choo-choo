# Review Gate 1 — Round 2 source audit (sample of 2026-08-18)

Audit performed 2026-08-19 against the live public sources. Input: `review-sample.json`
(54 sampled scores, 3 per benchmark, all on models that reach the product main view).
No file other than this report was modified.

## 1. Summary

**52 MATCH / 0 MISMATCH / 2 NOT_FOUND / 0 UNREACHABLE out of 54.**

Every numeric value in the sample is correct. The only two defects are _locator/sourceUrl_
defects: two `aa-omniscience` rows name an evaluations page that does not carry the model
variant they claim. The numbers themselves are right and were confirmed on the
corresponding Artificial Analysis model pages.

All four sources were reachable (HTTP 200):

| Source                | Fetched artefact                                                                | Status |
| --------------------- | ------------------------------------------------------------------------------- | ------ |
| artificialanalysis.ai | 11 `/evaluations/*` + 8 `/models/*` pages, RSC payload parsed                   | 200    |
| livebench.ai          | `table_2026_06_25.csv?v=1787033560` + `categories_2026_06_25.json?v=1787033560` | 200    |
| deepswe.datacurve.ai  | `artifacts/v1.1/leaderboard-live.json`                                          | 200    |
| cognition.com         | `data/frontiercode-leaderboard/data.json`                                       | 200    |

## 2. All 54 rows

Values shown to 6 significant digits; the comparison itself was done at full precision.

| #   | Benchmark                       | Model (as sampled)                                                 | Scraped rawScore | Source value | Verdict   |
| --- | ------------------------------- | ------------------------------------------------------------------ | ---------------- | ------------ | --------- |
| 1   | aa-briefcase                    | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.559596         | 0.559596     | MATCH     |
| 2   | aa-briefcase                    | DeepSeek V4 Flash 0731 (Reasoning, Max Effort)                     | 0.415152         | 0.415152     | MATCH     |
| 3   | aa-briefcase                    | Kimi K3 (max)                                                      | 0.509724         | 0.509724     | MATCH     |
| 4   | aa-lcr                          | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.766667         | 0.766667     | MATCH     |
| 5   | aa-lcr                          | GPT-5.6 Luna (low)                                                 | 0.653333         | 0.653333     | MATCH     |
| 6   | aa-lcr                          | Kimi K3 (low)                                                      | 0.77             | 0.77         | MATCH     |
| 7   | aa-omniscience                  | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.6535           | 0.6535       | MATCH     |
| 8   | aa-omniscience                  | GPT-5.6 Luna (low)                                                 | 0.396167         | not present  | NOT_FOUND |
| 9   | aa-omniscience                  | Kimi K3 (low)                                                      | 0.4575           | not present  | NOT_FOUND |
| 10  | apex-agents                     | GLM-5.2 (max)                                                      | 0.337021         | 0.337021     | MATCH     |
| 11  | apex-agents                     | GPT-5.6 Terra (max)                                                | 0.389381         | 0.389381     | MATCH     |
| 12  | apex-agents                     | Kimi K3 (max)                                                      | 0.412979         | 0.412979     | MATCH     |
| 13  | critpt                          | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.285714         | 0.285714     | MATCH     |
| 14  | critpt                          | GPT-5.6 Luna (low)                                                 | 0.0257143        | 0.0257143    | MATCH     |
| 15  | critpt                          | Kimi K3 (low)                                                      | 0.0314286        | 0.0314286    | MATCH     |
| 16  | deepswe-1-1                     | claude-fable-5                                                     | 68.6047          | 68.6047      | MATCH     |
| 17  | deepswe-1-1                     | glm-5-2                                                            | 36.2832          | 36.2832      | MATCH     |
| 18  | deepswe-1-1                     | kimi-k3                                                            | 68.5144          | 68.5144      | MATCH     |
| 19  | frontier-code-1-1               | Claude Fable 5                                                     | 0.5273           | 0.5273       | MATCH     |
| 20  | frontier-code-1-1               | Gemini 3.7 Flash                                                   | 0.4223           | 0.4223       | MATCH     |
| 21  | frontier-code-1-1               | Kimi K3                                                            | 0.4417           | 0.4417       | MATCH     |
| 22  | gdpval-aa                       | Claude Opus 5 (Adaptive Reasoning, High Effort)                    | 0.61642          | 0.61642      | MATCH     |
| 23  | gdpval-aa                       | GPT-5.6 Luna (Non-reasoning)                                       | 0.287015         | 0.287015     | MATCH     |
| 24  | gdpval-aa                       | Kimi K3 (low)                                                      | 0.38488          | 0.38488      | MATCH     |
| 25  | gpqa-diamond                    | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.926263         | 0.926263     | MATCH     |
| 26  | gpqa-diamond                    | GPT-5.6 Luna (low)                                                 | 0.835354         | 0.835354     | MATCH     |
| 27  | gpqa-diamond                    | Kimi K3 (low)                                                      | 0.842424         | 0.842424     | MATCH     |
| 28  | humanitys-last-exam             | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.55468          | 0.55468      | MATCH     |
| 29  | humanitys-last-exam             | GPT-5.6 Luna (low)                                                 | 0.198332         | 0.198332     | MATCH     |
| 30  | humanitys-last-exam             | Kimi K3 (low)                                                      | 0.249768         | 0.249768     | MATCH     |
| 31  | ifbench                         | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.634694         | 0.634694     | MATCH     |
| 32  | ifbench                         | GPT-5.6 Sol (medium)                                               | 0.695918         | 0.695918     | MATCH     |
| 33  | ifbench                         | GPT-5.6 Terra (xhigh)                                              | 0.662585         | 0.662585     | MATCH     |
| 34  | livebench-instruction-following | claude-fable-5-max-effort                                          | 75.7707          | 75.7708      | MATCH     |
| 35  | livebench-instruction-following | gemini-3.7-flash-high                                              | 79.9253          | 79.9253      | MATCH     |
| 36  | livebench-instruction-following | kimi-k3                                                            | 71.3628          | 71.3628      | MATCH     |
| 37  | livebench-language              | claude-fable-5-max-effort                                          | 90.684           | 90.684       | MATCH     |
| 38  | livebench-language              | gemini-3.7-flash-high                                              | 85.455           | 85.455       | MATCH     |
| 39  | livebench-language              | kimi-k3                                                            | 85.528           | 85.528       | MATCH     |
| 40  | livebench-mathematics           | claude-fable-5-max-effort                                          | 95.9857          | 95.9857      | MATCH     |
| 41  | livebench-mathematics           | gemini-3.7-flash-high                                              | 93.468           | 93.468       | MATCH     |
| 42  | livebench-mathematics           | kimi-k3                                                            | 84.4368          | 84.4368      | MATCH     |
| 43  | livebench-reasoning             | claude-fable-5-max-effort                                          | 89.6538          | 89.6538      | MATCH     |
| 44  | livebench-reasoning             | gemini-3.7-flash-high                                              | 87.798           | 87.798       | MATCH     |
| 45  | livebench-reasoning             | kimi-k3                                                            | 90.673           | 90.673       | MATCH     |
| 46  | scicode                         | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.601852         | 0.601852     | MATCH     |
| 47  | scicode                         | GPT-5.6 Luna (low)                                                 | 0.456019         | 0.456019     | MATCH     |
| 48  | scicode                         | Kimi K3 (low)                                                      | 0.511574         | 0.511574     | MATCH     |
| 49  | tau3-banking                    | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.381443         | 0.381443     | MATCH     |
| 50  | tau3-banking                    | GPT-5.6 Luna (medium)                                              | 0.17732          | 0.17732      | MATCH     |
| 51  | tau3-banking                    | Kimi K3 (low)                                                      | 0.416495         | 0.416495     | MATCH     |
| 52  | terminal-bench-2-1              | Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback) | 0.846442         | 0.846442     | MATCH     |
| 53  | terminal-bench-2-1              | GPT-5.6 Luna (medium)                                              | 0.531835         | 0.531835     | MATCH     |
| 54  | terminal-bench-2-1              | Kimi K3 (low)                                                      | 0.82397          | 0.82397      | MATCH     |

## 3. Non-MATCH rows in detail

### Row 8 — `aa-omniscience` / GPT-5.6 Luna (low) — NOT_FOUND

- `sourceUrl`: `https://artificialanalysis.ai/evaluations/omniscience`
- `locator`: `model slug=gpt-5-6-luna-low; field=omniscience_breakdown.total.accuracy`
- `rawScore`: 0.39616666666666667

The evaluations page carries eval data for exactly 31 models, in the RSC field
`initialModels`. That list holds the _default_ variant slugs only:
`claude-opus-5`, `claude-opus-5-xhigh`, `claude-fable-5`, `claude-opus-5-high`,
`gpt-5-6-sol`, `grok-4-6`, `kimi-k3`, ..., `gpt-5-6-luna`, ... The slug
`gpt-5-6-luna-low` appears on the page exactly once — inside the model-picker
list, which carries only `slug`/`name`/`releaseDate`/`creator` and **no scores**.
The only omniscience number on that page for this family is
`gpt-5-6-luna` (GPT-5.6 Luna (max)), `omniscienceBreakdown.accuracy = 0.42733333333333334`.

The scraped number itself is correct: on
`https://artificialanalysis.ai/models/gpt-5-6-luna-low`, `currentModel.omniscienceBreakdown.accuracy`
is `0.39616666666666667` — exactly the stored `rawScore`.
So this is a wrong `sourceUrl`, not a wrong value.

To re-check in under a minute: fetch the model page, unescape the RSC payload
(replace backslash-quote with quote) and grep for `"omniscienceBreakdown"`.

### Row 9 — `aa-omniscience` / Kimi K3 (low) — NOT_FOUND

Same defect, same page. `rawScore` 0.4575, locator
`model slug=kimi-k3-low; field=omniscience_breakdown.total.accuracy`.
On the evaluations page only `kimi-k3` (Kimi K3 (max)) has scores, with
`omniscienceBreakdown.accuracy = 0.47583333333333333`. The stored 0.4575 is the
**low** variant and is confirmed correct at
`https://artificialanalysis.ai/models/kimi-k3-low`
(`currentModel.omniscienceBreakdown.accuracy = 0.4575`).

Note the risk this pattern carries: had the pipeline actually read the page the
locator names, it would have silently picked up the max-effort number
(0.4758 / 0.4273) for a low-effort row. The values are right today, but the
provenance recorded for them is not.

For contrast, the other AA benchmarks record `/models/<slug>` as the `sourceUrl`
whenever the row is a non-default effort variant (e.g. rows 5, 6, 14, 15, 26,
27), which is the correct behaviour. `aa-omniscience` is the only benchmark in
the sample where a variant row still points at the evaluations page.

## 4. DeepSeek rows

The sample contains exactly **one** DeepSeek row:

| #   | Benchmark    | Sampled `model`                                | Slug used           | Verdict              |
| --- | ------------ | ---------------------------------------------- | ------------------- | -------------------- |
| 2   | aa-briefcase | DeepSeek V4 Flash 0731 (Reasoning, Max Effort) | `deepseek-v4-flash` | MATCH, current build |

Verified on `https://artificialanalysis.ai/models/deepseek-v4-flash`:
`currentModel.name = "DeepSeek V4 Flash 0731 (Reasoning, Max Effort)"`,
`currentModel.briefcaseBreakdown.rubricPassRate = 0.41515151515151516`, equal to
`rawScore` at full precision. The row is the current July-31 build.

The display-name / slug inversion flagged in the brief is confirmed on the live
site, and it applies to **both** DeepSeek lines, not only Pro. Names harvested
from the page payload:

| Slug                                 | Display name                                                         | Build                        |
| ------------------------------------ | -------------------------------------------------------------------- | ---------------------------- |
| `deepseek-v4-pro`                    | DeepSeek V4 Pro 0813 (Reasoning, Max Effort)                         | current (August)             |
| `deepseek-v4-pro-0424`               | DeepSeek V4 Pro (Reasoning, Max Effort) / "DeepSeek V4 Pro 0424"     | superseded (April)           |
| `deepseek-v4-pro-0424-high`          | DeepSeek V4 Pro (Reasoning, High Effort)                             | superseded                   |
| `deepseek-v4-pro-0424-non-reasoning` | DeepSeek V4 Pro (Non-reasoning)                                      | superseded                   |
| `deepseek-v4-flash`                  | DeepSeek V4 Flash 0731 (Reasoning, Max Effort)                       | current (July 31)            |
| `deepseek-v4-flash-0420`             | DeepSeek V4 Flash (Reasoning, Max Effort) / "DeepSeek V4 Flash 0420" | superseded (April 20)        |
| `deepseek-v4-flash-0420-high`        | DeepSeek V4 Flash (Reasoning, High Effort)                           | superseded                   |
| `deepseek-v4-flash-non-reasoning`    | DeepSeek V4 Flash (Non-reasoning)                                    | bare slug, i.e. current line |

The bare slug is the current build in both families; the dated slug is the old
one. The sampled row follows that rule correctly. `deepseek-v4-pro` also appears
in the `initialModels` list of several evaluations pages (e.g. omniscience,
gpqa-diamond) under the current 0813 name, so the evaluations-page path resolves
to the current build too. No April build was found anywhere in the sample.

Related, though outside Artificial Analysis: Cognition's FrontierCode export lists
`"DeepSeek V4 Pro"` and `"DeepSeek V4 Flash 0731"` as model keys — a third naming
convention, in which the Pro key is undated. Neither is sampled, but any
cross-source join on display name would be exposed to the same trap.

## 5. Other observations

1. **Locator field names do not match the actual JSON keys** (cosmetic, but they
   make manual re-checking harder):
   - `field=briefcase_breakdown.rubric` — the real path is
     `briefcaseBreakdown.rubricPassRate`. The object also contains
     `rubricByFileType`, so "rubric" alone is ambiguous.
   - `field=omniscience_breakdown.total.accuracy` — the real path is
     `omniscienceBreakdown.accuracy`. There is **no** `total` node in the
     payload; on model pages the object has only `accuracy` and
     `hallucinationRate`, on evaluations pages it additionally has
     `attemptRate`, `byDomain`, `bySweLanguage`.
   - `field=terminalbench_v2_1` — `terminalbenchV21`; `field=tau_banking` —
     `tauBanking`; `field=apex_agents` — `apexAgents`;
     `field=gdpval_normalized` — `gdpvalNormalized`. These are consistent
     snake_case renderings of the camelCase keys and resolve unambiguously.
2. **`unit: "percent"` is used for two different scales.** AA and FrontierCode
   rows store 0–1 fractions (e.g. 0.5273); LiveBench and DeepSWE rows store 0–100
   (e.g. 90.684, 68.6047). `normalized` is computed correctly in both cases
   (x100 for the fractions, identity for the rest), so no score is wrong, but the
   `unit` label alone does not tell a reader which scale `rawScore` is on.
3. **DeepSWE stores fractions; the sample stores percent.** Source `pass_rate`
   for `mini_swe_agent_claude_fable_5_high` is `0.686046511627907`; the sample
   holds `68.6046511627907`. Correct x100 conversion, noted so nobody re-checks
   it as a mismatch.
4. **FrontierCode Kimi K3 row carries `effort: "max"` while the source bucket is
   `"none"`** (row 21). The export's `v1_1.efforts["Kimi K3"]` is `["none"]` —
   Cognition ran a single unlabelled configuration. The locator correctly reads
   `["none"]`, so the value is right, but the `max` effort label is a pipeline
   inference, not something the source states. The same pattern would apply to any
   `none`-effort FrontierCode model (SWE-1.7, Kimi K2.7, Composer 2.5, GLM 5.2).
5. **LiveBench `kimi-k3` rows carry `effort: "max"` with no source support**
   (rows 36, 39, 42, 45). The CSV row id is the bare `kimi-k3`; LiveBench's own
   bundle metadata gives it `displayName: "Kimi K3"` with no effort suffix and no
   `variants` list, unlike `claude-fable-5-max-effort` (which explicitly declares
   max/xhigh variants) or `gemini-3.7-flash-high`. Again an inference, not a
   scrape error.
6. **Sources are current as of this audit; nothing drifted since `retrievedAt`.**
   - LiveBench: the site bundle (`static/js/main.d02aefd7.js`) still lists
     `2026-06-25` as the newest release and `?v=1787033560` as the cache version,
     i.e. exactly the CSV the sample cites. All 12 LiveBench values still
     reproduce to the last decimal.
   - DeepSWE: `generated_at = 2026-08-13T16:11:55Z`, older than the `retrievedAt`
     of 2026-08-18; unchanged.
   - Cognition FrontierCode: no timestamp field in the export; all three values
     reproduce exactly.
   - Artificial Analysis: all 34 resolvable AA values reproduce exactly, one day
     after capture.
7. **LiveBench category composition was verified against the live
   `categories_2026_06_25.json`**, not assumed: Reasoning =
   theory_of_mind / zebra_puzzle / spatial / logic_with_navigation; Mathematics =
   AMPS_Hard / integrals_with_game / math_comp / olympiad; Language =
   connections / plot_unscrambling / typos (3 tasks); IF =
   paraphrase / simplify / story_generation / summarize. Every sampled `rawScore`
   is the unweighted mean of exactly those columns. The excluded categories
   (Coding, Agentic Coding, Data Analysis) do not leak into any sampled value.
8. **`model` strings match the source's raw names** in every row. AA rows carry
   the full `name` field (e.g. "Claude Fable 5 (Adaptive Reasoning, Max Effort,
   Opus 4.8 Fallback)", "Kimi K3 (max)"), LiveBench rows carry the CSV row id,
   DeepSWE rows carry the JSON `model` field, FrontierCode rows carry the data
   key. No row was found to belong to a different model than it claims.
9. **`aa-briefcase` mixes URL styles for a defensible reason.** Row 2 uses
   `/models/deepseek-v4-flash` while rows 1 and 3 use `/evaluations/aa-briefcase`.
   The briefcase evaluations page carries only 20 models and DeepSeek V4 Flash is
   not among them, so the model page is the only place the value exists. This is
   correct behaviour, not an inconsistency.
10. **AA reports two different omniscience numbers per model** — a top-level
    `omniscience` (e.g. 43.3 for Claude Fable 5, 3.9167 for Kimi K3 (low)) and
    `omniscienceBreakdown.accuracy` (0.6535 / 0.4575). The pipeline uses
    `accuracy`, which is the right choice for a 0–100 normalized accuracy score;
    flagged only so the two are never confused.

## 6. Method

Values were read from the raw source artefacts, not from rendered screenshots.
For Artificial Analysis, the Next.js RSC payload was unescaped and the model
records were parsed out of `initialModels` (evaluations pages) and `currentModel`
(model pages) by brace-balanced extraction, then compared field by field at full
float precision. `"$undefined"` was treated as missing. Tolerance applied: 0.0005
on fraction-scaled rows, 0.05 on 0–100 rows. No row needed the tolerance — every
MATCH was exact to the stored precision.
