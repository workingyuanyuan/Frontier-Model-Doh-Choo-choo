/**
 * Published locations of the machine-readable files, relative to the site
 * root. The page links to them and the route handlers emit them, so both read
 * the same constants.
 */
export const LLMS_TXT_PATH = 'llms.txt';
export const METHODOLOGY_PATH = 'methodology.md';
export const DATA_INDEX_PATH = 'data/index.json';
export const PROFILES_PATH = 'data/profiles.json';
export const COSTS_PATH = 'data/costs.json';
/** The data the interactive dashboard loads; a transport, not a published contract. */
export const DASHBOARD_DATA_PATH = 'data/dashboard.json';
/**
 * Where the site is published. Canonical links and the sitemap name this
 * address whatever base path a build uses, so a local or preview build never
 * claims to be the original.
 */
export const PUBLIC_SITE_URL =
  'https://workingyuanyuan.github.io/Frontier-Model-Doh-Choo-choo/';
export const REPOSITORY_URL =
  'https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo';

export const presetMarkdownPath = (presetId: string): string =>
  `data/presets/${presetId}.md`;

export const presetJsonPath = (presetId: string): string =>
  `data/presets/${presetId}.json`;

/** The static HTML page of one preset, named with its extension so every static host serves it. */
export const presetPagePath = (presetId: string): string =>
  `presets/${presetId}.html`;

/** Product hashes use a colon, which cannot name a Windows export directory. */
export const evidenceVersionPath = (versionId: string): string =>
  versionId.replace(':', '-');

export const profileEvidencePath = (
  versionId: string,
  profileId: string,
): string => `evidence/${evidenceVersionPath(versionId)}/${profileId}.json`;

/** Path from a file at `from` to the site-root-relative `to`. */
export const relativeTo = (from: string, to: string): string =>
  `${'../'.repeat(from.split('/').length - 1)}${to}`;

/** Absolute public URL of a site-root-relative path; `''` is the home page. */
export const publicUrl = (path: string): string => `${PUBLIC_SITE_URL}${path}`;

/** Plain anchors are not prefixed by Next, so the Pages subpath is added here. */
export const sitePath = (path: string): string =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/${path}`;

/** The version keeps a cached copy of an older release from being paired with a newer page. */
export const dashboardDataUrl = (versionId: string): string =>
  `${sitePath(DASHBOARD_DATA_PATH)}?v=${encodeURIComponent(versionId)}`;
