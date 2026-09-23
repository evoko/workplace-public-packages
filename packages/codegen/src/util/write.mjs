import {
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { repoRoot } from './paths.mjs';

// Spec invariant 1: docs/ is a faithful mirror of Figma and is read-only to the generator.
// Every write in this package goes through here so a violation fails immediately.
const FORBIDDEN_TOP_LEVEL = new Set(['docs']);

// Every path written in this process, so pruneGenerated can tell a current output from a stale one.
const written = new Set();

function guard(absolutePath) {
  const rel = relative(repoRoot, absolutePath);
  if (rel.startsWith('..') || rel === '') {
    throw new Error(
      `refusing to write outside the repository: ${absolutePath}`,
    );
  }
  const top = rel.split(sep)[0];
  if (FORBIDDEN_TOP_LEVEL.has(top)) {
    throw new Error(
      `refusing to write to ${rel}: docs/ is the Figma mirror and is read-only to the generator (design spec invariant 1)`,
    );
  }
}

export function writeGenerated(absolutePath, contents) {
  guard(absolutePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents);
  written.add(absolutePath);
  return absolutePath;
}

/**
 * Deletes every file under `dir` that this run did not write, and any directory left empty.
 *
 * Writing alone never removes anything, so an icon deleted in Figma would keep its generated
 * module forever: still committed, still regenerating to the same bytes, and invisible to the
 * determinism check. Call it only on a directory the generator owns outright, after every
 * emitter that writes there has run. Returns the repository-relative paths it removed.
 */
export function pruneGenerated(dir) {
  guard(dir);
  const removed = [];
  const walk = (current) => {
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const e of entries) {
      const path = join(current, e.name);
      if (e.isDirectory()) walk(path);
      else if (!written.has(path)) {
        unlinkSync(path);
        removed.push(relative(repoRoot, path));
      }
    }
    if (current !== dir && readdirSync(current).length === 0)
      rmdirSync(current);
  };
  walk(dir);
  return removed;
}
