import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import AdmZip from 'adm-zip';
import { type CandidateResult } from '@llm-bench/benchmark-data';

const exactModelMappings = {
  'epoch-ai': {
    'GPT-5.6 Sol (pro, max)': {
      canonicalModelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-pro-max-epoch-inspect',
    },
    'GPT-5.5 Pro (xhigh)': {
      canonicalModelId: 'openai-gpt-5-5-pro',
      profileId: 'openai-gpt-5-5-pro-xhigh-epoch-inspect',
    },
    'Claude Fable 5 (max)': {
      canonicalModelId: 'anthropic-claude-fable-5',
      profileId: 'anthropic-claude-fable-5-max-epoch-inspect',
    },
    'GPT-5.5 (xhigh)': {
      canonicalModelId: 'openai-gpt-5-5',
      profileId: 'openai-gpt-5-5-xhigh-epoch-inspect',
    },
    'GPT-5.6 Terra (max)': {
      canonicalModelId: 'openai-gpt-5-6-terra',
      profileId: 'openai-gpt-5-6-terra-max-epoch-inspect',
    },
    'Claude Opus 4.8': {
      canonicalModelId: 'anthropic-claude-opus-4-8',
      profileId: 'anthropic-claude-opus-4-8-max-epoch-inspect',
    },
    'GPT-5.4 Pro (xhigh)': {
      canonicalModelId: 'openai-gpt-5-4-pro',
      profileId: 'openai-gpt-5-4-pro-xhigh-epoch-inspect',
    },
    'GPT-5.4 (xhigh)': {
      canonicalModelId: 'openai-gpt-5-4',
      profileId: 'openai-gpt-5-4-xhigh-epoch-inspect',
    },
    'Claude Opus 4.7 (max)': {
      canonicalModelId: 'anthropic-claude-opus-4-7',
      profileId: 'anthropic-claude-opus-4-7-max-epoch-inspect',
    },
    'GPT-5.6 Luna (max)': {
      canonicalModelId: 'openai-gpt-5-6-luna',
      profileId: 'openai-gpt-5-6-luna-max-epoch-inspect',
    },
    'GPT-5.3 Codex (xhigh)': {
      canonicalModelId: 'openai-gpt-5-3-codex',
      profileId: 'openai-gpt-5-3-codex-xhigh-epoch-inspect',
    },
    'Claude Opus 4.6 (max)': {
      canonicalModelId: 'anthropic-claude-opus-4-6',
      profileId: 'anthropic-claude-opus-4-6-max-epoch-inspect',
    },
    'Gemini 3.1 Pro Preview': {
      canonicalModelId: 'google-gemini-3-1-pro-preview',
      profileId: 'google-gemini-3-1-pro-preview-default-epoch-inspect',
    },
    'GPT-5.2 Pro': {
      canonicalModelId: 'openai-gpt-5-2-pro',
      profileId: 'openai-gpt-5-2-pro-xhigh-epoch-inspect',
    },
    'Gemini 3.5 Flash (high)': {
      canonicalModelId: 'google-gemini-3-5-flash',
      profileId: 'google-gemini-3-5-flash-high-epoch-inspect',
    },
    'Muse Spark': {
      canonicalModelId: 'meta-muse-spark',
      profileId: 'meta-muse-spark-default-epoch-inspect',
    },
    'GPT-5.2 (xhigh)': {
      canonicalModelId: 'openai-gpt-5-2',
      profileId: 'openai-gpt-5-2-xhigh-epoch-inspect',
    },
    'Gemini 3 Pro Preview': {
      canonicalModelId: 'google-gemini-3-pro-preview',
      profileId: 'google-gemini-3-pro-preview-default-epoch-inspect',
    },
    'Claude Sonnet 5 (max)': {
      canonicalModelId: 'anthropic-claude-sonnet-5',
      profileId: 'anthropic-claude-sonnet-5-max-epoch-inspect',
    },
    'Claude Sonnet 4.6 (max)': {
      canonicalModelId: 'anthropic-claude-sonnet-4-6',
      profileId: 'anthropic-claude-sonnet-4-6-max-epoch-inspect',
    },
    'GPT-5.6 Sol (max)': {
      canonicalModelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-max-epoch-inspect',
    },
  },
  'vals-ai': {
    'Claude Fable 5': {
      canonicalModelId: 'anthropic-claude-fable-5',
      profileId: 'anthropic-claude-fable-5-vals-index',
    },
    'GPT-5.6 Sol': {
      canonicalModelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-max-vals-1m',
    },
    'Claude Opus 4.8': {
      canonicalModelId: 'anthropic-claude-opus-4-8',
      profileId: 'anthropic-claude-opus-4-8-vals-index',
    },
    'GPT-5.6 Luna': {
      canonicalModelId: 'openai-gpt-5-6-luna',
      profileId: 'openai-gpt-5-6-luna-vals-index',
    },
    'Claude Sonnet 5': {
      canonicalModelId: 'anthropic-claude-sonnet-5',
      profileId: 'anthropic-claude-sonnet-5-vals-index',
    },
    'Muse Spark 1.1': {
      canonicalModelId: 'meta-muse-spark-1-1',
      profileId: 'meta-muse-spark-1-1-vals-index',
    },
    'GPT 5.5': {
      canonicalModelId: 'openai-gpt-5-5',
      profileId: 'openai-gpt-5-5-vals-index',
    },
    'Claude Opus 4.7': {
      canonicalModelId: 'anthropic-claude-opus-4-7',
      profileId: 'anthropic-claude-opus-4-7-vals-index',
    },
    'Grok 4.5': {
      canonicalModelId: 'xai-grok-4-5',
      profileId: 'xai-grok-4-5-vals-index',
    },
    'GPT-5.6 Terra': {
      canonicalModelId: 'openai-gpt-5-6-terra',
      profileId: 'openai-gpt-5-6-terra-vals-index',
    },
    'GLM 5.2': {
      canonicalModelId: 'zai-glm-5-2',
      profileId: 'zai-glm-5-2-vals-index',
    },
    'Gemini 3.5 Flash': {
      canonicalModelId: 'google-gemini-3-5-flash',
      profileId: 'google-gemini-3-5-flash-vals-index',
    },
    'Claude Sonnet 4.6': {
      canonicalModelId: 'anthropic-claude-sonnet-4-6',
      profileId: 'anthropic-claude-sonnet-4-6-vals-index',
    },
    'MiniMax-M3': {
      canonicalModelId: 'minimax-minimax-m3',
      profileId: 'minimax-minimax-m3-vals-index',
    },
    'Qwen 3.7 Max': {
      canonicalModelId: 'alibaba-qwen3-7-max',
      profileId: 'alibaba-qwen3-7-max-vals-index',
    },
    'DeepSeek V4': {
      canonicalModelId: 'deepseek-deepseek-v4',
      profileId: 'deepseek-deepseek-v4-vals-index',
    },
  },
  'artificial-analysis': {
    'Claude Fable 5 (with fallback)': {
      canonicalModelId: 'anthropic-claude-fable-5',
      profileId: 'anthropic-claude-fable-5-with-fallback-aa-index',
    },
    'GPT-5.6 Sol (max)': {
      canonicalModelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-max-aa-briefcase',
    },
    'Claude Opus 4.8 (max)': {
      canonicalModelId: 'anthropic-claude-opus-4-8',
      profileId: 'anthropic-claude-opus-4-8-max-aa-index',
    },
    'GPT-5.6 Terra (max)': {
      canonicalModelId: 'openai-gpt-5-6-terra',
      profileId: 'openai-gpt-5-6-terra-max-aa-index',
    },
    'GPT-5.5 (xhigh)': {
      canonicalModelId: 'openai-gpt-5-5',
      profileId: 'openai-gpt-5-5-xhigh-aa-index',
    },
    'Grok 4.5 (high)': {
      canonicalModelId: 'xai-grok-4-5',
      profileId: 'xai-grok-4-5-high-aa-index',
    },
    'Claude Sonnet 5 (max)': {
      canonicalModelId: 'anthropic-claude-sonnet-5',
      profileId: 'anthropic-claude-sonnet-5-max-aa-index',
    },
    'GPT-5.6 Luna (max)': {
      canonicalModelId: 'openai-gpt-5-6-luna',
      profileId: 'openai-gpt-5-6-luna-max-aa-index',
    },
    'GLM-5.2 (max)': {
      canonicalModelId: 'zai-glm-5-2',
      profileId: 'zai-glm-5-2-max-aa-index',
    },
    'Muse Spark 1.1 (xhigh)': {
      canonicalModelId: 'meta-muse-spark-1-1',
      profileId: 'meta-muse-spark-1-1-xhigh-aa-index',
    },
    'Gemini 3.5 Flash': {
      canonicalModelId: 'google-gemini-3-5-flash',
      profileId: 'google-gemini-3-5-flash-aa-index',
    },
    'Gemini 3.1 Pro Preview': {
      canonicalModelId: 'google-gemini-3-1-pro-preview',
      profileId: 'google-gemini-3-1-pro-preview-aa-index',
    },
    'Qwen3.7 Max': {
      canonicalModelId: 'alibaba-qwen3-7-max',
      profileId: 'alibaba-qwen3-7-max-aa-index',
    },
    'MiniMax-M3': {
      canonicalModelId: 'minimax-minimax-m3',
      profileId: 'minimax-minimax-m3-aa-index',
    },
    'DeepSeek V4 Pro (max)': {
      canonicalModelId: 'deepseek-deepseek-v4-pro',
      profileId: 'deepseek-deepseek-v4-pro-max-aa-index',
    },
    'Kimi K2.6': {
      canonicalModelId: 'moonshot-kimi-k2-6',
      profileId: 'moonshot-kimi-k2-6-aa-index',
    },
    'MiMo-V2.5-Pro': {
      canonicalModelId: 'xiaomi-mimo-v2-5-pro',
      profileId: 'xiaomi-mimo-v2-5-pro-aa-index',
    },
    Inkling: {
      canonicalModelId: 'thinking-machines-inkling',
      profileId: 'thinking-machines-inkling-aa-index',
    },
    'DeepSeek V4 Flash (max)': {
      canonicalModelId: 'deepseek-deepseek-v4-flash',
      profileId: 'deepseek-deepseek-v4-flash-max-aa-index',
    },
    'Nemotron 3 Ultra': {
      canonicalModelId: 'nvidia-nemotron-3-ultra',
      profileId: 'nvidia-nemotron-3-ultra-aa-index',
    },
    'GPT-5.6 Sol (max) in Codex': {
      canonicalModelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-max-codex',
    },
  },
} as const;

