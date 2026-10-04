import type { ProductEvidence } from '@llm-bench/benchmark-data';

import {
  evidenceVersionPath,
  type ProfileEvidencePayload,
} from './dashboard-data';

const requests = new Map<string, Promise<ProfileEvidencePayload>>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;
const isNullableText = (value: unknown) => value === null || isText(value);
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isHttpUrl = (value: unknown) => {
  if (!isText(value)) return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

// Validate the fields the panel consumes without shipping the server's schema
// library in the dashboard bundle.
const isEvidence = (value: unknown): value is ProductEvidence => {
  if (!isRecord(value)) return false;
  const { model, profile, metric, provenance } = value;
  return (
    isText(value.id) &&
    isText(value.sourceId) &&
    isText(value.benchmarkId) &&
    isNullableText(value.benchmarkVersion) &&
    isFiniteNumber(value.rawScore) &&
    (value.normalizedScore === null ||
      (isFiniteNumber(value.normalizedScore) &&
        value.normalizedScore >= 0 &&
        value.normalizedScore <= 100)) &&
    ['INCLUDED', 'EXCLUDED'].includes(String(value.inclusion)) &&
    isRecord(model) &&
    isNullableText(model.profileId) &&
    isNullableText(model.canonicalModelId) &&
    isRecord(profile) &&
    (profile.effort === null || typeof profile.effort === 'string') &&
    isRecord(metric) &&
    isText(metric.id) &&
    isText(metric.name) &&
    isText(metric.unit) &&
    typeof metric.higherIsBetter === 'boolean' &&
    isRecord(provenance) &&
    isHttpUrl(provenance.sourceUrl) &&
    isText(provenance.locator) &&
    isText(provenance.retrievedAt) &&
    Number.isFinite(Date.parse(provenance.retrievedAt))
  );
};

export const profileEvidenceKey = (versionId: string, profileId: string) =>
  JSON.stringify([versionId, profileId]);

export const parseProfileEvidence = (
  value: unknown,
  versionId: string,
  profileId: string,
): ProfileEvidencePayload => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 'profile-evidence-v1' ||
    value.versionId !== versionId ||
    value.profileId !== profileId ||
    !Array.isArray(value.evidence) ||
    !value.evidence.every(isEvidence)
  ) {
    throw new Error('Evidence details do not match this model and version.');
  }
  const evidence = value.evidence as ProductEvidence[];
  if (
    new Set(evidence.map(({ id }) => id)).size !== evidence.length ||
    evidence.some(
      (row) =>
        row.inclusion === 'INCLUDED' && row.model.profileId !== profileId,
    )
  ) {
    throw new Error('Evidence details contain invalid model records.');
  }
  return {
    schemaVersion: 'profile-evidence-v1',
    versionId,
    profileId,
    evidence,
  };
};

export const loadProfileEvidence = (
  versionId: string,
  profileId: string,
  expectedEvidenceIds: readonly string[] = [],
): Promise<ProfileEvidencePayload> => {
  const key = profileEvidenceKey(versionId, profileId);
  const validateExpectedRecords = (
    request: Promise<ProfileEvidencePayload>,
  ) => {
    if (expectedEvidenceIds.length === 0) return request;
    return request.then((payload) => {
      const includedIds = new Set(
        payload.evidence
          .filter((row) => row.inclusion === 'INCLUDED')
          .map((row) => row.id),
      );
      if (expectedEvidenceIds.some((id) => !includedIds.has(id))) {
        if (requests.get(key) === request) requests.delete(key);
        throw new Error('Evidence details are missing model records.');
      }
      return payload;
    });
  };
  const cached = requests.get(key);
  if (cached) return validateExpectedRecords(cached);

  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(
    /\/+$/,
    '',
  );
  const request = Promise.resolve()
    .then(() =>
      fetch(
        `${basePath}/evidence/${encodeURIComponent(evidenceVersionPath(versionId))}/${encodeURIComponent(profileId)}.json`,
      ),
    )
    .then(async (response) => {
      if (!response.ok) throw new Error('Could not load evidence details.');
      return parseProfileEvidence(await response.json(), versionId, profileId);
    });
  requests.set(key, request);
  void request.catch(() => {
    if (requests.get(key) === request) requests.delete(key);
  });
  return validateExpectedRecords(request);
};
