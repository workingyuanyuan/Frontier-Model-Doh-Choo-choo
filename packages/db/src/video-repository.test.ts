import { describe, expect, it } from 'vitest';

import {
  assertVideoJobTransition,
  shouldPersistVideoJob,
} from './video-repository.js';

describe('video job lifecycle policy', () => {
  it('persists formal editions but never preview editions', () => {
    expect(shouldPersistVideoJob('FORMAL')).toBe(true);
    expect(shouldPersistVideoJob('PREVIEW')).toBe(false);
  });

  it.each([
    ['QUEUED', 'RUNNING'],
    ['RUNNING', 'SUCCEEDED'],
    ['RUNNING', 'FAILED'],
  ] as const)('permits %s → %s', (from, to) => {
    expect(() => assertVideoJobTransition(from, to)).not.toThrow();
  });

  it.each([
    ['QUEUED', 'SUCCEEDED'],
    ['QUEUED', 'FAILED'],
    ['RUNNING', 'QUEUED'],
    ['SUCCEEDED', 'RUNNING'],
    ['FAILED', 'RUNNING'],
  ] as const)('rejects %s → %s', (from, to) => {
    expect(() => assertVideoJobTransition(from, to)).toThrow('transition');
  });
});
