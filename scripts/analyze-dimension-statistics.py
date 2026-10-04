"""Pairwise, missingness-aware checks on the canonical current-results export.

Run the companion TypeScript exporter first. No absent score is filled or
per-benchmark best-effort score constructed. These are descriptive diagnostics.
"""
import json
from pathlib import Path
from itertools import combinations
import numpy as np
import pandas as pd
from scipy.stats import spearmanr

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "tmp/dimension-statistics/effective-results.json"
OUT = ROOT / "docs/analysis/2026-10-03-dimension-statistics.json"
data = json.loads(INPUT.read_text(encoding="utf-8"))
rows = pd.DataFrame(data["rows"])
assert not rows.duplicated(["profileId", "benchmarkId"]).any()
dimensions = {b["id"]: b["primaryDimension"] for b in data["benchmarks"]}
all_ids = sorted(dimensions)
excluded = data["qualityPolicy"]["excludedBenchmarkIds"]
quality_ids = [b for b in all_ids if b not in excluded]
matrix = rows.pivot(index="profileId", columns="benchmarkId", values="score").reindex(columns=all_ids)
profile_meta = rows[["profileId", "modelId", "effort"]].drop_duplicates()
assert not profile_meta.duplicated("profileId").any()
effort_rank = {e: i for i, e in enumerate(["default", "non-reasoning", "low", "medium", "high", "xhigh", "max"])}
profile_meta["coverage"] = profile_meta.profileId.map(matrix[quality_ids].count(axis=1))
profile_meta["effortRank"] = profile_meta.effort.map(effort_rank)
best = profile_meta.sort_values(["modelId", "coverage", "effortRank", "profileId"], ascending=[True, False, False, True]).drop_duplicates("modelId")
base_matrix = matrix.loc[best.profileId].copy()
base_matrix.index = best.modelId
source_sets = rows.groupby("benchmarkId").sourceId.agg(lambda s: sorted(set(s))).to_dict()
source_counts = rows.groupby(["benchmarkId", "sourceId"]).size()
dominant_sources = {b: source_counts[b].idxmax() for b in all_ids}


def finite(value):
    return float(value) if np.isfinite(value) else None


def mean(values):
    values = [v for v in values if v is not None]
    return float(np.mean(values)) if values else None


def pair_summary(pairs, grouping=None):
    grouping = grouping or dimensions
    pairs = [{**p, "sameDimension": grouping[p["a"]] == grouping[p["b"]]} for p in pairs]
    within = [p["rho"] for p in pairs if p["sameDimension"]]
    between = [p["rho"] for p in pairs if not p["sameDimension"]]
    wi, be = mean(within), mean(between)
    return {"pairCount": len(pairs), "withinPairCount": len(within), "betweenPairCount": len(between), "withinMeanRho": wi,
            "betweenMeanRho": be, "contrast": wi - be if wi is not None and be is not None else None,
            "meanRho": mean([p["rho"] for p in pairs]),
            "overlapRange": [min(p["n"] for p in pairs), max(p["n"] for p in pairs)] if pairs else None,
            "byDimension": {d: {"pairCount": len(ps := [p for p in pairs if p["sameDimension"] and grouping[p["a"]] == d]),
                               "meanRho": mean([p["rho"] for p in ps])} for d in sorted(set(grouping.values()))},
            "byDominantSourceRelation": {relation: {"pairCount": len(ps := [p for p in pairs if p["sameDominantSource"] == same]),
                                                          "meanRho": mean([p["rho"] for p in ps]),
                                                          "withinMeanRho": mean([p["rho"] for p in ps if p["sameDimension"]]),
                                                          "betweenMeanRho": mean([p["rho"] for p in ps if not p["sameDimension"]])}
                                          for relation, same in [("same", True), ("different", False)]}}


