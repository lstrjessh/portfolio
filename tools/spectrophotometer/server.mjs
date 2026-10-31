import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const source = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(source)) throw new Error('Pass the source Assembly.obj path.');
const materialName = fs.readFileSync(source, 'utf8').match(/^mtllib (.+)$/m)?.[1].trim();
const routes = {
  '/': path.join(root, 'tools/spectrophotometer/render.html'),
  '/scene.mjs': path.join(root, 'tools/spectrophotometer/scene.mjs'),
  '/components.mjs': path.join(root, 'tools/spectrophotometer/components.mjs'),
  '/assembly.obj': source,
  '/assembly.mtl': materialName && path.join(path.dirname(source), path.basename(materialName)),
};
http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (request.method === 'POST' && url.pathname === '/save-model') {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const data = Buffer.concat(chunks);
    const destination = path.join(root, 'public/spectrophotometer');
    fs.mkdirSync(destination, { recursive: true });
    const compressed = gzipSync(data, { level: 9 });
    fs.writeFileSync(path.join(destination, 'model.glb.gz'), compressed);
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ rawBytes: data.length, compressedBytes: compressed.length }));
    return;
  }
  let file = routes[url.pathname];
  for (const [prefix, directory] of [['/three/', 'three'], ['/meshoptimizer/', 'meshoptimizer']]) {
    if (!url.pathname.startsWith(prefix)) continue;
    const base = path.resolve(root, 'tools/scanner/node_modules', directory);
    const candidate = path.resolve(base, url.pathname.slice(prefix.length));
    if (candidate.startsWith(base + path.sep)) file = candidate;
  }
  if (!file || !fs.existsSync(file)) { response.writeHead(404); response.end(); return; }
  response.setHeader('Content-Type', /\.m?js$/.test(file) ? 'text/javascript' : file.endsWith('.html') ? 'text/html' : 'text/plain');
  fs.createReadStream(file).pipe(response);
}).listen(8015, '127.0.0.1', () => console.log('Spectrophotometer studio: http://127.0.0.1:8015'));
