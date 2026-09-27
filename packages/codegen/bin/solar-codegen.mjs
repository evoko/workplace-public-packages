#!/usr/bin/env node
// Generates spec/ from docs/, then emits every target. Reads docs/, never writes it.
//
// Each stage builds its spec in memory first and only then emits. Every stage is built before
// any is emitted, and every write is held until all of them have emitted and the report is
// written, so a throw from a normalizer or an emitter (Button's recipe refusing a literal, after
// the stories were rendered) stops the run with nothing on disk rewritten.
//
// --pending   the workbench's preview; lets TODO(reason) through
//
// First, before anything else loads: the Node this needs (.nvmrc).
import '../src/util/require-node.mjs';
import { join, relative, sep } from 'node:path';
import * as tokens from '../src/stages/tokens.mjs';
import * as icons from '../src/stages/icons.mjs';
import * as components from '../src/stages/components.mjs';
import { allowPlaceholders } from '../src/normalize/overlay.mjs';
import { writeDeviationsReport } from '../src/report/deviations.mjs';
import { packagesDir, repoRoot } from '../src/util/paths.mjs';
import { staleShells } from '../src/shells/index.mjs';
import { WIDGETBOOK_FILES } from '../src/emit/playground.mjs';
import {
  formatDart,
  formatWithPrettier,
  isMissingSdk,
} from '../src/util/format.mjs';
import {
  commitGenerated,
  deferWrites,
  pruneGenerated,
  removeGenerated,
  wasWritten,
} from '../src/util/write.mjs';

// The workbench's preview of a pending edit, whose reason a person has not written yet
// (scripts/workbench.mjs). Nothing else passes it: a plain run refuses the placeholder.
if (process.argv.includes('--pending')) allowPlaceholders(true);

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

deferWrites();
const built = STAGES.map((stage) => stage.build());
// Each stage's emit also sees every stage's build, by name, where it needs another's in-memory
// spec (the component stage, the icon spec's names for the Playground controls).
const builds = Object.fromEntries(
  STAGES.map((stage, i) => [stage.name, built[i]]),
);
const results = STAGES.map((stage, i) => ({
  name: stage.name,
  ...stage.emit(built[i], builds),
}));

// One report for every source. Icon deviations are as much a governance question as token ones,
// and spec/deviations.md is the only place a human reads them. The label is the Foundations
// export; the other sources record their own versions in their spec files.
writeDeviationsReport(
  results.flatMap((r) => r.deviations),
  built[0].contract.generatedFrom?.exportedOn ?? 'unknown',
);

// The generated files are checked in and are linted and format-checked like hand-written
// ones, so the generator formats them itself rather than the repo ignoring them. It formats them
// in memory, before anything is written, so that a file whose formatted text is what is already
// on disk is not rewritten: a run after a one-component edit touches that component's files, not
// every output (Storybook's dev server re-indexes once per changed story).
//
// Prettier formats what the CLI pass once named: spec/**/*.{json,md}, the generated styles
// (ts, css, json) and assets (ts, tsx, json), the MUI theme and the stories. Not .svg: Prettier
// has no SVG parser, and the generated SVG files are written already formatted. The stories and
// the Widgetbook's generated Dart files are the generator's own outputs, named one by one: they
// sit beside hand-written files, which the generator must not rewrite.
const stories = new Set(
  built[STAGES.indexOf(components)].stories
    .map((s) => s.path)
    .filter((path) => path.endsWith('.tsx')),
);
const underPrettier = (path) => {
  const rel = relative(repoRoot, path).split(sep).join('/');
  const ext = rel.slice(rel.lastIndexOf('.') + 1);
  const under = (dir, exts) => rel.startsWith(`${dir}/`) && exts.includes(ext);
  return (
    under('spec', ['json', 'md']) ||
    under('packages/styles/src/generated', ['ts', 'css', 'json']) ||
    under('packages/assets/src/generated', ['ts', 'tsx', 'json']) ||
    rel === 'packages/components/src/solar-theme.generated.ts' ||
    stories.has(path)
  );
};
const flutterLib = join(packagesDir, 'solar_flutter', 'lib') + sep;
const underDart = (path) =>
  path.startsWith(flutterLib) || WIDGETBOOK_FILES.includes(path);

let dartFailed = false;
const written = await commitGenerated(async (held) => {
  const formatted = new Map();
  for (const [path, text] of held)
    if (underPrettier(path))
      formatted.set(path, await formatWithPrettier(path, text));
  const dart = new Map([...held].filter(([path]) => underDart(path)));
  try {
    for (const [path, text] of formatDart(dart)) formatted.set(path, text);
  } catch (error) {
    // Only a missing SDK: the Dart is written unformatted, as the emitter produced it, and
    // reported below. Anything else (a syntax error dart format refuses) stops the run with
    // nothing written.
    if (!isMissingSdk(error)) throw error;
    dartFailed = true;
  }
  return formatted;
});

const pruned = OWNED_DIRS.flatMap((dir) => pruneGenerated(dir));
// The stories share their directory with hand-written files (`solar.tsx`), and the barrels the
// shells', so a stale one is told by its generated header instead.
for (const path of staleShells(wasWritten)) {
  removeGenerated(path);
  pruned.push(relative(repoRoot, path));
}
for (const path of pruned) console.log(`removed stale ${path}`);

if (dartFailed) {
  // Not a warning to skim past: the emitter writes unformatted Dart and the committed file is
  // formatted, so without the SDK the Dart output is left differing from what is checked in by
  // hundreds of lines. Exiting non-zero says so plainly rather than leaving a diff to puzzle over.
  console.error(
    'dart format FAILED: the Dart SDK is not on PATH, so the generated Dart under\n' +
      'packages/solar_flutter/lib/src/generated and widgetbook/lib/playground is unformatted and\n' +
      'will not match the committed files. Install Flutter, or restore those files and regenerate\n' +
      'once the SDK is available.\n' +
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
    `${deviationCount} deviations; ${written.length} files written`,
);
