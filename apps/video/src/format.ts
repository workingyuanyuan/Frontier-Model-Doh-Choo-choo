export function formatVideoScore(value: number | null | undefined): string {
  return value === null || value === undefined ? 'N/A' : value.toFixed(1);
}

export function formatVideoRank(value: number | null): string {
  return value === null ? 'N/A' : String(value).padStart(2, '0');
}

export function formatVideoTimestamp(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value)) {
    throw new Error('Video timestamp must be an ISO UTC datetime');
  }
  return `${value.slice(0, 10)} ${value.slice(11, 16)} UTC`;
}
