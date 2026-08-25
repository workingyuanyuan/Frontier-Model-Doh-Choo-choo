import type {
  DimensionId,
  ModelProfile,
  ProductEvidence,
  ProductVersion,
} from '@llm-bench/benchmark-data';
import { useMemo, useState } from 'react';

import {
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
} from '../lib/ui-contract';
import { getProfileDisplayName, type ProductPreset } from '../lib/view-model';

export interface ModelDetailPanelProps {
  profile: ModelProfile;
  product: ProductVersion;
  benchmarkDimensions: Record<string, DimensionId>;
  selectedResult?:
    | {
        overallScore?: number | null;
        dimensions: Array<{
          dimension: DimensionId;
          score: number | null;
        }>;
        evidenceResultIds?: string[];
      }
    | undefined;
  preset?: ProductPreset | null | undefined;
  /**
   * Show measurements the preset does not score. Off by default: a benchmark
   * that does not contribute to the number above it does not belong on the
   * main screen, and retained evidence is a developer-mode concern.
   */
  developerMode?: boolean | undefined;
}

export const DIMENSION_DISPLAY_NAMES: Record<DimensionId, string> = {
  agentic: 'Agentic',
  coding: 'Coding',
  reasoning: 'Reasoning',
  knowledge: 'Knowledge',
  language: 'Language',
};

export const BENCHMARK_DISPLAY_NAMES: Record<string, string> = {
  'aa-lcr': 'AA-LCR',
  'aa-omniscience': 'AA-Omniscience',
  'arc-agi-2': 'ARC-AGI 2',
  critpt: 'CritPt',
  'gpqa-diamond': 'GPQA Diamond',
  'humanitys-last-exam': 'Humanity’s Last Exam',
  scicode: 'SciCode',
  'tau3-banking': 'τ³ Banking',
  'terminal-bench-2-1': 'Terminal-Bench 2.1',
  'livebench-reasoning': 'LiveBench Reasoning',
  'livebench-mathematics': 'LiveBench Mathematics',
  'livebench-language': 'LiveBench Language',
  'livebench-instruction-following': 'LiveBench Instruction Following',
  'deepswe-1-1': 'DeepSWE 1.1',
  'frontier-code-1-1': 'Frontier Code 1.1',
  'math-level-5': 'MATH Level 5',
  aime: 'AIME',
  frontiermath: 'FrontierMath',
  'frontiermath-tier-4': 'FrontierMath Tier 4',
  'swe-bench': 'SWE-bench',
  'simpleqa-verified': 'SimpleQA Verified',
  'chess-puzzles': 'Chess Puzzles',
  'aa-briefcase': 'AA-Briefcase',
  'apex-agents': 'APEX-Agents',
  'gdpval-aa': 'GDPval-AA',
  ifbench: 'IFBench',
  automationbench: 'AutomationBench',
};

export const getSourceDisplayName = (sourceId: string): string => {
  switch (sourceId) {
    case 'artificial-analysis':
      return 'AA';
    case 'deepswe':
      return 'DeepSWE';
    case 'livebench':
      return 'LiveBench';
    case 'frontier-code':
      return 'Frontier Code';
    case 'epoch-ai':
      return 'Epoch AI';
    case 'zapier-automationbench':
      return 'zapier';
    default:
      return sourceId;
  }
};

export const getBenchmarkDisplayName = (
  benchmarkId: string,
  evidence?: ProductEvidence,
): string => {
  if (BENCHMARK_DISPLAY_NAMES[benchmarkId]) {
    return BENCHMARK_DISPLAY_NAMES[benchmarkId];
  }
  if (evidence?.metric.name && evidence.metric.name !== 'category-average') {
    return evidence.metric.name;
  }
  return benchmarkId;
};

const formatScore = (val: number | null | undefined): string => {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return '—';
  }
  return val.toFixed(1);
};

