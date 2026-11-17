/**
 * Published locations of the machine-readable files, relative to the site
 * root. The page links to them and the route handlers emit them, so both read
 * the same constants.
 */
export const LLMS_TXT_PATH = 'llms.txt';
export const METHODOLOGY_PATH = 'methodology.md';
export const REPOSITORY_URL =
  'https://github.com/workingyuanyuan/Frontier-Model-Doh-Choo-choo';

export const presetMarkdownPath = (presetId: string): string =>
  `data/presets/${presetId}.md`;

/** Plain anchors are not prefixed by Next, so the Pages subpath is added here. */
export const sitePath = (path: string): string =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/${path}`;
