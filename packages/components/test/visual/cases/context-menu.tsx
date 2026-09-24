import oracle from '../../../../../spec/verify/context-menu.json';
import { ContextMenu } from '../../../src/ContextMenu.js';
import { ContextMenuItem } from '../../../src/ContextMenuItem.js';
import { Divider } from '../../../src/Divider.js';
import { icon } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { component?: string; variant?: Record<string, string> };

/** The rows and dividers Figma draws in the variant, in its order, each with its layer. */
const held = (v: OracleVariant) =>
  Object.entries(v.layers as Record<string, ChildLayer>).filter(
    ([, l]) => l.component === 'Context Menu Item' || l.component === 'Divider',
  );

// Figma's rows and divider, in place (no anchor), every row's slots filled so its look is
// measured: both icons and the shortcut; a destructive row where Figma draws one.
export default {
  oracle,
  render: (v) => (
    <ContextMenu>
      {held(v).map(([name, l]) =>
        l.component === 'Divider' ? (
          <Divider key={name} component="li" data-layer={name} />
        ) : (
          <ContextMenuItem
            key={name}
            data-layer={name}
            destructive={l.variant?.destructive === 'true'}
            leadingIcon={icon}
            trailingIcon={icon}
            shortcut="⌘K"
          >
            Action
          </ContextMenuItem>
        ),
      )}
    </ContextMenu>
  ),
} satisfies VisualCase;
