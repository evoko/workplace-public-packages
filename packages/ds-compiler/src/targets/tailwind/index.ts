import type { DesignIR } from '../../ir/types.js';
import type { CoverageEntry, TargetPlugin } from '../plugin.js';
import {
  TAILWIND_ID,
  ignoredForTailwind,
  isMappedForTailwind,
  tailwindExclusion,
} from './hints.js';
import { generateTailwind } from './render.js';
import { reparseTailwind } from './reparse.js';

function coverage(ir: DesignIR): CoverageEntry[] {
  return Object.keys(ir.components)
    .sort()
    .map((name) => {
      const component = ir.components[name];
      const excluded = tailwindExclusion(component);
      if (excluded !== null) {
        return {
          component: name,
          target: TAILWIND_ID,
          status: 'excluded' as const,
          reason: excluded,
        };
      }
      if (!isMappedForTailwind(component)) {
        return {
          component: name,
          target: TAILWIND_ID,
          status: 'unmapped' as const,
        };
      }
      const ignored = [...ignoredForTailwind(component)].sort();
      if (ignored.length > 0) {
        return {
          component: name,
          target: TAILWIND_ID,
          status: 'partial' as const,
          ignored,
        };
      }
      return {
        component: name,
        target: TAILWIND_ID,
        status: 'supported' as const,
      };
    });
}

/** Tailwind has a handler for every property in the table, so nothing is ever `unsupported`. */
export const tailwindPlugin: TargetPlugin<null> = {
  id: TAILWIND_ID,
  generate: (ir, _catalog, ctx) => generateTailwind(ir, ctx),
  reparse: reparseTailwind,
  coverage,
  isMapped: isMappedForTailwind,
  ignoredProperties: ignoredForTailwind,
};
