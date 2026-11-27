import { execSync } from 'node:child_process';

execSync('npm run build', {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
});

execSync('node scripts/generate-sw-manifest.mjs', {
  stdio: 'inherit',
});
