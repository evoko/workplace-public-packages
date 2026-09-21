import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
/** Absolute path to the repository root. */
export const repoRoot = resolve(here, '..', '..', '..', '..');
export const docsDir = resolve(repoRoot, 'docs');
export const specDir = resolve(repoRoot, 'spec');
export const packagesDir = resolve(repoRoot, 'packages');
