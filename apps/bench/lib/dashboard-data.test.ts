import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  GET,
  generateStaticParams,
} from '../app/evidence/[version]/[profile]/route';
import { buildCommonComparison } from './common-benchmarks';
import {
  buildProfileEvidencePayload,
  evidenceVersionPath,
  packDashboardProduct,
  toDashboardProduct,
  unpackDashboardProduct,
  type DashboardProduct,
} from './dashboard-data';
import * as loader from './load-product-version';
import {
  buildAdvancedCostSeries,
  buildWeightedCostCurve,
  COST_SOURCE_SCORE_BASES,
  getEvidenceForProfile,
  latestAaIndexVersion,
  withActivePreset,
} from './view-model';

const loaded = loader.loadProductVersion();
const full = loaded.product;

afterEach(() => vi.restoreAllMocks());

describe('dashboard data layers', () => {
  it('keeps the product structurally compatible and projects only dashboard evidence fields', () => {
    const compatible: DashboardProduct = full;
    expect(compatible.versionId).toBe(full.versionId);
    const compact = toDashboardProduct(full);
    expect(compact.evidenceDetails).toEqual({
      schemaVersion: 'profile-evidence-v1',
    });
    expect(
      compact.evidence.filter((row) => row.inclusion === 'INCLUDED'),
    ).toHaveLength(
      full.evidence.filter((row) => row.inclusion === 'INCLUDED').length,
    );
    for (const row of compact.evidence) {
      if (row.inclusion === 'EXCLUDED') {
        expect(
          Object.values(COST_SOURCE_SCORE_BASES).some(
            (basis) =>
              basis?.inclusion === 'EXCLUDED' &&
              basis.benchmarkId === row.benchmarkId,
          ),
        ).toBe(true);
      }
      expect(Object.keys(row).sort()).toEqual([
        'benchmarkId',
        'benchmarkVersion',
        'id',
        'inclusion',
        'metric',
        'model',
        'normalizedScore',
        'profile',
        'provenance',
        'rawScore',
        'sourceId',
      ]);
      expect(Object.keys(row.model).sort()).toEqual([
        'canonicalModelId',
        'profileId',
      ]);
      expect(Object.keys(row.profile)).toEqual(['effort']);
      expect(Object.keys(row.provenance)).toEqual(['sourceUrl']);
    }
    expect(JSON.stringify(compact).length).toBeLessThan(
      JSON.stringify(full).length,
    );
  });

  it('round trips dictionary transport through JSON and substantially reduces its size', () => {
    const compact = toDashboardProduct(full);
    const payload = packDashboardProduct(compact);
    expect(payload.schemaVersion).toBe('dashboard-payload-v1');
    expect(payload.product).not.toHaveProperty('evidence');
    expect(unpackDashboardProduct(JSON.parse(JSON.stringify(payload)))).toEqual(
      compact,
    );
    expect(JSON.stringify(payload).length).toBeLessThan(
      JSON.stringify(full).length * 0.35,
    );
  });

  it('preserves nullable evidence fields and repeated values through JSON transport', () => {
    const compact = toDashboardProduct(full);
    const row = {
      ...compact.evidence[0]!,
      benchmarkVersion: null,
      normalizedScore: null,
      model: { profileId: null, canonicalModelId: null },
      profile: { effort: null },
    };
    const nullable: DashboardProduct = { ...compact, evidence: [row, row] };
    const payload = packDashboardProduct(nullable);
    expect(payload.metrics).toHaveLength(1);
    expect(new Set(payload.strings).size).toBe(payload.strings.length);
    expect(unpackDashboardProduct(JSON.parse(JSON.stringify(payload)))).toEqual(
      nullable,
    );
  });

  it('retains excluded cost score benchmarks when a vendor reports the measurement', () => {
    const row = full.evidence.find(
      (item) =>
        item.inclusion === 'EXCLUDED' &&
        item.benchmarkId === 'artificial-analysis-intelligence-index',
    )!;
    const vendorRow = { ...row, sourceId: 'vendor-preview' };
    const product = { ...full, evidence: [vendorRow] };
    expect(toDashboardProduct(product).evidence).toHaveLength(1);
    expect(toDashboardProduct(product).evidence[0]!.sourceId).toBe(
      'vendor-preview',
    );
  });

  it('preserves comparison scores and cost calculations from the full product', () => {
    const compact = toDashboardProduct(full);
    const source = withActivePreset(full);
    const dashboard = withActivePreset(compact);
    const selected = Object.fromEntries(
      source.leaderboard.map(({ modelId, profileId }) => [modelId, profileId]),
    );
    const compare = (product: typeof dashboard) =>
      buildCommonComparison(
        product,
        Object.keys(selected),
        selected,
        loaded.benchmarkDimensions,
      );
    const original = compare(source);
    const projected = compare(dashboard);
    expect(projected.benchmarkIds).toEqual(original.benchmarkIds);
    expect(projected.product.leaderboard).toEqual(original.product.leaderboard);
    expect(buildWeightedCostCurve(dashboard)).toEqual(
      buildWeightedCostCurve(source),
    );
    expect(buildAdvancedCostSeries(compact)).toEqual(
      buildAdvancedCostSeries(full),
    );
    expect(latestAaIndexVersion(compact)).toBe(latestAaIndexVersion(full));
  });

  it('returns full profile evidence and excluded measurements for the same canonical model', () => {
    const profile = full.profiles.find(({ id }) =>
      full.evidence.some(
        (row) => row.model.profileId === id && row.inclusion === 'INCLUDED',
      ),
    )!;
    const payload = buildProfileEvidencePayload(full, profile.id)!;
    expect(payload.schemaVersion).toBe('profile-evidence-v1');
    expect(payload.versionId).toBe(full.versionId);
    expect(payload.profileId).toBe(profile.id);
    expect(payload.evidence).toEqual(getEvidenceForProfile(full, profile.id));
    expect(payload.evidence.some((row) => row.inclusion === 'INCLUDED')).toBe(
      true,
    );
    for (const row of payload.evidence) {
      expect(row.provenance).toEqual(
        full.evidence.find(({ id }) => id === row.id)!.provenance,
      );
      if (row.inclusion === 'EXCLUDED') {
        expect(row.model.canonicalModelId).toBe(profile.modelId);
      } else {
        expect(row.model.profileId).toBe(profile.id);
      }
    }
    expect(buildProfileEvidencePayload(full, 'unknown-profile')).toBeNull();
  });
});

