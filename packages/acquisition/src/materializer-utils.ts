import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

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

export interface AAModelItem {
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

export function isAAModels(obj: unknown): obj is AAModelItem[] {
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

/**
 * The only reasoning-effort values that may become a product profile. Kept in
 * sync with `effortOrder` in data-v2/mappings/profile-policy.json; the test
 * suite asserts the two stay identical. Source values outside this set are
 * treated as unlabelled rather than inventing a new effort tier.
 */
export const LEGAL_SOURCE_EFFORTS: ReadonlySet<string> = new Set([
  'non-reasoning',
  'max',
  'xhigh',
  'high',
  'medium',
  'low',
]);

const sourceEffortKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+effort$/u, '')
    .replace(/^-+|-+$/g, '');

/**
 * Keep source values only when they describe one of the agreed effort tiers.
 * Invalid values such as Frontier Code's sampling key `0.99` become null;
 * the original key remains available in provenance locators.
 */
export function normalizeSourceEffort(
  raw: string | null | undefined,
): string | null {
  if (typeof raw !== 'string' || raw.trim().length === 0) return null;
  const key = sourceEffortKey(raw);
  if (key === 'nonreasoning') return 'non-reasoning';
  if (key === 'minimal') return 'minimal';
  return LEGAL_SOURCE_EFFORTS.has(key) ? key : null;
}

/**
 * Anthropic and DeepSeek rows on Artificial Analysis put the reasoning mode and
 * the tier in one comma-separated parenthetical, for example
 * `Claude Sonnet 5 (Non-reasoning, High Effort)` or
 * `Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback)`. Each
 * segment is normalised on its own; segments that name neither a mode nor a
 * tier, such as `Adaptive Reasoning` or `Opus 4.8 Fallback`, are ignored.
 *
 * Per REFACTOR_SPEC_V2.md section 4.4 the reasoning switch and the tier are one
 * axis, so an explicit non-reasoning marker wins over any tier named alongside
 * it: `(Non-reasoning, High Effort)` is `non-reasoning`, not `high`.
 */
export function parseEffort(rawName: string): string | null {
  const segments = (rawName.match(/\([^()]+\)/gu) ?? []).flatMap(
    (parenthetical) => parenthetical.slice(1, -1).split(','),
  );
  const normalized = segments
    .map((segment) => normalizeSourceEffort(segment))
    .filter((value): value is string => value !== null)
    .map((value) => (value === 'minimal' ? 'low' : value));
  if (normalized.includes('non-reasoning')) return 'non-reasoning';
  return normalized[0] ?? null;
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

export function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveModel(
  rawName: string,
  sourceId: 'epoch-ai' | 'artificial-analysis',
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
    const suffix = sourceId === 'epoch-ai' ? 'epoch-inspect' : 'aa-index';
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

export function resolveCatalogModel(rawName: string): {
  canonicalModelId: string | null;
  rawName: string;
} {
  loadModelsCatalog();
  const model = modelAliasIndex.get(slugify(rawName));
  return {
    canonicalModelId: model?.modelId ?? null,
    rawName,
  };
}

export function parseCsv(text: string): string[][] {
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
