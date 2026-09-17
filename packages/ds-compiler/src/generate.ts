import {
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { buildIR } from './build.js';
import type { Diagnostics } from './errors.js';
import type { DesignIR } from './ir/types.js';
import { getTarget, targetIds } from './targets/index.js';
import { listOutputFiles } from './targets/output.js';
import { pluginContext, type TargetPlugin } from './targets/plugin.js';
import { COMPILER_VERSION } from './version.js';

export interface GenerateResult {
  ir: DesignIR | null;
  diagnostics: Diagnostics;
  /** Absolute paths written, in generation order. */
  written: string[];
  /** Absolute paths of files in an outDir that no generator produced and were deleted. */
  removed: string[];
}

export class UnknownTargetError extends Error {}

function resolvePlugins(ids: readonly string[]): TargetPlugin[] {
  return ids.map((id) => {
    const plugin = getTarget(id);
    if (!plugin) {
      throw new UnknownTargetError(
        `unknown target "${id}"; registered targets: ${targetIds().join(', ') || '(none)'}`,
      );
    }
    return plugin;
  });
}

/** Removes empty subdirectories under `dir`, bottom-up. Never removes `dir` itself. */
function removeEmptySubdirs(dir: string): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const sub = join(dir, entry.name);
    removeEmptySubdirs(sub);
    try {
      if (readdirSync(sub).length === 0) {
        rmdirSync(sub);
      }
    } catch {
      // Best-effort: leave it if it cannot be inspected or removed.
    }
  }
}

/**
 * Builds the IR and writes every requested target's files into its outDir.
 * Nothing is written when the IR has errors. The outDir is owned by the
 * generator: every file it did not produce there, at any depth and including
 * dotfiles, is deleted, and any subdirectory left empty by that cleanup is
 * removed too (never the outDir itself), so the directory always equals a
 * fresh generation.
 */
export function generate(
  rootDir: string,
  ids: readonly string[] = targetIds(),
): GenerateResult {
  const plugins = resolvePlugins([...new Set(ids)]);
  const result = buildIR(rootDir);
  if (!result.ir || !result.config) {
    return {
      ir: null,
      diagnostics: result.diagnostics,
      written: [],
      removed: [],
    };
  }
  const written: string[] = [];
  const removed: string[] = [];
  for (const plugin of plugins) {
    const ctx = pluginContext(
      rootDir,
      result.config,
      COMPILER_VERSION,
      plugin.id,
    );
    const files = plugin.generate(result.ir, null, ctx);
    mkdirSync(ctx.outDir, { recursive: true });
    const produced = new Set(files.map((f) => f.path));
    for (const file of files) {
      const abs = join(ctx.outDir, file.path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, file.contents);
      written.push(abs);
    }
    for (const rel of listOutputFiles(ctx.outDir)) {
      if (!produced.has(rel)) {
        const abs = join(ctx.outDir, rel);
        unlinkSync(abs);
        removed.push(abs);
      }
    }
    removeEmptySubdirs(ctx.outDir);
  }
  return { ir: result.ir, diagnostics: result.diagnostics, written, removed };
}
