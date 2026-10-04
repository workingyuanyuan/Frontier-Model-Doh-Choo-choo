import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  BenchmarkDimensionMappingSchema,
  DisplaySetSchema,
  ProductVersionSchema,
  verifyProductVersion,
  validateDisplaySet,
  type DimensionId,
  type DisplaySet,
  type BenchmarkDimensionMapping,
  type ProductVersion,
} from '@llm-bench/benchmark-data';

export interface LoadedProductVersion {
  benchmarkDimensions: Record<string, DimensionId>;
  displaySet: DisplaySet | null;
  product: ProductVersion;
}

const productRoot = (): string => {
  const candidates = [
    resolve(process.cwd(), 'data', 'product'),
    resolve(process.cwd(), '..', '..', 'data', 'product'),
  ];
  const existing = candidates.find((candidate) => {
    try {
      readFileSync(resolve(candidate, 'current.json'));
      return true;
    } catch {
      return false;
    }
  });

  return existing ?? candidates[0]!;
};

export const loadProductVersion = (): LoadedProductVersion => {
  const root = productRoot();
  const product = verifyProductVersion(
    ProductVersionSchema.parse(
      JSON.parse(readFileSync(resolve(root, 'current.json'), 'utf8')),
    ),
  );

  const benchmarkDimensions: Record<string, DimensionId> = {};
  let benchmarkMapping: BenchmarkDimensionMapping | null = null;
  let displaySet: DisplaySet | null = null;
  try {
    const mappingPath = resolve(
      root,
      '..',
      'mappings',
      product.benchmarkQuality ? 'benchmarks-v2.json' : 'benchmarks.json',
    );
    const mapping = BenchmarkDimensionMappingSchema.parse(
      JSON.parse(readFileSync(mappingPath, 'utf8')),
    );
    benchmarkMapping = mapping;
    mapping.benchmarks.forEach(({ id, primaryDimension }) => {
      benchmarkDimensions[id] = primaryDimension;
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    if (product.benchmarkQuality)
      throw new Error('v2 benchmark mapping does not exist', { cause: error });
    // Temporary product-loader fixtures do not include the workspace mapping.
  }

  if (benchmarkMapping !== null) {
    if (product.benchmarkQuality) {
      displaySet = DisplaySetSchema.parse({
        schemaVersion: 'display-set-v2',
        defaultPresetId: product.defaultPresetId,
        presets: product.presets.map(
          ({ id, targetModelCount, requireAllSources, benchmarkIds }) => ({
            id,
            targetModelCount,
            requireAllSources,
            benchmarkIds,
          }),
        ),
      });
      for (const preset of product.presets) {
        if (preset.benchmarkIds.some((id) => !benchmarkDimensions[id])) {
          throw new Error(`Unknown benchmark in preset ${preset.id}`);
        }
      }
      return { benchmarkDimensions, displaySet, product };
    }
    const displaySetPath = resolve(root, '..', 'mappings', 'display-set.json');
    try {
      displaySet = DisplaySetSchema.parse(
        JSON.parse(readFileSync(displaySetPath, 'utf8')),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error('display-set mapping does not exist', {
          cause: error,
        });
      }
      throw error;
    }
    validateDisplaySet(displaySet, benchmarkMapping);
  }

  return { benchmarkDimensions, displaySet, product };
};
