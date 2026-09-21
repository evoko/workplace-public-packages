import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, sep } from 'node:path';
import { repoRoot } from './paths.mjs';

// Spec invariant 1: docs/ is a faithful mirror of Figma and is read-only to the generator.
// Every write in this package goes through here so a violation fails immediately.
const FORBIDDEN_TOP_LEVEL = new Set(['docs']);

export function writeGenerated(absolutePath, contents) {
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
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents);
  return absolutePath;
}
