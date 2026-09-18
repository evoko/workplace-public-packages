import type { ComponentIR, DesignIR } from '../ir/types.js';
import type { CoverageEntry } from './plugin.js';

export interface CoverageHooks {
  exclusion(component: ComponentIR): string | null;
  isMapped(component: ComponentIR): boolean;
  ignored(component: ComponentIR): ReadonlySet<string>;
}

/** Coverage for a target whose every property is expressible: supported, partial (ignored), unmapped, or excluded. */
export function coverageEntries(
  id: string,
  ir: DesignIR,
  hooks: CoverageHooks,
): CoverageEntry[] {
  return Object.keys(ir.components)
    .sort()
    .map((name) => {
      const component = ir.components[name];
      const excluded = hooks.exclusion(component);
      if (excluded !== null) {
        return {
          component: name,
          target: id,
          status: 'excluded' as const,
          reason: excluded,
        };
      }
      if (!hooks.isMapped(component)) {
        return { component: name, target: id, status: 'unmapped' as const };
      }
      const ignored = [...hooks.ignored(component)].sort();
      if (ignored.length > 0) {
        return {
          component: name,
          target: id,
          status: 'partial' as const,
          ignored,
        };
      }
      return { component: name, target: id, status: 'supported' as const };
    });
}
