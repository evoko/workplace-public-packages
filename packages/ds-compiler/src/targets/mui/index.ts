import { coverageEntries } from '../coverage-entries.js';
import type { TargetPlugin } from '../plugin.js';
import { generateMui } from './generate.js';
import {
  MUI_ID,
  ignoredForMui,
  isMappedForMui,
  muiExclusion,
} from './hints.js';
import { reparseMui } from './reparse.js';

/** Every property in the table is expressible in Emotion, so nothing is ever `unsupported`. */
export const muiPlugin: TargetPlugin<null> = {
  id: MUI_ID,
  generate: (ir, _catalog, ctx, diag) => generateMui(ir, ctx, diag),
  reparse: reparseMui,
  coverage: (ir) =>
    coverageEntries(MUI_ID, ir, {
      exclusion: muiExclusion,
      isMapped: isMappedForMui,
      ignored: ignoredForMui,
    }),
  isMapped: isMappedForMui,
  ignoredProperties: ignoredForMui,
};
