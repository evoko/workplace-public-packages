#!/usr/bin/env node
// Generates spec/ from docs/, then emits every target. Reads docs/, never writes it.
//
// Each stage builds its spec in memory first and only then writes. Every stage is built before
// any is emitted, so a throw from one normalizer stops the run before half the targets have been
// rewritten.
import { execSync } from 'node:child_process';
import { join, relative } from 'node:path';
import * as tokens from '../src/stages/tokens.mjs';
import * as icons from '../src/stages/icons.mjs';
import * as components from '../src/stages/components.mjs';
import { writeDeviationsReport } from '../src/report/deviations.mjs';
import { packagesDir, repoRoot } from '../src/util/paths.mjs';
import { staleShells } from '../src/shells/index.mjs';
import {
  pruneGenerated,
  removeGenerated,
  wasWritten,
} from '../src/util/write.mjs';

const STAGES = [tokens, icons, components];

// The directories the generator owns outright. After every stage has written, anything left in
// them that this run did not write is stale -- an icon removed in Figma, an output a stage no
// longer produces -- and is deleted rather than left committed and silently regenerating.
// spec/ itself is not listed, because spec/overlay/ holds hand-written files beside the generated
// ones; spec/components/ is, because every file in it is generated.
const OWNED_DIRS = [
  components.componentsDir,
  components.verifyDir,
  join(packagesDir, 'styles', 'src', 'generated'),
  join(packagesDir, 'assets', 'src', 'generated'),
  join(packagesDir, 'solar_flutter', 'lib', 'src', 'generated'),
];

const built = STAGES.map((stage) => stage.build());
const results = STAGES.map((stage, i) => ({
  name: stage.name,
  ...stage.emit(built[i]),
}));

// One report for every source. Icon deviations are as much a governance question as token ones,
// and spec/deviations.md is the only place a human reads them. The label is the Foundations
// export; the other sources record their own versions in their spec files.
writeDeviationsReport(
  results.flatMap((r) => r.deviations),
  built[0].contract.generatedFrom?.exportedOn ?? 'unknown',
);

const pruned = OWNED_DIRS.flatMap((dir) => pruneGenerated(dir));
// The shells share their directories with hand-written files (the package entry, `internal/`, an
// owned shell), so a stale one is told by its generated header instead.
for (const path of staleShells(wasWritten)) {
  removeGenerated(path);
  pruned.push(relative(repoRoot, path));
}
for (const path of pruned) console.log(`removed stale ${path}`);

// The generated files are checked in and are linted and format-checked like hand-written
// ones, so the generator formats them itself rather than the repo ignoring them.
//
// The assets glob names ts, tsx and json and deliberately does not match .svg: Prettier has no
// SVG parser, and while it silently skips an .svg file found by expanding a directory, a glob
// that matches one is an explicit request and fails with "No parser could be inferred". The
// generated SVG files are written already formatted and need no pass.
// The React shells and stories are named one by one, not globbed: they sit beside hand-written
// files (an owned shell), which the generator must not rewrite.
const shells = built[STAGES.indexOf(components)].shells
  .map((s) => s.path)
  .filter((path) => path.endsWith('.tsx'))
  .map((path) => JSON.stringify(relative(repoRoot, path)));
execSync(
  `npx prettier --write "spec/**/*.{json,md}" "packages/styles/src/generated/**/*.{ts,css,json}" "packages/assets/src/generated/**/*.{ts,tsx,json}" ${shells.join(' ')}`,
  { cwd: repoRoot, stdio: 'ignore' },
);
try {
  execSync('dart format lib', {
    cwd: join(packagesDir, 'solar_flutter'),
    stdio: 'ignore',
  });
} catch {
  // Not a warning to skim past: the emitter writes unformatted Dart and the committed file is
  // formatted, so without the SDK the Dart output is left differing from what is checked in by
  // hundreds of lines. Exiting non-zero says so plainly rather than leaving a diff to puzzle over.
  console.error(
    'dart format FAILED: the Dart SDK is not on PATH, so the generated Dart under\n' +
      'packages/solar_flutter/lib/src/generated is unformatted and will not match the committed\n' +
      'files. Install Flutter, or restore those files and regenerate once the SDK is available.\n' +
      'Everything else was written normally.',
  );
  process.exitCode = 1;
}

const tally = (counts) =>
  Object.entries(counts)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');
const deviationCount = results.reduce((n, r) => n + r.deviations.length, 0);
console.log(
  `codegen: ${results.map((r) => `${r.name}: ${tally(r.counts)}`).join('; ')}; ` +
    `${deviationCount} deviations`,
);
