import { resolve } from 'node:path';
import type { DsConfig } from '../config.js';
import type { Diagnostics } from '../errors.js';
import type { ComponentIR, DesignIR } from '../ir/types.js';

/** One output file. `path` is relative to the target's outDir, forward slashes. */
export interface GeneratedFile {
  path: string;
  contents: string;
}

export interface PluginContext {
  /** Absolute path of the source root (the directory holding ds.config.json). */
  rootDir: string;
  config: DsConfig;
  compilerVersion: string;
  /** Absolute path where this target's files are written. */
  outDir: string;
}

export type CoverageStatus = 'supported' | 'partial' | 'unmapped' | 'excluded';

export interface CoverageEntry {
  component: string;
  target: string;
  status: CoverageStatus;
  /** For `excluded`: the manifest's reason. */
  reason?: string;
  /** For `partial`: properties the manifest tells the target to ignore. */
  ignored?: string[];
  /** Properties used by the component that the target has no handler for and that are not ignored. */
  unsupported?: string[];
}

export interface TargetPlugin<Catalog = unknown> {
  id: string;
  /**
   * Pure function of its inputs; byte-identical output across machines.
   * Reports coded errors on `diag` (nothing is written when it does) rather
   * than throwing.
   */
  generate(
    ir: DesignIR,
    catalog: Catalog | null,
    ctx: PluginContext,
    diag: Diagnostics,
  ): GeneratedFile[];
  /** Parses generated output back into an IR for round-trip comparison. Reports problems on `diag` and returns null when it cannot produce an IR. */
  reparse(
    files: GeneratedFile[],
    ir: DesignIR,
    ctx: PluginContext,
    diag: Diagnostics,
  ): DesignIR | null;
  coverage(ir: DesignIR): CoverageEntry[];
  /** True when the manifest maps this component to the target (an entry exists and is not excluded). */
  isMapped(component: ComponentIR): boolean;
  /** Properties the manifest tells this target to ignore for the component. */
  ignoredProperties(component: ComponentIR): ReadonlySet<string>;
}

/** One plugin's generation result, produced by `generateOutputs`. */
export interface PluginOutput {
  plugin: TargetPlugin;
  ctx: PluginContext;
  files: GeneratedFile[];
}

/** Absolute output directory for a target: the config override or `../styles-<id>/src/generated`. */
export function outDirFor(
  rootDir: string,
  config: DsConfig,
  id: string,
): string {
  const configured = config.targets[id]?.outDir;
  return resolve(rootDir, configured ?? `../styles-${id}/src/generated`);
}

export function pluginContext(
  rootDir: string,
  config: DsConfig,
  compilerVersion: string,
  id: string,
): PluginContext {
  return {
    rootDir,
    config,
    compilerVersion,
    outDir: outDirFor(rootDir, config, id),
  };
}
