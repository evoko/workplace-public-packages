import { readdirSync, statSync, type Dirent } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR, TOKENS_DIR } from './paths.js';

export function codeUnitCompare(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

function isSkipped(name: string): boolean {
  return name.startsWith('.') || name === 'node_modules';
}

/** Lists a directory's entries, or [] when it does not exist or is not a directory. */
export function listDir(dir: string): Dirent[] {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return [];
    }
    throw err;
  }
}

/**
 * Regular-file entry names directly under src/tokens, following symlinks
 * (broken symlinks and directories excluded), skipping dotfiles and
 * node_modules, code-unit sorted.
 *
 * Shared by buildIR and the generated entry file so the two cannot drift on
 * what counts as a token source: a name only reaches the IR or the entry
 * file's imports if it passes through here first.
 */
export function listTokenFiles(rootDir: string): string[] {
  const dir = join(rootDir, TOKENS_DIR);
  const names: string[] = [];
  for (const entry of listDir(dir)) {
    if (isSkipped(entry.name)) {
      continue;
    }
    let isFile = entry.isFile();
    if (!isFile && entry.isSymbolicLink()) {
      try {
        isFile = statSync(join(dir, entry.name)).isFile();
      } catch {
        isFile = false;
      }
    }
    if (isFile) {
      names.push(entry.name);
    }
  }
  return names.sort(codeUnitCompare);
}

/**
 * Directory names directly under src/components, following symlinks,
 * skipping dotfiles and node_modules, code-unit sorted.
 *
 * Shared by buildIR and the generated entry file so the two cannot drift on
 * what counts as a component source.
 */
export function listComponentDirs(rootDir: string): string[] {
  const dir = join(rootDir, COMPONENTS_DIR);
  const names: string[] = [];
  for (const entry of listDir(dir)) {
    if (isSkipped(entry.name)) {
      continue;
    }
    let isDirectory = entry.isDirectory();
    if (!isDirectory && entry.isSymbolicLink()) {
      try {
        isDirectory = statSync(join(dir, entry.name)).isDirectory();
      } catch {
        isDirectory = false;
      }
    }
    if (isDirectory) {
      names.push(entry.name);
    }
  }
  return names.sort(codeUnitCompare);
}
