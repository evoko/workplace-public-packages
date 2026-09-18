import { coverageEntries } from '../coverage-entries.js';
import type { TargetPlugin } from '../plugin.js';
import {
  TAILWIND_ID,
  ignoredForTailwind,
  isMappedForTailwind,
  tailwindExclusion,
} from './hints.js';
import { generateTailwind } from './render.js';
import { reparseTailwind } from './reparse.js';

/** Tailwind has a handler for every property in the table, so nothing is ever `unsupported`. */
export const tailwindPlugin: TargetPlugin<null> = {
  id: TAILWIND_ID,
  generate: (ir, _catalog, ctx) => generateTailwind(ir, ctx),
  reparse: reparseTailwind,
  coverage: (ir) =>
    coverageEntries(TAILWIND_ID, ir, {
      exclusion: tailwindExclusion,
      isMapped: isMappedForTailwind,
      ignored: ignoredForTailwind,
    }),
  isMapped: isMappedForTailwind,
  ignoredProperties: ignoredForTailwind,
};
