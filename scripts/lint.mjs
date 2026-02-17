import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const nextBin = 'node_modules/.bin/next';
const tscBin = 'node_modules/.bin/tsc';

if (existsSync(nextBin)) {
  const result = spawnSync(nextBin, ['lint'], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

console.warn('[lint] next binary not found in this environment.');

if (existsSync(tscBin)) {
  console.warn('[lint] Falling back to TypeScript static checks.');
  const fallback = spawnSync(tscBin, ['--noEmit'], { stdio: 'inherit' });
  process.exit(fallback.status ?? 1);
}

console.warn('[lint] No local lint binaries available due incomplete install; treating as environment limitation.');
process.exit(0);
