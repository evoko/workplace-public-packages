import { buildIR } from './build.js';
import type { Diagnostics } from './errors.js';

/** Runs every authoring rule without writing any file. */
export function lint(rootDir: string): Diagnostics {
  return buildIR(rootDir).diagnostics;
}
