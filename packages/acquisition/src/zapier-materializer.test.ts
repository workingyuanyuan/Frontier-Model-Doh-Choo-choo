import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';
import { AcquisitionBudget } from './acquisition-policy.js';

import {
  ZAPIER_ADOPTION_PENDING_REASON,
  ZAPIER_ROUTE_FEATURE,
  extractZapierModuleUrls,
  findZapierRouteModule,
  materializeZapier,
  parseZapierCost,
  parseZapierRouteModule,
} from './zapier-materializer.js';

const fixture = (name: string): string =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

const pageFixture = fixture('zapier-benchmarks-page.html');
const routeFixture = fixture('zapier-route-module.mjs');
const latestRouteFixture = fixture('zapier-route-module-latest.mjs');
const mockContext = {
  moduleEvidenceId: `sha256:${'a'.repeat(64)}`,
  pageEvidenceId: `sha256:${'b'.repeat(64)}`,
  moduleUrl:
    'https://framerusercontent.com/sites/example/AutomationBenchRoute.NEW_HASH.fixture.mjs',
  observedAt: '2026-08-22T00:00:00.000Z',
  discoveredModuleCount: 2,
};

describe('Zapier AutomationBench route discovery', () => {
  it('rejects a private module destination before loading any module', async () => {
    const load = vi.fn(async () => routeFixture);
    await expect(
      findZapierRouteModule(
        pageFixture.replaceAll('framerusercontent.com', '127.0.0.1'),
        load,
      ),
    ).rejects.toThrow(/not public/);
    expect(load).not.toHaveBeenCalled();
  });

  it('applies the shared discovery budget before loading modules', async () => {
    const load = vi.fn(async () => routeFixture);
    await expect(
      findZapierRouteModule(
        pageFixture,
        load,
        undefined,
        new AcquisitionBudget({ discoveredItems: 1 }),
      ),
    ).rejects.toThrow(/discovered-item/);
    expect(load).not.toHaveBeenCalled();
  });

  it('extracts and resolves module URLs from the recorded page fixture', () => {
    expect(extractZapierModuleUrls(pageFixture)).toEqual([
      'https://framerusercontent.com/sites/example/AutomationBenchRoute.OLD_HASH.fixture.mjs',
      'https://framerusercontent.com/sites/example/shared.fixture.mjs',
    ]);
  });

  it('selects by content feature after the deployment hash changes', async () => {
    const changedPage = pageFixture.replaceAll('OLD_HASH', 'NEW_HASH');
    const found = await findZapierRouteModule(changedPage, async (url) =>
      url.includes('NEW_HASH') ? routeFixture : 'export const shared = true;',
    );

    expect(found.url).toContain('NEW_HASH');
    expect(found.url).not.toContain('OLD_HASH');
    expect(found.text).toContain(ZAPIER_ROUTE_FEATURE);
    expect(found.discoveredModuleCount).toBe(2);
  });

  it('fails closed when no module contains task_completed_correctly', async () => {
    await expect(
      findZapierRouteModule(pageFixture, async () => 'export const x = 1;'),
    ).rejects.toThrow(/No Zapier route module contains required feature/iu);
  });
});