def analyze(mat, ids):
    selected = mat[ids]
    overlap = selected.notna().astype(int).T @ selected.notna().astype(int)
    pairs = []
    residual_pairs = []
    # Per-benchmark empirical percentiles preserve ordering and handle unequal scales.
    ranks = selected.rank(pct=True)
    for a, b in combinations(ids, 2):
        valid = selected[[a, b]].dropna()
        n = len(valid)
        if n < 15:
            continue
        if valid[a].nunique() < 2 or valid[b].nunique() < 2:
            continue
        pair = {"a": a, "b": b, "n": n, "rho": finite(spearmanr(valid[a], valid[b]).statistic),
                "sameDimension": dimensions[a] == dimensions[b], "sameDominantSource": dominant_sources[a] == dominant_sources[b]}
        pairs.append(pair)
        others = ranks.loc[valid.index].drop(columns=[a, b])
        common = others.median(axis=1).where(others.count(axis=1) >= 5)
        resid_valid = common.notna()
        if resid_valid.sum() >= 15:
            rr = valid.loc[resid_valid].rank(pct=True)
            design = np.column_stack([np.ones(resid_valid.sum()), common[resid_valid]])
            residuals = rr.to_numpy() - design @ np.linalg.lstsq(design, rr.to_numpy(), rcond=None)[0]
            if np.std(residuals, axis=0).min() > 1e-12:
                residual_pairs.append({**pair, "n": int(resid_valid.sum()), "rho": finite(np.corrcoef(residuals.T)[0, 1])})
    overlaps = [int(overlap.loc[a, b]) for a, b in combinations(ids, 2)]
    summary = pair_summary(pairs)
    summary.update({"rowCount": len(mat), "benchmarkCount": len(ids), "observedScoreCount": int(selected.count().sum()),
                    "missingShare": finite(selected.isna().to_numpy().mean()),
                    "benchmarkCounts": {b: int(selected[b].count()) for b in ids},
                    "overlaps": {"possiblePairs": len(overlaps), "nAtLeast15": sum(n >= 15 for n in overlaps), "nAtLeast20": sum(n >= 20 for n in overlaps),
                                 "median": finite(np.median(overlaps)), "minimum": min(overlaps), "maximum": max(overlaps)},
                    "medscribePairs15": sorted([p for p in pairs if "medscribe" in [p["a"], p["b"]]], key=lambda p: p["rho"], reverse=True),
                    "medscribePairs20": sorted([p for p in pairs if "medscribe" in [p["a"], p["b"]] and p["n"] >= 20], key=lambda p: p["rho"], reverse=True),
                    "commonFactorResidualDiagnostic": pair_summary(residual_pairs)})
    return summary, pairs, residual_pairs


diagnostics = {}
for label, mat, ids in [("profilesAll54", matrix, all_ids), ("profilesQuality52", matrix, quality_ids),
                        ("oneProfilePerModelAll54", base_matrix, all_ids), ("oneProfilePerModelQuality52", base_matrix, quality_ids)]:
    summary, pairs, residual_pairs = analyze(mat, ids)
    diagnostics[label] = {"summary": summary, "pairs": pairs, "residualPairs": residual_pairs}

