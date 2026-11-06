import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const port = 8080;
const types = {
  '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.swf': 'application/x-shockwave-flash'
};

await new Promise((resolve, reject) => {
  const build = spawn(process.execPath, ['scripts/build-manifest.mjs'], { stdio: 'inherit' });
  build.on('exit', code => code === 0 ? resolve() : reject(new Error(`Build exited with ${code}`)));
});

createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname);
    const filePath = normalize(join(root, urlPath === '/' ? 'index.html' : urlPath));
    if (!filePath.startsWith(root)) throw new Error('Invalid path');
    const info = await stat(filePath);
    const data = await readFile(info.isDirectory() ? join(filePath, 'index.html') : filePath);
    response.writeHead(200, { 'Content-Type': `${types[extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
    response.end(data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
}).listen(port, () => console.log(`\nThe List is ready at http://localhost:${port}\nPress Ctrl+C to stop the local preview.`));
