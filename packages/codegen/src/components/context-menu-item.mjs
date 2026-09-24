/**
 * SOLAR Context Menu Item, beyond its IR: where MUI draws each layer and marks each state, and the
 * two shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One row of a Context Menu: MUI's MenuItem on the web, as a Dropdown Item is, drawn and pressable
 * in Flutter, its icons, words and shortcut drawn by the shared layer helpers.
 */

import { drawnFlutter, drawnResets, treeOf } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  for (const slot of ['leadingIcon', 'shortcut', 'trailingIcon'])
    if (!spec.slots[slot])
      throw new Error(`Context Menu Item: the IR has no ${slot} slot`);
  for (const text of ['label', 'shortcut'])
    if (spec.layers[text]?.type !== 'TEXT')
      throw new Error(`Context Menu Item: the IR has no ${text} text`);
  for (const prop of ['disabled', 'destructive'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Context Menu Item: the IR has no ${prop} prop`);
};

const P = 'SolarContextMenuItem';

export default {
  name: 'Context Menu Item',
  mui: {
    // The shell draws every layer itself, inside MUI's MenuItem, each with a class of its own.
    slots: 'drawn',
    // MenuItem's own look gives way to the recipe's, as a Dropdown Item's does. A row spans its
    // menu; its icons keep their size, and a caller's icon fills its slot.
    resets: drawnResets('Context Menu Item', {
      display: 'flex',
      minHeight: '0',
      '&.Mui-disabled': { opacity: '1' },
      [`& .${P}-leadingIcon, & .${P}-trailingIcon`]: { flexShrink: '0' },
      [`& .${P}-leadingIcon > svg, & .${P}-trailingIcon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
    // Figma draws the focus: the menu's keyboard highlight, a row's own look.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Context Menu Item.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarContextMenuItemStyle\` and \`solarContextMenuItemCompose\` in
 * \`@bwp-web/styles/mui\`: the row's fill by state, and its words', shortcut's and icons' ink,
 * destructive or not.
 *
 * One action of a ContextMenu: MUI's MenuItem, so the menu moves the focus from row to row with
 * the arrow keys, and a focused row draws Figma's focus. Its words, an icon either side and a
 * keyboard \`shortcut\` after them are drawn from Figma's layer tree (\`internal/layers.tsx\`).
 * \`destructive\` is for an action that cannot be undone (Delete), and only that, as SOLAR says. No
 * submenus: one level. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import MenuItem, { type MenuItemProps } from '@mui/material/MenuItem';
import { forwardRef, type ReactNode } from 'react';
import {
  solarContextMenuItemCompose,
  solarContextMenuItemStyle,
  type SolarContextMenuItemProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface ContextMenuItemProps
  extends SolarContextMenuItemProps,
    Omit<
      MenuItemProps,
      | keyof SolarContextMenuItemProps
      | 'children'
      | 'dense'
      | 'divider'
      | 'disableGutters'
      | 'selected'
      | 'ref'
    > {
  /** The action's words. */
  children: ReactNode;
  /** An icon before the words. */
  leadingIcon?: ReactNode;
  /** An icon after the words and the shortcut. */
  trailingIcon?: ReactNode;
  /** The action's keyboard shortcut, as the platform writes it (⌘C, Ctrl+C). */
  shortcut?: ReactNode;
}

export const ContextMenuItem = forwardRef<HTMLLIElement, ContextMenuItemProps>(
  function ContextMenuItem(
    {
      disabled = false,
      destructive = false,
      children,
      leadingIcon,
      trailingIcon,
      shortcut,
      sx,
      ...rest
    },
    ref,
  ) {
    const look = { disabled, destructive };
    const composed = solarContextMenuItemCompose(look);
    // A slot left empty is not drawn.
    const parts = {
      ...composed,
      leadingIcon: { ...composed.leadingIcon, present: leadingIcon != null },
      trailingIcon: { ...composed.trailingIcon, present: trailingIcon != null },
      shortcut: { ...composed.shortcut, present: shortcut != null },
    };
    return (
      <MenuItem
        ref={ref}
        {...rest}
        disabled={disabled}
        disableRipple
        sx={[solarContextMenuItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE,
          parts,
          text: { label: children, shortcut },
          icons: {
            leadingIcon: <span>{leadingIcon}</span>,
            trailingIcon: <span>{trailingIcon}</span>,
          },
        })}
      </MenuItem>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the row’s fill by state, and its words’, shortcut’s and icons’ ink, destructive or not, read cell by cell',
        about: `Bespoke: one action of a SolarContextMenu, drawn from Figma's layer tree with [SolarLayers],
pressable, and focusable in the menu's order. Its words, an icon either side and a keyboard
[shortcut] after them. [destructive] is for an action that cannot be undone (Delete), and only
that, as SOLAR says. Inside a menu it is announced as a menu item; outside one, as a button. No
submenus: one level.`,
        params: `required this.label,
required this.onPressed,
this.leadingIcon,
this.trailingIcon,
this.shortcut,`,
        fields: `/// The action's words.
final String label;

/// Called when it is chosen; null disables it.
final VoidCallback? onPressed;

/// An icon before the words.
final Widget? leadingIcon;

/// An icon after the words and the shortcut.
final Widget? trailingIcon;

/// The action's keyboard shortcut, as the platform writes it (⌘C, Ctrl+C).
final String? shortcut;`,
        control: {
          onPressed: 'disabled ? null : onPressed',
          semantics: `role: SolarMenuScope.of(context) ? SemanticsRole.menuItem : null,`,
        },
        // A row with nothing to do is drawn disabled.
        values: { disabled: 'disabled || onPressed == null' },
        text: "{'label': label, 'shortcut': ?shortcut}",
        slots: "{'leadingIcon': ?leadingIcon, 'trailingIcon': ?trailingIcon}",
        // A slot left empty is not drawn.
        present: (recipe) => `switch (l) {
          'leadingIcon' => leadingIcon != null,
          'trailingIcon' => trailingIcon != null,
          'shortcut' => shortcut != null,
          _ => ${recipe},
        }`,
        imports: `import 'package:flutter/semantics.dart';

import '../solar_menu.dart';`,
      });
    },
  },
};
