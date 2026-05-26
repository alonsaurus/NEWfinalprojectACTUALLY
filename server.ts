import { readFileSync } from 'fs';
import path from 'path';

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const fullPath = path.join(import.meta.dir, filePath);

    try {
      const file = Bun.file(fullPath);
      const ext = path.extname(fullPath);
      return new Response(file, {
        headers: { 'Content-Type': mimeTypes[ext] ?? 'text/plain' },
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  },
});

console.log('Server running at http://localhost:3000');