import {
  liveBenchAliasExclusionManifest,
  type LiveBenchAliasExclusionManifestEntry,
} from './livebench-alias-exclusions.js';
import {
  liveBenchAliasInventory,
  type LiveBenchAliasInventoryEntry,
} from './livebench-alias-inventory.js';
import {
  liveBenchAliasManifest,
  type LiveBenchAliasManifestEntry,
} from './livebench-alias-manifest.js';
import { normalizeModelAlias } from './model-alias-resolution.js';

export interface LiveBenchAliasAdjudicationSummary {
  readonly aliasesInventoried: number;
  readonly aliasesMapped: number;
  readonly aliasesExcluded: number;
  readonly aliasesPending: number;
}

export interface LiveBenchAliasPersistenceRow {
  readonly validationStatus: string;
  readonly records: number;
  readonly resolvedRecords: number;
}

export interface LiveBenchAliasPersistenceSummary {
  readonly recordsSeen: number;
  readonly recordsValidated: number;
  readonly recordsExcluded: number;
}

export function validateLiveBenchAliasPersistence(
  rows: readonly LiveBenchAliasPersistenceRow[],
): LiveBenchAliasPersistenceSummary {
  if (rows.length === 0) {
    throw new Error('Persistence verification returned no records');
  }

  let recordsValidated = 0;
  let recordsExcluded = 0;

  for (const row of rows) {
    if (row.validationStatus === 'VALIDATED') {
      if (row.records !== row.resolvedRecords) {
        throw new Error('VALIDATED status must resolve every record');
      }
      recordsValidated += row.records;
      continue;
    }
    if (row.validationStatus === 'EXCLUDED') {
      if (row.resolvedRecords !== 0) {
        throw new Error('EXCLUDED status must not resolve records');
      }
      recordsExcluded += row.records;
      continue;
    }
    throw new Error(
      `Unexpected persisted validation status: ${row.validationStatus}`,
    );
  }

  return {
    recordsSeen: recordsValidated + recordsExcluded,
    recordsValidated,
    recordsExcluded,
  };
}

export function summarizeLiveBenchAliasAdjudication(
  inventory: readonly LiveBenchAliasInventoryEntry[] = liveBenchAliasInventory,
  mappings: readonly LiveBenchAliasManifestEntry[] = liveBenchAliasManifest,
  exclusions: readonly LiveBenchAliasExclusionManifestEntry[] = liveBenchAliasExclusionManifest,
): LiveBenchAliasAdjudicationSummary {
  const inventoryAliases = new Set(
    inventory.map((entry) => normalizeModelAlias(entry.alias)),
  );
  const mappedAliases = new Set(
    mappings.flatMap((entry) => entry.aliases.map(normalizeModelAlias)),
  );
  const excludedAliases = new Set(
    exclusions.map((entry) => normalizeModelAlias(entry.alias)),
  );

  const conflicting = [...mappedAliases].filter((alias) =>
    excludedAliases.has(alias),
  );
  if (conflicting.length > 0) {
    throw new Error(
      `Aliases have conflicting decisions: ${conflicting.join(', ')}`,
    );
  }

  const decidedAliases = new Set([...mappedAliases, ...excludedAliases]);
  const unexpected = [...decidedAliases].filter(
    (alias) => !inventoryAliases.has(alias),
  );
  if (unexpected.length > 0) {
    throw new Error(
      `Decisions not present in inventory: ${unexpected.join(', ')}`,
    );
  }

  const pending = [...inventoryAliases].filter(
    (alias) => !decidedAliases.has(alias),
  );
  if (pending.length > 0) {
    throw new Error(`Aliases pending adjudication: ${pending.join(', ')}`);
  }

  return {
    aliasesInventoried: inventoryAliases.size,
    aliasesMapped: mappedAliases.size,
    aliasesExcluded: excludedAliases.size,
    aliasesPending: 0,
  };
}
