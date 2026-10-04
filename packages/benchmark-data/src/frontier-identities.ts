import * as z from 'zod';

import {
  HttpUrlSchema,
  Sha256Schema,
  SlugSchema,
  type CandidateResult,
} from './index.js';

/** Reviewed exact source labels needed to compare the complete AA population. */
export const FrontierIdentitiesSchema = z
  .strictObject({
    schemaVersion: z.literal('frontier-identities-v1'),
    mappings: z
      .array(
        z.strictObject({
          sourceId: SlugSchema,
          canonicalModelId: SlugSchema,
          aliases: z.array(z.string().min(1)).min(1),
          justification: z.string().min(1),
          evidence: z
            .array(
              z.strictObject({
                candidateId: z.string().min(1),
                rawName: z.string().min(1),
                evidenceId: Sha256Schema,
                sourceUrl: HttpUrlSchema,
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  })
  .superRefine(({ mappings }, context) => {
    const seen = new Set<string>();
    mappings.forEach((mapping, index) => {
      mapping.aliases.forEach((alias, aliasIndex) => {
        const key = JSON.stringify([mapping.sourceId, alias]);
        if (seen.has(key))
          context.addIssue({
            code: 'custom',
            message: 'Source identity aliases must be unique.',
            path: ['mappings', index, 'aliases', aliasIndex],
          });
        seen.add(key);
        if (!mapping.evidence.some(({ rawName }) => rawName === alias))
          context.addIssue({
            code: 'custom',
            message:
              'Every exact alias requires saved source identity evidence.',
            path: ['mappings', index, 'aliases', aliasIndex],
          });
      });
      mapping.evidence.forEach(({ rawName }, evidenceIndex) => {
        if (!mapping.aliases.includes(rawName))
          context.addIssue({
            code: 'custom',
            message:
              'Identity evidence rawName must match a configured exact alias.',
            path: ['mappings', index, 'evidence', evidenceIndex, 'rawName'],
          });
      });
    });
  });
export type FrontierIdentities = z.infer<typeof FrontierIdentitiesSchema>;

/** Set reviewed canonical identities; effort/profile derivation happens afterward. */
export const resolveFrontierIdentities = (
  candidates: readonly CandidateResult[],
  identities: FrontierIdentities,
): CandidateResult[] => {
  const config = FrontierIdentitiesSchema.parse(identities);
  const bySourceAndName = new Map(
    config.mappings.flatMap((mapping) =>
      mapping.aliases.map(
        (alias) =>
          [JSON.stringify([mapping.sourceId, alias]), mapping] as const,
      ),
    ),
  );
  // Historical references document the review; current captures use exact source labels.
  return candidates.map((candidate) => {
    const mapping = bySourceAndName.get(
      JSON.stringify([candidate.sourceId, candidate.model.rawName]),
    );
    if (!mapping) return candidate;
    const known = candidate.model.canonicalModelId;
    if (known !== null && known !== mapping.canonicalModelId) {
      throw new Error(
        `Frontier identity conflicts with candidate ${candidate.id}: ${known} / ${mapping.canonicalModelId}`,
      );
    }
    return {
      ...candidate,
      model: { ...candidate.model, canonicalModelId: mapping.canonicalModelId },
    };
  });
};
