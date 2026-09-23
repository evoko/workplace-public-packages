/**
 * Playwright's global setup: bundles the page under test into `.out/` with esbuild. Workspace
 * packages resolve to their sources, as in the unit tests, so the check measures what is committed
 * and needs no build first. The fonts are bundled too, so the text is measured in Inter, not in a
 * fallback that would change every line height.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const here = (path) => fileURLToPath(new URL(path, import.meta.url));
const styles = (path) => here(`../../../styles/src/${path}`);
export const outDir = here('.out');

export default async function setup() {
  await build({
    entryPoints: [here('page.tsx')],
    bundle: true,
    outdir: outDir,
    format: 'esm',
    jsx: 'automatic',
    loader: { '.woff2': 'file', '.woff': 'file' },
    alias: {
      '@bwp-web/styles/mui': styles('mui.ts'),
      '@bwp-web/styles/tokens.css': styles('generated/css/tokens.css'),
      '@bwp-web/styles/fonts.css': styles('fonts.css'),
    },
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'warning',
  });
  writeFileSync(
    `${outDir}/index.html`,
    `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="page.css"></head><body><div id="root"></div><script type="module" src="page.js"></script></body></html>\n`,
  );
}
