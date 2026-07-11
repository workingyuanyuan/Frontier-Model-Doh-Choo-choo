const LOCAL_DATABASE_URL =
  'postgresql://llm_bench:llm_bench_dev@localhost:54329/llm_bench';

export function getDatabaseUrl(environment = process.env): string {
  const configuredUrl = environment.DATABASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (environment.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production');
  }

  return LOCAL_DATABASE_URL;
}