describe('static profile evidence route', () => {
  it('generates versioned JSON filenames and responds with the full payload', async () => {
    vi.spyOn(loader, 'loadProductVersion').mockReturnValue(loaded);
    const params = generateStaticParams();
    expect(params).toEqual(
      full.profiles.map(({ id }) => ({
        version: evidenceVersionPath(full.versionId),
        profile: `${id}.json`,
      })),
    );
    const route = params[0]!;
    const response = await GET(new Request('https://example.test'), {
      params: Promise.resolve(route),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      buildProfileEvidencePayload(full, full.profiles[0]!.id),
    );
  });

  it('rejects stale versions, unknown profiles, and missing JSON extensions', async () => {
    vi.spyOn(loader, 'loadProductVersion').mockReturnValue(loaded);
    for (const params of [
      { version: 'stale-version', profile: `${full.profiles[0]!.id}.json` },
      {
        version: evidenceVersionPath(full.versionId),
        profile: 'unknown-profile.json',
      },
      {
        version: evidenceVersionPath(full.versionId),
        profile: full.profiles[0]!.id,
      },
      { version: full.versionId, profile: `${full.profiles[0]!.id}.json` },
    ]) {
      const response = await GET(new Request('https://example.test'), {
        params: Promise.resolve(params),
      });
      expect(response.status).toBe(404);
    }
  });
});
