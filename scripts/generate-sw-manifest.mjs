import fs from 'node:fs';
import path from 'node:path';

const buildIdPath = path.resolve('.next/BUILD_ID');
const buildId = fs.existsSync(buildIdPath)
  ? fs.readFileSync(buildIdPath, 'utf8').trim()
  : String(Date.now());

const assets = [];
const staticChunksDir = path.resolve('.next/static/chunks');
if (fs.existsSync(staticChunksDir)) {
  for (const file of fs.readdirSync(staticChunksDir)) {
    if (file.endsWith('.js')) {
      assets.push(`/_next/static/chunks/${file}`);
    }
  }
}

const staticCssDir = path.resolve('.next/static/css');
if (fs.existsSync(staticCssDir)) {
  for (const file of fs.readdirSync(staticCssDir)) {
    if (file.endsWith('.css')) {
      assets.push(`/_next/static/css/${file}`);
    }
  }
}

fs.writeFileSync(
  path.resolve('public/sw-manifest.json'),
  JSON.stringify({ buildId, assets: assets.slice(0, 60) }, null, 2) + '\n',
  'utf8'
);

console.log(`Generated public/sw-manifest.json (buildId=${buildId}, assets=${Math.min(60, assets.length)})`);
