// Builds the public GitHub Pages artifact.
//
// The one thing this script exists to guarantee: no OpenRouter key reaches a
// public bundle. MURSHIDI_PUBLIC_BUILD=1 makes vite.config.ts replace
// import.meta.env.VITE_OPENROUTER_KEY with an empty string at compile time, so
// a .env.local sitting in the working tree cannot leak into the artifact. The
// script then greps the output and refuses to finish if anything key-shaped
// survived, because "we were careful" is not a control.
//
//   npm run build:pages   → dist/ with base /murshidi-app/ and no key

import { execFileSync } from 'child_process';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Call the local JS entry points with node directly: spawning npx.cmd fails with
// EINVAL on Windows, and going through a shell would mean quoting this repo's
// Arabic path.
const tsc = resolve(root, 'node_modules/typescript/bin/tsc');
const vite = resolve(root, 'node_modules/vite/bin/vite.js');

execFileSync(process.execPath, [tsc, '-b'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, [vite, 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, MURSHIDI_PUBLIC_BUILD: '1', VITE_BASE: '/murshidi-app/' },
});

const SECRET = /sk-(?:or-)?v?\d?-?[A-Za-z0-9_-]{20,}/;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(js|css|html|json|map|webmanifest)$/.test(name)) {
      const hit = readFileSync(full, 'utf8').match(SECRET);
      if (hit) {
        console.error(`\nREFUSING TO SHIP: credential-shaped string in ${full}\n  ${hit[0].slice(0, 12)}…\n`);
        process.exit(1);
      }
    }
  }
}
walk(resolve(root, 'dist'));

const index = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
if (!index.includes('/murshidi-app/assets/')) {
  console.error('\nREFUSING TO SHIP: base path /murshidi-app/ not applied to dist/index.html\n');
  process.exit(1);
}

console.log('\n✓ dist/ built for GitHub Pages — base applied, no key in the bundle');
