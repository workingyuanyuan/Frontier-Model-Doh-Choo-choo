import test from 'node:test';
import assert from 'node:assert/strict';

import {
  INDEXNOW_KEY,
  changedPages,
  pageDataFiles,
  requestBody,
  sitemapLocs,
} from './indexnow.mjs';

const root = 'https://example.github.io/site/';
const locs = [root, `${root}presets/a.html`, `${root}presets/b.html`];

test('each page is compared through the data file it renders', () => {
  const xml = locs.map((loc) => `<url><loc>${loc}</loc></url>`).join('');
  assert.deepEqual(pageDataFiles(sitemapLocs(xml)), [
    { loc: root, file: 'data/dashboard.json' },
    { loc: `${root}presets/a.html`, file: 'data/presets/a.json' },
    { loc: `${root}presets/b.html`, file: 'data/presets/b.json' },
  ]);
});

test('an unknown page, an off-site URL or no single root fails', () => {
  assert.throws(() => pageDataFiles([root, `${root}about.html`]), /no data/);
  assert.throws(
    () => pageDataFiles([root, 'https://other.example/x.html']),
    /off-site/,
  );
  assert.throws(() => pageDataFiles([`${root}presets/a.html`]), /site root/);
  assert.throws(() => pageDataFiles([root, `${root}x/`]), /site root/);
});

test('only pages whose data differs from the live copy or is new are listed', async () => {
  const local = {
    'data/dashboard.json': 'same',
    'data/presets/a.json': 'new value',
    'data/presets/b.json': 'added',
  };
  const live = {
    [`${root}data/dashboard.json`]: 'same',
    [`${root}data/presets/a.json`]: 'old value',
  };
  const changed = await changedPages(
    locs,
    (file) => local[file],
    async (url) => live[url] ?? null,
  );
  assert.deepEqual(changed, [`${root}presets/a.html`, `${root}presets/b.html`]);
});

test('a failed live request stops the comparison', async () => {
  await assert.rejects(
    changedPages(
      locs,
      () => 'x',
      async () => {
        throw new Error('503');
      },
    ),
    /503/,
  );
});

test('the request names the domain key file', () => {
  assert.deepEqual(requestBody([`${root}presets/a.html`]), {
    host: 'example.github.io',
    key: INDEXNOW_KEY,
    keyLocation: `https://example.github.io/${INDEXNOW_KEY}.txt`,
    urlList: [`${root}presets/a.html`],
  });
});
