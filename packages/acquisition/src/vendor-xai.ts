import {
  CandidateResultSchema,
  type CandidateResult,
  type CostRecord,
} from '@llm-bench/benchmark-data';
import { materializeVendorTaskCost } from './vendor-costs.js';

export const XAI_RELEASE_URL = 'https://x.ai/news/grok-4-7';
const models: Record<string, string> = {
  'Fable 5.1': 'anthropic-claude-fable-5-1',
  'Opus 5': 'anthropic-claude-opus-5',
  'Grok 4.7': 'xai-grok-4-7',
  'GPT-5.6 Sol': 'openai-gpt-5-6-sol',
  'GPT-5.6 Terra': 'openai-gpt-5-6-terra',
  'GPT-5.6 Luna': 'openai-gpt-5-6-luna',
  'Sonnet 5': 'anthropic-claude-sonnet-5',
  'Gemini 3.8 Flash': 'google-gemini-3-8-flash',
  'Muse Spark 1.3': 'meta-muse-spark-1-3',
  'Composer 2.5': 'cursor-composer-2-5',
};

/** Read literal chart data without executing the downloaded JavaScript. */
export function materializeXaiRelease(
  bundle: string,
  html: string,
  context: {
    evidenceId: string;
    pageEvidenceId: string;
    observedAt: string;
  },
) {
  if (
    !bundle.includes('CursorBench 4.0') ||
    !bundle.includes('Average cost per task') ||
    !html.includes('DeepSWE v1.1') ||
    !html.includes('* high effort')
  )
    throw new Error('xAI release benchmark or unit drift');
  const candidates: CandidateResult[] = [];
  const costs: CostRecord[] = [];
  const series = [
    ...bundle.matchAll(
      /label:"([^"]+)",role:"primary"[^\][]*runs:\[([^\]]+)\]/gu,
    ),
  ];
  if (series.length !== 10)
    throw new Error('xAI CursorBench series count drift');
  const row = (
    model: string,
    effort: string | null,
    score: number,
    benchmarkId: string,
    evidenceId: string,
    locator: string,
  ) => {
    const canonicalModelId = models[model];
    if (!canonicalModelId) throw new Error(`Unknown xAI chart model: ${model}`);
    const exclusionReason =
      effort === 'minimal'
        ? 'Minimal is distinct from low in this chart; product effort mapping would merge two measured settings.'
        : null;
    const provenance = { evidenceId, method: 'NEXT_RSC' as const, locator };
    return CandidateResultSchema.parse({
      schemaVersion: 'candidate-result-v1',
      id: `xai-releases:${benchmarkId}:${canonicalModelId}:${effort ?? 'default'}`,
      sourceId: 'xai-releases',
      sourceRole: 'VENDOR',
      benchmarkId,
      benchmarkVersion: benchmarkId === 'cursorbench-4' ? '4.0' : '1.1',
      model: {
        rawName: model,
        canonicalModelId,
        profileId: effort ? `${canonicalModelId}-${effort}` : null,
      },
      profile: {
        effort,
        thinking: null,
        tools: null,
        harness: null,
        contextWindowTokens: null,
        quantization: null,
        attempts: null,
      },
      metric: {
        id: benchmarkId === 'cursorbench-4' ? 'accuracy' : 'pass-at-1',
        name: benchmarkId === 'cursorbench-4' ? 'Accuracy' : 'Pass@1',
        unit: 'percent',
        higherIsBetter: true,
      },
      rawScore: score,
      normalizedScore: score,
      acquisitionStatus: 'PARTIAL_SOURCE',
      inclusion: exclusionReason ? 'EXCLUDED' : 'INCLUDED',
      exclusionReason,
      sourceUrl: XAI_RELEASE_URL,
      observedAt: context.observedAt,
      sourcePublishedAt: null,
      evidenceIds: [evidenceId],
      provenance: {
        rawScore: provenance,
        profile: provenance,
        'model.rawName': provenance,
      },
    });
  };
  for (const [, model, runs] of series) {
    for (const literal of runs!.matchAll(/\{([^{}]+)\}/gu)) {
      const effort = /effort:"([a-z]+)"/u.exec(literal[1]!)?.[1] ?? null;
      if (
        effort &&
        !['minimal', 'low', 'medium', 'high', 'xhigh', 'max'].includes(effort)
      )
        throw new Error('xAI effort drift');
      const score = Number(/(?:^|,)score:([\d.]+)/u.exec(literal[1]!)?.[1]);
      const cost = Number(/avgCost:([\d.]+)/u.exec(literal[1]!)?.[1]);
      if (!Number.isFinite(score) || !Number.isFinite(cost) || cost < 0)
        throw new Error('Invalid xAI score/cost');
      const locator = `CursorBench 4.0; label=${model}; effort=${effort}; literal={${literal[1]}}`;
      const candidate = row(
        model!,
        effort,
        score,
        'cursorbench-4',
        context.evidenceId,
        locator,
      );
      candidate.provenance.cost = {
        evidenceId: context.evidenceId,
        method: 'NEXT_RSC',
        locator: `${locator}; avgCost=${cost}`,
      };
      candidates.push(candidate);
      costs.push(
        materializeVendorTaskCost(
          candidate,
          cost,
          'CursorBench 4.0; average cost per task (USD); avgCost',
        ),
      );
    }
  }
  if (candidates.length !== 43)
    throw new Error(`xAI CursorBench row count drift: ${candidates.length}`);
  candidates.push(
    row(
      'Grok 4.7',
      'high',
      71,
      'deepswe-1-1',
      context.pageEvidenceId,
      'Model Improvements > DeepSWE v1.1 > Grok 4.7 = 71.0%*; footnote * high effort',
    ),
  );
  if (!html.includes('71.0%')) throw new Error('xAI DeepSWE score drift');
  return {
    candidates,
    costs,
    validationReport:
      '# xAI release validation\n\nGrok 4.7 release: literal CursorBench 4.0 score and USD/task curves; DeepSWE v1.1 high-effort footnote. Minimal remains excluded to preserve distinct configurations.\n',
  };
}
