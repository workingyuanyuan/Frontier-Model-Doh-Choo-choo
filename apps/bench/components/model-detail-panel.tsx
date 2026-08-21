import type {
  DimensionId,
  DisplaySet,
  ModelProfile,
  ProductEvidence,
  ProductVersion,
} from '@llm-bench/benchmark-data';
import { useMemo, useState } from 'react';

import {
  UI_DIMENSION_ABBREVIATIONS,
  UI_DIMENSION_IDS,
} from '../lib/ui-contract';
import { getProfileDisplayName } from '../lib/view-model';

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
      }
    | undefined;
  displaySet?: DisplaySet | null | undefined;
}

export const DIMENSION_DISPLAY_NAMES: Record<DimensionId, string> = {
  agentic: 'Agentic',
  coding: 'Coding',
  reasoning: 'Reasoning',
  math: 'Math',
  knowledge: 'Knowledge',
  language: 'Language',
  context: 'Context',
  instruction: 'Instruction',
};

export const BENCHMARK_DISPLAY_NAMES: Record<string, string> = {
  'aa-lcr': 'AA-LCR',
  'aa-omniscience': 'AA-Omniscience',
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
  'swe-bench': 'SWE-bench',
  'simpleqa-verified': 'SimpleQA Verified',
  'chess-puzzles': 'Chess Puzzles',
  'aa-briefcase': 'AA-Briefcase',
  'apex-agents': 'APEX-Agents',
  'gdpval-aa': 'GDPval-AA',
  ifbench: 'IFBench',
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
  displaySet,
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
    profileEvidence.forEach((e) => {
      map.set(e.benchmarkId, e);
    });
    return map;
  }, [profileEvidence]);

  const dimensionScoreMap = useMemo(() => {
    const map = new Map<DimensionId, number | null>();
    selectedResult?.dimensions.forEach((d) => {
      map.set(d.dimension, d.score);
    });
    return map;
  }, [selectedResult]);

  const benchmarksByDimension = useMemo(() => {
    const map = new Map<DimensionId, string[]>();
    UI_DIMENSION_IDS.forEach((dim) => {
      map.set(dim, []);
    });

    const activeBenchmarkIds = displaySet?.benchmarkIds
      ? [...displaySet.benchmarkIds]
      : Object.keys(benchmarkDimensions);

    // Also include any profile evidence benchmarks that are not in displaySet
    profileEvidence.forEach((e) => {
      if (!activeBenchmarkIds.includes(e.benchmarkId)) {
        activeBenchmarkIds.push(e.benchmarkId);
      }
    });

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
  }, [benchmarkDimensions, displaySet, profileEvidence]);

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
            Eight capability dimensions and underlying source-verified
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

                    return (
                      <li
                        key={bmId}
                        className={`dimension-benchmark-item ${
                          evidence ? 'has-score' : 'is-missing'
                        }`}
                        data-benchmark-id={bmId}
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
