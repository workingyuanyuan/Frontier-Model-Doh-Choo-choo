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

  let mappingJson: string;
  try {
    mappingJson = readFileSync(
      resolve(root, '..', 'mappings', 'benchmarks-v2.json'),
      'utf8',
    );
  } catch (error) {
    throw new Error('v2 benchmark mapping does not exist', { cause: error });
  }
  const benchmarkDimensions: Record<string, DimensionId> = {};
  BenchmarkDimensionMappingSchema.parse(
    JSON.parse(mappingJson),
  ).benchmarks.forEach(({ id, primaryDimension }) => {
    benchmarkDimensions[id] = primaryDimension;
  });
  // The product carries its scored presets; each must stay classifiable.
  for (const preset of product.presets) {
    if (preset.benchmarkIds.some((id) => !benchmarkDimensions[id])) {
      throw new Error(`Unknown benchmark in preset ${preset.id}`);
    }
  }

  return { benchmarkDimensions, product };
};
