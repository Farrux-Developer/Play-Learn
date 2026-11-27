/**
 * Production bundle-size gate (`npm run budget:check`):
 * Reads `.next/app-build-manifest.json` and measures gzipped First-Load JS per route.
 * Fails CI if any route exceeds its budget (or reports exact baseline if --report).
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const manifestPath = path.resolve('.next/app-build-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Missing .next/app-build-manifest.json. Run `npm run build` first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const pages = manifest.pages || {};

const ROUTE_BUDGETS_KB = {
  '/page': 120,
  '/design-gallery/page': 250,
};

const reportOnly = process.argv.includes('--report');
let failed = false;

console.log('=== First-Load JS Bundle Budget Check ===');
for (const [route, budgetKb] of Object.entries(ROUTE_BUDGETS_KB)) {
  const files = pages[route] || [];
  let totalGz = 0;
  for (const rel of files) {
    if (!rel.endsWith('.js')) continue;
    const full = path.resolve('.next', rel);
    if (!fs.existsSync(full)) continue;
    totalGz += zlib.gzipSync(fs.readFileSync(full)).length;
  }
  const kb = Number((totalGz / 1024).toFixed(1));
  const ok = kb <= budgetKb;
  const status = ok ? 'PASS' : 'OVER_BUDGET';
  console.log(`${status.padEnd(11)} ${route.padEnd(24)} ${kb} KB gz / ${budgetKb} KB gz`);
  if (!ok && !reportOnly) failed = true;
}

if (failed) {
  console.error(
    '\nBundle budget exceeded! Convert landing shell to Server Components + dynamic islands to meet <= 120 KB gz.'
  );
  process.exit(1);
}