export function ModelDetailPanel({
  profile,
  product,
  benchmarkDimensions,
  selectedResult,
  preset,
  developerMode = false,
}: ModelDetailPanelProps) {
  const [openProvenanceId, setOpenProvenanceId] = useState<string | null>(null);

  const profileEvidence = useMemo(() => {
    return product.evidence.filter(
      (e) =>
        e.inclusion === 'INCLUDED' &&
        e.model.profileId === profile.id &&
        e.normalizedScore !== null,
    );
  }, [product.evidence, profile.id]);

  const evidenceByBenchmark = useMemo(() => {
    const map = new Map<string, ProductEvidence>();
    const contributingEvidenceIds = new Set(
      selectedResult?.evidenceResultIds ?? [],
    );
    profileEvidence.forEach((e) => {
      const current = map.get(e.benchmarkId);
      if (!current) {
        map.set(e.benchmarkId, e);
        return;
      }

      const currentContributes = contributingEvidenceIds.has(current.id);
      const candidateContributes = contributingEvidenceIds.has(e.id);
      if (
        (candidateContributes && !currentContributes) ||
        (candidateContributes === currentContributes &&
          (e.normalizedScore ?? Number.NEGATIVE_INFINITY) >
            (current.normalizedScore ?? Number.NEGATIVE_INFINITY))
      ) {
        map.set(e.benchmarkId, e);
      }
    });
    return map;
  }, [profileEvidence, selectedResult?.evidenceResultIds]);

  const dimensionScoreMap = useMemo(() => {
    const map = new Map<DimensionId, number | null>();
    selectedResult?.dimensions.forEach((d) => {
      map.set(d.dimension, d.score);
    });
    return map;
  }, [selectedResult]);

  const scoringBasisIds = useMemo(
    () =>
      new Set(preset ? preset.benchmarkIds : Object.keys(benchmarkDimensions)),
    [benchmarkDimensions, preset],
  );

  const benchmarksByDimension = useMemo(() => {
    const map = new Map<DimensionId, string[]>();
    UI_DIMENSION_IDS.forEach((dim) => {
      map.set(dim, []);
    });

    const activeBenchmarkIds = preset
      ? [...preset.benchmarkIds]
      : Object.keys(benchmarkDimensions);

    // Measurements outside the preset appear in developer mode only, appended
    // after the preset's own and marked as not counted. On the main screen they
    // are omitted entirely: rendering them made a dimension card show two
    // children under a score computed from one, which is arithmetic no reader
    // can follow. Ruling R1: the preset is the scoring basis, and R17 says the
    // main screen shows only what is in it.
    if (developerMode) {
      profileEvidence.forEach((e) => {
        if (!activeBenchmarkIds.includes(e.benchmarkId)) {
          activeBenchmarkIds.push(e.benchmarkId);
        }
      });
    }

    activeBenchmarkIds.forEach((bmId) => {
      const dim = benchmarkDimensions[bmId];
      if (dim && map.has(dim)) {
        const list = map.get(dim)!;
        if (!list.includes(bmId)) {
          list.push(bmId);
        }
      }
    });

    return map;
  }, [benchmarkDimensions, developerMode, preset, profileEvidence]);

  const modelDisplayName = getProfileDisplayName(profile);
  const overallText =
    selectedResult?.overallScore !== null &&
    selectedResult?.overallScore !== undefined
      ? `Overall ${selectedResult.overallScore.toFixed(1)}`
      : 'Overall —';

  const toggleProvenance = (id: string) => {
    setOpenProvenanceId((current) => (current === id ? null : id));
  };

  const titleId = `model-detail-title-${profile.id}`;

  return (
    <div
      className="model-detail-panel"
      role="group"
      aria-labelledby={titleId}
      data-model-detail-panel
    >
      <div className="section-heading model-detail-heading">
        <div>
          <p className="eyebrow">Model capability breakdown</p>
          <div className="model-detail-title-row">
            <h2 id={titleId}>{modelDisplayName}</h2>
            <span className="model-detail-overall-badge">{overallText}</span>
          </div>
          <p>
            Five capability dimensions and underlying source-verified
            benchmarks.
          </p>
        </div>
      </div>

      <div className="model-detail-dimensions-grid">
        {UI_DIMENSION_IDS.map((dimension) => {
          const dimLabel = DIMENSION_DISPLAY_NAMES[dimension];
          const dimAbbr = UI_DIMENSION_ABBREVIATIONS[dimension];
          const dimScore = dimensionScoreMap.get(dimension);
          const benchmarkIds = benchmarksByDimension.get(dimension) ?? [];

          return (
            <div
              key={dimension}
              className="model-detail-dimension-card"
              data-dimension-group={dimension}
            >
              <div className="dimension-card-header">
                <div className="dimension-card-title">
                  <span className="dimension-badge">{dimAbbr}</span>
                  <strong>{dimLabel}</strong>
                </div>
                <span className="dimension-score-val">
                  {formatScore(dimScore)}
                </span>
              </div>

              <ul className="dimension-benchmark-list">
                {benchmarkIds.length > 0 ? (
                  benchmarkIds.map((bmId, idx) => {
                    const evidence = evidenceByBenchmark.get(bmId);
                    const isLast = idx === benchmarkIds.length - 1;
                    const treePrefix = isLast ? '└ ' : '├ ';
                    const bmName = getBenchmarkDisplayName(bmId, evidence);
                    const sourceName = evidence
                      ? getSourceDisplayName(evidence.sourceId)
                      : null;
                    const scoreText = evidence
                      ? formatScore(evidence.normalizedScore)
                      : '—';
                    const provKey = `${profile.id}:${bmId}`;
                    const isProvOpen = openProvenanceId === provKey;
                    const isScored = scoringBasisIds.has(bmId);

                    return (
                      <li
                        key={bmId}
                        className={`dimension-benchmark-item ${
                          evidence ? 'has-score' : 'is-missing'
                        }${isScored ? '' : ' is-outside-basis'}`}
                        data-benchmark-id={bmId}
                        data-outside-basis={isScored ? undefined : 'true'}
                      >
                        <div className="benchmark-row-main">
                          <span className="tree-branch" aria-hidden="true">
                            {treePrefix}
                          </span>
                          <span className="benchmark-name">
                            {evidence ? (
                              <button
                                type="button"
                                className="provenance-toggle-btn"
                                onClick={() => toggleProvenance(provKey)}
                                aria-expanded={isProvOpen}
                                aria-label={`View provenance for ${bmName}`}
                              >
                                {bmName}
                              </button>
                            ) : (
                              <span>{bmName}</span>
                            )}
                          </span>
                          {sourceName ? (
                            <span className="benchmark-source">
                              ({sourceName})
                            </span>
                          ) : null}
                          {isScored ? null : (
                            <span
                              className="benchmark-outside-basis"
                              title="Measured, but outside the benchmark set this preset scores. It does not affect the dimension score above."
                            >
                              not scored here
                            </span>
                          )}
                          <span className="benchmark-score">{scoreText}</span>
                        </div>

                        {evidence && isProvOpen ? (
                          <div
                            className="benchmark-provenance-popover"
                            data-provenance-details
                          >
                            <dl className="provenance-dl">
                              <div>
                                <dt>Source URL</dt>
                                <dd>
                                  <a
                                    href={evidence.provenance.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {evidence.provenance.sourceUrl}
                                  </a>
                                </dd>
                              </div>
                              <div>
                                <dt>Raw Score</dt>
                                <dd>
                                  <strong>
                                    {evidence.rawScore.toFixed(1)}{' '}
                                    {evidence.metric.unit}
                                  </strong>{' '}
                                  <span>
                                    (Normalized{' '}
                                    {formatScore(evidence.normalizedScore)})
                                  </span>
                                </dd>
                              </div>
                              <div>
                                <dt>Locator</dt>
                                <dd>
                                  <code>{evidence.provenance.locator}</code>
                                </dd>
                              </div>
                              <div>
                                <dt>Retrieved At</dt>
                                <dd>{evidence.provenance.retrievedAt}</dd>
                              </div>
                            </dl>
                          </div>
                        ) : null}
                      </li>
                    );
                  })
                ) : (
                  <li className="dimension-benchmark-empty">
                    <span className="tree-branch">└ </span>
                    <span className="empty-text">No active benchmarks</span>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
