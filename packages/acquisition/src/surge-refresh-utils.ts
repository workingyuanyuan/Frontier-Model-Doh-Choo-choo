export { readBaselineSnapshot as readSurgeBaseline } from './refresh-utils.js';

export function surgeVisualRowCount(label: string): number {
  const visualRowCount = Number(
    process.argv
      .find((arg) => arg.startsWith('--visual-row-count='))
      ?.split('=')[1],
  );
  if (!Number.isInteger(visualRowCount) || visualRowCount < 1)
    throw new Error(
      `First verify the rendered ${label} leaderboard, then pass --visual-row-count=<count>`,
    );
  return visualRowCount;
}
