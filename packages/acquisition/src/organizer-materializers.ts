import {
  CandidateResultSchema,
  CostRecordSchema,
  type CandidateResult,
  type CostRecord,
  type EvidenceRecord,
} from '@llm-bench/benchmark-data';

interface MaterializerContext {
  sourceId: string;
  sourceUrl: string;
  evidenceId: string;
  observedAt: string;
  method: EvidenceRecord['method'];
  sourcePublishedAt?: string | null;
}

interface MaterializedOrganizer {
  candidates: CandidateResult[];
  costs: CostRecord[];
  extractedRows: number;
  expectedRows: number;
  benchmarkVersion: string | null;
}

interface ResolvedModel {
  canonicalModelId: string | null;
  profileId: string | null;
  effort: string | null;
}

const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');

const MODEL_PATTERNS: ReadonlyArray<{
  pattern: RegExp;
  canonicalModelId: string;
}> = [
  {
    pattern: /^(?:anthropic )?claude opus 5\b/iu,
    canonicalModelId: 'anthropic-claude-opus-5',
  },
  {
    pattern: /^(?:anthropic )?claude fable 5(?:\.0)?\b/iu,
    canonicalModelId: 'anthropic-claude-fable-5',
  },
  {
    pattern: /^(?:anthropic )?claude opus 4\.8\b/iu,
    canonicalModelId: 'anthropic-claude-opus-4-8',
  },
  {
    pattern: /^(?:anthropic )?(?:claude )?opus 4\.7\b/iu,
    canonicalModelId: 'anthropic-claude-opus-4-7',
  },
  {
    pattern: /^(?:anthropic )?(?:claude )?opus 4\.6\b/iu,
    canonicalModelId: 'anthropic-claude-opus-4-6',
  },
  {
    pattern: /^(?:anthropic )?claude sonnet 5\b/iu,
    canonicalModelId: 'anthropic-claude-sonnet-5',
  },
  {
    pattern: /^(?:anthropic )?claude sonnet 4\.6\b/iu,
    canonicalModelId: 'anthropic-claude-sonnet-4-6',
  },
  { pattern: /^gpt-5\.6 sol\b/iu, canonicalModelId: 'openai-gpt-5-6-sol' },
  { pattern: /^gpt-5\.6 terra\b/iu, canonicalModelId: 'openai-gpt-5-6-terra' },
  { pattern: /^gpt-5\.6 luna\b/iu, canonicalModelId: 'openai-gpt-5-6-luna' },
  { pattern: /^gpt[- ]5\.5 pro\b/iu, canonicalModelId: 'openai-gpt-5-5-pro' },
  { pattern: /^gpt[- ]5\.5\b/iu, canonicalModelId: 'openai-gpt-5-5' },
  { pattern: /^gpt[- ]5\.4 pro\b/iu, canonicalModelId: 'openai-gpt-5-4-pro' },
  { pattern: /^gpt[- ]5\.4\b/iu, canonicalModelId: 'openai-gpt-5-4' },
  { pattern: /^gpt[- ]5\.2 pro\b/iu, canonicalModelId: 'openai-gpt-5-2-pro' },
  { pattern: /^gpt[- ]5\.2\b/iu, canonicalModelId: 'openai-gpt-5-2' },
  {
    pattern: /^gemini[- ]3\.6 flash\b/iu,
    canonicalModelId: 'google-gemini-3-6-flash',
  },
  {
    pattern: /^gemini[- ]3\.5 flash\b/iu,
    canonicalModelId: 'google-gemini-3-5-flash',
  },
  {
    pattern: /^gemini[- ]3\.1 pro(?: preview| \(preview\))?\b/iu,
    canonicalModelId: 'google-gemini-3-1-pro-preview',
  },
  {
    pattern: /^gemini[- ]3 pro preview\b/iu,
    canonicalModelId: 'google-gemini-3-pro-preview',
  },
  { pattern: /^muse spark 1\.1\b/iu, canonicalModelId: 'meta-muse-spark-1-1' },
  { pattern: /^muse spark\b/iu, canonicalModelId: 'meta-muse-spark' },
  { pattern: /^grok 4\.5\b/iu, canonicalModelId: 'xai-grok-4-5' },
  { pattern: /^glm[- ]5\.2\b/iu, canonicalModelId: 'zai-glm-5-2' },
  { pattern: /^glm[- ]5\.1\b/iu, canonicalModelId: 'zai-glm-5-1' },
  { pattern: /^minimax[- ]m3\b/iu, canonicalModelId: 'minimax-minimax-m3' },
  {
    pattern: /^deepseek[- ]v4 flash\b/iu,
    canonicalModelId: 'deepseek-deepseek-v4-flash',
  },
  {
    pattern: /^deepseek[- ]v4 pro\b/iu,
    canonicalModelId: 'deepseek-deepseek-v4-pro',
  },
  { pattern: /^deepseek[- ]v4\b/iu, canonicalModelId: 'deepseek-deepseek-v4' },
  { pattern: /^kimi k3\b/iu, canonicalModelId: 'moonshot-kimi-k3' },
  { pattern: /^kimi k2\.6\b/iu, canonicalModelId: 'moonshot-kimi-k2-6' },
  {
    pattern: /^qwen ?3\.7[- ]max\b/iu,
    canonicalModelId: 'alibaba-qwen3-7-max',
  },
  {
    pattern: /^(?:xiaomi )?mimo[- ]v2\.5[- ]pro\b/iu,
    canonicalModelId: 'xiaomi-mimo-v2-5-pro',
  },
  {
    pattern: /^nemotron 3 ultra\b/iu,
    canonicalModelId: 'nvidia-nemotron-3-ultra',
  },
];