frontier_ids = ["anthropic-claude-opus-5-5", "anthropic-claude-sonnet-5-5", "anthropic-claude-fable-5-1", "openai-gpt-6-astra", "google-gemini-4-argon", "openai-gpt-6-1-sol"]
frontier_best = best[best.modelId.isin(frontier_ids)]
frontier_matrix = base_matrix.loc[frontier_ids, quality_ids]
common_ids = frontier_matrix.columns[frontier_matrix.notna().all(axis=0)].tolist()
assert len(all_ids) == 54 and len(quality_ids) == 52
assert len(best) == rows.modelId.nunique() <= data["counts"]["qualifiedModels"]
assert len(frontier_matrix) == 6
frontier_complete = frontier_matrix[common_ids]
frontier_rank = frontier_complete.rank(axis=0)
singular = np.linalg.svd(frontier_rank.to_numpy() - frontier_rank.mean(axis=0).to_numpy(), compute_uv=False)
frontier_info = {"modelIds": frontier_ids, "profiles": frontier_best[["modelId", "profileId", "effort", "coverage"]].to_dict("records"),
                 "commonBenchmarks": common_ids, "commonBenchmarkCount": len(common_ids), "matrix": frontier_complete.to_dict("index"),
                 "dimensionBenchmarkCounts": {d: sum(dimensions[b] == d for b in common_ids) for d in sorted(set(dimensions.values()))},
                 "matrixRank": int(np.linalg.matrix_rank(frontier_rank.to_numpy() - frontier_rank.mean(axis=0).to_numpy())),
                 "rankVarianceExplained": (singular ** 2 / (singular ** 2).sum()).tolist(),
                 "benchmarkSpread": {b: {"minimum": float(frontier_complete[b].min()), "maximum": float(frontier_complete[b].max()),
                                           "range": float(frontier_complete[b].max() - frontier_complete[b].min()),
                                           "mean": float(frontier_complete[b].mean()), "sd": float(frontier_complete[b].std(ddof=1)),
                                           "uniqueScores": int(frontier_complete[b].nunique())} for b in common_ids},
                 "interpretation": "Six model rows cannot establish latent dimension count: centered rank is at most five. No n>=15 pairs are possible. SVD is only an algebraic diagnostic."}
candidate_five = {b: dimensions[b] for b in common_ids}
for b in ["gdp-pdf", "gdp-xlsx", "aa-lcr", "medscribe"]:
    candidate_five[b] = "information"
for b in common_ids:
    if candidate_five[b] == "coding" or b == "cyber":
        candidate_five[b] = "software"
    if candidate_five[b] == "agentic":
        candidate_five[b] = "action"
candidate_four = {b: ("analytical" if d in ["knowledge", "reasoning"] else "workflow" if d == "action" else d) for b, d in candidate_five.items()}
candidate_four_medscribe_workflow = {**candidate_four, "medscribe": "workflow"}
taxonomy_mappings = {"current5": {b: dimensions[b] for b in common_ids}, "candidate5": candidate_five,
                     "candidate4": candidate_four, "candidate4MedScribeWorkflow": candidate_four_medscribe_workflow}
candidate_diagnostics = {}
for label in ["profilesQuality52", "oneProfilePerModelQuality52"]:
    selected_diagnostic = diagnostics[label]
    common_pairs = [p for p in selected_diagnostic["pairs"] if p["a"] in common_ids and p["b"] in common_ids]
    common_residual = [p for p in selected_diagnostic["residualPairs"] if p["a"] in common_ids and p["b"] in common_ids]
    candidate_diagnostics[label] = {**{name: pair_summary(common_pairs, group) for name, group in taxonomy_mappings.items()},
                                    **{name + "Residual": pair_summary(common_residual, group) for name, group in taxonomy_mappings.items()},
                                    **{name + "Overlap20": pair_summary([p for p in common_pairs if p["n"] >= 20], group) for name, group in taxonomy_mappings.items()},
                                    "informationPairs": [p for p in common_pairs if candidate_five[p["a"]] == candidate_five[p["b"]] == "information"],
                                    "informationResidualPairs": [p for p in common_residual if candidate_five[p["a"]] == candidate_five[p["b"]] == "information"],
                                    "softwarePairs": [p for p in common_pairs if candidate_five[p["a"]] == candidate_five[p["b"]] == "software"]}
taxonomy_score_sensitivity = {}
for name, grouping in taxonomy_mappings.items():
    for drop_proof in [False, True]:
        groups = sorted(set(grouping.values()))
        dimension_scores = {d: frontier_complete[[b for b in common_ids if grouping[b] == d and (not drop_proof or b != "proofbench")]].mean(axis=1) for d in groups}
        overall = pd.DataFrame(dimension_scores).mean(axis=1)
        taxonomy_score_sensitivity[name + ("WithoutProofBench" if drop_proof else "")] = {"scoreConvention": "Exploratory arithmetic mean of benchmarks within each dimension and equal dimension means; not product score-policy output.",
            "ranking": [{"modelId": m, "score": float(s)} for m, s in overall.sort_values(ascending=False).items()],
            "dimensionScores": pd.DataFrame(dimension_scores).to_dict("index")}
