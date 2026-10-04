import { afterEach, describe, expect, it, vi } from 'vitest';

import { productFixture } from '../test/fixture';

const profileId = 'openai-gpt-5-6-sol-max';
const payload = (versionId = productFixture.versionId, id = profileId) => ({
  schemaVersion: 'profile-evidence-v1',
  versionId,
  profileId: id,
  evidence: productFixture.evidence.filter((row) => row.model.profileId === id),
});
const response = (value: unknown) => ({
  ok: true,
  json: async () => value,
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('profile evidence loading', () => {
  it('accepts an empty source effort allowed by the product schema', async () => {
    const { parseProfileEvidence } = await import('./profile-evidence');
    const value = payload();
    value.evidence = value.evidence.map((row) => ({
      ...row,
      profile: { ...row.profile, effort: '' },
    }));
    expect(
      parseProfileEvidence(value, productFixture.versionId, profileId),
    ).toEqual(value);
  });

  it('deduplicates in-flight and completed requests and respects the site base path', async () => {
    const fetch = vi.fn().mockResolvedValue(response(payload()));
    vi.stubGlobal('fetch', fetch);
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/bench/');
    const { loadProfileEvidence } = await import('./profile-evidence');

    const first = loadProfileEvidence(productFixture.versionId, profileId);
    const second = loadProfileEvidence(productFixture.versionId, profileId);
    expect(second).toBe(first);
    expect(await first).toEqual(payload());
    expect(loadProfileEvidence(productFixture.versionId, profileId)).toBe(
      first,
    );
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(
      `/bench/evidence/${encodeURIComponent(productFixture.versionId.replace(':', '-'))}/${profileId}.json`,
    );
  });

  it.each([
    { ...payload(), schemaVersion: 'other-schema' },
    { ...payload(), versionId: 'old-version' },
    { ...payload(), profileId: 'other-profile' },
    { ...payload(), evidence: [{ ...payload().evidence[0], rawScore: '88' }] },
    {
      ...payload(),
      evidence: [
        {
          ...payload().evidence[0],
          provenance: { sourceUrl: 'https://example.com', locator: 'row' },
        },
      ],
    },
  ])('rejects a mismatched or malformed payload', async (value) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(value)));
    const { loadProfileEvidence } = await import('./profile-evidence');
    await expect(
      loadProfileEvidence(productFixture.versionId, profileId),
    ).rejects.toThrow('Evidence details do not match');
  });

  it('retries a failed request rather than caching the rejection', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce(response(payload()));
    vi.stubGlobal('fetch', fetch);
    const { loadProfileEvidence } = await import('./profile-evidence');
    await expect(
      loadProfileEvidence(productFixture.versionId, profileId),
    ).rejects.toThrow('Could not load');
    await expect(
      loadProfileEvidence(productFixture.versionId, profileId),
    ).resolves.toEqual(payload());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('rejects a truncated payload and retries to recover the expected records', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ ...payload(), evidence: [] }))
      .mockResolvedValueOnce(response(payload()));
    vi.stubGlobal('fetch', fetch);
    const { loadProfileEvidence } = await import('./profile-evidence');
    const expectedIds = payload()
      .evidence.filter((row) => row.inclusion === 'INCLUDED')
      .map((row) => row.id);
    await expect(
      loadProfileEvidence(productFixture.versionId, profileId, expectedIds),
    ).rejects.toThrow('missing model records');
    await expect(
      loadProfileEvidence(productFixture.versionId, profileId, expectedIds),
    ).resolves.toEqual(payload());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('isolates profile and version keys when requests finish out of order', async () => {
    let finishOld!: (value: ReturnType<typeof response>) => void;
    const oldRequest = new Promise<ReturnType<typeof response>>((resolve) => {
      finishOld = resolve;
    });
    const otherProfile = 'google-gemini-3-1-pro-high';
    const fetch = vi
      .fn()
      .mockReturnValueOnce(oldRequest)
      .mockResolvedValueOnce(response(payload('new-version')))
      .mockResolvedValueOnce(response(payload('new-version', otherProfile)));
    vi.stubGlobal('fetch', fetch);
    const { loadProfileEvidence } = await import('./profile-evidence');
    const old = loadProfileEvidence('old-version', profileId);
    const current = loadProfileEvidence('new-version', profileId);
    const other = loadProfileEvidence('new-version', otherProfile);

    expect(await current).toEqual(payload('new-version'));
    expect(await other).toEqual(payload('new-version', otherProfile));
    finishOld(response(payload('old-version')));
    expect(await old).toEqual(payload('old-version'));
    expect(loadProfileEvidence('new-version', profileId)).toBe(current);
    expect(loadProfileEvidence('new-version', otherProfile)).toBe(other);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('rejects duplicate IDs and included records for a different profile', async () => {
    const { parseProfileEvidence } = await import('./profile-evidence');
    const first = payload().evidence[0]!;
    expect(() =>
      parseProfileEvidence(
        { ...payload(), evidence: [first, first] },
        productFixture.versionId,
        profileId,
      ),
    ).toThrow('invalid model records');
    expect(() =>
      parseProfileEvidence(
        {
          ...payload(),
          evidence: [
            { ...first, model: { ...first.model, profileId: 'other-profile' } },
          ],
        },
        productFixture.versionId,
        profileId,
      ),
    ).toThrow('invalid model records');
  });
});
