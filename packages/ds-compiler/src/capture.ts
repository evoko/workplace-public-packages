import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { buildIR } from './build.js';
import type { Diagnostics } from './errors.js';
import { UnknownTargetError } from './generate.js';
import { getTarget, targetIds } from './targets/index.js';
import { pluginContext } from './targets/plugin.js';
import { COMPILER_VERSION } from './version.js';

export interface CaptureResult {
  diagnostics: Diagnostics;
  /** Absolute path of the written catalog, or null when nothing was written. */
  written: string | null;
}

/** The target exists but has no defaults catalog (it is not an opinionated framework). */
export class NoCatalogTargetError extends Error {}

/**
 * Builds the IR (lint must be clean), runs the target's `captureDefaults`,
 * and writes `<rootDir>/catalogs/<id>.json`. Nothing is written when any
 * error was reported. Throws `UnknownTargetError` for an unknown target id
 * and `NoCatalogTargetError` when the target has no defaults catalog.
 */
export async function captureDefaults(
  rootDir: string,
  id: string,
): Promise<CaptureResult> {
  const plugin = getTarget(id);
  if (!plugin) {
    throw new UnknownTargetError(
      `unknown target "${id}"; registered targets: ${targetIds().join(', ') || '(none)'}`,
    );
  }
  if (!plugin.captureDefaults) {
    throw new NoCatalogTargetError(
      `target "${id}" has no defaults catalog; only opinionated targets capture defaults`,
    );
  }
  const result = buildIR(rootDir);
  const diag = result.diagnostics;
  if (!result.ir || !result.config || diag.hasErrors()) {
    return { diagnostics: diag, written: null };
  }
  const ctx = pluginContext(rootDir, result.config, COMPILER_VERSION, id);
  const captured = await plugin.captureDefaults(result.ir, ctx, diag);
  if (!captured || diag.hasErrors()) {
    return { diagnostics: diag, written: null };
  }
  mkdirSync(dirname(captured.path), { recursive: true });
  writeFileSync(captured.path, captured.contents);
  return { diagnostics: diag, written: captured.path };
}
