#!/usr/bin/env node
// Installs the published packages as an app receives them, and uses them.
//
// packages/codegen/test/packaging.test.mjs checks each package.json; nothing else installs what
// `npm pack` produces. A file missing from `files`, an export pointing at a path the build does not
// write, or a module that touches `window` as it loads all pass those checks and fail in the first
// app. So: pack @bwp-web/styles, @bwp-web/assets and @bwp-web/components (built first, `npm run
// build`), install the three tarballs into a fresh app beside the lowest React they support (18)
// and MUI 9, resolve every public entry, and render a few components on the server.
//
//   npm run build && node scripts/smoke-install.mjs [--keep]
//
// --keep leaves the temporary app in place and prints where it is. Needs the npm registry, for
// React, MUI and the fonts.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PACKAGES = ['styles', 'assets', 'components'];
// What the app does: resolve every public entry, then load and render.
const SMOKE = `
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const require = createRequire(import.meta.url);
const fail = (why) => { console.error('smoke-install: ' + why); process.exit(1); };

// Every export of every package resolves to a file that is there.
for (const pkg of ['@bwp-web/styles', '@bwp-web/assets', '@bwp-web/components']) {
  const dir = new URL('node_modules/' + pkg + '/', import.meta.url).pathname;
  const manifest = JSON.parse(readFileSync(dir + 'package.json', 'utf8'));
  const targets = (e) => typeof e === 'string' ? [e] : Object.values(e ?? {}).flatMap(targets);
  for (const [entry, target] of Object.entries(manifest.exports ?? {}))
    for (const file of targets(target)) {
      const path = dir + file.replace(/^\\.\\//, '').replace('*', '');
      if (!file.includes('*') && !existsSync(path)) fail(pkg + ' exports ' + entry + ' as ' + file + ', which the package does not have');
      if (file.includes('*') && !existsSync(path)) fail(pkg + ' exports ' + entry + ' from ' + file + ', a directory the package does not have');
    }
}
for (const css of ['@bwp-web/styles/tokens.css', '@bwp-web/styles/fonts.css', '@bwp-web/styles/tailwind.css'])
  if (!readFileSync(require.resolve(css), 'utf8').includes('--solar-') && !css.endsWith('fonts.css'))
    fail(css + ' holds no SOLAR variables');

// Next.js's App Router renders every layout and page as a server component. A module that calls
// MUI's styled() or a hook as it loads must declare itself a client module, or importing it from
// one fails the app's build ("Attempted to call ... styled ... from the server").
for (const file of ['@bwp-web/components/dist/index.js', '@bwp-web/components/dist/index.cjs']) {
  const path = new URL('node_modules/' + file, import.meta.url).pathname;
  if (!/^['"]use client['"]/.test(readFileSync(path, 'utf8').trimStart()))
    fail(file + ' does not begin with "use client", so a Next.js server component cannot import it');
}

// Loaded as an app loads them, and rendered on the server.
const styles = await import('@bwp-web/styles/mui');
const assets = await import('@bwp-web/assets');
const { Button, TextInput, SolarProvider } = await import('@bwp-web/components');
if (typeof styles.createSolarThemeOptions !== 'function') fail('@bwp-web/styles/mui has no createSolarThemeOptions');
const icon = assets.IconArrowRight;
if (!icon) fail('@bwp-web/assets has no IconArrowRight');
const html = renderToString(
  h(SolarProvider, null,
    h(Button, { iconTrailing: h(icon) }, 'Continue'),
    h(TextInput, { label: 'Name', placeholder: 'Your name' }),
  ),
);
for (const words of ['Continue', 'Name', '<svg']) if (!html.includes(words)) fail('the server render lacks ' + words);
console.log('smoke-install: every export resolves; Button, Text Input and an icon render on the server');
`;

const keep = process.argv.includes('--keep');
const app = mkdtempSync(join(tmpdir(), 'solar-smoke-'));
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] })
    .toString()
    .trim();

try {
  // The tarballs, as `npm publish` would upload them.
  const tarballs = PACKAGES.map((pkg) => {
    const name = run(
      'npm',
      ['pack', '--pack-destination', app, '--silent'],
      join(root, 'packages', pkg),
    )
      .split('\n')
      .pop();
    return `./${name}`;
  });

  // The app: the lowest React the packages declare, MUI 9 and its Emotion peers.
  writeFileSync(
    join(app, 'package.json'),
    `${JSON.stringify({ name: 'solar-smoke', private: true, type: 'module' }, null, 2)}\n`,
  );
  run(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      ...tarballs,
      'react@18',
      'react-dom@18',
      '@mui/material@9',
      '@emotion/react@11',
      '@emotion/styled@11',
    ],
    app,
  );

  writeFileSync(join(app, 'smoke.mjs'), SMOKE);
  process.stdout.write(run('node', ['smoke.mjs'], app) + '\n');
  const react = JSON.parse(
    readFileSync(join(app, 'node_modules/react/package.json'), 'utf8'),
  ).version;
  console.log(`smoke-install: ok, the packed packages under React ${react}`);
} finally {
  if (keep) console.log(`kept ${app}`);
  else rmSync(app, { recursive: true, force: true });
}
