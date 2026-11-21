// Gives every exported page a copy at <page>/index.html.
//
// Next.js exports a page as <page>.html. GitHub Pages serves that file for
// /<page> but answers /<page>/ only from <page>/index.html, so a hand-typed or
// copied URL with a trailing slash returned 404. The copy keeps its canonical
// link to /<page>, so search engines still index one URL.
//
// Skipped: the site root (index.html), the 404 page, Next.js internals (names
// starting with "_"), and any page that already has a directory index.
//
// Usage: node scripts/add-directory-indexes.mjs [export-dir]
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const SKIPPED = new Set(['index.html', '404.html']);

/** Returns the export-relative paths of the index files it wrote. */
export function addDirectoryIndexes(exportDir) {
  const written = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('_')) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(path);
        continue;
      }
      if (!entry.name.endsWith('.html') || SKIPPED.has(entry.name)) continue;
      const target = join(dir, basename(entry.name, '.html'), 'index.html');
      if (existsSync(target)) continue;
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(path, target);
      written.push(relative(exportDir, target));
    }
  };
  visit(exportDir);
  return written.toSorted();
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const exportDir = process.argv[2] ?? 'apps/bench/out';
  const written = addDirectoryIndexes(exportDir);
  console.log(
    `Added ${written.length} directory index page(s) under ${exportDir}`,
  );
}
