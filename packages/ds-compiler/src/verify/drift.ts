import { readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Diagnostics } from '../errors.js';
import { serializeIR } from '../ir/serialize.js';
import type { DesignIR } from '../ir/types.js';
import { IR_FILE } from '../paths.js';
import type { PluginOutput } from '../targets/plugin.js';
import { listOutputFiles } from '../targets/output.js';

/** A path that exists but is a directory, not a regular file. */
interface IsDirectory {
  isDirectory: true;
}

type ReadOutcome = string | null | IsDirectory;

function readIfPresent(path: string): ReadOutcome {
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      return null;
    }
    if (code === 'EISDIR') {
      return { isDirectory: true };
    }
    throw err;
  }
}

function posixRelative(from: string, to: string): string {
  return relative(from, to).split(sep).join('/');
}

/**
 * DS-E080 for a missing or stale design.ir.json, and for every target file
 * that is missing, differs from a fresh generation, or exists in an outDir
 * without being produced by the generator.
 */
export function checkDrift(
  rootDir: string,
  ir: DesignIR,
  outputs: readonly PluginOutput[],
  diag: Diagnostics,
): void {
  const at = (file: string) => ({ file, line: 1, column: 1 });
  const actualIr = readIfPresent(join(rootDir, IR_FILE));
  if (actualIr === null) {
    diag.add('DS-E080', `${IR_FILE} is missing; run bwp-ds build`, at(IR_FILE));
  } else if (typeof actualIr === 'object') {
    diag.add(
      'DS-E080',
      `${IR_FILE} is not a file; delete it and run bwp-ds build`,
      at(IR_FILE),
    );
  } else if (actualIr !== serializeIR(ir)) {
    diag.add(
      'DS-E080',
      `${IR_FILE} differs from a fresh build; run bwp-ds build`,
      at(IR_FILE),
    );
  }
  for (const { plugin, ctx, files } of outputs) {
    const rel = (p: string): string =>
      posixRelative(rootDir, join(ctx.outDir, p));
    const produced = new Set<string>();
    for (const file of files) {
      produced.add(file.path);
      const actual = readIfPresent(join(ctx.outDir, file.path));
      if (actual === null) {
        diag.add(
          'DS-E080',
          `${rel(file.path)} is missing; run bwp-ds generate --target ${plugin.id}`,
          at(rel(file.path)),
        );
      } else if (typeof actual === 'object') {
        diag.add(
          'DS-E080',
          `${rel(file.path)} is not a file; delete it and run bwp-ds generate --target ${plugin.id}`,
          at(rel(file.path)),
        );
      } else if (actual !== file.contents) {
        diag.add(
          'DS-E080',
          `${rel(file.path)} differs from a fresh generation; run bwp-ds generate --target ${plugin.id}`,
          at(rel(file.path)),
        );
      }
    }
    for (const name of listOutputFiles(ctx.outDir)) {
      if (!produced.has(name)) {
        diag.add(
          'DS-E080',
          `${rel(name)} is not produced by the ${plugin.id} generator; delete it`,
          at(rel(name)),
        );
      }
    }
  }
}
