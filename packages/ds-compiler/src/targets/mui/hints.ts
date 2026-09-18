import type { ComponentIR } from '../../ir/types.js';

export const MUI_ID = 'mui';

interface MuiHints {
  ignore?: string[];
}

/** The manifest's `targets.mui` entry when it maps the component (present and not excluded). */
function mappedHints(component: ComponentIR): MuiHints | null {
  const hints = component.targets[MUI_ID];
  if (hints === undefined || typeof hints.excluded === 'string') {
    return null;
  }
  return hints as MuiHints;
}

export function isMappedForMui(component: ComponentIR): boolean {
  return mappedHints(component) !== null;
}

export function ignoredForMui(component: ComponentIR): ReadonlySet<string> {
  return new Set(mappedHints(component)?.ignore ?? []);
}

/** The exclusion reason, or null when the component is not excluded. */
export function muiExclusion(component: ComponentIR): string | null {
  const hints = component.targets[MUI_ID];
  return hints !== undefined && typeof hints.excluded === 'string'
    ? hints.excluded
    : null;
}
