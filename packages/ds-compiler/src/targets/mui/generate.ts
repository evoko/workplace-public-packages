import type { Diagnostics } from '../../errors.js';
import type { DesignIR } from '../../ir/types.js';
import type { GeneratedFile, PluginContext } from '../plugin.js';
import type { MuiCatalog } from './catalog.js';
import { buildMuiModel } from './model.js';
import {
  renderComponentTsx,
  renderComponentsIndex,
  renderIndexTs,
  renderTypecheckTsx,
} from './render-component.js';
import {
  renderAugmentationTs,
  renderModelJson,
  renderThemeTs,
} from './render-ts.js';

/** Every file of the MUI target, in a fixed order. Empty (after reporting) when the model cannot be built. */
export function generateMui(
  ir: DesignIR,
  catalog: MuiCatalog | null,
  ctx: PluginContext,
  diag: Diagnostics,
): GeneratedFile[] {
  const model = buildMuiModel(ir, catalog, ctx, diag);
  if (!model) {
    return [];
  }
  return [
    { path: 'theme.model.json', contents: renderModelJson(model) },
    { path: 'theme.ts', contents: renderThemeTs(model) },
    { path: 'augmentation.ts', contents: renderAugmentationTs(model) },
    ...Object.values(model.components).map((c) => ({
      path: `components/${c.exportName}.tsx`,
      contents: renderComponentTsx(model, c),
    })),
    { path: 'components/index.ts', contents: renderComponentsIndex(model) },
    { path: 'index.ts', contents: renderIndexTs(model) },
    { path: 'typecheck.tsx', contents: renderTypecheckTsx(model) },
  ];
}
