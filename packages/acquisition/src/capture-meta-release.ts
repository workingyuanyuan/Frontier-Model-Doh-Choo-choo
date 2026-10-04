import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  captureArtifact,
  getWorkspaceRoot,
  writeMetadataJson,
} from './refresh-utils.js';

const root = getWorkspaceRoot();
const targets = [
  [
    'https://research.meta.ai/blog/introducing-muse-spark-1-3',
    'text/html',
    'DOM',
  ],
  [
    'https://research.meta.ai/static/muse-spark-1-3-multimodal-evaluation-methodology',
    'application/pdf',
    'DOM',
  ],
  [
    'https://research.meta.ai/articles/introducing-muse-1-3/benchmarks/benchmark-scorecard-v6.webp',
    'image/webp',
    'VISUAL',
  ],
] as const;
const records = [];
for (const [url, mediaType, method] of targets) {
  const capture = await captureArtifact({
    root,
    sourceId: 'meta-releases',
    url,
    mediaType,
    method,
    retrievedAt: new Date().toISOString(),
    metadata: {
      scope: 'Reviewed Muse Spark 1.3 release, methodology and scorecard',
    },
  });
  records.push(capture.record);
}
await mkdir(join(root, 'data/research'), { recursive: true });
await writeMetadataJson(
  join(root, 'data/research/meta-release-evidence-index.json'),
  records,
);
console.log('Captured Meta release evidence');
