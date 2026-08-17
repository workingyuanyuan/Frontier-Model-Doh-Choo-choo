import { type CandidateResult } from '@llm-bench/benchmark-data';

import {
  isAAModels,
  parseEffort,
  resolveModel,
  slugify,
} from './materializer-utils.js';

export function materializeArtificialAnalysis(
  modelsHtml: string,
  articleHtml: string,
  observedAt: string,
  context: {
    modelsEvidenceId?: string;
    articleEvidenceId?: string;
    modelsUrl?: string;
    articleUrl?: string;
  } = {},
): CandidateResult[] {
  const candidates: CandidateResult[] = [];
  const sourceId = 'artificial-analysis';
  const modelsUrl = context.modelsUrl ?? 'https://artificialanalysis.ai/models';
  const articleUrl =
    context.articleUrl ??
    'https://artificialanalysis.ai/articles/gpt-5-6-has-landed';
  const modelsEvidenceId =
    context.modelsEvidenceId ??
    'sha256:b7084dca03b345e5a1e1aab3729bee6fcd7577b744ad46f38e30e0143486768a';
  const articleEvidenceId =
    context.articleEvidenceId ??
    'sha256:1b8ce2a9690fbd52b4706e5fe3f81215735b792710b7a8f4859e684a284d2a28';

  // 1. Parse initialModels array from modelsHtml
  const imIdx = modelsHtml.indexOf('initialModels');
  if (imIdx === -1)
    throw new Error('initialModels not found in Artificial Analysis HTML');
  const valStart = modelsHtml.indexOf('[', imIdx);

  let bracketCount = 0;
  let jsonEndIdx = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = valStart; i < modelsHtml.length; i++) {
    const char = modelsHtml[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '[') bracketCount++;
      else if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          jsonEndIdx = i + 1;
          break;
        }
      }
    }
  }

  if (jsonEndIdx === -1) throw new Error('Failed to parse initialModels JSON');

  // Unescape string literal content
  const escapedStr = modelsHtml.slice(valStart, jsonEndIdx);

  function unescapeJsString(s: string): string {
    let result = '';
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '\\') {
        const next = s[i + 1];
        if (next === '\\') {
          result += '\\';
          i++;
        } else if (next === '"') {
          result += '"';
          i++;
        } else if (next === 'n') {
          result += '\n';
          i++;
        } else if (next === 'r') {
          result += '\r';
          i++;
        } else if (next === 't') {
          result += '\t';
          i++;
        } else if (next === 'u') {
          const hex = s.slice(i + 2, i + 6);
          result += String.fromCharCode(parseInt(hex, 16));
          i += 5;
        } else {
          result += next;
          i++;
        }
      } else {
        result += s[i];
      }
    }
    return result;
  }

  const unescaped = unescapeJsString(escapedStr);
  const modelsParsed: unknown = JSON.parse(unescaped);
  if (!isAAModels(modelsParsed)) {
    throw new Error('Invalid Artificial Analysis models schema');
  }
  const models = modelsParsed;

  // Matrix benchmarks mapping to field key, benchmark ID, metric ID, unit, and sourceRole
  const matrixMappings = [
    {
      key: 'lcr',
      benchmarkId: 'aa-lcr',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: true,
      normalize: true,
    },
    {
      key: 'hle',
      benchmarkId: 'humanitys-last-exam',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
    {
      key: 'gpqa',
      benchmarkId: 'gpqa-diamond',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
    {
      key: 'scicode',
      benchmarkId: 'scicode',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
    {
      key: 'critpt',
      benchmarkId: 'critpt',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
    {
      key: 'apexAgents',
      benchmarkId: 'apex-agents',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
    {
      key: 'terminalbenchV21',
      benchmarkId: 'terminal-bench-2-1',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
    {
      key: 'tauBanking',
      benchmarkId: 'tau3-banking',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
    {
      key: 'livecodebench',
      benchmarkId: 'livecodebench',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
    {
      key: 'gdpvalNormalized',
      benchmarkId: 'gdpval-aa',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
    {
      key: 'ifbench',
      benchmarkId: 'ifbench',
      metricId: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      isOrganizer: false,
      normalize: true,
    },
  ] as const;

  for (const model of models) {
    const rawName = model.name;
    const { canonicalModelId, profileId } = resolveModel(
      rawName,
      'artificial-analysis',
    );

    // Parse effort from rawName
    const effort = parseEffort(rawName);
    const thinking =
      effort !== null || /\b(reasoning|thinking)\b/iu.test(rawName)
        ? 'reasoning'
        : null;

    const modelPart = profileId || slugify(rawName);

    // 1. Intelligence Index (organizer, excluded)
    if (
      model.intelligenceIndex !== undefined &&
      model.intelligenceIndex !== null
    ) {
      candidates.push({
        schemaVersion: 'candidate-result-v1',
        id: `${sourceId}:${modelPart}:intelligence-index-v4-1`,
        sourceId,
        sourceRole: 'ORGANIZER',
        benchmarkId: 'artificial-analysis-intelligence-index',
        benchmarkVersion: 'v4.1',
        model: {
          rawName,
          canonicalModelId,
          profileId,
        },
        profile: {
          effort,
          thinking,
          tools: null,
          harness: null,
          contextWindowTokens: null,
          quantization: null,
          attempts: null,
        },
        metric: {
          id: 'index-score',
          name: 'Artificial Analysis Intelligence Index',
          unit: 'index points',
          higherIsBetter: true,
        },
        rawScore: model.intelligenceIndex,
        normalizedScore: null,
        acquisitionStatus: 'PARTIAL_SOURCE',
        inclusion: 'EXCLUDED',
        exclusionReason:
          'External composite is used for frontier selection and display only; including it would double-count constituent benchmarks.',
        sourceUrl: modelsUrl,
        observedAt,
        sourcePublishedAt: null,
        evidenceIds: [modelsEvidenceId],
        provenance: {
          'model.rawName': {
            evidenceId: modelsEvidenceId,
            method: 'EMBEDDED_JSON',
            locator: `Intelligence Index embedded array, label`,
          },
          rawScore: {
            evidenceId: modelsEvidenceId,
            method: 'EMBEDDED_JSON',
            locator: `Intelligence Index embedded array, intelligenceIndex`,
          },
        },
      });
    }

    // 2. Coding Index (organizer, excluded)
    if (model.codingIndex !== undefined && model.codingIndex !== null) {
      candidates.push({
        schemaVersion: 'candidate-result-v1',
        id: `${sourceId}:${modelPart}:coding-agent-index`,
        sourceId,
        sourceRole: 'ORGANIZER',
        benchmarkId: 'artificial-analysis-coding-agent-index',
        benchmarkVersion: '2026-07',
        model: {
          rawName,
          canonicalModelId,
          profileId,
        },
        profile: {
          effort,
          thinking,
          tools: null,
          harness: null,
          contextWindowTokens: null,
          quantization: null,
          attempts: null,
        },
        metric: {
          id: 'index-score',
          name: 'Artificial Analysis Coding Agent Index',
          unit: 'index points',
          higherIsBetter: true,
        },
        rawScore: model.codingIndex,
        normalizedScore: null,
        acquisitionStatus: 'PARTIAL_SOURCE',
        inclusion: 'EXCLUDED',
        exclusionReason:
          'External composite is used for frontier selection and display only; constituent evaluations must be ingested separately.',
        sourceUrl: modelsUrl,
        observedAt,
        sourcePublishedAt: null,
        evidenceIds: [modelsEvidenceId],
        provenance: {
          'model.rawName': {
            evidenceId: modelsEvidenceId,
            method: 'EMBEDDED_JSON',
            locator: `Intelligence Index embedded array, label`,
          },
          rawScore: {
            evidenceId: modelsEvidenceId,
            method: 'EMBEDDED_JSON',
            locator: `Intelligence Index embedded array, codingIndex`,
          },
        },
      });
    }

    // 2.1. Omniscience Index (Excluded, display only)
    if (model.omniscience !== undefined && model.omniscience !== null) {
      candidates.push({
        schemaVersion: 'candidate-result-v1',
        id: `${sourceId}:${modelPart}:aa-omniscience:index`,
        sourceId,
        sourceRole: 'ORGANIZER',
        benchmarkId: 'aa-omniscience',
        benchmarkVersion: null,
        model: {
          rawName,
          canonicalModelId,
          profileId,
        },
        profile: {
          effort,
          thinking,
          tools: null,
          harness: null,
          contextWindowTokens: null,
          quantization: null,
          attempts: null,
        },
        metric: {
          id: 'omniscience-index',
          name: 'AA Omniscience Index',
          unit: 'index-points',
          higherIsBetter: true,
        },
        rawScore: model.omniscience,
        normalizedScore: null,
        acquisitionStatus: 'PARTIAL_SOURCE',
        inclusion: 'EXCLUDED',
        exclusionReason:
          'Raw omniscience index uses an unnormalized scale and is retained as display-only evidence.',
        sourceUrl: modelsUrl,
        observedAt,
        sourcePublishedAt: null,
        evidenceIds: [modelsEvidenceId],
        provenance: {
          'model.rawName': {
            evidenceId: modelsEvidenceId,
            method: 'EMBEDDED_JSON',
            locator: `Intelligence Index embedded array, label`,
          },
          rawScore: {
            evidenceId: modelsEvidenceId,
            method: 'EMBEDDED_JSON',
            locator: `Intelligence Index embedded array, omniscience`,
          },
        },
      });
    }

    // 2.2. Omniscience Accuracy (Included)
    const breakdown = model.omniscienceBreakdown;
    if (
      breakdown &&
      typeof breakdown === 'object' &&
      breakdown.accuracy !== undefined &&
      breakdown.accuracy !== null
    ) {
      const acc = breakdown.accuracy;
      candidates.push({
        schemaVersion: 'candidate-result-v1',
        id: `${sourceId}:aa-omniscience:${modelPart}`,
        sourceId,
        sourceRole: 'ORGANIZER',
        benchmarkId: 'aa-omniscience',
        benchmarkVersion: null,
        model: {
          rawName,
          canonicalModelId,
          profileId,
        },
        profile: {
          effort,
          thinking,
          tools: null,
          harness: null,
          contextWindowTokens: null,
          quantization: null,
          attempts: null,
        },
        metric: {
          id: 'accuracy',
          name: 'Accuracy',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: acc,
        normalizedScore: acc * 100,
        acquisitionStatus: 'PARTIAL_SOURCE',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl: modelsUrl,
        observedAt,
        sourcePublishedAt: null,
        evidenceIds: [modelsEvidenceId],
        provenance: {
          'model.rawName': {
            evidenceId: modelsEvidenceId,
            method: 'EMBEDDED_JSON',
            locator: `Intelligence Index embedded array, label`,
          },
          rawScore: {
            evidenceId: modelsEvidenceId,
            method: 'EMBEDDED_JSON',
            locator: `Intelligence Index embedded array, omniscienceBreakdown.accuracy`,
          },
          sourceRole: {
            evidenceId: modelsEvidenceId,
            method: 'EMBEDDED_JSON',
            locator: `Intelligence Index embedded array (Artificial Analysis-owned benchmark)`,
          },
        },
      });
    }

    // 3. Direct constituents
    for (const m of matrixMappings) {
      const val = model[m.key];
      if (val !== undefined && val !== null) {
        const rawScore = val;
        const normalizedScore = m.normalize ? val * 100 : val;

        candidates.push({
          schemaVersion: 'candidate-result-v1',
          id: `${sourceId}:${m.benchmarkId}:${modelPart}`,
          sourceId,
          sourceRole: m.isOrganizer ? 'ORGANIZER' : 'INDEPENDENT',
          benchmarkId: m.benchmarkId,
          benchmarkVersion: null,
          model: {
            rawName,
            canonicalModelId,
            profileId,
          },
          profile: {
            effort,
            thinking,
            tools: null,
            harness: null,
            contextWindowTokens: null,
            quantization: null,
            attempts: null,
          },
          metric: {
            id: m.metricId,
            name: m.name,
            unit: m.unit,
            higherIsBetter: true,
          },
          rawScore,
          normalizedScore,
          acquisitionStatus: 'PARTIAL_SOURCE',
          inclusion: 'INCLUDED',
          exclusionReason: null,
          sourceUrl: modelsUrl,
          observedAt,
          sourcePublishedAt: null,
          evidenceIds: [modelsEvidenceId],
          provenance: {
            rawScore: {
              evidenceId: modelsEvidenceId,
              method: 'EMBEDDED_JSON',
              locator: `Intelligence Index embedded array, ${m.key}`,
            },
            sourceRole: {
              evidenceId: modelsEvidenceId,
              method: 'EMBEDDED_JSON',
              locator: m.isOrganizer
                ? `Intelligence Index embedded array (Artificial Analysis-owned benchmark)`
                : `Intelligence Index embedded array (rerun of external benchmark)`,
            },
          },
        });
      }
    }
  }

  // 4. Article facts (AA-Briefcase)
  // - Fable 5 (max) Rubric Score: 56%
  // - Fable 5 (max) Analytical Quality Elo: 1764
  // - GPT-5.6 Sol (max) Rubric Score: 42%
  // - GPT-5.6 Sol (max) Analytical Quality Elo: 1592

  const articleModels = [
    {
      rawName: 'GPT-5.6 Sol (max)',
      canonicalModelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-max-aa-briefcase',
      rubricScore: 42,
      elo: 1592,
    },
    {
      rawName: 'Claude Fable 5 (max)',
      canonicalModelId: 'anthropic-claude-fable-5',
      profileId: 'anthropic-claude-fable-5-max-aa-briefcase',
      rubricScore: 56,
      elo: 1764,
    },
  ];

  for (const m of articleModels) {
    // Rubric score
    candidates.push({
      schemaVersion: 'candidate-result-v1',
      id: `${sourceId}:${m.profileId}:aa-briefcase:rubric-score`,
      sourceId,
      sourceRole: 'ORGANIZER',
      benchmarkId: 'aa-briefcase',
      benchmarkVersion: null,
      model: {
        rawName: m.rawName,
        canonicalModelId: m.canonicalModelId,
        profileId: m.profileId,
      },
      profile: {
        effort: 'max',
        thinking: 'reasoning',
        tools: null,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: null,
      },
      metric: {
        id: 'rubric-score',
        name: 'Rubric Score',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: m.rubricScore,
      normalizedScore: m.rubricScore,
      acquisitionStatus: 'PARTIAL_SOURCE',
      inclusion: 'INCLUDED',
      exclusionReason: null,
      sourceUrl: articleUrl,
      observedAt,
      sourcePublishedAt: '2026-07-09T00:00:00.000Z',
      evidenceIds: [articleEvidenceId],
      provenance: {
        'model.rawName': {
          evidenceId: articleEvidenceId,
          method: 'DOM',
          locator: 'AA-Briefcase key-takeaway paragraph',
        },
        benchmarkId: {
          evidenceId: articleEvidenceId,
          method: 'DOM',
          locator: 'AA-Briefcase heading text',
        },
        rawScore: {
          evidenceId: articleEvidenceId,
          method: 'DOM',
          locator: `explicit 'Rubric Score of 56% vs 42%' comparison`,
        },
      },
    });

    // Analytical Quality Elo
    candidates.push({
      schemaVersion: 'candidate-result-v1',
      id: `${sourceId}:${m.profileId}:aa-briefcase:analytical-quality-elo`,
      sourceId,
      sourceRole: 'ORGANIZER',
      benchmarkId: 'aa-briefcase',
      benchmarkVersion: null,
      model: {
        rawName: m.rawName,
        canonicalModelId: m.canonicalModelId,
        profileId: m.profileId,
      },
      profile: {
        effort: 'max',
        thinking: 'reasoning',
        tools: null,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: null,
      },
      metric: {
        id: 'analytical-quality-elo',
        name: 'Analytical Quality Elo',
        unit: 'Elo',
        higherIsBetter: true,
      },
      rawScore: m.elo,
      normalizedScore: null,
      acquisitionStatus: 'PARTIAL_SOURCE',
      inclusion: 'EXCLUDED',
      exclusionReason:
        'No approved v1 normalization exists for this Elo scale; retain as display-only evidence.',
      sourceUrl: articleUrl,
      observedAt,
      sourcePublishedAt: '2026-07-09T00:00:00.000Z',
      evidenceIds: [articleEvidenceId],
      provenance: {
        'model.rawName': {
          evidenceId: articleEvidenceId,
          method: 'DOM',
          locator: 'AA-Briefcase key-takeaway paragraph',
        },
        'metric.id': {
          evidenceId: articleEvidenceId,
          method: 'DOM',
          locator: `explicit 'Analytical Quality Elo' label`,
        },
        rawScore: {
          evidenceId: articleEvidenceId,
          method: 'DOM',
          locator: `explicit '${m.rawName} at ${m.elo}'`,
        },
      },
    });
  }

  return candidates;
}
