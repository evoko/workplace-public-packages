#!/usr/bin/env node
// One command for "Figma changed": fetch all three SOLAR files, rebuild every generated doc,
// rebuild the derived token files, and regenerate code.
//
// Every step runs, even after one reports a problem. Chaining these with `&&` looks tidier but
// is what left raw/ ahead of the generated docs: a fetcher that reports a finding has still
// written its data, so stopping there strands the repository in a state CI rejects, and skips
// the two files that had not been fetched yet. Failures are collected and reported at the end,
// where they are actionable, instead of silently truncating the run.
//
//   node scripts/solar-sync.mjs              fetch, then rebuild everything
//   node scripts/solar-sync.mjs --no-fetch   rebuild from the committed raw data, no Figma token
//   node scripts/solar-sync.mjs --fresh      ignore the version cache and re-fetch every page
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const noFetch = argv.includes('--no-fetch');
const fetchArgs = argv.filter((a) => a !== '--no-fetch');

/** `fetch` steps talk to Figma and need a token; the rest are pure functions of what is committed. */
const STEPS = [
  {
    name: 'fetch · Foundations',
    run: 'docs/solar/raw/fetch-rest.mjs',
    fetch: true,
  },
  {
    name: 'fetch · Web',
    run: 'docs/solar-web/raw/fetch-rest.mjs',
    fetch: true,
  },
  {
    name: 'fetch · Icons',
    run: 'docs/solar-icons/raw/fetch-rest.mjs',
    fetch: true,
  },
  { name: 'docs · Foundations', run: 'docs/solar/build-docs.mjs' },
  { name: 'docs · Web', run: 'docs/solar-web/build-docs.mjs' },
  { name: 'docs · Icons', run: 'docs/solar-icons/build-docs.mjs' },
  { name: 'tokens', run: 'docs/solar/tokens/build-derived.mjs' },
  { name: 'codegen', run: 'packages/codegen/bin/solar-codegen.mjs' },
];

const failures = [];
for (const step of STEPS) {
  if (step.fetch && noFetch) continue;
  console.log(`\n\u001b[1m── ${step.name}\u001b[0m`);
  const { status } = spawnSync(
    process.execPath,
    [step.run, ...(step.fetch ? fetchArgs : [])],
    { cwd: repoRoot, stdio: 'inherit' },
  );
  if (status !== 0) failures.push({ name: step.name, status });
}

console.log('');
if (failures.length === 0) {
  console.log(
    'solar:sync complete. Review the diff and commit the generated files.',
  );
} else {
  for (const f of failures)
    console.log(`\u001b[31m✗ ${f.name} exited ${f.status}\u001b[0m`);
  console.log(
    `\n${failures.length} step(s) reported a problem. Everything else still ran, so the tree is consistent;\n` +
      'read the output above, fix the cause, and re-run.',
  );
  process.exitCode = 1;
}
