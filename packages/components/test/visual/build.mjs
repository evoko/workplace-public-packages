/**
 * Playwright's global setup: bundles the pages under test into `.out/` with esbuild: the visual
 * checks' page (`index.html`), the Playground interaction check's (`playground.html`) and the
 * workbench bar's (`workbench.html`, and `workbench-scenario.html` for the shared scenarios), each
 * its own build, so none changes another's output. Workspace packages resolve to their sources, as
 * in the unit tests, so the check measures what is committed and needs no build first. The fonts
 * are bundled too, so the text is measured in Inter, not in a fallback that would change every line
 * height.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { playgroundData } from '../../../codegen/src/playground/controls.mjs';
import { WORKSPACE_SOURCES } from '../../../codegen/src/util/workspace-sources.mjs';

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
export const outDir = here('.out');

const TYPES = {
  html: 'text/html',
  js: 'text/javascript',
  css: 'text/css',
  woff2: 'font/woff2',
  woff: 'font/woff',
};

/**
 * Serves the built pages to a Playwright page at `http://solar.test/`: Chromium refuses module
 * scripts from file:// URLs.
 */
export const servePages = (page) =>
  page.route('http://solar.test/**', (route) => {
    const path = new URL(route.request().url()).pathname.slice(1);
    route.fulfill({
      body: readFileSync(`${outDir}/${path}`),
      contentType: TYPES[path.split('.').pop()] ?? 'application/octet-stream',
    });
  });

/** One page: its entry bundled to `<name>.js` and `.css`, and the HTML that loads them. */
async function page(entry, html, define = {}) {
  const name = entry.replace(/\.tsx$/, '');
  await build({
    entryPoints: [here(entry)],
    bundle: true,
    outdir: outDir,
    format: 'esm',
    jsx: 'automatic',
    loader: { '.woff2': 'file', '.woff': 'file' },
    // Every workspace entry the page imports, from its source (one table for every tool).
    alias: WORKSPACE_SOURCES,
    define: { 'process.env.NODE_ENV': '"production"', ...define },
    logLevel: 'warning',
  });
  writeFileSync(
    `${outDir}/${html}`,
    `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${name}.css"></head><body><div id="root"></div><script type="module" src="${name}.js"></script></body></html>\n`,
  );
}

export default async function setup() {
  await page('page.tsx', 'index.html');
  // The Playground controls, as Storybook's virtual:solar serves them (.storybook/main.ts).
  await page('playground-page.tsx', 'playground.html', {
    __PLAYGROUND__: JSON.stringify(playgroundData()),
  });
  // The workbench bar over a fake service (workbench.spec.mjs).
  await page('workbench-page.tsx', 'workbench.html');
  // The workbench bar over HTTP, for the shared scenarios (workbench-scenarios.spec.mjs).
  await page('workbench-scenario-page.tsx', 'workbench-scenario.html');
}
