import type { ComponentIR } from '../../ir/types.js';

export const MUI_ID = 'mui';

export type MuiScalar = string | number | boolean;

interface MuiHints {
  ignore?: string[];
  component?: string;
  axisMap?: Record<string, string>;
  slotMap?: Record<string, string>;
  defaultProps?: Record<string, MuiScalar>;
}

/** A mapping onto one of MUI's own components, as written in the manifest. */
export interface MuiMappingHints {
  component: string;
  axisMap: Record<string, string>;
  slotMap: Record<string, string>;
  defaultProps: Record<string, MuiScalar>;
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

/** The manifest's mapping, or null for an own component (and for excluded or unmapped ones). */
export function muiMapping(component: ComponentIR): MuiMappingHints | null {
  const hints = mappedHints(component);
  if (!hints || hints.component === undefined) {
    return null;
  }
  return {
    component: hints.component,
    axisMap: hints.axisMap ?? {},
    slotMap: hints.slotMap ?? {},
    defaultProps: hints.defaultProps ?? {},
  };
}

/** The exclusion reason, or null when the component is not excluded. */
export function muiExclusion(component: ComponentIR): string | null {
  const hints = component.targets[MUI_ID];
  return hints !== undefined && typeof hints.excluded === 'string'
    ? hints.excluded
    : null;
}
