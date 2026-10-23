import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  computeFrontierSet,
  frontierAuditPath,
  frontierSetPath,
  serializeFrontierJson,
} from './generate-frontier-set.js';
import { readCurrentProductVersion } from './index.js';
import { buildWorkspaceProduct } from './workspace.js';

export interface FreshnessReport {
  fresh: boolean;
  versionId: string | null;
  recomputedVersionId: string | null;
  mismatches: string[];
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Recomputes the frontier artifacts and product from the saved sources and
 * mappings without writing anything. The committed generatedAt is reused so
 * an unchanged workspace reproduces the committed versionId exactly.
 */
export const checkWorkspaceFreshness = async (
  repositoryRoot: string,
): Promise<FreshnessReport> => {
  const root = resolve(repositoryRoot);
  const mismatches: string[] = [];
  let committed;
  try {
    committed = await readCurrentProductVersion(join(root, 'data', 'product'));
  } catch (error) {
    return {
      fresh: false,
      versionId: null,
      recomputedVersionId: null,
      mismatches: [`data/product/current.json: ${message(error)}`],
    };
  }

  const frontier = await computeFrontierSet(root);
  const expectedFiles =
    frontier.status === 'selected'
      ? [
          [frontierSetPath(root), frontier.artifact],
          [frontierAuditPath(root), frontier.audit],
        ]
      : [];
  if (frontier.status !== 'selected') {
    mismatches.push(`frontier generator: ${frontier.error.message}`);
  }
  for (const [path, value] of expectedFiles) {
    const committedBytes = await readFile(path as string, 'utf8').catch(
      () => null,
    );
    if (committedBytes !== (await serializeFrontierJson(value))) {
      mismatches.push(
        `${(path as string).slice(root.length + 1)} differs from a fresh frontier generation`,
      );
    }
  }

  let recomputedVersionId: string | null = null;
  try {
    const product = await buildWorkspaceProduct(root, committed.generatedAt, {
      writeFrontier: false,
    });
    recomputedVersionId = product.versionId;
    if (product.versionId !== committed.versionId) {
      mismatches.push(
        `data/product/current.json is ${committed.versionId}; current inputs build ${product.versionId}`,
      );
    }
  } catch (error) {
    mismatches.push(`product build: ${message(error)}`);
  }

  return {
    fresh: mismatches.length === 0,
    versionId: committed.versionId,
    recomputedVersionId,
    mismatches,
  };
};
