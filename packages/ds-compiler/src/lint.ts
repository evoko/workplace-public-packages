import { buildIR } from './build.js';
import { checkEntryCss } from './entry.js';
import { configFailed, type Diagnostics } from './errors.js';

/** Runs every authoring rule without writing any file. */
export function lint(rootDir: string): Diagnostics {
  const result = buildIR(rootDir);
  // DS-E001 means ds.config.json could not be read; an entry-file error on
  // top of that would be noise.
  if (!configFailed(result.diagnostics)) {
    checkEntryCss(rootDir, result.diagnostics);
  }
  return result.diagnostics;
}
