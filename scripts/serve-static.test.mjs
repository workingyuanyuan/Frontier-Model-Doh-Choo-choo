import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { setTimeout as sleep } from 'node:timers/promises';
import { createStaticServer, CONTENT_TYPES } from './serve-static.mjs';

const parseHttpResponse = (rawResponse) => {
  const [headerSection, ...bodyParts] = rawResponse.split('\r\n\r\n');
  const lines = headerSection.split('\r\n');
  const statusLine = lines[0] ?? '';
  const statusMatch = statusLine.match(/^HTTP\/[0-9.]+\s+(\d+)/);
  const status = statusMatch ? Number(statusMatch[1]) : 0;
  const headers = {};
  for (let i = 1; i < lines.length; i++) {
    const colon = lines[i].indexOf(':');
    if (colon > 0) {
      const key = lines[i].slice(0, colon).trim().toLowerCase();
      const value = lines[i].slice(colon + 1).trim();
      headers[key] = value;
    }
  }
  const body = bodyParts.join('\r\n\r\n');
  return { status, headers, body, raw: rawResponse };
};

const sendRawRequest = (port, requestString) =>
  new Promise((resolvePromise, rejectPromise) => {
    const socket = connect(port, '127.0.0.1', () => {
      socket.write(requestString);
    });
    let data = '';
    socket.on('data', (chunk) => {
      data += chunk.toString();
    });
    socket.on('end', () => {
      resolvePromise(parseHttpResponse(data));
    });
    socket.on('error', (err) => {
      rejectPromise(err);
    });
  });

