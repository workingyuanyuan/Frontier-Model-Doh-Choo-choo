# Scoring Methodology v1

## Metric normalization

Every benchmark metric has a versioned transform and fixed anchors. No transform uses the current model cohort.

- Percentage/accuracy/solve rate: `100 × (raw - lower) / (upper - lower)`, clamped to 0–100.
- Lower-is-better: `100 × (upper - raw) / (upper - lower)`, clamped to 0–100.
- Human/random anchors replace generic 0/100 bounds when the benchmark documents them.
- Rank is display-only. Elo is eligible only within an explicitly comparable pool/version. Different pass@k values never mix.
- Custom/reward metrics require documented bounds; otherwise they remain display-only.

The stored audit tuple is raw value/unit, normalized value, method/version, anchors and clipping rule.

The first committed mapping pins LiveBench release `2024-11-25` to its 1,000-observation inventory hash and 18 task metrics. Each official task mean is already expressed as a percentage and uses `FIXED_PERCENTAGE_V1` with anchors 0 and 100. The mapping supplies Reasoning (including the three structured data-analysis tasks), Math, Language, Instruction and Coding. It intentionally supplies no Knowledge, Agentic or Context weight; those dimensions remain null until an appropriate independent source is admitted.

## Benchmark and dimension aggregation

1. Select one reviewed result per canonical key using source precedence; conflicts are excluded.
2. Aggregate related subtests inside a benchmark family before dimension weighting.
3. Count only the versioned primary-dimension mapping in v1; secondary dimensions are descriptive.
4. Dimension score is the configured weighted mean of available, eligible benchmark-family scores.
5. Dimension coverage is available configured weight divided by total eligible configured weight. Missing rows stay null.

A dimension is formal when coverage is at least 50% and includes at least one benchmark-official or independent-evaluator row. Otherwise its status is provisional/insufficient.

## Confidence

For each included family, evidence quality is source tier × freshness: benchmark official 1.00, independent 0.90, vendor 0.50, secondary 0.25, unverified 0; freshness is 1.00 fresh, 0.80 aging, 0.50 stale. Dimension confidence is `100 × coverage × weighted mean(evidence quality)`, clamped 0–100. These constants and freshness windows are versioned configuration, not hidden code.

## Overall score and eligibility

- Absolute Capability Score is the equal-weight mean of the eight dimension scores (12.5% each), calculated on unrounded values.
- Verified ranking requires all eight formal dimensions, overall coverage ≥65%, independent-source share ≥50%, and no blocking quality flag.
- A model with at least six formal dimensions and overall coverage ≥50% may receive a separately labelled provisional score over available dimensions; weights renormalize only inside the provisional cohort.
- Models below that threshold remain visible but unranked. Missing data is never penalized or rewarded as a fabricated score.
- Verified and provisional rankings never share a rank sequence.

Ties compare unrounded overall score, then confidence, coverage and stable model-variant ID. Every publish stores the scoring method version and a sensitivity report.

`absolute-capability-v1` is seeded as `DRAFT` with formal publication disabled. Its eight overall dimension weights are 0.125 each, while per-dimension LiveBench task weights sum to one. Changing mappings or thresholds requires a new scoring-method version rather than mutating the existing seed.