out = {"referenceDate": data["referenceDate"], "extractionCounts": data["counts"],
       "method": {"effectiveSelection": data["method"], "minimumPairOverlap": 15, "correlation": "Spearman rho using observed pairs with tied average ranks; simple unweighted mean across eligible pairs.",
                  "dimensionAssignment": "Current primaryDimension only; secondary tags do not make duplicate observations.",
                  "baseModelSensitivity": "Choose one fixed profile per model by highest quality52 coverage, then highest effort, then lexicographic profile ID. Never choose a profile per benchmark.",
                  "residualDiagnostic": "Exclude the two target benchmarks; median observed benchmark percentile rank per row from >=5 other scores. Regress pair-specific ranks linearly on that median and correlate residuals. Changes in source mixture, score availability and residual common factor can confound this proxy; it is not a factor model.",
                  "uncertainty": "No p-values or latent dimension count. Shared profiles, related model families, common training and overlapping test tasks violate simple independent-pair assumptions; model collapsing only partially addresses dependence."},
       "excludedQualityBenchmarks": excluded, "limitedQualityBenchmarks": data["qualityPolicy"]["limitedBenchmarkIds"],
       "comparisonOnlyBenchmarks": data["comparisonOnlyBenchmarkIds"], "benchmarkSources": source_sets,
       "chosenBaseModelProfiles": best[["modelId", "profileId", "effort", "coverage"]].to_dict("records"),
       "diagnostics": diagnostics, "approvedSixCommonCore": frontier_info,
       "candidateCommon21Groupings": taxonomy_mappings, "historicalCommon21TaxonomyDiagnostic": candidate_diagnostics,
       "frontierTaxonomyScoreSensitivity": taxonomy_score_sensitivity}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
def f(value):
    return f"{value:.4f}" if value is not None else "—"


lines = ["# Dimension statistics — 2026-10-03", "",
         "The refreshed evidence retains modest separation under the current five groups. The measured separation does not establish an optimal dimension count. The common 21 benchmarks provide a different task mix, and its candidate partitions change the result when general performance is controlled with a descriptive proxy.", "",
         "## Evidence and selection", "",
         "The companion exporter calls `loadWorkspaceCoverageData` and reproduces coverage-matrix steps 1–7: source whitelist, comparison-only exclusion, canonical product-effort policy, included non-null resolved candidates, canonical current-result selection, qualified-model and mapped-benchmark filtering. The optimizer is never invoked. There are 7,096 source candidates, 7,078 after whitelist/comparison filtering, 2,766 eligible candidates and 2,598 effective selected rows. The profile × benchmark uniqueness assertion passes. The population has 201 profiles and 64 base models with scores, drawn from 66 qualified catalog models.", "",
         "There are 54 active benchmarks and 52 quality-eligible benchmarks after excluding `aime` and `programbench`. `frontier-swe-v2` is comparison-only. The existing limited-benchmark balance rule is retained as metadata; these diagnostics analyze the eligible pool rather than generating a preset. Missing results remain missing.", "",
         "## SPEC §4.6 reproduction", "",
         "Spearman rho uses the same observed product profiles for each benchmark pair, with at least 15 rows. Summary correlations are unweighted means over computable pairs. Current primary dimension alone determines within/between assignment.", "",
         "| Population | Benchmarks | Pairs | Within rho | Between rho | Difference |", "|---|---:|---:|---:|---:|---:|"]
for label, diag in diagnostics.items():
    s = diag["summary"]
    lines.append(f"| {label} ({s['rowCount']} rows) | {s['benchmarkCount']} | {s['pairCount']} | {f(s['withinMeanRho'])} | {f(s['betweenMeanRho'])} | {f(s['contrast'])} |")