const spawnServer = async (rootDir) => {
  const scriptPath = resolve('scripts/serve-static.mjs');
  const child = spawn(process.execPath, [scriptPath, rootDir, '0'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const port = await new Promise((resolvePromise, rejectPromise) => {
    let output = '';
    const onData = (chunk) => {
      output += chunk.toString();
      const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        child.stdout.off('data', onData);
        resolvePromise(Number(match[1]));
      }
    };
    child.stdout.on('data', onData);
    child.on('error', rejectPromise);
    child.on('exit', (code) => {
      rejectPromise(
        new Error(
          `Server process exited prematurely with code ${code}: ${output}`,
        ),
      );
    });
  });

  const stop = () =>
    new Promise((resolvePromise) => {
      if (child.exitCode !== null) {
        resolvePromise();
        return;
      }
      child.on('exit', () => resolvePromise());
      child.kill();
    });

  return { child, port, stop };
};

describe('scripts/serve-static.mjs integration tests', () => {
  let tempBaseDir;
  let fixtureDir;
  let outsideFile;
  let serverInstance;

  before(async () => {
    tempBaseDir = await mkdtemp(join(tmpdir(), 'serve-static-test-'));
    fixtureDir = join(tempBaseDir, 'root');
    outsideFile = join(tempBaseDir, 'outside.txt');

    await mkdir(fixtureDir, { recursive: true });
    await mkdir(join(fixtureDir, 'sub'), { recursive: true });

    await writeFile(outsideFile, 'secret outside root', 'utf-8');
    await writeFile(
      join(fixtureDir, 'index.html'),
      '<h1>Hello Index</h1>',
      'utf-8',
    );
    await writeFile(
      join(fixtureDir, 'style.css'),
      'body { margin: 0; }',
      'utf-8',
    );
    await writeFile(
      join(fixtureDir, 'app.js'),
      'console.log("static");',
      'utf-8',
    );
    await writeFile(join(fixtureDir, 'data.json'), '{"bench": true}', 'utf-8');
    await writeFile(
      join(fixtureDir, 'clean-page.html'),
      '<h1>Clean Page</h1>',
      'utf-8',
    );
    await writeFile(
      join(fixtureDir, 'sub', 'index.html'),
      '<h1>Sub Index</h1>',
      'utf-8',
    );
    await writeFile(
      join(fixtureDir, 'sub', 'nested.html'),
      '<h1>Nested</h1>',
      'utf-8',
    );
    await writeFile(
      join(fixtureDir, 'large.txt'),
      'A'.repeat(1024 * 1024),
      'utf-8',
    );

    serverInstance = await spawnServer(fixtureDir);
  });

  after(async () => {
    if (serverInstance) {
      await serverInstance.stop();
    }
    if (tempBaseDir) {
      await rm(tempBaseDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  test('spawns actual server on dynamically assigned port and stays running', () => {
    assert.ok(serverInstance.port > 0);
    assert.equal(serverInstance.child.exitCode, null);
  });

  test('malformed raw HTTP paths -> 400 then valid -> 200 on same process', async () => {
    const initialPid = serverInstance.child.pid;
    const malformedPaths = [
      '/%ff',
      '/%',
      '/%c0%af',
      '/%E0%A4%A',
      '/test%zz',
      '/hello%2',
    ];

    for (const badPath of malformedPaths) {
      const response = await sendRawRequest(
        serverInstance.port,
        `GET ${badPath} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n`,
      );
      assert.equal(
        response.status,
        400,
        `Expected 400 for path "${badPath}", received ${response.status}`,
      );
      assert.ok(
        response.body.includes('Bad request'),
        `Expected body to include "Bad request", received "${response.body}"`,
      );
      assert.equal(
        serverInstance.child.exitCode,
        null,
        'Server process terminated after malformed request',
      );
      assert.equal(
        serverInstance.child.pid,
        initialPid,
        'Server PID changed after malformed request',
      );
    }

    const validResponse = await sendRawRequest(
      serverInstance.port,
      'GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(validResponse.status, 200);
    assert.ok(validResponse.body.includes('<h1>Hello Index</h1>'));
    assert.equal(serverInstance.child.exitCode, null);
    assert.equal(serverInstance.child.pid, initialPid);
  });

  test('handles pipelined malformed then valid requests on same socket without terminating', async () => {
    const initialPid = serverInstance.child.pid;
    const rawData = await new Promise((resolvePromise, rejectPromise) => {
      const socket = connect(serverInstance.port, '127.0.0.1', () => {
        socket.write(
          'GET /%ff HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n' +
            'GET /index.html HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
        );
      });
      let buf = '';
      socket.on('data', (chunk) => {
        buf += chunk.toString();
      });
      socket.on('end', () => resolvePromise(buf));
      socket.on('error', rejectPromise);
    });

    assert.ok(rawData.includes('HTTP/1.1 400 Bad Request'));
    assert.ok(rawData.includes('HTTP/1.1 200 OK'));
    assert.ok(rawData.includes('<h1>Hello Index</h1>'));
    assert.equal(serverInstance.child.exitCode, null);
    assert.equal(serverInstance.child.pid, initialPid);
  });

  test('preserves normal static file serving and content types', async () => {
    const resHtml = await sendRawRequest(
      serverInstance.port,
      'GET /index.html HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(resHtml.status, 200);
    assert.equal(resHtml.headers['content-type'], CONTENT_TYPES.get('.html'));
    assert.ok(resHtml.body.includes('<h1>Hello Index</h1>'));

    const resCss = await sendRawRequest(
      serverInstance.port,
      'GET /style.css HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(resCss.status, 200);
    assert.equal(resCss.headers['content-type'], CONTENT_TYPES.get('.css'));

    const resJs = await sendRawRequest(
      serverInstance.port,
      'GET /app.js HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(resJs.status, 200);
    assert.equal(resJs.headers['content-type'], CONTENT_TYPES.get('.js'));

    const resJson = await sendRawRequest(
      serverInstance.port,
      'GET /data.json HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(resJson.status, 200);
    assert.equal(resJson.headers['content-type'], CONTENT_TYPES.get('.json'));

    const resClean = await sendRawRequest(
      serverInstance.port,
      'GET /clean-page HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(resClean.status, 200);
    assert.ok(resClean.body.includes('<h1>Clean Page</h1>'));

    const resSub = await sendRawRequest(
      serverInstance.port,
      'GET /sub HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(resSub.status, 200);
    assert.ok(resSub.body.includes('<h1>Sub Index</h1>'));

    const resSubSlash = await sendRawRequest(
      serverInstance.port,
      'GET /sub/ HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(resSubSlash.status, 200);
    assert.ok(resSubSlash.body.includes('<h1>Sub Index</h1>'));

    const resNested = await sendRawRequest(
      serverInstance.port,
      'GET /sub/nested.html HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(resNested.status, 200);
    assert.ok(resNested.body.includes('<h1>Nested</h1>'));

    const resNotFound = await sendRawRequest(
      serverInstance.port,
      'GET /missing.html HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(resNotFound.status, 404);
    assert.ok(resNotFound.body.includes('Not found'));
  });

  test('maintains lexical containment and blocks path traversal attempts', async () => {
    const traversalPaths = [
      '/../outside.txt',
      '/../../outside.txt',
      '/sub/../../outside.txt',
      '/%2e%2e/outside.txt',
      '/%2e%2e%2foutside.txt',
      '/..%2foutside.txt',
    ];

    for (const path of traversalPaths) {
      const response = await sendRawRequest(
        serverInstance.port,
        `GET ${path} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n`,
      );
      assert.ok(
        response.status === 404 || response.status === 400,
        `Expected 404 or 400 for path "${path}", got ${response.status}`,
      );
      assert.ok(
        !response.body.includes('secret outside root'),
        `Traversal leaked outside file for path: ${path}`,
      );
    }
  });

  test('client premature disconnect during stream does not terminate server process', async () => {
    await new Promise((resolvePromise) => {
      const socket = connect(serverInstance.port, '127.0.0.1', () => {
        socket.write('GET /large.txt HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n');
      });
      socket.on('data', () => {
        socket.destroy();
        resolvePromise();
      });
      socket.on('error', () => {
        resolvePromise();
      });
    });

    await sleep(100);

    assert.equal(
      serverInstance.child.exitCode,
      null,
      'Server crashed after client premature disconnect',
    );

    const checkRes = await sendRawRequest(
      serverInstance.port,
      'GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
    );
    assert.equal(checkRes.status, 200);
    assert.ok(checkRes.body.includes('<h1>Hello Index</h1>'));
  });

  test('createStaticServer exports and behaves correctly', async () => {
    const inProcServer = createStaticServer(fixtureDir);
    await new Promise((r) => inProcServer.listen(0, '127.0.0.1', r));
    const dynamicPort = inProcServer.address().port;

    try {
      const badRes = await sendRawRequest(
        dynamicPort,
        'GET /%ff HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
      );
      assert.equal(badRes.status, 400);

      const goodRes = await sendRawRequest(
        dynamicPort,
        'GET /index.html HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n',
      );
      assert.equal(goodRes.status, 200);
      assert.ok(goodRes.body.includes('<h1>Hello Index</h1>'));
    } finally {
      await new Promise((r) => inProcServer.close(r));
    }
  });
});
