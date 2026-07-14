# Data Methodology

## Evidence lifecycle

1. Fetch only a source-registry URL over HTTPS with redirect, timeout and size limits.
2. Save exact bytes, retrieval time, headers, final URL, SHA-256 and connector/parser version.
3. Parse into source-shaped rows; never discard unknown fields from the raw artifact.
4. Validate types, units, ranges, dates and required evaluation configuration.
5. Resolve benchmark, model variant and alias. Ambiguous matches enter review.
6. Detect duplicate and conflicting canonical result keys.
7. Publish only reviewed rows in one transaction; rejected rows remain auditable.

## Canonical identity

- A model entry identifies provider, family, product version/snapshot, hosted/open-weight form and lifecycle state.
- An effort or reasoning setting is a distinct model variant when it changes evaluation behavior.
- Aliases are scoped to source. Safe normalization is limited to Unicode normalization, trim, case-folding and whitespace collapse.
- String similarity may suggest candidates but can never permanently merge identities.
- Every alias in a pinned ingestion inventory must have exactly one source-controlled decision: an HTTPS-evidence-backed canonical mapping or an explicit exclusion.
- Benchmark-private checkpoints, invalid model identities and unverifiable source-local aliases are excluded rather than guessed. Their staged rows remain auditable with `EXCLUDED` status, a machine-readable reason and a null canonical variant ID.

## Result identity

A canonical result is unique by model variant, benchmark version, metric, evaluation configuration and evaluation date/snapshot. The configuration hash includes harness, prompt/shot setting, tool/network access, attempt count and relevant effort parameters.

## Duplicate and precedence policy

- Exact source duplicates collapse by raw fingerprint while retaining all evidence locators.
- Conflicting values for the same canonical key block automatic publication.
- Precedence is benchmark official, independent evaluator, vendor reported, secondary aggregator, unverified.
- A lower-tier row never replaces a higher-tier published row automatically.
- LiveBench question scores are averaged within task, then complete task scores are equally averaged within category, matching the official result script. Identical repeated canonical observations collapse with an audit count; different scores for one canonical observation key remain a blocking conflict until a source-backed evaluation-run selection policy exists.
- Expected coverage is derived from the SHA-pinned six-category question inventory, never from the judgment artifact or from model alias status. Explicitly excluded aliases cannot reduce the denominator, and incomplete task/category scores remain null.
- The formal LiveBench denominator comes from all six official question datasets for one explicit release, not from whichever categories happen to exist in `model_judgment`. Release selection includes the chosen release and earlier configured releases, excludes questions whose removal date is on or before the chosen release, rejects duplicate question IDs and expands each retained question into its declared turns.
- The first pinned inventory targets public release `2024-11-25`: 1,000 observations across 18 tasks and six categories. Its derived prompt-free evidence JSON binds all six dataset revisions, Parquet paths, linked sizes and ETags and is stored under SHA-256 `b8a90d2f2308b774fbee982178d433412fd6f349429be2a41def4331b0ee4027`. This establishes the denominator only; it does not resolve conflicting judgments or authorize publication.
- Staged judgments are admitted only when category, task, question ID and turn exactly match that inventory. An unknown question/turn is reported outside the release; a known question/turn with different category or task metadata fails closed. Coverage counts distinct staged inventory keys regardless of model alias exclusion, while only canonical `VALIDATED` rows may contribute scores.
- The pinned judgment artifact covers 318/1,000 release observation keys: coding 128/128, language 140/140, instruction-following 50/200, reasoning 0/150, math 0/232 and data-analysis 0/150. The remaining 682 observations are missing, not zero-valued.
- Revision-bound recovery adds the latest earlier official six-category artifact without mutating either source. Distinct inventory keys are unioned only for evidence coverage: current revision `9704e5d` covers 318, historical revision `5896e3b` covers 700, and their union covers 800/1,000. Data-analysis, coding, language and math have full source evidence; instruction-following is 50/200 and reasoning is 100/150. The remaining 200 observations stay missing.
- Coverage union is not score precedence. The historical rows are not yet admitted to per-model aggregation, and overlapping revisions do not select a winner. The current staged artifact's 201 canonical conflicts split into 64 keys already conflicting within one exact raw model spelling and 137 that conflict only after reviewed aliases merge. Although the official generator keeps the final JSONL occurrence for one exact `(question_id, model)`, the published Parquet lacks answer/run/version lineage; `tstamp`, row position and alias spelling therefore remain invalid winner keys.
- Result promotion is task-scoped and transactionally idempotent. Only an exact release task with every expected observation present and no score conflict receives a published benchmark result; incomplete or conflicting tasks remain staged. The publication key binds ingestion run, canonical model variant, task metric and source snapshot. A result-level evidence locator preserves the run, inventory hash, release, category, task, denominator and snapshot, so every aggregate can be reconstructed without treating it as a formal ranking.
- Score generation reads only promoted results bound to the exact evaluation config and primary source evidence. It applies fixed 0–100 anchors and versioned task weights, records component result IDs, and emits all eight dimensions in canonical order. Unsupported or absent dimensions stay null with zero coverage; no value is imputed. Snapshot content hashes bind the edition date, data cutoff, scoring method, source snapshots and deterministically ordered entries. An existing edition/method pair is reused only when its hash matches exactly; changed content fails closed.

## Quality flags

`VERIFIED`, `PROVISIONAL`, `VENDOR_REPORTED`, `STALE`, `LOW_COVERAGE`, `SOURCE_UNAVAILABLE`, `MANUAL_REVIEW_REQUIRED`, `CONFLICTING`, `PARSER_FAILED`.

## Reference data policy

`reference-table-data/` contains 2026-07 Scale Labs HTML/Next Flight snapshots, JavaScript chunks and derived Markdown tables. It is preserved as research, seed and parser fixtures. Until live-source, terms and row-level provenance checks pass, imports from it remain `PROVISIONAL` and cannot enter the verified ranking.
