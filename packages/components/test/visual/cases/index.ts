/**
 * The web registry: a case per generated component, by its name, in registry.generated.ts, which
 * `npm run solar:codegen` writes from the component list. The spec requires one for every
 * component in the codegen's `COMPONENTS`, so a new component cannot go unmeasured.
 */

export { CASES } from './registry.generated.js';

/** `Icon Button` to `icon-button`: its cases' `data-case` is `icon-button:<index>`. */
export const slug = (component: string) =>
  component.toLowerCase().replace(/[^a-z0-9]+/g, '-');
