/**
 * SOLAR Dropdown Item, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One row of a Dropdown Menu: MUI's MenuItem on the web, drawn and pressable in Flutter, its
 * checkbox, icon and words drawn by the shared layer helpers. Figma draws no focus: the menu moves
 * the focus from row to row, and a focused row draws the hover (owner decision 2026-09-24).
 */

import { drawnFlutter, drawnResets, treeOf } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  for (const slot of ['checkbox', 'icon', 'helper'])
    if (!spec.slots[slot])
      throw new Error(`Dropdown Item: the IR has no ${slot} slot`);
  for (const text of ['label', 'helper'])
    if (spec.layers[text]?.type !== 'TEXT')
      throw new Error(`Dropdown Item: the IR has no ${text} text`);
  for (const prop of ['selected', 'disabled'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Dropdown Item: the IR has no ${prop} prop`);
};

const P = 'SolarDropdownItem';

export default {
  name: 'Dropdown Item',
  mui: {
    // The shell draws every layer itself, inside MUI's MenuItem, each with a class of its own.
    slots: 'drawn',
    // MenuItem's own look gives way to the recipe's: its minimum height, its faded disabled row
    // (the recipe draws Figma's), and its focus fill (a focused row draws the hover). A row spans
    // its menu. A caller's icon fills its slot, which the recipe sizes and colours.
    resets: drawnResets('Dropdown Item', {
      display: 'flex',
      minHeight: '0',
      '&.Mui-disabled': { opacity: '1' },
      // The box and the icon keep their size; the words take what is left of the row.
      [`& .${P}-checkbox, & .${P}-icon`]: { flexShrink: '0' },
      [`& .${P}-icon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      [`& .${P}-helper`]: { whiteSpace: 'normal' },
    }),
    // A focused row, the menu's keyboard highlight, draws Figma's hover, as does the row an
    // Autocomplete highlights while its input keeps the focus (MUI marks it Mui-focused). A
    // selected row keeps its fill under the pointer, and a disabled one beats both; each is a class
    // the shell sets, as MUI's own selected fill is not the recipe's.
    states: {
      default: null,
      hover: '&:hover, &.Mui-focusVisible, &.Mui-focused',
      selected: `&.${P}-selected`,
      disabled: '&.Mui-disabled',
    },
  },
  flutter: {
    // As on the web: the focused row draws the hover.
    states: {
      hover:
        's.contains(WidgetState.hovered) || s.contains(WidgetState.focused)',
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Dropdown Item.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarDropdownItemStyle\` and \`solarDropdownItemCompose\` in \`@bwp-web/styles/mui\`:
 * the row's fill by state, and its words' and icon's ink.
 *
 * One row of a DropdownMenu: MUI's MenuItem, so the menu moves the focus from row to row with the
 * arrow keys, and a focused row draws Figma's hover, as SOLAR's description says a highlighted one
 * does. Its words, a second line (\`helper\`), an \`icon\` before them and a \`checkbox\` are drawn
 * from Figma's layer tree (\`internal/layers.tsx\`). The checkbox follows \`selected\` and makes the
 * row a menuitemcheckbox, announced checked; a single-choice menu gives its rows
 * \`role="menuitemradio"\`, announced checked where selected, and a listbox its rows
 * \`role="option"\`, announced selected (MUI's Select does). In a menu it takes the menu's size.
 * The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import MenuItem, { type MenuItemProps } from '@mui/material/MenuItem';
import { forwardRef, type ReactNode } from 'react';
import {
  solarDropdownItemCompose,
  solarDropdownItemStyle,
  type SolarDropdownItemProps,
} from '@bwp-web/styles/mui';
import { Checkbox } from './Checkbox.js';
import { useDropdownMenuSize } from './DropdownMenu.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface DropdownItemProps
  extends SolarDropdownItemProps,
    Omit<
      MenuItemProps,
      | keyof SolarDropdownItemProps
      | 'children'
      | 'dense'
      | 'divider'
      | 'disableGutters'
      | 'ref'
    > {
  /** The row's words. */
  children: ReactNode;
  /** A second line under the words, quieter. */
  helper?: ReactNode;
  /** An icon before the words. */
  icon?: ReactNode;
  /** Shows a checkbox before the words, checked where the row is selected: a choice of several. */
  checkbox?: boolean;
}

export const DropdownItem = forwardRef<HTMLLIElement, DropdownItemProps>(
  function DropdownItem(
    {
      size,
      selected = false,
      disabled = false,
      children,
      helper,
      icon,
      checkbox = false,
      role,
      className,
      sx,
      ...rest
    },
    ref,
  ) {
    // In a menu, the menu's size, as Figma draws its rows.
    const look = { size: useDropdownMenuSize() ?? size, selected, disabled };
    const composed = solarDropdownItemCompose(look);
    // A slot left empty is not drawn.
    const parts = {
      ...composed,
      checkbox: { ...composed.checkbox, present: checkbox },
      icon: { ...composed.icon, present: icon != null },
      helper: { ...composed.helper, present: helper != null },
    };
    const as = role ?? (checkbox ? 'menuitemcheckbox' : 'menuitem');
    // The box's variant, as the recipe names it in each of the row's prop states, which may hold
    // together (a selected row disabled).
    const box = (state: string) => solarDropdownItemCompose(look, state).checkbox;
    return (
      <MenuItem
        ref={ref}
        role={as}
        aria-checked={
          as === 'menuitemcheckbox' || as === 'menuitemradio' ? selected : undefined
        }
        aria-selected={as === 'option' ? selected : undefined}
        {...rest}
        disabled={disabled}
        disableRipple
        // Its checkbox takes its hover, and its keyboard focus (Checkbox's recipe).
        className={['SolarStatesScope', selected ? '${P}-selected' : null, className]
          .filter(Boolean)
          .join(' ')}
        sx={[solarDropdownItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE,
          parts,
          text: { label: children, helper },
          // The box is a SOLAR Checkbox in the variant the recipe names, inert: the row is the
          // control, and says what is chosen.
          render: {
            checkbox: ({ className, style }) => (
              <span className={className} style={style}>
                <Checkbox
                  inert
                  checked={box(selected ? 'selected' : 'default')['variant.checked'] === 'true'}
                  disabled={box(disabled ? 'disabled' : 'default')['variant.disabled'] === 'true'}
                />
              </span>
            ),
          },
          icons: { icon: <span>{icon}</span> },
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
        look: 'the row’s fill by state, and its words’ and icon’s ink, read cell by cell',
        about: `Bespoke: one row of a SolarDropdownMenu, drawn from Figma's layer tree with [SolarLayers],
pressable, and focusable in the menu's order; a focused row draws Figma's hover, as SOLAR's
description says a highlighted one does. Its words, a second line ([helper]), an [icon] before
them and a [checkbox] that follows [selected]. Inside a menu it takes the menu's size, and is
announced as a menu item (a checkable one with a checkbox); outside one, as a button.`,
        params: `required this.label,
required this.onPressed,
this.helper,
this.icon,
this.checkbox = false,`,
        fields: `/// The row's words.
final String label;

/// Called when it is chosen; null disables it.
final VoidCallback? onPressed;

/// A second line under the words, quieter.
final String? helper;

/// An icon before the words.
final Widget? icon;

/// Shows a checkbox before the words, checked where the row is selected: a choice of several.
final bool checkbox;`,
        control: {
          onPressed: 'disabled ? null : onPressed',
          semantics: `role: SolarMenuScope.of(context)
    ? (checkbox ? SemanticsRole.menuItemCheckbox : SemanticsRole.menuItem)
    : null,
checked: checkbox ? selected : null,
selected: checkbox ? null : selected,`,
        },
        // A row with nothing to do is drawn disabled; in a menu, it takes the menu's size.
        values: {
          disabled: 'disabled || onPressed == null',
          size: 'SolarMenuScope.sizeOf(context, SolarDropdownItemSize.values) ?? size',
        },
        text: "{'label': label, 'helper': ?helper}",
        slots: "{'icon': ?icon}",
        // The box is a SOLAR Checkbox in the variant the recipe names, drawn in the row's hover,
        // inert: the row is the control, and says what is chosen.
        composed: `{
        'checkbox': SolarCheckbox(
          checked:
              SolarDropdownItemRecipe.lookup('checkbox.variant.checked', p, states) ==
              'k:true',
          disabled:
              SolarDropdownItemRecipe.lookup('checkbox.variant.disabled', p, states) ==
              'k:true',
          onChanged: null,
          inStates: {
            if (SolarDropdownItemRecipe.lookup('checkbox.variant.hover', p, states) ==
                'k:true')
              WidgetState.hovered,
          },
        ),
      }`,
        // A slot left empty is not drawn.
        present: (recipe) => `switch (l) {
          'checkbox' => checkbox,
          'icon' => icon != null,
          'helper' => helper != null,
          _ => ${recipe},
        }`,
        imports: `import 'package:flutter/semantics.dart';

import '../solar_menu.dart';
import 'solar_checkbox.dart';`,
      });
    },
  },
};
