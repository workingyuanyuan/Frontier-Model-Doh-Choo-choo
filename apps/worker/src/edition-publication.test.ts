import { describe, expect, it } from 'vitest';

import {
  assertEditionActivationPolicy,
  createEditionAuditHash,
  parseEditionCommandArguments,
} from './edition-publication.js';

const snapshotId = '019f5f2d-c3df-7c54-96e8-e1939d332c8e';

describe('weekly edition publication boundary', () => {
  it('parses dry-run activation and explicit apply rollback commands', () => {
    expect(
      parseEditionCommandArguments([
        '--activate-snapshot',
        snapshotId,
        '--mode',
        'preview',
      ]),
    ).toEqual({
      action: 'ACTIVATE',
      actor: 'local-operator',
      dryRun: true,
      mode: 'PREVIEW',
      snapshotId,
    });
    expect(
      parseEditionCommandArguments([
        '--',
        '--rollback-edition',
        '2026-07-13',
        '--actor',
        'release-bot',
        '--apply',
      ]),
    ).toEqual({
      action: 'ROLLBACK',
      actor: 'release-bot',
      dryRun: false,
      editionDate: '2026-07-13',
    });
  });

  it('rejects ambiguous or unknown command arguments', () => {
    expect(() =>
      parseEditionCommandArguments([
        '--activate-snapshot',
        snapshotId,
        '--rollback-edition',
        '2026-07-13',
        '--mode',
        'preview',
      ]),
    ).toThrow('exactly one');
    expect(() => parseEditionCommandArguments(['--force'])).toThrow('Unknown');
  });

  it('allows an incomplete snapshot only in explicitly preview mode', () => {
    const entries = [
      { rankingStatus: 'UNRANKED' as const, rank: null, overallScore: null },
    ];
    expect(() =>
      assertEditionActivationPolicy({
        mode: 'PREVIEW',
        scoringMethodVersion: 'absolute-capability-v1',
        scoringMethodStatus: 'DRAFT',
        formalPublicationEnabled: false,
        entries,
      }),
    ).not.toThrow();
    expect(() =>
      assertEditionActivationPolicy({
        mode: 'FORMAL',
        scoringMethodVersion: 'absolute-capability-v1',
        scoringMethodStatus: 'DRAFT',
        formalPublicationEnabled: false,
        entries,
      }),
    ).toThrow('not enabled');
  });

  it('hashes every audit entry into its previous chain state', () => {
    const entry = {
      occurredAt: '2026-07-14T00:00:00.000Z',
      actor: 'release-bot',
      action: 'EDITION_ACTIVATED',
      resourceType: 'weekly_edition',
      resourceId: 'edition-1',
      metadata: { mode: 'PREVIEW', snapshotId },
    } as const;
    const first = createEditionAuditHash(null, entry);
    expect(first).toMatch(/^[a-f0-9]{64}$/u);
    expect(createEditionAuditHash(null, entry)).toBe(first);
    expect(createEditionAuditHash(first, entry)).not.toBe(first);
  });
});
