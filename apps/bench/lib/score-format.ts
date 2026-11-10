export const formatScore = (value: number | null): string =>
  value === null ? 'N/A' : value.toFixed(1);
