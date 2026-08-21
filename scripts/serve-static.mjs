/**
 * Minimal static file server for the exported dashboard. Playwright needs to
 * serve `apps/bench/out`, and `next start` cannot serve an `output: 'export'`
 * build. Written against node:http so the e2e gate adds no dependency.
 *
 * Usage: node scripts/serve-static.mjs <root> <port>
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const [, , rootArg, portArg] = process.argv;
const root = resolve(rootArg ?? 'apps/bench/out');
const port = Number(portArg ?? 3910);

const CONTENT_TYPES = new Map(
  Object.entries({
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.woff2': 'font/woff2',
    '.txt': 'text/plain; charset=utf-8',
  }),
);

/** Resolve a request path inside root, refusing anything that escapes it. */
const resolveWithin = (urlPath) => {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const candidate = resolve(join(root, normalize(decoded)));
  return candidate === root || candidate.startsWith(root + sep)
    ? candidate
    : null;
};

const fileFor = async (candidate) => {
  const direct = await stat(candidate).catch(() => null);
  if (direct?.isFile()) return candidate;
  if (direct?.isDirectory()) {
    const index = join(candidate, 'index.html');
    if ((await stat(index).catch(() => null))?.isFile()) return index;
  }
  const html = `${candidate}.html`;
  return (await stat(html).catch(() => null))?.isFile() ? html : null;
};

createServer(async (request, response) => {
  const candidate = resolveWithin(request.url ?? '/');
  const file = candidate === null ? null : await fileFor(candidate);
  if (file === null) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'content-type':
      CONTENT_TYPES.get(extname(file)) ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} on http://127.0.0.1:${port}`);
});
