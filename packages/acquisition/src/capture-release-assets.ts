import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { EvidenceRecord } from '@llm-bench/benchmark-data';
import {
  captureArtifact,
  getWorkspaceRoot,
  readJson,
  writeMetadataJson,
} from './refresh-utils.js';

const root = getWorkspaceRoot();
const path = join(root, 'data/research/release-evidence-index.json');
const records = await readJson<EvidenceRecord[]>(path);
const xai = records.find(
  (r) => r.sourceId === 'xai-releases' && r.mediaType === 'text/html',
)!;
const html = await readFile(join(root, xai.artifactPath), 'utf8');
const chunks = [
  ...new Set(
    [...html.matchAll(/src="([^"<>]+\.js[^"<>]*)"/g)].map(
      (m) => new URL(m[1]!.replaceAll('&amp;', '&'), xai.requestUrl).href,
    ),
  ),
];
const targets = [
  {
    sourceId: 'zai-releases',
    url: 'https://z.ai/blog/assets/glm-5.3-BIDw01m9.js',
  },
  ...chunks.map((url) => ({ sourceId: 'xai-releases', url })),
];
const results = await Promise.allSettled(
  targets.map(async ({ sourceId, url }) => {
    const captured = await captureArtifact({
      root,
      sourceId,
      url,
      retrievedAt: new Date().toISOString(),
      mediaType: 'application/javascript',
      method: 'NEXT_RSC',
      metadata: {
        scope: 'Release page chart bundle; read-only source inspection',
      },
    });
    if (
      sourceId === 'zai-releases' ||
      /662143|CursorBench 4\.0/.test(captured.text)
    )
      return captured.record;
    return null;
  }),
);
for (const result of results) {
  if (result.status === 'rejected') console.error(String(result.reason));
  else if (result.value) {
    records.push(result.value);
    console.log(result.value.artifactPath);
  }
}
await writeMetadataJson(path, records);