const effortFromName = (rawName: string): string | null => {
  const normalizedName = rawName
    .replace(/(\d)-(\d)/gu, '$1.$2')
    .replace(/[_-]+/gu, ' ');
  const match = normalizedName.match(
    /(?:reasoning effort\s*=\s*|thinking\s+|\(|\b)(max|xhigh|high|medium|low|minimal)(?:\b|\))/iu,
  );
  return match?.[1]?.toLocaleLowerCase() ?? null;
};

const normaliseSourceDate = (
  value: string | null | undefined,
): string | null => {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/u.test(value) ? `${value}T00:00:00.000Z` : value;
};

const resolveModel = (rawName: string, sourceId: string): ResolvedModel => {
  const normalizedName = rawName
    .replace(/(\d)-(\d)/gu, '$1.$2')
    .replace(/[_-]+/gu, ' ');
  const mapping =
    MODEL_PATTERNS.find(({ pattern }) => pattern.test(rawName)) ??
    MODEL_PATTERNS.find(({ pattern }) => pattern.test(normalizedName));
  const effort = effortFromName(rawName);
  if (!mapping) {
    return { canonicalModelId: null, profileId: null, effort };
  }
  return {
    canonicalModelId: mapping.canonicalModelId,
    profileId: `${mapping.canonicalModelId}-${effort ?? 'source-default'}-${sourceId}`,
    effort,
  };
};

const provenance = (
  context: MaterializerContext,
  locator: string,
): CandidateResult['provenance'][string] => ({
  evidenceId: context.evidenceId,
  method: context.method,
  locator,
});

const candidate = (input: {
  context: MaterializerContext;
  benchmarkId: string;
  benchmarkVersion: string | null;
  rawName: string;
  rawScore: number;
  normalizedScore: number;
  metricId: string;
  metricName: string;
  metricUnit: string;
  locator: string;
  effort?: string | null;
  harness?: string | null;
  sourcePublishedAt?: string | null;
  suffix?: string;
}): CandidateResult => {
  const resolved = resolveModel(input.rawName, input.context.sourceId);
  const effort = input.effort ?? resolved.effort;
  const profileId = resolved.canonicalModelId
    ? `${resolved.canonicalModelId}-${effort ?? 'source-default'}-${input.context.sourceId}`
    : null;
  return CandidateResultSchema.parse({
    schemaVersion: 'candidate-result-v1',
    id: `${input.context.sourceId}:${input.benchmarkId}:${slugify(input.rawName)}:${slugify(input.benchmarkVersion ?? 'current')}${input.suffix ? `:${slugify(input.suffix)}` : ''}`,
    sourceId: input.context.sourceId,
    sourceRole: 'ORGANIZER',
    benchmarkId: input.benchmarkId,
    benchmarkVersion: input.benchmarkVersion,
    model: {
      rawName: input.rawName,
      canonicalModelId: resolved.canonicalModelId,
      profileId,
    },
    profile: {
      effort,
      thinking: /thinking|reasoning/iu.test(input.rawName) ? 'reasoning' : null,
      tools: null,
      harness: input.harness ?? null,
      contextWindowTokens: null,
      quantization: null,
      attempts: null,
    },
    metric: {
      id: input.metricId,
      name: input.metricName,
      unit: input.metricUnit,
      higherIsBetter: true,
    },
    rawScore: input.rawScore,
    normalizedScore: input.normalizedScore,
    acquisitionStatus: 'FULL',
    inclusion: 'INCLUDED',
    exclusionReason: null,
    sourceUrl: input.context.sourceUrl,
    observedAt: input.context.observedAt,
    sourcePublishedAt: normaliseSourceDate(
      input.sourcePublishedAt ?? input.context.sourcePublishedAt,
    ),
    evidenceIds: [input.context.evidenceId],
    provenance: {
      'model.rawName': provenance(input.context, `${input.locator} model`),
      rawScore: provenance(input.context, `${input.locator} score`),
      sourceRole: provenance(
        input.context,
        `${input.locator} organizer leaderboard`,
      ),
      ...(input.harness
        ? {
            'profile.harness': provenance(
              input.context,
              `${input.locator} original approach/tool setting`,
            ),
          }
        : {}),
    },
  });
};

