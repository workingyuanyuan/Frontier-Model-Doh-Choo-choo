import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CandidateResultSchema } from '@llm-bench/benchmark-data';

import {
  extractLiveBenchMetadata,
  materializeLiveBench,
  resolveLiveBenchModel,
} from './livebench-materializer.js';

describe('LiveBench materializer', () => {
  const jsPath = resolve(
    '../../artifacts-v2/sha256/7a/7ad013edfc9ccaec78ad4a25dfebd0c8a1fa7f54744fc0e0354a1ffcf88c97db.js',
  );
  const tablePath = resolve(
    '../../artifacts-v2/sha256/15/1599f36a8888c62fc85ac6a5509b5041cec747844b38638f064aba4903297fe7.csv',
  );
  const categoriesPath = resolve(
    '../../artifacts-v2/sha256/da/dad300ad18655b69db720e1b88fc5a5eac06c5b2f0e52c2bf50f10ff057674f3.json',
  );

  const jsText = readFileSync(jsPath, 'utf8');
  const tableCsv = readFileSync(tablePath, 'utf8');
  const categoriesJson = readFileSync(categoriesPath, 'utf8');

  describe('deterministic model-name resolution', () => {
    it('matches a full catalog alias before interpreting max as effort', () => {
      expect(resolveLiveBenchModel('kimi-k3')).toMatchObject({
        canonicalModelId: 'moonshot-kimi-k3',
        effort: null,
        rule: 'exact-catalog',
      });

      // The max token is part of this model family name, not an effort
      // suffix. Full-name-first protects the catalog identity.
      expect(resolveLiveBenchModel('qwen3.7-max')).toMatchObject({
        canonicalModelId: 'alibaba-qwen3-7-max',
        effort: null,
        rule: 'exact-catalog',
      });
    });

    it('parses model-effort and model-effort-effort suffixes', () => {
      expect(resolveLiveBenchModel('claude-opus-5-max-effort')).toMatchObject({
        canonicalModelId: 'anthropic-claude-opus-5',
        effort: 'max',
        rule: 'effort-suffix',
      });
      expect(resolveLiveBenchModel('gemini-3.6-flash-high')).toMatchObject({
        canonicalModelId: 'google-gemini-3-6-flash',
        effort: 'high',
        rule: 'effort-suffix',
      });
    });

    it('prefers an approved full release alias before dated transforms', () => {
      expect(resolveLiveBenchModel('deepseek-v4-flash-0731')).toMatchObject({
        canonicalModelId: 'deepseek-deepseek-v4-flash',
        effort: null,
        rule: 'exact-catalog',
      });
      expect(
        resolveLiveBenchModel(
          'claude-sonnet-4-6-20260217-thinking-auto-medium-effort',
        ),
      ).toMatchObject({
        canonicalModelId: 'anthropic-claude-sonnet-4-6',
        effort: 'medium',
        rule: 'claude-thinking-effort',
      });
    });

    it('returns an explicit unresolved reason without fuzzy matching', () => {
      const result = resolveLiveBenchModel('smaug-agentic');
      expect(result).toMatchObject({
        canonicalModelId: null,
        effort: null,
        rule: 'unresolved',
      });
      expect(result.reason).toContain('no documented exact');
    });
  });

  it('dynamically extracts the latest release and cacheVersion without hardcoding', () => {
    const meta = extractLiveBenchMetadata(jsText);
    expect(meta.latestRelease).toBe('2026-06-25');
    expect(meta.cacheVersion).toBe('1786549038');
  });

  it('rejects bundle when release array or cacheVersion cannot be found', () => {
    expect(() => extractLiveBenchMetadata('const x = 42;')).toThrow(
      'Could not extract releases array',
    );
    expect(() =>
      extractLiveBenchMetadata('const releases = ["2026-01-01"];'),
    ).toThrow('Could not extract cacheVersion');
  });

  it('materializes all structured candidate results from committed LiveBench artifacts', () => {
    const result = materializeLiveBench(
      jsText,
      tableCsv,
      categoriesJson,
      '2026-08-12T16:44:09.579Z',
      {
        tableEvidenceId:
          'sha256:1599f36a8888c62fc85ac6a5509b5041cec747844b38638f064aba4903297fe7',
        categoriesEvidenceId:
          'sha256:dad300ad18655b69db720e1b88fc5a5eac06c5b2f0e52c2bf50f10ff057674f3',
        jsEvidenceId:
          'sha256:7ad013edfc9ccaec78ad4a25dfebd0c8a1fa7f54744fc0e0354a1ffcf88c97db',
        tableUrl: 'https://livebench.ai/table_2026_06_25.csv?v=1786549038',
        categoriesUrl:
          'https://livebench.ai/categories_2026_06_25.json?v=1786549038',
        jsUrl: 'https://livebench.ai/static/js/main.b540d9a3.js',
      },
    );

    // Schema parse validation
    CandidateResultSchema.array().parse(result.candidates);

    // Exactly 40 models * 4 approved categories = 160 candidates
    expect(result.populationRows).toBe(40);
    expect(result.extractedCandidates).toBe(160);
    expect(result.candidates).toHaveLength(160);
    expect(result.release).toBe('2026-06-25');
    expect(result.cacheVersion).toBe('1786549038');

    const reasoning = result.candidates.filter(
      (c) => c.benchmarkId === 'livebench-reasoning',
    );
    expect(reasoning).toHaveLength(40);

    const math = result.candidates.filter(
      (c) => c.benchmarkId === 'livebench-mathematics',
    );
    expect(math).toHaveLength(40);

    const language = result.candidates.filter(
      (c) => c.benchmarkId === 'livebench-language',
    );
    expect(language).toHaveLength(40);

    const ifBench = result.candidates.filter(
      (c) => c.benchmarkId === 'livebench-instruction-following',
    );
    expect(ifBench).toHaveLength(40);

    // Verify unapproved categories are excluded
    const coding = result.candidates.filter((c) =>
      c.benchmarkId.includes('coding'),
    );
    expect(coding).toHaveLength(0);

    const dataAnalysis = result.candidates.filter((c) =>
      c.benchmarkId.includes('data-analysis'),
    );
    expect(dataAnalysis).toHaveLength(0);

    // Verify validation report includes required sections
    expect(result.validationReport).toContain(
      '# LiveBench acquisition validation',
    );
    expect(result.validationReport).toContain('Raw model rows in table CSV');
    expect(result.validationReport).toContain('40');
    expect(result.validationReport).toContain('Approved scoring categories');
    expect(result.validationReport).toContain(
      'Distinct unresolved raw model names',
    );
    expect(result.validationReport).toContain('smaug-agentic');
    expect(result.validationReport).toContain('no documented exact');

    const claudeMax = result.candidates.find(
      (candidate) =>
        candidate.model.rawName === 'claude-opus-4-8-max-effort' &&
        candidate.benchmarkId === 'livebench-reasoning',
    );
    expect(claudeMax?.profile.effort).toBe('max');
  });
});
