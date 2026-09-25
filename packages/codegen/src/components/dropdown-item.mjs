/**
 * SOLAR Dropdown Item, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * One row of a Dropdown Menu: MUI's MenuItem on the web, drawn and pressable in Flutter, its
 * checkbox, icon and words drawn by the shared layer helpers. Figma draws no focus: the menu moves
 * the focus from row to row, and a focused row draws the hover (owner decision 2026-09-24).
 */

import { drawnResets } from './shared/drawn.mjs';

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
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own controls: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
};
