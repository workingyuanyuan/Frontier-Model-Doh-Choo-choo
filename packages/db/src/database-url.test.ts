import { describe, expect, it } from 'vitest';

import { getDatabaseUrl } from './database-url.js';

describe('database URL policy', () => {
  it('uses an explicit configured URL when present', () => {
    expect(
      getDatabaseUrl({ DATABASE_URL: 'postgresql://example.test/bench' }),
    ).toBe('postgresql://example.test/bench');
  });

  it('allows the project-local default outside production', () => {
    expect(getDatabaseUrl({ NODE_ENV: 'test' })).toContain(
      'localhost:54329/llm_bench',
    );
  });

  it('requires an explicit URL in production', () => {
    expect(() => getDatabaseUrl({ NODE_ENV: 'production' })).toThrow(
      'DATABASE_URL is required in production',
    );
  });
});
