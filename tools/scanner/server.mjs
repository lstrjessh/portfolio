import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const routes = {
  '/': 'tools/scanner/render.html',
  '/scene.mjs': 'tools/scanner/scene.mjs',
  '/assembly.json': '.cache/scanner/assembly.json',
  '/cat.json': '.cache/scanner/cat.json',
};
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (request.method === 'POST' && url.pathname === '/save-model') {
    const chunks=[];
    for await (const chunk of request) chunks.push(chunk);
    const model=Buffer.concat(chunks);
    fs.mkdirSync(path.join(root,'public/scanner'),{recursive:true});
    fs.writeFileSync(path.join(root,'.cache/scanner/model.glb'),model);
    const compressed=gzipSync(model,{level:9});
    fs.writeFileSync(path.join(root,'public/scanner/model.glb.gz'),compressed);
    response.setHeader('Content-Type','application/json');
    response.end(JSON.stringify({rawBytes:model.length,compressedBytes:compressed.length}));
    return;
  }
  let relative=routes[url.pathname];
  if(url.pathname.startsWith('/three/')) relative='tools/scanner/node_modules/three/'+url.pathname.slice(7);
  if(url.pathname.startsWith('/meshoptimizer/')) relative='tools/scanner/node_modules/meshoptimizer/'+url.pathname.slice(15);
  if(!relative){response.writeHead(404);response.end();return;}
  const absolute=path.resolve(root,relative);
  if(!absolute.startsWith(root+path.sep)||!fs.existsSync(absolute)){response.writeHead(404);response.end();return;}
  response.setHeader('Content-Type',types[path.extname(absolute)]||'application/octet-stream');
  fs.createReadStream(absolute).pipe(response);
});
server.listen(8014,'127.0.0.1',()=>console.log('Scanner render studio: http://127.0.0.1:8014'));
