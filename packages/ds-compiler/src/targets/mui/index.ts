import { coverageEntries } from '../coverage-entries.js';
import type { TargetPlugin } from '../plugin.js';
import { captureMuiDefaults } from './capture.js';
import { loadMuiCatalog, type MuiCatalog } from './catalog.js';
import { generateMui } from './generate.js';
import {
  MUI_ID,
  ignoredForMui,
  isMappedForMui,
  muiExclusion,
} from './hints.js';
import { reparseMui } from './reparse.js';

/** Every property in the table is expressible in Emotion, so nothing is ever `unsupported`. */
export const muiPlugin: TargetPlugin<MuiCatalog> = {
  id: MUI_ID,
  loadCatalog: loadMuiCatalog,
  captureDefaults: captureMuiDefaults,
  generate: (ir, catalog, ctx, diag) => generateMui(ir, catalog, ctx, diag),
  reparse: (files, ir, _catalog, ctx, diag) => reparseMui(files, ir, ctx, diag),
  coverage: (ir) =>
    coverageEntries(MUI_ID, ir, {
      exclusion: muiExclusion,
      isMapped: isMappedForMui,
      ignored: ignoredForMui,
    }),
  isMapped: isMappedForMui,
  ignoredProperties: ignoredForMui,
};
