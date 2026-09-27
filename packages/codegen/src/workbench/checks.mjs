/**
 * A component's own checks, behind the workbench's Keep and Approve: its web visual check (one
 * component, `SOLAR_VISUAL_ONLY`, in packages/components/test/visual/components.spec.mjs), its
 * Flutter visual check (`--name`, in packages/solar_flutter/test/visual/components_visual_test.dart)
 * and the parity suite; and the failures the visual checks' reports hold, Light and Dark.
 *
 * A component a chart library draws has no visual check of its own: the chart theme's test
 * (test/charts.test.mjs) stands for it, run with the parity suite.
 */

import { join } from 'node:path';
import { reportFiles } from '../explain/index.mjs';
import { library } from '../stages/components.mjs';
import { packagesDir } from '../util/paths.mjs';

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Each check in words, for a failure that is only what its command printed. */
const TITLES = {
  web: 'The web visual check',
  flutter: 'The Flutter visual check',
  parity: 'The parity suite',
};

/**
 * Each visual check's report stems for a component, Light then Dark: the check writes
 * `<stem>-failures.json` and `<stem>-gaps.json`. The web's Dark is `<slug>-dark` (components.spec.mjs),
 * Flutter's `<snake>_dark` (components_visual_test.dart).
 */
export function stemsOf(component) {
  const { web, flutter } = reportFiles(component);
  return { web: [web, `${web}-dark`], flutter: [flutter, `${flutter}_dark`] };
}

/**
 * The commands, in the order they run: `{ platform, cmd, args, cwd, env, stems }`, `stems` the
 * reports the command writes (none for the parity suite).
 */
export function checkCommands(component) {
  const stems = stemsOf(component);
  const visual = library(component)
    ? []
    : [
        {
          platform: 'web',
          cmd: 'npx',
          args: [
            'playwright',
            'test',
            'components.spec.mjs',
            '-g',
            'in every variant',
          ],
          cwd: join(packagesDir, 'components'),
          env: { SOLAR_VISUAL_ONLY: component },
          stems: stems.web,
        },
        {
          platform: 'flutter',
          cmd: 'flutter',
          // Light and Dark: the tests are named `<Component> draws what Figma draws[ in Dark], in
          // every variant`, in no group.
          args: [
            'test',
            'test/visual/components_visual_test.dart',
            '--name',
            `^${escape(component)} draws what Figma draws`,
          ],
          cwd: join(packagesDir, 'solar_flutter'),
          env: {},
          stems: stems.flutter,
        },
      ];
  return [
    ...visual,
    {
      platform: 'parity',
      cmd: 'npx',
      args: [
        'vitest',
        'run',
        'test/component-parity.test.mjs',
        ...(library(component) ? ['test/charts.test.mjs'] : []),
      ],
      cwd: join(packagesDir, 'codegen'),
      env: {},
      stems: [],
    },
  ];
}

/**
 * The failures one platform's reports hold, as the HTTP contract's `Failure`: the web writes what
 * it drew as `rendered`, Flutter as `painted`; a Dark report's variant is marked `(Dark)`. A report
 * that is absent holds none; one that cannot be read is a failure that says so.
 * @param {string} platform
 * @param {string[]} stems Light's stem, then Dark's
 * @param {(path: string) => string | null} read
 */
export function failuresOf(platform, stems, read) {
  const out = [];
  stems.forEach((stem, i) => {
    const file = `${stem}-failures.json`;
    const text = read(file);
    if (text === null) return;
    let reported;
    try {
      reported = JSON.parse(text);
      if (!Array.isArray(reported)) throw new Error('not a list');
    } catch (error) {
      out.push({
        platform,
        message: `${file} is unreadable: ${error.message}`,
      });
      return;
    }
    for (const f of reported)
      out.push({
        platform,
        variant: i === 1 ? `${f.variant} (Dark)` : f.variant,
        layer: f.layer,
        property: f.property,
        figma: f.figma,
        drawn: 'rendered' in f ? f.rendered : f.painted,
      });
  });
  return out;
}