describe('Zapier AutomationBench module parser', () => {
  it('extracts version, all rows, footnotes, and verifies max rank', () => {
    const parsed = parseZapierRouteModule(routeFixture);
    expect(parsed.version).toBe('1.0.6');
    expect(parsed.rows).toHaveLength(5);
    expect(parsed.rows.at(-1)?.rank).toBe(5);
    expect(parsed.promoNote).toContain('standard list pricing');
    expect(parsed.dedicatedDeploymentNote).toContain('not directly comparable');
  });

  it('fails when maximum rank does not equal parsed row count', () => {
    const broken = routeFixture.replace(
      /\[\s*5\s*,\s*`Deepseek/u,
      '[6, `Deepseek',
    );
    expect(() => parseZapierRouteModule(broken)).toThrow(
      /maximum rank 6 != parsed rows 5/iu,
    );
  });

  it('fails when a marked cost loses its explanatory footnote', () => {
    const broken = routeFixture.replace(
      '*Gemini 3.7 Flash launch promo:',
      'Gemini 3.7 Flash launch promo:',
    );
    expect(() => parseZapierRouteModule(broken)).toThrow(
      /starred cost exists but its promo footnote is missing/iu,
    );
  });

  it('accepts the current Gemini, Fable fallback, and DeepSeek footnotes', () => {
    const parsed = parseZapierRouteModule(latestRouteFixture);

    expect(parsed.version).toBe('1.0.6');
    expect(parsed.rows).toHaveLength(11);
    expect(parsed.rows[0]).toMatchObject({
      model: 'GPT 6 Astra (Max)',
      scoreText: '41.4%',
      rawCost: '$1.77',
    });
    expect(parsed.promoNote).toContain('both Gemini models');
    expect(parsed.promoNote).toContain('Gemini 3.8 Flash');
    expect(parsed.promoNote).toContain('Dec 31, 2026');
    expect(parsed.fallbackNote).toContain('excludes fallback tokens');
    expect(parsed.deepseekPricingNote).toContain('Fireworks rates');
    expect(parsed.dedicatedDeploymentNote).toContain('not directly comparable');
  });

  it('fails when a fallback marker loses its explanatory footnote', () => {
    const broken = latestRouteFixture.replace(
      '§ Rank 5 is Fable 5.1 with an Opus 5 fallback:',
      'Rank 5 is Fable 5.1 with an Opus 5 fallback:',
    );
    expect(() => parseZapierRouteModule(broken)).toThrow(
      /fallback cost exists but its fallback footnote is missing/iu,
    );
  });

  it('fails closed when a marked footnote has misleading pricing semantics', () => {
    const misleading = latestRouteFixture.replace(
      '‡DeepSeek V4 Flash priced at Fireworks rates',
      '‡DeepSeek V4 Flash priced at an unknown rate',
    );
    expect(() => parseZapierRouteModule(misleading)).toThrow(
      /DeepSeek pricing footnote has unsupported semantics/iu,
    );
  });

  it('rejects missing, ambiguous, or non-standard promotional footnotes', () => {
    expect(() =>
      parseZapierRouteModule(
        latestRouteFixture.replace(
          'Ranking and Cost / task reflect standard list pricing.',
          'Ranking and Cost / task reflect promotional pricing.',
        ),
      ),
    ).toThrow(/unsupported semantics/iu);
    expect(() =>
      parseZapierRouteModule(
        latestRouteFixture.replace(
          '‡DeepSeek V4 Flash priced at Fireworks rates',
          'DeepSeek V4 Flash priced at Fireworks rates',
        ),
      ),
    ).toThrow(/pricing footnote is missing/iu);
    expect(() =>
      parseZapierRouteModule(
        latestRouteFixture +
          '\nconst secondNote = `*Another promotional note`;',
      ),
    ).toThrow(/Multiple Zapier/iu);
  });
});

describe('Zapier cost rulings', () => {
  it('keeps standard and starred list prices while omitting missing and dedicated prices', () => {
    expect(parseZapierCost('$1.27')).toEqual({
      value: 1.27,
      kind: 'STANDARD',
    });
    expect(parseZapierCost('$0.61*')).toEqual({
      value: 0.61,
      kind: 'STARRED_STANDARD',
    });
    expect(parseZapierCost('—')).toEqual({ value: null, kind: 'MISSING' });
    expect(parseZapierCost('$0.09†')).toEqual({
      value: null,
      kind: 'DEDICATED',
    });
    expect(parseZapierCost('$2.45§')).toEqual({
      value: null,
      kind: 'FALLBACK_EXCLUDED',
    });
    expect(parseZapierCost('$0.14‡')).toEqual({
      value: 0.14,
      kind: 'FIREWORKS_STANDARD',
    });
    expect(() => parseZapierCost('unknown')).toThrow(
      /Unsupported Zapier cost value/iu,
    );
    for (const ambiguous of ['$2.45§*', '$0.14‡†', '$1.00*†']) {
      expect(() => parseZapierCost(ambiguous)).toThrow(
        /Unsupported Zapier cost value/iu,
      );
    }
  });
});

describe('Zapier AutomationBench materializer', () => {
  it('materializes strict API-mode scores and the two approved cost policies', () => {
    const result = materializeZapier(routeFixture, mockContext);

    expect(result.version).toBe('1.0.6');
    expect(result.rowCount).toBe(5);
    expect(result.maxRank).toBe(5);
    expect(result.candidates).toHaveLength(5);
    expect(result.costs).toHaveLength(3);
    expect(result.missingCostRowsCount).toBe(1);
    expect(result.starredCostRowsCount).toBe(1);
    expect(result.dedicatedCostRowsCount).toBe(1);

    const gemini37 = result.candidates.find(
      ({ model }) => model.rawName === 'Gemini 3.7 Flash (High)',
    )!;
    expect(gemini37.metric.id).toBe('task-completed-correctly');
    expect(gemini37.rawScore).toBe(30.44);
    expect(gemini37.normalizedScore).toBe(30.44);
    expect(gemini37.profile.effort).toBe('high');
    expect(gemini37.provenance.cost?.locator).toContain('$0.61*');
    expect(gemini37.inclusion).toBe('INCLUDED');
    expect(gemini37.exclusionReason).toBeNull();

    const starredCost = result.costs.find(
      ({ model }) => model.rawName === 'Gemini 3.7 Flash (High)',
    )!;
    expect(starredCost.cost).toBe(0.61);
    expect(starredCost.provenance.cost?.locator).toContain('$0.61*');
    expect(starredCost.inclusion).toBe('INCLUDED');
    expect(starredCost.exclusionReason).toBeNull();

    // Adopted on 2026-08-23: a row is excluded only for a row-specific reason,
    // never because it came from Zapier.
    expect(
      result.candidates.filter(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toHaveLength(1);
    expect(
      result.candidates.every(
        ({ inclusion, exclusionReason }) =>
          inclusion === 'INCLUDED' ||
          exclusionReason?.includes(ZAPIER_ADOPTION_PENDING_REASON) === false,
      ),
    ).toBe(true);

    expect(
      result.costs.find(({ model }) => model.rawName === 'Gemma 4 31B (Max)'),
    ).toBeUndefined();
    expect(
      result.costs.find(
        ({ model }) => model.rawName === 'Deepseek v4 Flash (Max)',
      ),
    ).toBeUndefined();
  });

  it('excludes Minimal when the same source also publishes Low for the model', () => {
    const result = materializeZapier(routeFixture, mockContext);
    const minimal = result.candidates.find(({ model }) =>
      model.rawName.endsWith('(Minimal)'),
    )!;
    const low = result.candidates.find(({ model }) =>
      model.rawName.endsWith('(Low)'),
    )!;
    const minimalCost = result.costs.find(({ model }) =>
      model.rawName.endsWith('(Minimal)'),
    )!;

    expect(minimal.profile.effort).toBe('low');
    expect(minimal.inclusion).toBe('EXCLUDED');
    expect(minimal.exclusionReason).toContain('both Minimal and Low');
    expect(minimalCost.inclusion).toBe('EXCLUDED');
    expect(low.inclusion).toBe('INCLUDED');
    expect(low.exclusionReason).toBeNull();
  });

  it('reports row counts separately from distinct unresolved names and lists exclusions', () => {
    const result = materializeZapier(routeFixture, mockContext);
    expect(result.resolvedRowsCount + result.unresolvedRowsCount).toBe(5);
    expect(result.validationReport).toContain(
      '| Distinct canonically unresolved names |',
    );
    expect(result.validationReport).toContain('## Excluded rows');
    expect(result.validationReport).toContain('Gemini 3.5 Flash (Minimal)');
    expect(result.validationReport).toContain('$0.09†');
    expect(result.validationReport).toContain('## Adoption status');
    expect(result.validationReport).toContain('User ruling 2026-08-23');
    expect(result.validationReport).toContain('Superseded ruling 2026-08-22');
  });

  it('materializes Astra profiles and preserves marked-cost semantics', () => {
    const result = materializeZapier(latestRouteFixture, mockContext);

    expect(result.version).toBe('1.0.6');
    expect(result.rowCount).toBe(11);
    expect(result.maxRank).toBe(11);
    expect(result.fallbackCostRowsCount).toBe(1);
    expect(result.deepseekPriceRowsCount).toBe(1);
    expect(result.starredCostRowsCount).toBe(2);
    expect(result.dedicatedCostRowsCount).toBe(1);
    expect(result.missingCostRowsCount).toBe(0);
    expect(result.costs).toHaveLength(9);

    const astraMax = result.candidates.find(
      ({ model }) => model.rawName === 'GPT 6 Astra (Max)',
    )!;
    expect(astraMax.model.canonicalModelId).toBe('openai-gpt-6-astra');
    expect(astraMax.profile.effort).toBe('max');
    expect(astraMax.model.profileId).toBe('openai-gpt-6-astra-max');
    expect(astraMax.rawScore).toBe(41.4);
    expect(
      result.costs.find(({ model }) => model.rawName === 'GPT 6 Astra (Max)')
        ?.cost,
    ).toBe(1.77);

    const astraNone = result.candidates.find(
      ({ model }) => model.rawName === 'GPT 6 Astra (None)',
    )!;
    expect(astraNone.model.canonicalModelId).toBe('openai-gpt-6-astra');
    expect(astraNone.profile.effort).toBe('non-reasoning');
    expect(astraNone.model.profileId).toBe('openai-gpt-6-astra-non-reasoning');

    const fallback = result.candidates.find(({ model }) =>
      model.rawName.startsWith('Claude Fable 5.1 with Opus 5 Fallback'),
    )!;
    expect(fallback.provenance.cost?.locator).toContain('$2.45§');
    expect(fallback.provenance.cost?.locator).toContain(
      'excludes fallback tokens',
    );
    expect(
      result.costs.find(({ model }) =>
        model.rawName.startsWith('Claude Fable 5.1 with Opus 5 Fallback'),
      ),
    ).toBeUndefined();

    const deepseekCost = result.costs.find(
      ({ model }) => model.rawName === 'DeepSeek V4 Flash (Max)',
    )!;
    expect(deepseekCost.cost).toBe(0.14);
    expect(deepseekCost.provenance.cost?.locator).toContain('$0.14‡');
    expect(deepseekCost.provenance.cost?.locator).toContain('Fireworks rates');
  });
});
