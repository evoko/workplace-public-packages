import { Diagnostics } from '../../errors.js';
import { loadMuiCatalog, type MuiCatalog } from '../mui/catalog.js';
import type { TargetPlugin } from '../plugin.js';
import { generateStories } from './generate.js';

export const STORIES_ID = 'stories';

/**
 * Compare stories for the Storybook. Auxiliary: generated and drift-checked
 * like a target, nothing to round-trip, no coverage. The MUI catalog is
 * loaded with a scratch diagnostics object because the MUI plugin already
 * reports its problems; only a hard failure is summarised here.
 */
export const storiesPlugin: TargetPlugin<MuiCatalog> = {
  id: STORIES_ID,
  auxiliary: true,
  loadCatalog: (ctx, diag) => {
    const scratch = new Diagnostics();
    const catalog = loadMuiCatalog(ctx, scratch);
    if (scratch.hasErrors()) {
      diag.add(
        'DS-E086',
        'stories: the mui defaults catalog could not be loaded; see the mui diagnostics',
        { file: 'catalogs/mui.json', line: 1, column: 1 },
      );
      return null;
    }
    return catalog;
  },
  generate: generateStories,
  reparse: () => null,
  coverage: () => [],
  isMapped: () => false,
  ignoredProperties: () => new Set(),
};
