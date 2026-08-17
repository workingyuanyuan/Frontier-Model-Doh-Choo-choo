import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  BenchmarkDimensionMappingSchema,
  ProductVersionSchema,
  verifyProductVersion,
  type DimensionId,
  type ProductVersion,
} from '@llm-bench/benchmark-data';

export interface LoadedProductVersion {
  benchmarkDimensions: Record<string, DimensionId>;
  product: ProductVersion;
}

const productRoot = (): string => {
  const candidates = [
    resolve(process.cwd(), 'data-v2', 'product'),
    resolve(process.cwd(), '..', '..', 'data-v2', 'product'),
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
  try {
    const mappingPath = resolve(root, '..', 'mappings', 'benchmarks.json');
    const mapping = BenchmarkDimensionMappingSchema.parse(
      JSON.parse(readFileSync(mappingPath, 'utf8')),
    );
    mapping.benchmarks.forEach(({ id, primaryDimension }) => {
      benchmarkDimensions[id] = primaryDimension;
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    // Temporary product-loader fixtures do not include the workspace mapping.
  }

  return { benchmarkDimensions, product };
};
