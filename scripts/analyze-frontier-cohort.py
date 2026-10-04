"""Reproduce the approved AA gap rule and its complete-profile benchmark core.

Run from the repository root after scripts/analyze-dimension-statistics.ts.
This writes analysis artifacts, not the production taxonomy or ProductVersion.
"""

import hashlib
import json
import statistics
from pathlib import Path


def gap_boundary(scores, multiplier=2.0):
    """Return an unambiguous positive largest gap meeting the relative threshold."""
    if len(scores) < 3 or any(a < b for a, b in zip(scores, scores[1:])):
        raise ValueError("Need at least three scores in descending order")
    gaps = [a - b for a, b in zip(scores, scores[1:])]
    largest = max(gaps)
    if largest <= 0 or gaps.count(largest) != 1:
        return {"status": "review", "reason": "no unique positive largest gap", "gaps": gaps}
    index = gaps.index(largest)
    other_median = statistics.median(gaps[:index] + gaps[index + 1 :])
    accepted = largest >= multiplier * other_median
    return {
        "status": "selected" if accepted else "review",
        "modelCount": index + 1 if accepted else None,
        "largestGap": largest,
        "otherGapMedian": other_median,
        "gapRatio": largest / other_median if other_median else None,
        "multiplier": multiplier,
        "gaps": gaps,
    }


def main():
    assert gap_boundary([10, 9, 8, 3, 2])["modelCount"] == 3
    assert gap_boundary([10, 10, 10])["status"] == "review"
    assert gap_boundary([10, 8, 6, 4])["status"] == "review"
    assert gap_boundary([10, 10, 5, 5])["modelCount"] == 2
    product_path = Path("data/product/current.json")
    product = json.loads(product_path.read_text(encoding="utf-8"))
    effective = json.loads(Path("tmp/dimension-statistics/effective-results.json").read_text(encoding="utf-8"))
    aa = [e for e in product["evidence"] if e["benchmarkId"] == "artificial-analysis-intelligence-index" and e["model"]["canonicalModelId"]]
    versions = sorted({e["benchmarkVersion"] for e in aa})
    assert len(versions) == 1, "Review AA versions before combining scores"
    best = {}
    for row in aa:
        key = row["model"]["canonicalModelId"]
        if key not in best or row["rawScore"] > best[key]["rawScore"]:
            best[key] = row
    leaders = sorted(best.values(), key=lambda e: (-e["rawScore"], e["model"]["canonicalModelId"]))
    assert len(leaders) >= 10, "The approved search window needs ten resolved models"
    boundary = gap_boundary([row["rawScore"] for row in leaders[:10]])
    assert boundary["status"] == "selected", "Boundary requires user audit"
    cohort = leaders[:boundary["modelCount"]]
    quality = effective["qualityPolicy"]
    excluded = set(quality["excludedBenchmarkIds"])
    limited = set(quality["limitedBenchmarkIds"])
    profiles = {row["model"]["profileId"] for row in cohort}
    by_profile = {}
    for row in effective["rows"]:
        by_profile.setdefault(row["profileId"], {})[row["benchmarkId"]] = row
    common_before_quality = sorted(set.intersection(*(set(by_profile[p]) for p in profiles)))
    common = [b for b in common_before_quality if b not in excluded]
    dimensions = {r["benchmarkId"]: r["primaryDimension"] for r in effective["rows"]}
    groups = {}
    for benchmark in common:
        groups.setdefault(dimensions[benchmark], []).append(benchmark)
    for dimension, ids in groups.items():
        assert len(set(ids) & limited) * (quality["minOtherBenchmarksPerLimited"] + 1) <= len(ids), f"Quality share failed: {dimension}"
    models = {p["id"]: p for p in product["profiles"]}
    matrix = []
    for row in cohort:
        profile = row["model"]["profileId"]
        matrix.append({
            "modelId": row["model"]["canonicalModelId"], "profileId": profile,
            "name": models[profile]["baseModelName"], "aaScore": row["rawScore"],
            "benchmarks": {b: by_profile[profile][b] for b in common},
        })
    output = {
        "productVersion": product["versionId"],
        "productSha256": hashlib.sha256(product_path.read_bytes()).hexdigest(),
        "referenceDate": effective["referenceDate"],
        "approvedSelectionPolicy": {
            "source": "artificial-analysis", "benchmarkId": "artificial-analysis-intelligence-index",
            "searchWindowModels": 10, "gapToOtherMedianMultiplier": 2,
            "deduplication": "one canonical model, highest AA score",
            "audit": "retain source version, scores, boundary and threshold; user audit guides future revisions",
        },
        "analysisProfileConvention": "Use each selected model's AA highest-score product profile for the common-core analysis.",
        "sourcePopulationScope": "Canonical identities resolved in this saved product snapshot; not a fresh full AA leaderboard scrape.",
        "aaVersion": versions[0], "resolvedAAModels": len(leaders), "boundary": boundary,
        "topTen": [{"modelId": row["model"]["canonicalModelId"], "profileId": row["model"]["profileId"], "score": row["rawScore"]} for row in leaders[:10]],
        "thresholdSensitivity": [gap_boundary([row["rawScore"] for row in leaders[:10]], value) for value in [1.5, 2, 2.5, 3]],
        "windowSensitivity": [{"window": n, **gap_boundary([row["rawScore"] for row in leaders[:n]])} for n in [8, 10, 12, 15]],
        "commonBeforeQuality": common_before_quality, "qualityExcluded": sorted(set(common_before_quality) & excluded),
        "commonBenchmarkIds": common, "commonByCurrentDimension": groups, "matrix": matrix,
    }
    destination = Path("docs/analysis/2026-10-03-frontier-cohort.json")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(destination), "boundary": boundary, "models": [m["name"] for m in matrix], "commonCount": len(common), "dimensions": {k: len(v) for k, v in groups.items()}}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
