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
    'google-releases',
    'https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/',
    'text/html',
  ],
  [
    'google-releases',
    'https://deepmind.google/models/evals-methodology/gemini-3-8-flash',
    'application/pdf',
  ],
  [
    'google-releases',
    'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/',
    'text/html',
  ],
  [
    'google-releases',
    'https://deepmind.google/models/evals-methodology/gemini-4-argon',
    'application/pdf',
  ],
  ['xai-releases', 'https://x.ai/news/grok-4-7', 'text/html'],
  ['zai-releases', 'https://z.ai/blog/glm-5.3', 'text/html'],
  [
    'zai-releases',
    'https://autoclaw.z.ai/blog/model/glm-5.3-flash/',
    'text/html',
  ],
  ['kimi-releases', 'https://www.kimi.com/en/blog/kimi-k3', 'text/html'],
  ['deepseek-releases', 'https://api-docs.deepseek.com/updates/', 'text/html'],
] as const;
const results = [];
for (const [sourceId, url, mediaType] of targets) {
  try {
    const capture = await captureArtifact({
      root,
      sourceId,
      url,
      mediaType,
      retrievedAt: new Date().toISOString(),
      method: 'DOM',
      metadata: {
        scope:
          'Official release research; adoption requires individual row review.',
      },
    });
    results.push(capture.record);
    console.log(`${sourceId}: ${capture.record.byteLength} bytes`);
  } catch (error) {
    console.error(`${url}: ${String(error)}`);
  }
}
await mkdir(join(root, 'data', 'research'), { recursive: true });
await writeMetadataJson(
  join(root, 'data', 'research', 'release-evidence-index.json'),
  results,
);
