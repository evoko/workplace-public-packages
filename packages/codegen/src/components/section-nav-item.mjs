/**
 * SOLAR Section Nav Item, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One item of a section nav rail (settings and admin sub-navigation), as Nav Item is of a
 * sidebar: MUI's ButtonBase on the web (a link where it has an `href`), drawn and pressable in
 * Flutter, its icon and label drawn by the shared layer helpers.
 */

import { drawnFlutter, drawnResets, treeConsts } from '../shells/drawn.mjs';

const P = 'SolarSectionNavItem';

const requireLayers = (spec) => {
  for (const slot of ['icon', 'label'])
    if (!spec.slots[slot])
      throw new Error(`Section Nav Item: the IR has no ${slot} slot`);
  for (const prop of ['selected', 'disabled'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Section Nav Item: the IR has no ${prop} prop`);
};

export default {
  name: 'Section Nav Item',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    // A caller's icon fills its slot, which the recipe sizes and colours; a link is not
    // underlined. No padded target: the items touch in their rail, as a menu's rows do (owner
    // decision 2026-09-24 for rows), and each is its own box's target.
    resets: drawnResets('Section Nav Item', {
      display: 'flex',
      textDecoration: 'none',
      [`& .${P}-icon`]: { flexShrink: '0' },
      [`& .${P}-icon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
    // Hovered as the pointer is; focused as the keyboard reaches it (MUI marks it focus-visible);
    // selected by the shell's class, and disabled as MUI marks it.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
      selected: `&.${P}-selected`,
      disabled: '&.Mui-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    // An item's words are its `label`, as a Nav Item's are.
    label: 'label',
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Section Nav Item.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarSectionNavItemStyle\` and \`solarSectionNavItemCompose\` in
 * \`@bwp-web/styles/mui\`: the item's fill and focus ring by state, and its icon's and label's ink.
 *
 * One item of a section nav rail, the settings and admin sub-navigation (a sidebar's destinations are
 * NavItems): MUI's ButtonBase, a link where it has an \`href\` (or a router's link as its
 * \`component\`), a button otherwise. The \`selected\` one is the current page
 * (\`aria-current="page"\`), drawn by its fill, not colour alone, as its description says. Its
 * \`icon\` and \`label\` are drawn from Figma's layer tree (\`internal/layers.tsx\`); it spans its
 * rail. Group them under SectionNavGroupHeaders. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { forwardRef, type ReactNode } from 'react';
import {
  solarSectionNavItemCompose,
  solarSectionNavItemStyle,
  type SolarSectionNavItemProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface SectionNavItemProps
  extends SolarSectionNavItemProps,
    Omit<ButtonBaseProps, keyof SolarSectionNavItemProps | 'children' | 'ref'> {
  /** Where it goes. */
  label: ReactNode;
  /** An icon before the words. */
  icon: ReactNode;
  /** Where it goes: it is a link. */
  href?: string;
}

export const SectionNavItem = forwardRef<HTMLButtonElement, SectionNavItemProps>(
  function SectionNavItem(
    { selected = false, disabled = false, label, icon, className, sx, ...rest },
    ref,
  ) {
    const look = { selected, disabled };
    const parts = solarSectionNavItemCompose(look);
    return (
      <ButtonBase
        ref={ref}
        aria-current={selected ? 'page' : undefined}
        {...rest}
        disabled={disabled}
        disableRipple
        className={[selected ? '${P}-selected' : null, className].filter(Boolean).join(' ') || undefined}
        sx={[solarSectionNavItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE, slots: SLOTS,
          parts,
          text: { label },
          icons: { icon: <span>{icon}</span> },
        })}
      </ButtonBase>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the item’s fill and focus ring by state, and its icon’s and label’s ink, read cell by cell',
        about: `Bespoke: one item of a section nav rail, the settings and admin sub-navigation (a sidebar's destinations are SolarNavItems), drawn from Figma's layer tree with [SolarLayers], pressable and focusable. The [selected] one is the current page, announced selected, drawn by its fill, not colour alone. It spans its rail. Group them under SolarSectionNavGroupHeaders.`,
        params: `required this.label,
required this.icon,
required this.onPressed,`,
        fields: `/// Where it goes.
final String label;

/// An icon before the words.
final Widget icon;

/// Called when it is chosen; null disables it.
final VoidCallback? onPressed;`,
        control: {
          onPressed: 'disabled ? null : onPressed',
          semantics: 'selected: selected,',
          // The items touch in their rail, as a menu's rows do: no padded target.
          target: false,
        },
        text: "{'label': label}",
        slots: "{'icon': icon}",
      });
    },
  },
};