const costRecord = (input: {
  context: MaterializerContext;
  rawName: string;
  cost: number;
  benchmarkId: string;
  benchmarkVersion: string | null;
  locator: string;
  effort?: string | null;
  harness?: string | null;
}): CostRecord => {
  const resolved = resolveModel(input.rawName, input.context.sourceId);
  const effort = input.effort ?? resolved.effort;
  const profileId = resolved.canonicalModelId
    ? `${resolved.canonicalModelId}-${effort ?? 'source-default'}-${input.context.sourceId}`
    : null;
  return CostRecordSchema.parse({
    schemaVersion: 'cost-record-v1',
    id: `${input.context.sourceId}:${slugify(input.rawName)}:${slugify(input.benchmarkVersion ?? 'current')}:${slugify(input.harness ?? 'default')}:cost`,
    sourceId: input.context.sourceId,
    model: {
      rawName: input.rawName,
      canonicalModelId: resolved.canonicalModelId,
      profileId,
    },
    profile: {
      effort,
      thinking: /thinking|reasoning/iu.test(input.rawName) ? 'reasoning' : null,
      tools: null,
      harness: input.harness ?? null,
      contextWindowTokens: null,
      quantization: null,
      attempts: null,
    },
    costType: 'AGENT_TASK',
    metricId: 'cost-per-task',
    metricName: 'Cost per task',
    unit: 'USD_PER_TASK',
    inputPerMillionTokens: null,
    outputPerMillionTokens: null,
    cost: input.cost,
    assumptionId: null,
    benchmarkId: input.benchmarkId,
    benchmarkVersion: input.benchmarkVersion,
    inclusion: 'INCLUDED',
    exclusionReason: null,
    sourceUrl: input.context.sourceUrl,
    observedAt: input.context.observedAt,
    sourcePublishedAt: normaliseSourceDate(input.context.sourcePublishedAt),
    evidenceIds: [input.context.evidenceId],
    provenance: {
      cost: provenance(input.context, `${input.locator} cost per task`),
      ...(input.harness
        ? {
            'profile.harness': provenance(
              input.context,
              `${input.locator} original approach/tool setting`,
            ),
          }
        : {}),
    },
  });
};

const htmlTextLines = (html: string): string[] =>
  html
    .replace(/<script[\s\S]*?<\/script>/giu, '')
    .replace(/<style[\s\S]*?<\/style>/giu, '')
    .replace(/<[^>]+>/gu, '\n')
    .replaceAll('&amp;', '&')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&plusmn;', '±')
    .split(/\n/gu)
    .map((line) => line.trim())
    .filter(Boolean);