function getWorkspaceRoot(): string {
  let dir = process.cwd();
  while (true) {
    if (existsSync(join(dir, 'data-v2'))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error('Workspace root not found');
    }
    dir = parent;
  }
}

interface ModelCatalogItem {
  modelId: string;
  providerId: string;
  displayName: string;
  releaseDate: string | null;
  pricing: unknown[];
  profilePricing: Record<string, unknown[]>;
  aliases?: string[];
  isReasoning?: boolean;
}

interface ModelCatalog {
  schemaVersion: string;
  models: ModelCatalogItem[];
}

function isModelCatalog(obj: unknown): obj is ModelCatalog {
  if (typeof obj !== 'object' || obj === null) return false;
  const raw = obj as Record<string, unknown>;
  if (typeof raw.schemaVersion !== 'string') return false;
  if (!Array.isArray(raw.models)) return false;
  for (const item of raw.models) {
    if (typeof item !== 'object' || item === null) return false;
    const m = item as Record<string, unknown>;
    if (typeof m.modelId !== 'string') return false;
    if (typeof m.displayName !== 'string') return false;
    if (
      m.aliases !== undefined &&
      (!Array.isArray(m.aliases) ||
        m.aliases.some((alias) => typeof alias !== 'string'))
    )
      return false;
  }
  return true;
}

