import { createDatabase } from '@llm-bench/db';

type WebDatabase = ReturnType<typeof createDatabase>;

const databaseGlobal = globalThis as typeof globalThis & {
  llmBenchWebDatabase?: WebDatabase;
};

export function getWebDatabase(): WebDatabase {
  databaseGlobal.llmBenchWebDatabase ??= createDatabase();
  return databaseGlobal.llmBenchWebDatabase;
}