export const materializeArcPrize = (
  evaluationsJson: string,
  modelsJson: string,
  evaluationsContext: MaterializerContext,
  modelsContext: MaterializerContext,
): MaterializedOrganizer => {
  const evaluations = JSON.parse(evaluationsJson) as Array<{
    datasetId: string;
    modelId: string;
    score: number;
    display: boolean;
  }>;
  const models = JSON.parse(modelsJson) as Array<{
    id: string;
    displayName: string;
    modelReleaseDate: string | null;
  }>;
  const modelsById = new Map(models.map((model) => [model.id, model]));
  const rows = evaluations.filter(
    ({ datasetId, display, modelId }) =>
      datasetId === 'v3_Semi_Private' && display && modelsById.has(modelId),
  );
  const candidates = rows.map((row, index) => {
    const model = modelsById.get(row.modelId)!;
    const base = candidate({
      context: evaluationsContext,
      benchmarkId: 'arc-agi',
      benchmarkVersion: 'ARC-AGI-3-v3_Semi_Private',
      rawName: model.displayName,
      rawScore: row.score,
      normalizedScore: row.score * 100,
      metricId: 'score',
      metricName: 'ARC-AGI-3 score',
      metricUnit: 'fraction',
      locator: `evaluations.json v3_Semi_Private row ${index + 1}`,
      sourcePublishedAt: model.modelReleaseDate,
    });
    return CandidateResultSchema.parse({
      ...base,
      evidenceIds: [evaluationsContext.evidenceId, modelsContext.evidenceId],
      provenance: {
        ...base.provenance,
        'model.rawName': provenance(
          modelsContext,
          `models.json id=${row.modelId} displayName`,
        ),
        sourcePublishedAt: provenance(
          modelsContext,
          `models.json id=${row.modelId} modelReleaseDate`,
        ),
      },
    });
  });
  return {
    candidates,
    costs: [],
    extractedRows: rows.length,
    expectedRows: rows.length,
    benchmarkVersion: 'ARC-AGI-3-v3_Semi_Private',
  };
};

export const materializeScaleHle = (
  html: string,
  context: MaterializerContext,
): MaterializedOrganizer => {
  const lines = htmlTextLines(html);
  const start = lines.indexOf('Performance Comparison');
  const end = lines.indexOf('Legend', start + 1);
  if (start < 0 || end < 0) {
    throw new Error('Scale HLE performance table boundaries were not found');
  }
  const rows: Array<{ rawName: string; score: number }> = [];
  for (let index = start + 1; index + 6 < end;) {
    if (
      /^\d+$/u.test(lines[index]!) &&
      Number.isFinite(Number(lines[index + 2])) &&
      lines[index + 3] === '±' &&
      lines[index + 5] === 'Calib Err:'
    ) {
      rows.push({
        rawName: lines[index + 1]!,
        score: Number(lines[index + 2]),
      });
      index += 7;
    } else {
      index += 1;
    }
  }
  const candidates = rows.map((row, index) =>
    candidate({
      context,
      benchmarkId: 'humanitys-last-exam',
      benchmarkVersion: 'final-2500',
      rawName: row.rawName,
      rawScore: row.score,
      normalizedScore: row.score,
      metricId: 'accuracy',
      metricName: 'Accuracy',
      metricUnit: 'percent',
      locator: `Performance Comparison row ${index + 1}`,
    }),
  );
  return {
    candidates,
    costs: [],
    extractedRows: rows.length,
    expectedRows: rows.length,
    benchmarkVersion: 'final-2500',
  };
};