interface ValsRliItem {
  model: [number, string];
  slug: [number, string];
}
type ValsRli = [number, Array<[number, ValsRliItem]>];

function isValsRli(obj: unknown): obj is ValsRli {
  if (!Array.isArray(obj) || obj.length < 2) return false;
  if (typeof obj[0] !== 'number' || !Array.isArray(obj[1])) return false;
  for (const item of obj[1]) {
    if (!Array.isArray(item) || item.length < 2) return false;
    if (
      typeof item[0] !== 'number' ||
      typeof item[1] !== 'object' ||
      item[1] === null
    )
      return false;
    const data = item[1] as Record<string, unknown>;
    if (!Array.isArray(data.model) || typeof data.model[1] !== 'string')
      return false;
    if (!Array.isArray(data.slug) || typeof data.slug[1] !== 'string')
      return false;
  }
  return true;
}

interface ValsScoreObj {
  accuracy: [number, number];
  reasoning_effort?: [number, string | null];
  compute_effort?: [number, string | null];
}
type ValsTaskData = [number, Record<string, [number, ValsScoreObj]>];
type ValsTasksParsed = [number, Record<string, ValsTaskData>];

function isValsTasksParsed(obj: unknown): obj is ValsTasksParsed {
  if (!Array.isArray(obj) || obj.length < 2) return false;
  if (
    typeof obj[0] !== 'number' ||
    typeof obj[1] !== 'object' ||
    obj[1] === null
  )
    return false;
  const raw = obj[1] as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    const val = raw[key];
    if (!Array.isArray(val) || val.length < 2) return false;
    if (
      typeof val[0] !== 'number' ||
      typeof val[1] !== 'object' ||
      val[1] === null
    )
      return false;
    const modelScores = val[1] as Record<string, unknown>;
    for (const slug of Object.keys(modelScores)) {
      const wrapped = modelScores[slug];
      if (!Array.isArray(wrapped) || wrapped.length < 2) return false;
      if (
        typeof wrapped[0] !== 'number' ||
        typeof wrapped[1] !== 'object' ||
        wrapped[1] === null
      )
        return false;
      const scoreObj = wrapped[1] as Record<string, unknown>;
      if (
        !Array.isArray(scoreObj.accuracy) ||
        typeof scoreObj.accuracy[1] !== 'number'
      )
        return false;
    }
  }
  return true;
}

