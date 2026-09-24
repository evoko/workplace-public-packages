#!/usr/bin/env node
// Surveys every SOLAR Web component for planning, and prints it as markdown (or JSON).
//
//   npm run solar:triage                   the components under components/
//   npm run solar:triage -- --all          patterns and views too
//   npm run solar:triage -- --json         the rows as JSON
//
// Read-only: it writes nothing, and is never part of solar:codegen.
import { loadWebCatalog } from '../src/normalize/components.mjs';
import {
  loadDefaults,
  loadExcluded,
  loadOverlay,
} from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import { COMPONENTS } from '../src/stages/components.mjs';
import { renderTriage, triage } from '../src/report/triage.mjs';

const args = process.argv.slice(2);
const catalog = loadWebCatalog();
const excluded = loadExcluded();
const rows = triage(catalog, {
  excluded,
  names: tokenNames(loadContract()),
  done: new Set(COMPONENTS),
  defaults: loadDefaults(),
  overlayOf: loadOverlay,
  scope: args.includes('--all') ? '' : 'components/',
});
process.stdout.write(
  args.includes('--json')
    ? JSON.stringify(rows, null, 2) + '\n'
    : renderTriage(rows, { fileVersion: catalog.fileVersion, excluded }),
);
