import type { ComponentIR } from '../../ir/types.js';

export const TAILWIND_ID = 'tailwind';

interface TailwindHints {
  ignore?: string[];
}

/** The manifest's `targets.tailwind` entry when it maps the component (present and not excluded). */
function mappedHints(component: ComponentIR): TailwindHints | null {
  const hints = component.targets[TAILWIND_ID];
  if (hints === undefined || typeof hints.excluded === 'string') {
    return null;
  }
  return hints as TailwindHints;
}

export function isMappedForTailwind(component: ComponentIR): boolean {
  return mappedHints(component) !== null;
}

export function ignoredForTailwind(
  component: ComponentIR,
): ReadonlySet<string> {
  return new Set(mappedHints(component)?.ignore ?? []);
}

/** The exclusion reason, or null when the component is not excluded. */
export function tailwindExclusion(component: ComponentIR): string | null {
  const hints = component.targets[TAILWIND_ID];
  return hints !== undefined && typeof hints.excluded === 'string'
    ? hints.excluded
    : null;
}
