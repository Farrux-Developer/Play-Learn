/**
 * Serves root static files (index.html, tests.html, styles.css, app.js, data.js, css/*, js/*, data/*)
 * for preview on localhost:3000 via next.config.ts beforeFiles rewrites.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
};

const ALLOWED_ROOT = new Set([
  'index.html',
  'tests.html',
  'styles.css',
  'app.js',
  'data.js',
  'README.md',
]);

const ALLOWED_PREFIXES = ['css/', 'js/', 'data/', 'vendor/'];

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const resolved = await context.params;
  const relPath = (resolved.path || []).join('/');
  const allowed =
    ALLOWED_ROOT.has(relPath) ||
    ALLOWED_PREFIXES.some((prefix) => relPath.startsWith(prefix));

  if (!allowed || relPath.includes('..')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const rootDir = path.resolve(process.cwd());
  const filePath = path.resolve(rootDir, relPath);
  if (!filePath.startsWith(rootDir + path.sep)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
