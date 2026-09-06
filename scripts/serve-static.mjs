/**
 * Minimal static file server for the exported dashboard. Playwright needs to
 * serve `apps/bench/out`, and `next start` cannot serve an `output: 'export'`
 * build. Written against node:http so the e2e gate adds no dependency.
 *
 * Usage: node scripts/serve-static.mjs <root> <port>
 */
import { createServer } from 'node:http';
import { createReadStream, realpathSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream';
import { fileURLToPath } from 'node:url';

const [, , rootArg, portArg] = process.argv;
const root = resolve(rootArg ?? 'apps/bench/out');
const port = Number(portArg ?? 3910);

export const CONTENT_TYPES = new Map(
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
export const resolveWithin = (urlPath, rootDir = root) => {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const candidate = resolve(join(rootDir, normalize(decoded)));
  return candidate === rootDir || candidate.startsWith(rootDir + sep)
    ? candidate
    : null;
};

export const fileFor = async (candidate) => {
  const direct = await stat(candidate).catch(() => null);
  if (direct?.isFile()) return candidate;
  if (direct?.isDirectory()) {
    const index = join(candidate, 'index.html');
    if ((await stat(index).catch(() => null))?.isFile()) return index;
  }
  const html = `${candidate}.html`;
  return (await stat(html).catch(() => null))?.isFile() ? html : null;
};

export const createStaticServer = (rootDir = root) => {
  const server = createServer((request, response) => {
    request.on('error', () => {});
    response.on('error', () => {});

    const handle = async () => {
      let candidate;
      try {
        candidate = resolveWithin(request.url ?? '/', rootDir);
      } catch (err) {
        if (err instanceof URIError) {
          response.writeHead(400, {
            'content-type': 'text/plain; charset=utf-8',
          });
          response.end('Bad request');
          return;
        }
        throw err;
      }

      const file = candidate === null ? null : await fileFor(candidate);
      if (file === null) {
        response.writeHead(404, {
          'content-type': 'text/plain; charset=utf-8',
        });
        response.end('Not found');
        return;
      }

      const stream = createReadStream(file);
      stream.on('error', () => {
        if (!response.headersSent) {
          response.writeHead(500, {
            'content-type': 'text/plain; charset=utf-8',
          });
          response.end('Internal server error');
        } else {
          response.destroy();
        }
      });
      response.writeHead(200, {
        'content-type':
          CONTENT_TYPES.get(extname(file)) ?? 'application/octet-stream',
      });
      pipeline(stream, response, () => {});
    };

    handle().catch(() => {
      try {
        if (!response.headersSent) {
          response.writeHead(500, {
            'content-type': 'text/plain; charset=utf-8',
          });
          response.end('Internal server error');
        } else {
          response.destroy();
        }
      } catch {
        // response might already be closed or destroyed
      }
    });
  });

  return server;
};

const isMain =
  Boolean(process.argv[1]) &&
  (() => {
    try {
      return (
        realpathSync(resolve(process.argv[1])).toLowerCase() ===
        realpathSync(fileURLToPath(import.meta.url)).toLowerCase()
      );
    } catch {
      return (
        resolve(process.argv[1]).toLowerCase() ===
        fileURLToPath(import.meta.url).toLowerCase()
      );
    }
  })();

if (isMain) {
  const server = createStaticServer(root);
  server.listen(port, '127.0.0.1', () => {
    const address = server.address();
    const actualPort =
      typeof address === 'object' && address !== null ? address.port : port;
    console.log(`Serving ${root} on http://127.0.0.1:${actualPort}`);
  });
}