export const materializeZapierAutomationBench = (
  moduleText: string,
  context: MaterializerContext,
): MaterializedOrganizer => {
  const tableMatch = moduleText.match(/z=`([^`]+)`,B=\[\[([\s\S]+?)\]\],V=\[/u);
  if (!tableMatch) {
    throw new Error('Zapier AutomationBench embedded table was not found');
  }
  const version = tableMatch[1]!;
  const table = `[[${tableMatch[2]}]]`;
  const rows = [
    ...table.matchAll(/\[(\d+),`([^`]+)`,`([\d.]+)%`,`([^`]+)`\]/gu),
  ].map((match) => ({
    rank: Number(match[1]),
    rawName: match[2]!,
    score: Number(match[3]),
    cost: match[4] === '—' ? null : Number(match[4]!.replace(/[$†]/gu, '')),
  }));
  if (rows.length === 0) {
    throw new Error('Zapier AutomationBench embedded table had no rows');
  }
  const candidates = rows.map((row) =>
    candidate({
      context,
      benchmarkId: 'automationbench',
      benchmarkVersion: version,
      rawName: row.rawName,
      rawScore: row.score,
      normalizedScore: row.score,
      metricId: 'task-completed-correctly',
      metricName: 'task_completed_correctly',
      metricUnit: 'percent',
      locator: `embedded leaderboard rank ${row.rank}`,
      harness: 'Zapier API mode',
    }),
  );
  const costs = rows.flatMap((row) =>
    row.cost === null
      ? []
      : [
          costRecord({
            context,
            rawName: row.rawName,
            cost: row.cost,
            benchmarkId: 'automationbench',
            benchmarkVersion: version,
            locator: `embedded leaderboard rank ${row.rank}`,
            harness: 'Zapier API mode',
          }),
        ],
  );
  return {
    candidates,
    costs,
    extractedRows: rows.length,
    expectedRows: Math.max(...rows.map(({ rank }) => rank)),
    benchmarkVersion: version,
  };
};

export const materializeOsworld = (
  json: string,
  context: MaterializerContext,
): MaterializedOrganizer => {
  const payload = JSON.parse(json) as {
    benchmarkVersion: string;
    taskVersion: string;
    updatedAt: string;
    defaultStepBudget: number;
    results: Array<{
      model: string;
      reasoning: string | null;
      toolSetting: string | null;
      stepBudget: number;
      binaryAccuracy: number;
      estimatedCostUsd: number | null;
      official: boolean;
    }>;
  };
  const rows = payload.results.filter(
    ({ official, stepBudget }) =>
      official && stepBudget === payload.defaultStepBudget,
  );
  const version = `${payload.benchmarkVersion}-${payload.taskVersion}-steps-${payload.defaultStepBudget}`;
  const publishedAt = `${payload.updatedAt}T00:00:00.000Z`;
  const candidates = rows.map((row, index) =>
    candidate({
      context,
      benchmarkId: 'osworld',
      benchmarkVersion: version,
      rawName: row.model,
      rawScore: row.binaryAccuracy,
      normalizedScore: row.binaryAccuracy,
      metricId: 'binary-accuracy',
      metricName: 'Binary accuracy',
      metricUnit: 'percent',
      locator: `official-results.json default-step row ${index + 1}`,
      effort: row.reasoning,
      harness: row.toolSetting,
      sourcePublishedAt: publishedAt,
      suffix: row.toolSetting ?? 'standard',
    }),
  );
  const costs = rows.flatMap((row, index) =>
    row.estimatedCostUsd === null
      ? []
      : [
          costRecord({
            context: { ...context, sourcePublishedAt: publishedAt },
            rawName: row.model,
            cost: row.estimatedCostUsd,
            benchmarkId: 'osworld',
            benchmarkVersion: version,
            locator: `official-results.json default-step row ${index + 1}`,
            effort: row.reasoning,
            harness: row.toolSetting,
          }),
        ],
  );
  return {
    candidates,
    costs,
    extractedRows: rows.length,
    expectedRows: rows.length,
    benchmarkVersion: version,
  };
};

export const materializeLechWriting = (
  markdown: string,
  context: MaterializerContext,
): MaterializedOrganizer => {
  const section = markdown.match(
    /### Leaderboard[\s\S]+?(?=\n### Coverage Note)/u,
  )?.[0];
  if (!section) {
    throw new Error('Lech Writing leaderboard section was not found');
  }
  const rows = section.split(/\r?\n/gu).flatMap((line) => {
    const match = line.match(
      /^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(-?[\d.]+)\s*\|\s*([\d.]+)%\s*\|/u,
    );
    return match
      ? [
          {
            rank: Number(match[1]),
            rawName: match[2]!.replace(/[†‡§]/gu, '').trim(),
            score: Number(match[4]),
          },
        ]
      : [];
  });
  const expectedRows = Number(
    markdown.match(/\*\s+(\d+) rated models/u)?.[1] ?? rows.length,
  );
  const candidates = rows.map((row) =>
    candidate({
      context,
      benchmarkId: 'lech-mazur-writing',
      benchmarkVersion: 'pairwise-v2-v3-bridge',
      rawName: row.rawName,
      rawScore: row.score,
      normalizedScore: row.score,
      metricId: 'estimated-win-chance',
      metricName: 'Estimated win chance',
      metricUnit: 'percent',
      locator: `Current Results leaderboard rank ${row.rank}`,
    }),
  );
  return {
    candidates,
    costs: [],
    extractedRows: rows.length,
    expectedRows,
    benchmarkVersion: 'pairwise-v2-v3-bridge',
  };
};