lines += ["", "The one-profile-per-model sensitivity picks a fixed profile by largest quality52 coverage, highest effort on a tie, then lexicographic profile ID. Its 64 rows are never assembled from per-benchmark best scores. The overall five-group contrast changes little, suggesting repeated effort profiles do not drive this particular contrast. Model family, provider, training, and task dependence remain.", "",
          "Quality52 profile observations are 76.33% missing; the fixed base-model matrix is 52.76% missing. Of 1,326 possible benchmark pairs, 873 qualify at n≥15 and 683 at n≥20 in the profile matrix. In the base-model matrix, 818 qualify at n≥15 and 540 at n≥20. Eligible pairs therefore measure different model cohorts. Pairwise correlation matrices assembled this way need not be positive semidefinite or describe any single joint sample.", "",
          "| Current group (quality52) | Profile pair count | Profile mean rho | Base-model pair count | Base-model mean rho |", "|---|---:|---:|---:|---:|"]
for dim in sorted(set(dimensions.values())):
    p = diagnostics["profilesQuality52"]["summary"]["byDimension"][dim]
    b = diagnostics["oneProfilePerModelQuality52"]["summary"]["byDimension"][dim]
    lines.append(f"| {dim} | {p['pairCount']} | {f(p['meanRho'])} | {b['pairCount']} | {f(b['meanRho'])} |")
lines += ["", "## General-performance and source diagnostics", "",
          "For each pair, the residual proxy takes the median empirical percentile rank over the row’s other observed benchmarks, requiring at least five; it excludes the two target scores. Pair-specific benchmark ranks are regressed on that median, and their residuals are correlated. This is a descriptive partial-rank diagnostic, not an estimated latent factor. Changing coverage and source mixtures can bias the median.", "",
          "On quality52, mean correlation across eligible pairs is 0.5462 before this control and 0.0754 afterward for profiles; it is 0.5368 and 0.0686 for base models. Current-group residual within/between differences are +0.1317 and +0.1472. The residual sample also requires enough other observed scores, so pair counts change slightly. This proxy is consistent with broad performance accounting for much of the raw positive association while task-specific structure remains.", "",
          "Benchmarks sharing a dominant selected source have profile raw mean rho 0.5390, compared with 0.5488 for different-source pairs. Residual means are 0.1198 and 0.0593. Source is not interchangeable with task: this classification uses each benchmark’s modal selected source, and individual rows may come from different sources. Shared harnesses, source model coverage and published-score selection can all confound comparisons. Correlations establish neither causal capabilities nor cross-source validity.", "",
          "## MedScribe reevaluation", "",
          "The §4.6 n≥20 follow-up condition is reached for all three other current Language benchmarks: LiveBench Language rho 0.3488 (n=31), Complex Constraints 0.3276 (n=22), and LiveBench Instruction Following −0.0181 (n=31). These values are identical after the fixed-profile model collapse. MedScribe has 46 qualifying pairs across all54, including 35 at n≥20; quality52 has 44, including 33 at n≥20.", "",
          "MedScribe correlates more with professional workflow benchmarks: Legal Research 0.7939 (n=37), Corporate Finance 0.7417 (n=28), Public Benefits 0.7248 (n=28), and Finance Agent v2 0.6172 (n=36). Those four share its source, so task and source explanations remain entangled. Other-source DayJob Healthcare is 0.7766 (n=18), below the follow-up threshold. These observations support reassessing Language, but do not uniquely identify its replacement group.", "",
          "## Same-common21 candidate partition checks", "",
          "These checks reuse all historical qualified rows restricted to exactly the same 21 benchmark columns. They do not infer factors from the six currently selected frontier models. Candidate mappings are saved in JSON: four groups combine candidate5 Reasoning and Knowledge into Analytical; the workflow alternative also moves MedScribe from Information to Workflow.", "",
          "| Partition | Profile raw difference | Base raw difference | Profile residual difference | Base residual difference |", "|---|---:|---:|---:|---:|"]
