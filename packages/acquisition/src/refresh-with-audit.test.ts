import { EventEmitter } from 'node:events';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  spawn: vi.fn(),
  readSourceSnapshots: vi.fn(),
  monitorSources: vi.fn(),
}));

vi.mock('node:child_process', () => ({ spawn: mocks.spawn }));
vi.mock('./refresh-utils.js', () => ({
  getWorkspaceRoot: () => resolve('workspace'),
}));
vi.mock('./source-change-monitor.js', () => ({
  readSourceSnapshots: mocks.readSourceSnapshots,
  monitorSources: mocks.monitorSources,
}));

import { refreshRoot, refreshWithAudit } from './refresh-with-audit.js';

const childExit = (
  code: number | null,
  signal: NodeJS.Signals | null = null,
) => {
  mocks.spawn.mockImplementation(() => {
    const child = new EventEmitter();
    queueMicrotask(() => child.emit('exit', code, signal));
    return child;
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.readSourceSnapshots.mockResolvedValue([]);
  mocks.monitorSources.mockResolvedValue({
    reportPath: 'report.md',
    attentionCount: 2,
    errorCount: 0,
  });
  childExit(0);
});

describe('refresh with source audit', () => {
  it('captures both vendor baselines before refreshing, then audits their new state', async () => {
    const args = [
      '--openai-capture',
      'capture.html',
      '--openai-observed-at',
      '2026-10-03',
    ];
    const result = await refreshWithAudit(
      'openai-releases,anthropic-releases',
      'src/refresh-vendor-releases.ts',
      args,
    );
    expect(mocks.readSourceSnapshots).toHaveBeenCalledWith(
      resolve('workspace'),
      ['openai-releases', 'anthropic-releases'],
      true,
    );
    expect(mocks.spawn).toHaveBeenCalledWith(
      process.execPath,
      ['--import', 'tsx', 'src/refresh-vendor-releases.ts', ...args],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
        shell: false,
      },
    );
    expect(mocks.readSourceSnapshots.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.spawn.mock.invocationCallOrder[0]!,
    );
    expect(mocks.monitorSources).toHaveBeenCalledWith({
      root: resolve('workspace'),
      sourceIds: ['openai-releases', 'anthropic-releases'],
      previousSnapshots: [],
    });
    expect(result).toEqual({ code: 0, signal: null });
  });

  it('captures the healthcare baseline before refreshing its Surge companion', async () => {
    const args = ['--observed-at', '2026-10-03'];
    const result = await refreshWithAudit(
      'surge-dayjob-healthcare',
      'src/refresh-surge-dayjob-healthcare.ts',
      args,
    );
    expect(mocks.readSourceSnapshots).toHaveBeenCalledWith(
      resolve('workspace'),
      ['surge-dayjob-healthcare'],
      true,
    );
    expect(mocks.spawn).toHaveBeenCalledWith(
      process.execPath,
      ['--import', 'tsx', 'src/refresh-surge-dayjob-healthcare.ts', ...args],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
        shell: false,
      },
    );
    expect(mocks.monitorSources).toHaveBeenCalledWith({
      root: resolve('workspace'),
      sourceIds: ['surge-dayjob-healthcare'],
      previousSnapshots: [],
    });
    expect(result).toEqual({ code: 0, signal: null });
  });

  it('captures the GDP.xlsx baseline before refreshing its Surge companion', async () => {
    const args = ['--observed-at', '2026-10-03'];
    const result = await refreshWithAudit(
      'surge-gdp-xlsx',
      'src/refresh-surge-gdp-xlsx.ts',
      args,
    );
    expect(mocks.readSourceSnapshots).toHaveBeenCalledWith(
      resolve('workspace'),
      ['surge-gdp-xlsx'],
      true,
    );
    expect(mocks.spawn).toHaveBeenCalledWith(
      process.execPath,
      ['--import', 'tsx', 'src/refresh-surge-gdp-xlsx.ts', ...args],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
        shell: false,
      },
    );
    expect(mocks.monitorSources).toHaveBeenCalledWith({
      root: resolve('workspace'),
      sourceIds: ['surge-gdp-xlsx'],
      previousSnapshots: [],
    });
    expect(result).toEqual({ code: 0, signal: null });
  });

  it('preserves refresh failure and skips auditing', async () => {
    childExit(7);
    expect(
      await refreshWithAudit('livebench', 'src/refresh-livebench.ts', []),
    ).toEqual({ code: 7, signal: null });
    expect(mocks.monitorSources).not.toHaveBeenCalled();
  });

  it('preserves a terminated refresh and skips auditing', async () => {
    childExit(null, 'SIGTERM');
    expect(
      await refreshWithAudit('livebench', 'src/refresh-livebench.ts', []),
    ).toEqual({ code: 1, signal: 'SIGTERM' });
    expect(mocks.monitorSources).not.toHaveBeenCalled();
  });

  it('fails the command when the audit reports errors', async () => {
    mocks.monitorSources.mockResolvedValue({
      reportPath: 'report.md',
      attentionCount: 0,
      errorCount: 1,
    });
    expect(
      await refreshWithAudit('livebench', 'src/refresh-livebench.ts', []),
    ).toEqual({ code: 1, signal: null });
  });

  it('honors each refresh script root convention', () => {
    expect(
      refreshRoot('src/refresh-livebench.ts', [
        '--visual-profile-count=4',
        'other-root',
      ]),
    ).toBe(resolve('other-root'));
    expect(
      refreshRoot('src/refresh-frontier-code.ts', [
        '--root',
        'other-root',
        '--visual-top-ten-matched',
      ]),
    ).toBe(resolve('other-root'));
    expect(
      refreshRoot('src/refresh-surge-chartography.ts', [
        '--visual-row-count=8',
      ]),
    ).toBe(resolve('workspace'));
    expect(
      refreshRoot('src/refresh-surge-dayjob-healthcare.ts', [
        '--observed-at',
        '2026-10-03',
      ]),
    ).toBe(resolve('workspace'));
    expect(
      refreshRoot('src/refresh-surge-gdp-xlsx.ts', [
        '--observed-at',
        '2026-10-03',
      ]),
    ).toBe(resolve('workspace'));
  });
});
