// Prints the IndexNow request body for pages whose content changed, or nothing.
//
// Run on a main push after the export is built and before it is deployed. The
// pages carry build hashes, so each page is compared through the data file it
// renders: the dashboard through data/dashboard.json, a preset page through
// its preset JSON. A page counts as changed when that file differs from the
// live one or is missing there. A change to the page chrome submits nothing.
//
// The key file lives at the root of the domain (served by the user site),
// which authorizes every URL on the host, project sites included.
//
// Usage: node scripts/indexnow.mjs [export-dir] > body.json
//        (empty output: nothing to submit)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const INDEXNOW_KEY = '633317ad5747c8e6a159c88e888ec920';

export const sitemapLocs = (xml) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

/**
 * The site root is the one listed URL ending in a slash: the dashboard.
 * Returns, per page, the site-relative path of the data file it renders.
 * An unknown kind of page throws, so a new page type cannot go unchecked.
 */
export function pageDataFiles(locs) {
  const roots = locs.filter((loc) => loc.endsWith('/'));
  if (roots.length !== 1)
    throw new Error(`indexnow: expected one site root, found ${roots.length}`);
  const [root] = roots;
  return locs.map((loc) => {
    if (!loc.startsWith(root)) throw new Error(`indexnow: ${loc} is off-site`);
    const path = loc.slice(root.length);
    if (path === '') return { loc, file: 'data/dashboard.json' };
    const preset = /^presets\/([^/]+)\.html$/.exec(path);
    if (preset) return { loc, file: `data/presets/${preset[1]}.json` };
    throw new Error(`indexnow: no data file is known for ${loc}`);
  });
}

/**
 * `fetchLive(url)` resolves to the live text, or null when the file is new
 * (404). Any other failure must throw: an outage is not a change.
 */
export async function changedPages(locs, readLocal, fetchLive) {
  const root = locs.find((loc) => loc.endsWith('/'));
  const changed = [];
  for (const { loc, file } of pageDataFiles(locs)) {
    const live = await fetchLive(`${root}${file}`);
    if (live !== readLocal(file)) changed.push(loc);
  }
  return changed;
}

export const requestBody = (urlList) => {
  const { host, origin } = new URL(urlList[0]);
  return {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${origin}/${INDEXNOW_KEY}.txt`,
    urlList,
  };
};

async function fetchLive(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`indexnow: ${url} returned ${response.status}`);
  return response.text();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const out = process.argv[2] ?? 'apps/bench/out';
  const locs = sitemapLocs(readFileSync(join(out, 'sitemap.xml'), 'utf8'));
  if (locs.length === 0) throw new Error('indexnow: the sitemap lists no URL');
  const changed = await changedPages(
    locs,
    (file) => readFileSync(join(out, file), 'utf8'),
    fetchLive,
  );
  console.error(`indexnow: ${changed.length} of ${locs.length} pages changed`);
  for (const url of changed) console.error(`  ${url}`);
  if (changed.length > 0) console.log(JSON.stringify(requestBody(changed)));
}