for name in taxonomy_mappings:
    p, b = candidate_diagnostics["profilesQuality52"], candidate_diagnostics["oneProfilePerModelQuality52"]
    lines.append(f"| {name} | {f(p[name]['contrast'])} | {f(b[name]['contrast'])} | {f(p[name+'Residual']['contrast'])} | {f(b[name+'Residual']['contrast'])} |")
lines += ["", "Candidate partitions improve raw contrast over the current common21 grouping. The raw advantage of four groups over candidate5 reverses under the residual control. MedScribe’s workflow alternative raises the raw contrast, but residual preference depends on whether repeated effort profiles are retained. These diagnostics cannot choose the number or names of dimensions.", "",
          "The proposed Information group has only three of six possible n≥15 pairs: AA LCR × GDP PDF, AA LCR × MedScribe, and GDP PDF × MedScribe. GDP XLSX is too sparsely observed to test any of its three groupmates at this threshold. On the model-aware sensitivity the corresponding rhos are 0.5905 (n=22), 0.3903 (n=15) and 0.6106 (n=15); at n≥20 only the first remains. This is weak evidence for a coherent new group.", "",
          "Moving Cyber into Software conflicts with raw model-aware task correlations: Cyber × IOI −0.0287 (n=23), × Code Migration 0.1589 (n=25), × Vibe Code Bench 0.1562 (n=25), and × SciCode 0.2821 (n=15). Other computable coding-group pairs range 0.6436–0.8860. Cyber may deserve that grouping by task semantics, but correlation does not support describing it as the same measured capability.", "",
          "## Current-six coverage and score sensitivity", "",
          "Each current frontier model’s highest-coverage fixed profile matches the approved AA profile: Opus 5.5 max, Sonnet 5.5 max, Fable 5.1 max, GPT 6 Astra max, Gemini 4 Argon high and GPT-6.1 Sol max. Their exact common core has 21 quality-eligible benchmarks, with all 126 scores present. The centered matrix can have rank at most five, and no benchmark pair can meet n≥15. A latent-dimension-count claim from these six rows would be unsupported.", "",
          "ProofBench is 99–100 across these six, mean 99.5 and only two distinct scores. Under candidate5 it is half of the Reasoning dimension, hence one tenth of equal-dimension Overall. The remaining CritPt range is 4.57. Candidate4 puts ProofBench among five Analytical tests, reducing its implicit benchmark weight to 1/20. The JSON includes per-benchmark minimum, maximum, range, standard deviation and unique-score counts.", "",
          "Exploratory scoring takes benchmark arithmetic means within groups and equally averages group means. Under candidate5, Gemini precedes Opus by 0.1783 points; dropping ProofBench makes Opus precede Gemini by 0.1788. Candidate4 retains Gemini then Opus with or without ProofBench. These are weighting sensitivities of the specified common21 matrix, not a proposed leaderboard or dimension validation.", "",
          "## Reproduction and checks", "", "```powershell", "pnpm exec tsx scripts/analyze-dimension-statistics.ts", "python scripts/analyze-dimension-statistics.py", "```", "",
          "The exporter rejects duplicate profile×benchmark cells; the Python analysis asserts the 54/52 benchmark counts, profile identity uniqueness, one row per evidenced model, and six-model completeness. JSON serialization rejects NaN. Every pair stores its exact overlap n and both benchmark IDs; the JSON retains the fixed selected-profile list and benchmark source sets."]
OUT.with_suffix(".md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(json.dumps({k: {f: v["summary"][f] for f in ["rowCount", "pairCount", "withinMeanRho", "betweenMeanRho", "contrast"]} for k, v in diagnostics.items()}, indent=2))
print(json.dumps({"common21Candidate": candidate_diagnostics, "scores": taxonomy_score_sensitivity}, indent=2))