interface AAModelItem {
  name: string;
  intelligenceIndex?: number | null;
  codingIndex?: number | null;
  omniscience?: number | null;
  omniscienceBreakdown?: {
    accuracy?: number | null;
    hallucinationRate?: number | null;
  } | null;
  lcr?: number | null;
  hle?: number | null;
  gpqa?: number | null;
  scicode?: number | null;
  critpt?: number | null;
  apexAgents?: number | null;
  terminalbenchV21?: number | null;
  tauBanking?: number | null;
  livecodebench?: number | null;
  gdpvalNormalized?: number | null;
  ifbench?: number | null;
}

function isAAModels(obj: unknown): obj is AAModelItem[] {
  if (!Array.isArray(obj)) return false;
  for (const item of obj) {
    if (typeof item !== 'object' || item === null) return false;
    const m = item as Record<string, unknown>;
    if (typeof m.name !== 'string') return false;
  }
  return true;
}

// Lazy load models catalog
let modelsCatalog: ModelCatalog | null = null;
const modelAliasIndex = new Map<string, ModelCatalogItem>();

function stripTrailingConfiguration(rawName: string): string {
  let current = rawName.trim();
  let previous = '';
  while (current !== previous) {
    previous = current;
    current = current.replace(/\s*\([^()]*\)\s*$/u, '').trim();
  }
  return current;
}

function parseEffort(rawName: string): string | null {
  const match = rawName.match(/\b(xhigh|max|high|medium|low)\b/iu);
  return match?.[1]?.toLowerCase() ?? null;
}

function registerModelAlias(alias: string, model: ModelCatalogItem): void {
  const key = slugify(alias);
  const existing = modelAliasIndex.get(key);
  if (existing && existing.modelId !== model.modelId) {
    throw new Error(
      `Model alias collision for "${alias}": ${existing.modelId} and ${model.modelId}`,
    );
  }
  modelAliasIndex.set(key, model);
}

function loadModelsCatalog() {
  if (!modelsCatalog) {
    const root = getWorkspaceRoot();
    const p = join(root, 'data-v2/mappings/models.json');
    const parsed: unknown = JSON.parse(readFileSync(p, 'utf8'));
    if (!isModelCatalog(parsed)) {
      throw new Error('Invalid models catalog schema');
    }
    modelsCatalog = parsed;
    for (const m of modelsCatalog.models) {
      registerModelAlias(m.modelId, m);
      registerModelAlias(m.displayName, m);
      for (const alias of m.aliases ?? []) registerModelAlias(alias, m);
    }
  }
}

function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveModel(
  rawName: string,
  sourceId: 'epoch-ai' | 'vals-ai' | 'artificial-analysis',
) {
  loadModelsCatalog();
  if (!modelsCatalog) {
    throw new Error('Models catalog not loaded');
  }

  // 1. Check exact mappings from existing candidates
  const mappings = exactModelMappings[sourceId] as Record<
    string,
    { readonly canonicalModelId: string; readonly profileId: string }
  >;
  const exact = mappings[rawName];
  if (exact) {
    return {
      canonicalModelId: exact.canonicalModelId,
      profileId: exact.profileId,
      rawName,
    };
  }

  // 2. Normalize and check against models.json
  const clean = stripTrailingConfiguration(rawName);
  const model =
    modelAliasIndex.get(slugify(rawName)) ??
    modelAliasIndex.get(slugify(clean));
  if (model) {
    const effort = parseEffort(rawName);
    const suffix =
      sourceId === 'epoch-ai'
        ? 'epoch-inspect'
        : sourceId === 'vals-ai'
          ? 'vals-index'
          : 'aa-index';
    const effortPart = effort
      ? `-${effort}`
      : sourceId === 'epoch-ai'
        ? '-default'
        : '';
    const profileId = `${model.modelId}${effortPart}-${suffix}`;

    return {
      canonicalModelId: model.modelId,
      profileId,
      rawName,
    };
  }

  // 3. Fallback to unresolved
  return {
    canonicalModelId: null,
    profileId: null,
    rawName,
  };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function parseEciLine(line: string): string[] {
  const row: string[] = [];
  let cell = '';
  let inQuotes = false;
  let escapeNext = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (escapeNext) {
      cell += char;
      escapeNext = false;
    } else if (char === '\\') {
      escapeNext = true;
    } else if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell);
  return row;
}

