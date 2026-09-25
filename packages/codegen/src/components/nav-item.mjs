/**
 * SOLAR Nav Item, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One destination of a sidebar or top bar: MUI's ButtonBase on the web (a link where it has an
 * `href`), drawn and pressable in Flutter, its icon and label drawn by the shared layer helpers.
 * Its icon is solid while selected, as Figma swaps it. A focused item draws SOLAR's focus ring,
 * which Figma draws none of (owner decision 2026-09-24).
 */

import { drawnFlutter, drawnResets, treeConsts } from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const P = 'SolarNavItem';

const requireLayers = (spec) => {
  for (const slot of ['iconOutline', 'label'])
    if (!spec.slots[slot])
      throw new Error(`Nav Item: the IR has no ${slot} slot`);
  for (const prop of ['selected', 'expanded'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Nav Item: the IR has no ${prop} prop`);
};

export default {
  name: 'Nav Item',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    // A caller's icon fills its slot, which the recipe sizes and colours; a link is not
    // underlined. A 44 × 44 target around it, which takes no room.
    resets: drawnResets('Nav Item', {
      display: 'flex',
      textDecoration: 'none',
      [`& .${P}-iconOutline`]: { flexShrink: '0' },
      [`& .${P}-iconOutline > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      ...targetArea(),
    }),
    // Hovered as the pointer is; focused as the keyboard reaches it (MUI marks it focus-visible).
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    // An item's words are its `label`, which names it collapsed, where they are not drawn.
    label: 'label',
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Nav Item.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarNavItemStyle\` and \`solarNavItemCompose\` in \`@bwp-web/styles/mui\`: the
 * item's fill by state, and its icon's and label's ink, collapsed and expanded.
 *
 * One destination of a sidebar or a top bar: MUI's ButtonBase, a link where it has an \`href\` (or a
 * router's link as its \`component\`), a button otherwise. The \`selected\` one is the current page
 * (\`aria-current="page"\`), its icon solid (\`iconSolid\`, where given) as Figma swaps it. Expanded,
 * it shows its \`label\` beside its icon and spans its sidebar; collapsed, it is its icon alone, a
 * 40px square, named by its label for a screen reader (give \`aria-label\` where the label is not
 * text). A focused item draws SOLAR's focus ring. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { forwardRef, type ReactNode } from 'react';
import {
  solarNavItemCompose,
  solarNavItemStyle,
  type SolarNavItemProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface NavItemProps
  extends SolarNavItemProps,
    Omit<ButtonBaseProps, keyof SolarNavItemProps | 'children' | 'ref'> {
  /** Where it goes, and its name: drawn expanded, read collapsed. */
  label: ReactNode;
  /** Its icon, outlined, as it is drawn at rest. */
  iconOutline: ReactNode;
  /** Its icon while selected, solid; the outlined one where none is given. */
  iconSolid?: ReactNode;
  /** Where it goes: it is a link. */
  href?: string;
}

export const NavItem = forwardRef<HTMLButtonElement, NavItemProps>(function NavItem(
  {
    selected = false,
    expanded = false,
    label,
    iconOutline,
    iconSolid,
    className,
    sx,
    ...rest
  },
  ref,
) {
  const look = { selected, expanded };
  const parts = solarNavItemCompose(look);
  return (
    <ButtonBase
      ref={ref}
      aria-current={selected ? 'page' : undefined}
      // Collapsed, its words are not drawn: they name it.
      aria-label={!expanded && typeof label === 'string' ? label : undefined}
      {...rest}
      disableRipple
      className={className}
      sx={[solarNavItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: '${P}',
        tree: TREE, slots: SLOTS,
        parts,
        text: { label },
        icons: {
          iconOutline: <span>{selected ? (iconSolid ?? iconOutline) : iconOutline}</span>,
        },
      })}
    </ButtonBase>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the item’s fill by state, and its icon’s and label’s ink, collapsed and expanded, read cell by cell',
        about: `Bespoke: one destination of a sidebar or a top bar, drawn from Figma's layer tree with [SolarLayers], pressable and focusable. The [selected] one is the current page, announced selected, its icon solid ([iconSolid], where given) as Figma swaps it. [expanded], it shows its [label] beside its icon and fills its sidebar; collapsed, it is its icon alone, a 40px square, named by its label for a screen reader. A focused item draws SOLAR's focus ring.`,
        params: `required this.label,
required this.iconOutline,
required this.onPressed,
this.iconSolid,`,
        fields: `/// Where it goes, and its name: drawn expanded, read collapsed.
final String label;

/// Its icon, outlined, as it is drawn at rest.
final Widget iconOutline;

/// Called when it is chosen; null disables it.
final VoidCallback? onPressed;

/// Its icon while selected, solid; the outlined one where none is given.
final Widget? iconSolid;`,
        control: {
          onPressed: 'onPressed',
          semantics: 'selected: selected,',
        },
        text: "{'label': label}",
        slots:
          "{'iconOutline': selected ? (iconSolid ?? iconOutline) : iconOutline}",
        // Collapsed, its words are not drawn: they name it.
        wrap: `expanded ? mark : Semantics(label: label, child: mark)`,
      });
    },
  },
};
