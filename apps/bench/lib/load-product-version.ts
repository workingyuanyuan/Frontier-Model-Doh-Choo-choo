import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  ProductVersionPointerSchema,
  ProductVersionSchema,
  verifyProductVersion,
  type ProductVersion,
  type ProductVersionPointer,
} from '@llm-bench/benchmark-data';

import type { ProductChannel } from './ui-contract';

export interface LoadedProductVersion {
  channel: ProductChannel;
  pointer: ProductVersionPointer;
  product: ProductVersion;
}

const configuredChannel = (): ProductChannel => {
  const value = process.env.LLM_BENCH_CHANNEL ?? 'DRAFT';
  if (value !== 'DRAFT' && value !== 'PUBLISHED') {
    throw new Error(
      `LLM_BENCH_CHANNEL must be DRAFT or PUBLISHED, received ${value}`,
    );
  }
  return value;
};

const productRoot = (): string => {
  const candidates = [
    resolve(process.cwd(), 'data-v2', 'product'),
    resolve(process.cwd(), '..', '..', 'data-v2', 'product'),
  ];
  const existing = candidates.find((candidate) => {
    try {
      readFileSync(
        resolve(
          candidate,
          'pointers',
          `${configuredChannel().toLowerCase()}.json`,
        ),
      );
      return true;
    } catch {
      return false;
    }
  });

  return existing ?? candidates[0]!;
};

export const loadProductVersion = (): LoadedProductVersion => {
  const channel = configuredChannel();
  const root = productRoot();
  const pointerPath = resolve(
    root,
    'pointers',
    `${channel.toLowerCase()}.json`,
  );
  const pointer = ProductVersionPointerSchema.parse(
    JSON.parse(readFileSync(pointerPath, 'utf8')),
  );
  const versionPath = resolve(
    root,
    'versions',
    `${pointer.versionId.slice(7)}.json`,
  );
  const product = verifyProductVersion(
    ProductVersionSchema.parse(JSON.parse(readFileSync(versionPath, 'utf8'))),
  );

  if (pointer.channel !== channel) {
    throw new Error(
      `Product pointer channel ${pointer.channel} does not match ${channel}`,
    );
  }
  if (product.versionId !== pointer.versionId) {
    throw new Error('Product pointer and immutable version do not match');
  }

  return { channel, pointer, product };
};
