/**
 * Where each workspace package entry resolves for the tools that read the packages from their
 * sources rather than from dist/: the unit tests (`vitest.config.mjs`), the web visual check's
 * bundle (`packages/components/test/visual/build.mjs`) and Storybook
 * (`packages/components/.storybook/main.ts`). Each of them then runs on a fresh checkout with no
 * build first, and measures what is committed.
 *
 * One table, so the three cannot drift. An entry missing here resolves through the package's
 * `exports` to dist/, which a local build leaves behind and a CI runner does not have: the check
 * passes on the machine that wrote the import and fails in CI. `test/workspace-sources.test.mjs`
 * fails on any `@bwp-web/*` import of the components, their stories or their cases that the table
 * lacks.
 */

import { join } from 'node:path';
import { packagesDir } from './paths.mjs';

const src = (path) => join(packagesDir, path);

export const WORKSPACE_SOURCES = {
  '@bwp-web/assets': src('assets/src/index.ts'),
  '@bwp-web/styles': src('styles/src/index.ts'),
  '@bwp-web/styles/mui': src('styles/src/mui.ts'),
  '@bwp-web/styles/tokens.css': src('styles/src/generated/css/tokens.css'),
  '@bwp-web/styles/fonts.css': src('styles/src/fonts.css'),
};

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/**
 * The table as Vite's and Vitest's aliases. Exact matches: a string alias there also matches
 * subpaths, so `@bwp-web/styles` would catch `@bwp-web/styles/mui` wherever it came first.
 * (esbuild takes the table itself: it prefers an exact key over a prefix.)
 */
export const exactAliases = () =>
  Object.entries(WORKSPACE_SOURCES).map(([entry, replacement]) => ({
    find: new RegExp(`^${escape(entry)}$`),
    replacement,
  }));
