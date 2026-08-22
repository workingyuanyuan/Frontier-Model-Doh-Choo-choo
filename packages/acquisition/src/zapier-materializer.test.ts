import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

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
const mockContext = {
  moduleEvidenceId: `sha256:${'a'.repeat(64)}`,
  pageEvidenceId: `sha256:${'b'.repeat(64)}`,
  moduleUrl:
    'https://framerusercontent.com/sites/example/AutomationBenchRoute.NEW_HASH.fixture.mjs',
  observedAt: '2026-08-22T00:00:00.000Z',
  discoveredModuleCount: 2,
};

describe('Zapier AutomationBench route discovery', () => {
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
    expect(() => parseZapierCost('unknown')).toThrow(
      /Unsupported Zapier cost value/iu,
    );
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
    expect(gemini37.inclusion).toBe('EXCLUDED');
    expect(gemini37.exclusionReason).toBe(ZAPIER_ADOPTION_PENDING_REASON);

    const starredCost = result.costs.find(
      ({ model }) => model.rawName === 'Gemini 3.7 Flash (High)',
    )!;
    expect(starredCost.cost).toBe(0.61);
    expect(starredCost.provenance.cost?.locator).toContain('$0.61*');
    expect(starredCost.inclusion).toBe('EXCLUDED');
    expect(starredCost.exclusionReason).toBe(ZAPIER_ADOPTION_PENDING_REASON);

    expect(
      result.candidates.every(({ inclusion }) => inclusion === 'EXCLUDED'),
    ).toBe(true);
    expect(
      result.costs.every(({ inclusion }) => inclusion === 'EXCLUDED'),
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
    expect(low.inclusion).toBe('EXCLUDED');
    expect(low.exclusionReason).toBe(ZAPIER_ADOPTION_PENDING_REASON);
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
    expect(result.validationReport).toContain('after the N phase is complete');
  });
});
