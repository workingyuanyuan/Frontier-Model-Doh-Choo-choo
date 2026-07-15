import { describe, expect, it } from 'vitest';

import { createWeeklyRenderInvocation } from './weekly-render';

describe('weekly render subprocess boundary', () => {
  it('uses Node and pnpm without a shell for default and edition previews', () => {
    expect(
      createWeeklyRenderInvocation(
        {
          nodePath: 'C:/node/node.exe',
          pnpmCliPath: 'C:/pnpm/pnpm.cjs',
          projectDirectory: 'N:/llm-bench',
        },
        { kind: 'DEFAULT_PREVIEW' },
      ),
    ).toEqual([
      {
        command: 'C:/node/node.exe',
        arguments: ['C:/pnpm/pnpm.cjs', 'video:still'],
        options: { cwd: 'N:/llm-bench', shell: false },
      },
      {
        command: 'C:/node/node.exe',
        arguments: ['C:/pnpm/pnpm.cjs', 'video:artifacts'],
        options: { cwd: 'N:/llm-bench', shell: false },
      },
    ]);

    expect(
      createWeeklyRenderInvocation(
        {
          nodePath: '/usr/bin/node',
          pnpmCliPath: '/pnpm/pnpm.cjs',
          projectDirectory: '/repo',
        },
        {
          kind: 'EDITION_PREVIEW',
          snapshotId: '019f5f2d-c3df-7c54-96e8-e1939d332c8e',
        },
      )[0],
    ).toEqual({
      command: '/usr/bin/node',
      arguments: [
        '/pnpm/pnpm.cjs',
        'video:edition',
        '--',
        '--snapshot',
        '019f5f2d-c3df-7c54-96e8-e1939d332c8e',
        '--locale',
        'zh-TW',
        '--theme',
        'editorial',
        '--top',
        '5',
        '--media',
        'poster',
      ],
      options: { cwd: '/repo', shell: false },
    });
  });
});
