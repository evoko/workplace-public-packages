import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { codeUnitCompare } from '../sources.js';

function walk(dir: string, prefix: string, out: string[]): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return;
    }
    throw err;
  }
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      walk(join(dir, entry.name), rel, out);
    } else if (entry.isFile()) {
      out.push(rel);
    }
  }
}

/**
 * Every regular file under `dir`, recursively, as POSIX-relative paths
 * (forward slashes regardless of OS), including dotfiles, sorted by
 * `codeUnitCompare`. Tolerates a missing or non-directory `dir` (returns []),
 * the same as the rest of this codebase's directory listings.
 */
export function listOutputFiles(dir: string): string[] {
  const out: string[] = [];
  walk(dir, '', out);
  return out.sort(codeUnitCompare);
}
