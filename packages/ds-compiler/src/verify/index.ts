import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { buildIR } from '../build.js';
import { checkEntryCss } from '../entry.js';
import { configFailed, type Diagnostics } from '../errors.js';
import { generateOutputs, type GenerateOptions } from '../generate.js';
import { TARGETS, targetIds } from '../targets/index.js';
import { COMPILER_VERSION } from '../version.js';
import {
  computeCoverage,
  renderCoverageMarkdown,
  type CoverageReport,
} from './coverage.js';
import { checkDrift } from './drift.js';
import { diffIR } from './ir-diff.js';
import { runRendered } from './rendered.js';

export type StepStatus = 'pass' | 'fail' | 'skipped';
export type VerifyStep =
  | 'lint'
  | 'drift'
  | 'roundtrip'
  | 'coverage'
  | 'rendered';

export interface VerifyOptions extends GenerateOptions {
  /** Run the configured rendered-parity command after the Node steps pass. */
  rendered?: boolean;
}

export interface VerifyResult {
  diagnostics: Diagnostics;
  steps: Record<VerifyStep, StepStatus>;
  coverage: CoverageReport | null;
  /** Absolute path of the written coverage report, or null when lint failed. */
  coverageFile: string | null;
}

/**
 * lint (build, then checkEntryCss), then drift, round-trip, and coverage for
 * every registered target. `lint` fails whenever any error is present, even
 * when an IR was produced (for example a stale src/index.css): the other
 * steps only make sense once the source is clean, so they are skipped and no
 * coverage file is written. Later steps run even when an earlier one (drift,
 * round-trip) fails, except that nothing runs without a passing lint. A
 * plugin whose generation reports errors fails the drift step and is skipped
 * by round-trip; coverage still runs for every plugin. With `rendered`, the
 * configured browser comparison runs last, only when drift, round-trip, and
 * coverage passed; it is `skipped` otherwise, and `skipped` with `DS-W005`
 * when `ds.config.json` has no `rendered` entry.
 */
export function verify(
  rootDir: string,
  options: VerifyOptions = {},
): VerifyResult {
  const steps: Record<VerifyStep, StepStatus> = {
    lint: 'skipped',
    drift: 'skipped',
    roundtrip: 'skipped',
    coverage: 'skipped',
    rendered: 'skipped',
  };
  const result = buildIR(rootDir);
  const diag = result.diagnostics;
  if (!configFailed(diag)) {
    checkEntryCss(rootDir, diag);
  }
  steps.lint = diag.errors.length > 0 ? 'fail' : 'pass';
  if (steps.lint === 'fail' || !result.ir || !result.config) {
    steps.lint = 'fail';
    return { diagnostics: diag, steps, coverage: null, coverageFile: null };
  }
  const ir = result.ir;
  const config = result.config;
  const plugins = targetIds().map((id) => TARGETS[id]);

  const failsSince = (count: number): StepStatus =>
    diag.errors.length > count ? 'fail' : 'pass';

  const beforeDrift = diag.errors.length;
  const outputs = generateOutputs(
    rootDir,
    ir,
    config,
    plugins,
    COMPILER_VERSION,
    diag,
    options,
  );
  checkDrift(rootDir, ir, outputs, diag);
  steps.drift = failsSince(beforeDrift);

  const beforeRoundtrip = diag.errors.length;
  for (const { plugin, ctx, catalog, files } of outputs) {
    if (plugin.auxiliary) {
      continue;
    }
    const reparsed = plugin.reparse(files, ir, catalog, ctx, diag);
    if (!reparsed) {
      continue;
    }
    const scope = {
      components: Object.keys(ir.components).filter((n) =>
        plugin.isMapped(ir.components[n]),
      ),
      ignored: (name: string) => plugin.ignoredProperties(ir.components[name]),
    };
    for (const d of diffIR(ir, reparsed, scope)) {
      diag.add(
        'DS-E081',
        `${plugin.id}: ${d.kind} ${d.id}: ${d.message}`,
        d.location,
      );
    }
  }
  steps.roundtrip = failsSince(beforeRoundtrip);

  const beforeCoverage = diag.errors.length;
  const coverage = computeCoverage(ir, plugins);
  for (const entry of coverage.entries) {
    const manifest = `src/components/${entry.component}/${entry.component}.manifest.json`;
    if (entry.status === 'unmapped') {
      diag.add(
        'DS-E082',
        `${entry.component} has no targets.${entry.target} entry in its manifest`,
        { file: manifest, line: 1, column: 1 },
      );
    } else if (entry.unsupported && entry.unsupported.length > 0) {
      diag.add(
        'DS-E083',
        `${entry.component}: ${entry.target} has no handler for ${entry.unsupported.join(', ')}`,
        { file: manifest, line: 1, column: 1 },
      );
    }
  }
  steps.coverage = failsSince(beforeCoverage);

  const coverageFile = resolve(rootDir, config.coverageFile);
  mkdirSync(dirname(coverageFile), { recursive: true });
  writeFileSync(
    coverageFile,
    renderCoverageMarkdown(coverage, ir, COMPILER_VERSION),
  );

  if (options.rendered) {
    const nodeStepsPassed =
      steps.drift === 'pass' &&
      steps.roundtrip === 'pass' &&
      steps.coverage === 'pass';
    steps.rendered = nodeStepsPassed
      ? runRendered(rootDir, config, diag)
      : 'skipped';
  }

  return { diagnostics: diag, steps, coverage, coverageFile };
}
