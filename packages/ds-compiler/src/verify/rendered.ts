import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DsConfig } from '../config.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import type { StepStatus } from './index.js';

const AT: SourceLocation = { file: 'ds.config.json', line: 1, column: 1 };
/** Lines of combined output kept in the DS-E087 message. */
const TAIL_LINES = 60;
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Runs the configured rendered-parity command (a Vitest browser run over the
 * generated compare stories) in its configured directory. Its output is
 * captured; on failure the last lines travel in the diagnostic so a CI log
 * shows the differing properties next to the code.
 */
export function runRendered(
  rootDir: string,
  config: DsConfig,
  diag: Diagnostics,
): StepStatus {
  if (!config.rendered) {
    diag.add(
      'DS-W005',
      'rendered: no `rendered` entry in ds.config.json; the browser comparison did not run',
      AT,
    );
    return 'skipped';
  }
  const cwd = resolve(rootDir, config.rendered.cwd);
  if (!existsSync(cwd)) {
    diag.add(
      'DS-E087',
      `rendered: cwd "${config.rendered.cwd}" (${cwd}) does not exist`,
      AT,
    );
    return 'fail';
  }
  if (!statSync(cwd).isDirectory()) {
    diag.add(
      'DS-E087',
      `rendered: cwd "${config.rendered.cwd}" (${cwd}) is not a directory`,
      AT,
    );
    return 'fail';
  }
  const timeoutMs = config.rendered.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const result = spawnSync(config.rendered.command, {
    cwd,
    shell: true,
    encoding: 'utf8',
    timeout: timeoutMs,
    env: { ...process.env, CI: process.env.CI ?? '1', FORCE_COLOR: '0' },
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status === 0) {
    return 'pass';
  }
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
    .split('\n')
    .filter((line) => line.trim() !== '')
    .slice(-TAIL_LINES)
    .join('\n');
  const errorCode = (result.error as NodeJS.ErrnoException | undefined)?.code;
  const why =
    errorCode === 'ETIMEDOUT'
      ? `timed out after ${timeoutMs / 60000} minutes`
      : result.error !== undefined
        ? `could not run: ${result.error.message}`
        : result.signal
          ? `was killed by ${result.signal}`
          : `exited with ${result.status}`;
  diag.add(
    'DS-E087',
    `rendered: "${config.rendered.command}" in ${config.rendered.cwd} ${why}\n${output}`,
    AT,
  );
  return 'fail';
}
