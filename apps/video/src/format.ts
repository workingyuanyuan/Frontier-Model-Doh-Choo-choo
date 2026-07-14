export function formatVideoScore(value: number | null | undefined): string {
  return value === null || value === undefined ? 'N/A' : value.toFixed(1);
}
