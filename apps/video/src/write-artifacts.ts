import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { previewSnapshot } from '@llm-bench/presentation';

import { createVideoArtifactBundle } from './artifacts';

const outputDirectory = resolve(import.meta.dirname, '../../../output');
const bundle = createVideoArtifactBundle({
  snapshot: previewSnapshot,
  locale: 'zh-TW',
  theme: 'editorial',
  selectedModelIndex: 0,
});

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(
    resolve(outputDirectory, 'llm-bench-weekly.metadata.json'),
    `${JSON.stringify(bundle.manifest, null, 2)}\n`,
    'utf8',
  ),
  writeFile(
    resolve(outputDirectory, 'llm-bench-weekly.ranking.csv'),
    bundle.rankingCsv,
    'utf8',
  ),
]);

console.info(
  JSON.stringify({
    snapshotId: bundle.manifest.snapshotId,
    snapshotSha256: bundle.manifest.snapshotSha256,
    outputDirectory,
  }),
);