export function materializeEpoch(
  zipBuffer: Buffer,
  observedAt: string,
  context: { evidenceId?: string; sourceUrl?: string } = {},
): CandidateResult[] {
  const zip = new AdmZip(zipBuffer);
  const candidates: CandidateResult[] = [];
  const sourceId = 'epoch-ai';
  const sourceUrl =
    context.sourceUrl ?? 'https://epoch.ai/benchmarks/use-this-data';
  const evidenceId =
    context.evidenceId ??
    'sha256:f8ce95989868ba75347e92b661e5f700f5c07767f9884768d36632425c78a3b9';

  // 1. Load ECI capabilities index to map versions to display names
  const eciEntry = zip.getEntry('epoch_capabilities_index.csv');
  if (!eciEntry) throw new Error('epoch_capabilities_index.csv not found');
  const eciText = eciEntry.getData().toString('utf8');

  // ECI must be split naively by line to get exactly 719 rows
  const eciLines = eciText.split(/\r?\n/).filter((line) => line.trim());
  const eciRows = eciLines.map(parseEciLine);

  const versionToDisplayName = new Map<string, string>();
  for (let i = 1; i < eciRows.length; i++) {
    const row = eciRows[i];
    if (!row) continue;
    const version = row[0];
    if (version) {
      const displayName = row[10] || row[8] || version;
      versionToDisplayName.set(version, displayName);
    }
  }

  // Parse ECI candidates (from row 1 to 719)
  for (let i = 1; i < eciRows.length; i++) {
    const row = eciRows[i];
    if (!row) continue;
    const version = row[0];
    if (!version) continue;
    const scoreStr = row[1]?.trim();
    if (!scoreStr) continue;
    const rawScoreVal = parseFloat(scoreStr);
    if (isNaN(rawScoreVal) || !isFinite(rawScoreVal)) continue;
    const releaseDate = row[2] ? `${row[2]}T00:00:00.000Z` : null;
    const displayName = row[10] || row[8] || version;

    const { canonicalModelId, profileId, rawName } = resolveModel(
      displayName,
      'epoch-ai',
    );

    // profile effort and thinking logic
    let effort: string | null = null;
    let thinking: string | null = null;
    if (version.endsWith('_promax') || version.endsWith('_pro_max')) {
      effort = 'max';
      thinking = 'pro';
    } else if (version.endsWith('_max')) {
      effort = 'max';
    } else if (version.endsWith('_xhigh')) {
      effort = 'xhigh';
    } else if (version.endsWith('_high')) {
      effort = 'high';
    } else if (version.endsWith('_medium')) {
      effort = 'medium';
    } else if (version.endsWith('_low')) {
      effort = 'low';
    }
    if (version.includes('_thinking')) {
      thinking = 'reasoning';
    }
    if (version.includes('-pro') || version.includes('_pro')) {
      thinking = 'pro';
    }

    const modelPart = profileId || slugify(rawName);

    candidates.push({
      schemaVersion: 'candidate-result-v1',
      id: `${sourceId}:epoch-capabilities-index:${modelPart}-row-${i}`,
      sourceId,
      sourceRole: 'ORGANIZER',
      benchmarkId: 'epoch-capabilities-index',
      benchmarkVersion: '2026-07-16',
      model: {
        rawName,
        canonicalModelId,
        profileId,
      },
      profile: {
        effort,
        thinking,
        tools: null,
        harness: 'Epoch AI Inspect',
        contextWindowTokens: null,
        quantization: null,
        attempts: 1,
      },
      metric: {
        id: 'eci-score',
        name: 'ECI Score',
        unit: 'eci-points',
        higherIsBetter: true,
      },
      rawScore: rawScoreVal,
      normalizedScore: null,
      acquisitionStatus: 'FULL',
      inclusion: 'EXCLUDED',
      exclusionReason:
        'Composite index is selection-only and must not be double-counted in eight-dimension scoring.',
      sourceUrl,
      observedAt,
      sourcePublishedAt: releaseDate,
      evidenceIds: [evidenceId],
      provenance: {
        rawScore: {
          evidenceId,
          method: 'EXPORT',
          locator: `epoch_capabilities_index.csv[Model version="${version}"].ECI Score`,
        },
        sourceRole: {
          evidenceId,
          method: 'EXPORT',
          locator:
            'epoch_capabilities_index.csv (filename has no _external suffix)',
        },
      },
    });
  }

  // 2. Parse direct benchmarks using the robust CSV parser
  const directFiles = [
    {
      name: 'gpqa_diamond.csv',
      benchmarkId: 'gpqa-diamond',
      isOrganizer: false,
    },
    {
      name: 'math_level_5.csv',
      benchmarkId: 'math-level-5',
      isOrganizer: false,
    },
    {
      name: 'swe_bench_verified.csv',
      benchmarkId: 'swe-bench',
      isOrganizer: false,
    },
    {
      name: 'otis_mock_aime_2024_2025.csv',
      benchmarkId: 'aime',
      isOrganizer: false,
    },
    {
      name: 'frontiermath.csv',
      benchmarkId: 'frontiermath',
      isOrganizer: true,
      version: null,
    },
    {
      name: 'frontiermath_tier_4.csv',
      benchmarkId: 'frontiermath',
      isOrganizer: true,
      version: 'Tier 4',
    },
    {
      name: 'simpleqa_verified.csv',
      benchmarkId: 'simpleqa-verified',
      isOrganizer: false,
    },
    {
      name: 'chess_puzzles.csv',
      benchmarkId: 'chess-puzzles',
      isOrganizer: false,
    },
  ];

  for (const f of directFiles) {
    const entry = zip.getEntry(f.name);
    if (!entry) continue;
    const text = entry.getData().toString('utf8');
    const rows = parseCsv(text);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row[0]) continue;
      const version = row[0];
      const scoreStr = row[1]?.trim();
      if (!scoreStr) continue;
      const meanScore = parseFloat(scoreStr);
      if (isNaN(meanScore) || !isFinite(meanScore)) continue;
      const startedAt = row[11] || null;

      const displayName = versionToDisplayName.get(version) || version;
      const { canonicalModelId, profileId, rawName } = resolveModel(
        displayName,
        'epoch-ai',
      );

      // profile effort and thinking logic
      let effort: string | null = null;
      let thinking: string | null = null;
      if (version.endsWith('_promax') || version.endsWith('_pro_max')) {
        effort = 'max';
        thinking = 'pro';
      } else if (version.endsWith('_max')) {
        effort = 'max';
      } else if (version.endsWith('_xhigh')) {
        effort = 'xhigh';
      } else if (version.endsWith('_high')) {
        effort = 'high';
      } else if (version.endsWith('_medium')) {
        effort = 'medium';
      } else if (version.endsWith('_low')) {
        effort = 'low';
      }
      if (version.includes('_thinking')) {
        thinking = 'reasoning';
      }
      if (version.includes('-pro') || version.includes('_pro')) {
        thinking = 'pro';
      }

      const modelPart = profileId || slugify(rawName);
      const versionPart = f.version ? `:${slugify(f.version)}` : '';
      const candidateId = `${sourceId}:${f.benchmarkId}:${modelPart}-row-${i}${versionPart}`;

      candidates.push({
        schemaVersion: 'candidate-result-v1',
        id: candidateId,
        sourceId,
        sourceRole: f.isOrganizer ? 'ORGANIZER' : 'INDEPENDENT',
        benchmarkId: f.benchmarkId,
        benchmarkVersion: f.version || null,
        model: {
          rawName,
          canonicalModelId,
          profileId,
        },
        profile: {
          effort,
          thinking,
          tools: null,
          harness: 'Epoch AI Inspect',
          contextWindowTokens: null,
          quantization: null,
          attempts: 1,
        },
        metric: {
          id: 'accuracy',
          name: 'Accuracy',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: meanScore,
        normalizedScore: meanScore * 100,
        acquisitionStatus: 'FULL',
        inclusion: 'INCLUDED',
        exclusionReason: null,
        sourceUrl,
        observedAt,
        sourcePublishedAt: startedAt,
        evidenceIds: [evidenceId],
        provenance: {
          rawScore: {
            evidenceId,
            method: 'EXPORT',
            locator: `${f.name}[Model version="${version}"].mean_score`,
          },
          sourceRole: {
            evidenceId,
            method: 'EXPORT',
            locator: f.isOrganizer
              ? `${f.name} (FrontierMath is organizer evidence)`
              : `${f.name} (rerun of external benchmark)`,
          },
        },
      });
    }
  }

  return candidates;
}

