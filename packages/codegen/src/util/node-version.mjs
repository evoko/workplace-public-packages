/**
 * The Node the generator needs: the major `.nvmrc` pins, or newer. The generator uses Node 22's
 * iterator helpers (`entriesOf(...).some`), which Node 20 lacks, so on an older Node it would die
 * mid-run with a stack trace and no hint; this says so in one line instead.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './paths.mjs';

/** The major version `.nvmrc` pins. */
export const pinnedMajor = () =>
  Number(
    readFileSync(join(repoRoot, '.nvmrc'), 'utf8')
      .trim()
      .replace(/^v/, '')
      .split('.')[0],
  );

/** What is wrong with running on `version`, or null where nothing is. */
export function nodeVersionProblem(
  version = process.versions.node,
  needed = pinnedMajor(),
) {
  const major = Number(String(version).split('.')[0]);
  return major >= needed
    ? null
    : `SOLAR codegen needs Node ${needed} (.nvmrc); this is ${version}`;
}
