/**
 * The web registry: a case per generated component, by its Figma name. The spec requires one for
 * every component in the codegen's `COMPONENTS`, so a new component cannot go unmeasured.
 */

import button from './button.js';
import buttonGroup from './button-group.js';
import iconButton from './icon-button.js';
import spinner from './spinner.js';
import type { VisualCase } from './types.js';

export const CASES: Record<string, VisualCase> = {
  Button: button,
  'Button Group': buttonGroup,
  'Icon Button': iconButton,
  Spinner: spinner,
};

/** `Icon Button` to `icon-button`: its cases' `data-case` is `icon-button:<index>`. */
export const slug = (component: string) =>
  component.toLowerCase().replace(/[^a-z0-9]+/g, '-');