/** The most failing checks one answer carries: a Keep's, an Approve's, and a note's. */
export const MAX_FAILURES = 200;

/**
 * `failures`, at most MAX_FAILURES of them: past that, the first MAX_FAILURES - 1 and a last that
 * counts the rest (on the platform most of them are on) and names the command that shows them all.
 * One knock-on fails every variant, which is hundreds.
 * @param {object[]} failures
 * @param {string} component its name in code
 */
export function capFailures(failures, component) {
  if (failures.length <= MAX_FAILURES) return failures;
  const kept = failures.slice(0, MAX_FAILURES - 1);
  const rest = failures.slice(MAX_FAILURES - 1);
  const counts = new Map();
  for (const f of rest)
    counts.set(f.platform, (counts.get(f.platform) ?? 0) + 1);
  const [platform] = [...counts].reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ['parity', 0],
  );
  return [
    ...kept,
    {
      platform,
      message: `…and ${rest.length} more failing checks: run npm run solar:explain -- "${component}" for all`,
    },
  ];
}

/** Where a test runner's output says what failed. */
const FAILED = /Error:|Expected|FAIL|✘|failed/;

/**
 * What a command printed, without colour, cut to what says what failed: from the first line that
 * does (at most 40 lines), else its last 12.
 */
export function excerpt(output) {
  const lines = String(output)
    // eslint-disable-next-line no-control-regex
    .replace(/\x1b\[[0-9;]*m/g, '')
    .trimEnd()
    .split('\n');
  const first = lines.findIndex((l) => FAILED.test(l));
  return (first < 0 ? lines.slice(-12) : lines.slice(first, first + 40)).join(
    '\n',
  );
}

/**
 * Runs a component's checks one after another (they share build directories: workflows.md,
 * Pitfalls), and answers whether all passed, with their failures. Each visual check's reports are
 * removed before it runs, so a report is always this run's: a check that stops before it writes
 * one is reported by what it printed, never by an earlier run's report.
 * @param {string} component its name in code
 * @param {{ run: (cmd: string, args: string[], opts: {cwd: string, env: object}) =>
 *   Promise<{ok: boolean, output: string}>, read: (path: string) => string | null,
 *   remove: (path: string) => void }} deps `run` resolves, never rejects: a command that cannot
 *   start is `{ ok: false, output: <why> }`
 * @returns {Promise<{ok: boolean, failures: object[]}>}
 */
export async function runChecks(component, { run, read, remove }) {
  const failures = [];
  let ok = true;
  for (const c of checkCommands(component)) {
    for (const stem of c.stems) {
      remove(`${stem}-failures.json`);
      remove(`${stem}-gaps.json`);
    }
    const result = await run(c.cmd, c.args, { cwd: c.cwd, env: c.env });
    const reported = failuresOf(c.platform, c.stems, read);
    failures.push(...reported);
    const missing = c.stems.filter((s) => read(`${s}-failures.json`) === null);
    if (!result.ok) {
      ok = false;
      // What it printed, where its reports do not hold every failure: it reported nothing (the
      // parity suite), or it stopped before one of its reports (Light failed, Dark crashed).
      if (!reported.length || missing.length)
        failures.push({
          platform: c.platform,
          message: `${TITLES[c.platform]} failed (${[c.cmd, ...c.args].join(' ')}):\n${excerpt(result.output)}`,
        });
    } else if (reported.length) ok = false;
    else if (missing.length) {
      ok = false;
      failures.push({
        platform: c.platform,
        message: `${TITLES[c.platform]} passed but wrote no report (${missing.map((s) => `${s}-failures.json`).join(', ')}): it measured nothing of ${component}`,
      });
    }
  }
  return { ok, failures: capFailures(failures, component) };
}
