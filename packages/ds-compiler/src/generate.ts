import {
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { buildIR } from './build.js';
import type { DsConfig } from './config.js';
import type { Diagnostics } from './errors.js';
import type { DesignIR } from './ir/types.js';
import { getTarget, targetIds } from './targets/index.js';
import { listOutputFiles } from './targets/output.js';
import {
  pluginContext,
  type PluginOutput,
  type TargetPlugin,
} from './targets/plugin.js';
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

export interface GenerateOptions {
  /** A catalog captured from another framework version is a warning, not an error. */
  allowCatalogMismatch?: boolean;
}

/**
 * Runs every plugin's `loadCatalog` (when it has one) and `generate` once.
 * A plugin that reports errors while loading its catalog or generating is
 * left out of the result, so callers never write or compare its output.
 */
export function generateOutputs(
  rootDir: string,
  ir: DesignIR,
  config: DsConfig,
  plugins: readonly TargetPlugin[],
  compilerVersion: string,
  diag: Diagnostics,
  options: GenerateOptions = {},
): PluginOutput[] {
  const outputs: PluginOutput[] = [];
  for (const plugin of plugins) {
    if (plugin.auxiliary && !config.targets[plugin.id]) {
      continue;
    }
    const ctx = pluginContext(
      rootDir,
      config,
      compilerVersion,
      plugin.id,
      options,
    );
    const before = diag.errors.length;
    const catalog = plugin.loadCatalog ? plugin.loadCatalog(ctx, diag) : null;
    if (diag.errors.length > before) {
      continue;
    }
    const files = plugin.generate(ir, catalog, ctx, diag);
    if (diag.errors.length === before) {
      outputs.push({ plugin, ctx, catalog, files });
    }
  }
  return outputs;
}

/**
 * Builds the IR and writes every requested target's files into its outDir.
 * Nothing is written when the IR has errors, when a catalog fails to load,
 * or when any plugin reports a generation error. The outDir is owned by the
 * generator: every file it did not produce there, at any depth and including
 * dotfiles, is deleted, and any subdirectory left empty by that cleanup is
 * removed too (never the outDir itself), so the directory always equals a
 * fresh generation.
 *
 * When `ids` is omitted, every registered target runs and an auxiliary
 * target with no `ds.config.json` entry is silently skipped (so a repo that
 * has not configured it yet, such as `stories`, stays quiet). When `ids` is
 * given explicitly (including by the CLI's `--target`) and it names such a
 * target, that is almost certainly a mistake worth surfacing, so it is
 * reported as `DS-W006` (a warning: the run still exits 0).
 */
export function generate(
  rootDir: string,
  ids?: readonly string[],
  options: GenerateOptions = {},
): GenerateResult {
  const explicit = ids !== undefined;
  const plugins = resolvePlugins([...new Set(ids ?? targetIds())]);
  const result = buildIR(rootDir);
  if (!result.ir || !result.config) {
    return {
      ir: null,
      diagnostics: result.diagnostics,
      written: [],
      removed: [],
    };
  }
  const diag = result.diagnostics;
  if (explicit) {
    for (const plugin of plugins) {
      if (plugin.auxiliary && !result.config.targets[plugin.id]) {
        diag.add(
          'DS-W006',
          `targets.${plugin.id} is not configured in ds.config.json; the auxiliary target "${plugin.id}" was skipped`,
          { file: 'ds.config.json', line: 1, column: 1 },
        );
      }
    }
  }
  const outputs = generateOutputs(
    rootDir,
    result.ir,
    result.config,
    plugins,
    COMPILER_VERSION,
    diag,
    options,
  );
  if (diag.hasErrors()) {
    // A plugin reported a generation error: write nothing for any target,
    // so a failed run never leaves a half-updated set of packages.
    return { ir: result.ir, diagnostics: diag, written: [], removed: [] };
  }
  const written: string[] = [];
  const removed: string[] = [];
  for (const { ctx, files } of outputs) {
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
  return { ir: result.ir, diagnostics: diag, written, removed };
}
