import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootArg = process.argv[2] || 'web';
const port = Number(process.argv[3] || 47221);
const root = join(dirname(fileURLToPath(import.meta.url)), '..', rootArg);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json'
};

function dirname(p) { return p.slice(0, p.lastIndexOf('/')); }

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(root, path));
    if (!file.startsWith(root)) { res.writeHead(403); res.end('no'); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch (e) {
    res.writeHead(404); res.end('not found');
  }
});
server.listen(port, '0.0.0.0', () => {
  console.log('serving ' + rootArg + ' at http://127.0.0.1:' + port + '/');
});