export function materializeVals(
  homeHtml: string,
  detailHtml: string,
  observedAt: string,
  context: {
    homeEvidenceId?: string;
    detailEvidenceId?: string;
    homeUrl?: string;
    detailUrl?: string;
  } = {},
): CandidateResult[] {
  const candidates: CandidateResult[] = [];
  const sourceId = 'vals-ai';
  const homeUrl = context.homeUrl ?? 'https://www.vals.ai/home';
  const detailUrl =
    context.detailUrl ?? 'https://www.vals.ai/models/openai_gpt-5.6-sol';
  const homeEvidenceId =
    context.homeEvidenceId ??
    'sha256:a905ab27b4c4efc554e0c62ff8e501e9710d8e7474c3834c124b0dac50c80a09';
  const detailEvidenceId =
    context.detailEvidenceId ??
    'sha256:5facdfe0c6d90ff4b224aae0ac6d5884b2e536dcaad23de47ed437b59f677871';

  // Helper to decode HTML entities
  function htmlDecode(input: string): string {
    return input
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&#x2F;/g, '/');
  }

  // 1. Extract regularLeaderboardItems and tasks matrix from homeHtml
  const bvIdx = homeHtml.indexOf('benchmarkView');
  if (bvIdx === -1)
    throw new Error('benchmarkView not found in Vals AI Home HTML');
  const scriptStart = homeHtml.lastIndexOf('<script', bvIdx);
  const scriptEnd = homeHtml.indexOf('</script>', bvIdx);
  const scriptOpenTagEnd = homeHtml.indexOf('>', scriptStart);

  const scriptContent = htmlDecode(
    homeHtml.slice(scriptOpenTagEnd + 1, scriptEnd),
  );

  // Find properties of regularLeaderboardItems and tasks inside scriptContent
  // Let's find regularLeaderboardItems starting bracket
  const rliIndex = scriptContent.indexOf('"regularLeaderboardItems"');
  if (rliIndex === -1)
    throw new Error('regularLeaderboardItems not found in Astro props');
  const rliStart = scriptContent.indexOf('[', rliIndex);

  // Parse balanced bracket for regularLeaderboardItems
  let bracketCount = 0;
  let rliEnd = -1;
  let inString = false;
  let escapeNext = false;
  for (let i = rliStart; i < scriptContent.length; i++) {
    const char = scriptContent[i];
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
          rliEnd = i + 1;
          break;
        }
      }
    }
  }

  if (rliEnd === -1)
    throw new Error('Failed to parse regularLeaderboardItems JSON');
  const rliJsonText = scriptContent.slice(rliStart, rliEnd);
  const rliParsed: unknown = JSON.parse(rliJsonText);
  if (!isValsRli(rliParsed)) {
    throw new Error('Invalid Vals regularLeaderboardItems schema');
  }
  const rli = rliParsed;

  // Construct slug -> display name map
  // Structure: [1, [[0, { model: [0, displayName], slug: [0, slugWithUnderline] }], ...]]
  const slugToDisplayName = new Map<string, string>();
  const items = rli[1];
  for (const item of items) {
    const data = item[1];
    const displayName = data.model[1];
    const rawSlug = data.slug[1];
    if (displayName && rawSlug) {
      // Slugs in tasks matrix are formatted with slash (e.g., openai/gpt-5.6-sol)
      // Slugs in Astro props have underline (e.g., openai_gpt-5.6-sol)
      const tasksSlug = rawSlug.replace('_', '/');
      slugToDisplayName.set(tasksSlug, displayName);
    }
  }

  // Extract tasks matrix
  let tasksIndex = scriptContent.indexOf('total_models":[0,36]}],"tasks"');
  if (tasksIndex !== -1) {
    tasksIndex = scriptContent.indexOf('"tasks"', tasksIndex);
  } else {
    tasksIndex = scriptContent.indexOf('"tasks"');
  }
  if (tasksIndex === -1) throw new Error('tasks not found in Astro props');
  const tasksStart = scriptContent.indexOf('[', tasksIndex);
  bracketCount = 0;
  let tasksEnd = -1;
  inString = false;
  escapeNext = false;
  for (let i = tasksStart; i < scriptContent.length; i++) {
    const char = scriptContent[i];
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
          tasksEnd = i + 1;
          break;
        }
      }
    }
  }

  if (tasksEnd === -1) throw new Error('Failed to parse tasks JSON');
  const tasksJsonText = scriptContent.slice(tasksStart, tasksEnd);
  const tasksParsed: unknown = JSON.parse(tasksJsonText);
  if (!isValsTasksParsed(tasksParsed)) {
    throw new Error('Invalid Vals tasks schema');
  }
  const tasks = tasksParsed[1];

  const sourcePublishedAt = '2026-07-13T00:00:00.000Z';

  // Matrix tasks mapping to benchmark ID, metric ID, sourceRole, inclusion
  const taskMappings = [
    {
      key: 'overall',
      benchmarkId: 'vals-index',
      isOrganizer: true,
      inclusion: 'EXCLUDED' as const,
      exclusionReason:
        'Composite index is selection-only and must not be double-counted in eight-dimension scoring.',
    },
    {
      key: 'finance_agent',
      benchmarkId: 'finance-agent-v2',
      isOrganizer: true,
      inclusion: 'INCLUDED' as const,
      exclusionReason: null,
    },
    {
      key: 'corp_fin_v2',
      benchmarkId: 'corpfin',
      isOrganizer: true,
      inclusion: 'INCLUDED' as const,
      exclusionReason: null,
    },
    {
      key: 'swebench',
      benchmarkId: 'swe-bench',
      isOrganizer: false,
      inclusion: 'INCLUDED' as const,
      exclusionReason: null,
    },
    {
      key: 'vibe_code_bench',
      benchmarkId: 'vibe-code-bench',
      isOrganizer: true,
      inclusion: 'INCLUDED' as const,
      exclusionReason: null,
    },
    {
      key: 'terminal_bench_2_1',
      benchmarkId: 'terminal-bench-2-1',
      isOrganizer: false,
      inclusion: 'INCLUDED' as const,
      exclusionReason: null,
    },
  ];

  for (const m of taskMappings) {
    const taskData = tasks[m.key];
    if (!taskData) continue;
    const modelScores = taskData[1];

    for (const [slug, scoreObjWrapped] of Object.entries(modelScores)) {
      const scoreObj = scoreObjWrapped[1];
      const accuracy = scoreObj.accuracy[1]; // numeric value in 0-100

      const displayName = slugToDisplayName.get(slug) || slug;
      const { canonicalModelId, profileId, rawName } = resolveModel(
        displayName,
        'vals-ai',
      );

      // Profile attributes
      const reasoningEffort = scoreObj.reasoning_effort?.[1] || null;
      const computeEffort = scoreObj.compute_effort?.[1] || null;
      let effort = reasoningEffort || computeEffort;

      let contextWindowTokens: number | null = null;
      let thinking: string | null = null;
      let tools: boolean | null = null;

      if (rawName === 'GPT-5.6 Sol') {
        effort = 'max';
        contextWindowTokens = 1000000;
        thinking = 'reasoning';
        // tools is true for swebench and terminal_bench_2_1
        if (m.key === 'swebench' || m.key === 'terminal_bench_2_1') {
          tools = true;
        }
      }

      const modelPart = profileId || slugify(slug);

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
          tools,
          harness: null,
          contextWindowTokens,
          quantization: null,
          attempts: null,
        },
        metric: {
          id: 'accuracy',
          name: 'Accuracy',
          unit: 'percent',
          higherIsBetter: true,
        },
        rawScore: accuracy,
        normalizedScore: accuracy,
        acquisitionStatus: 'FULL',
        inclusion: m.inclusion,
        exclusionReason: m.exclusionReason,
        sourceUrl: homeUrl,
        observedAt,
        sourcePublishedAt,
        evidenceIds: [homeEvidenceId],
        provenance: {
          rawScore: {
            evidenceId: homeEvidenceId,
            method: 'DOM',
            locator: `benchmarkView.tasks.${m.key}["${slug}"].accuracy`,
          },
          sourceRole: {
            evidenceId: homeEvidenceId,
            method: 'DOM',
            locator: m.isOrganizer
              ? `benchmarkView.tasks.${m.key} (Vals-owned/organizer benchmark)`
              : `benchmarkView.tasks.${m.key} (rerun of external benchmark)`,
          },
        },
      });
    }
  }

  // 2. Add manual/article update candidates
  // - GPT-5.6 Sol ProofBench: 77% (from update card)
  // - GPT-5.6 Sol GPQA Diamond: 95.202% (from detail page target-width)

  // ProofBench GPT-5.6 Sol
  candidates.push({
    schemaVersion: 'candidate-result-v1',
    id: `${sourceId}:proofbench:openai-gpt-5-6-sol-max-vals-1m`,
    sourceId,
    sourceRole: 'ORGANIZER',
    benchmarkId: 'proofbench',
    benchmarkVersion: null,
    model: {
      rawName: 'GPT-5.6 Sol',
      canonicalModelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-max-vals-1m',
    },
    profile: {
      effort: 'max',
      thinking: 'reasoning',
      tools: null,
      harness: null,
      contextWindowTokens: 1000000,
      quantization: null,
      attempts: null,
    },
    metric: {
      id: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      higherIsBetter: true,
    },
    rawScore: 77,
    normalizedScore: 77,
    acquisitionStatus: 'FULL',
    inclusion: 'INCLUDED',
    exclusionReason: null,
    sourceUrl: homeUrl,
    observedAt,
    sourcePublishedAt: '2026-07-09T00:00:00.000Z',
    evidenceIds: [homeEvidenceId, detailEvidenceId],
    provenance: {
      rawScore: {
        evidenceId: homeEvidenceId,
        method: 'DOM',
        locator: 'ProofBench update card text ("77.00%")',
      },
      sourceRole: {
        evidenceId: homeEvidenceId,
        method: 'DOM',
        locator: 'ProofBench heading text (Vals-owned benchmark)',
      },
    },
  });

  // GPQA Diamond GPT-5.6 Sol
  candidates.push({
    schemaVersion: 'candidate-result-v1',
    id: `${sourceId}:gpqa-diamond:openai-gpt-5-6-sol-max-vals-1m`,
    sourceId,
    sourceRole: 'INDEPENDENT',
    benchmarkId: 'gpqa-diamond',
    benchmarkVersion: null,
    model: {
      rawName: 'GPT-5.6 Sol',
      canonicalModelId: 'openai-gpt-5-6-sol',
      profileId: 'openai-gpt-5-6-sol-max-vals-1m',
    },
    profile: {
      effort: 'max',
      thinking: 'reasoning',
      tools: null,
      harness: null,
      contextWindowTokens: 1000000,
      quantization: null,
      attempts: null,
    },
    metric: {
      id: 'accuracy',
      name: 'Accuracy',
      unit: 'percent',
      higherIsBetter: true,
    },
    rawScore: 95.202,
    normalizedScore: 95.202,
    acquisitionStatus: 'FULL',
    inclusion: 'INCLUDED',
    exclusionReason: null,
    sourceUrl: detailUrl,
    observedAt,
    sourcePublishedAt: '2026-07-09T00:00:00.000Z',
    evidenceIds: [detailEvidenceId],
    provenance: {
      rawScore: {
        evidenceId: detailEvidenceId,
        method: 'DOM',
        locator:
          'GPQA Diamond detail page progress bar style target-width ("95.202%")',
      },
      sourceRole: {
        evidenceId: detailEvidenceId,
        method: 'DOM',
        locator: 'GPQA Diamond heading text (rerun of external benchmark)',
      },
    },
  });

  return candidates;
}

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
