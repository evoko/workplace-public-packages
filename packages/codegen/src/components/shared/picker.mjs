/**
 * What SOLAR's pickers share (Select, Dropdown): a field, with its label above and its helper
 * below, that opens a panel of Dropdown Items under it and shows the one chosen. MUI's Select on
 * the web, on InputBase as the field, its menu kept in the component (`disablePortal`) so the
 * recipe reaches it: drawn as the picker's own panel layer where Figma draws one (Select's), and
 * otherwise as a Dropdown Menu (Dropdown's). In Flutter, a drawn field, pressable, and the panel
 * floated under it by SolarMenuAnchor, as wide as the field.
 */

import { pascal } from '../../util/naming.mjs';
import { drawnResets } from './drawn.mjs';
import { targetArea } from './target.mjs';

/**
 * A picker's resets: a drawn component's, the combobox as the field's words (MUI's own padding,
 * height and room for its icon give way to the recipe's), MUI's icon as the chevron in the field's
 * row, the menu's paper as the panel (none of MUI's own look), a caller's icons filling their
 * slots, the helper wrapping, and a 44 × 44 target around the field.
 *
 * @param {string} name the component
 * @param {object} o
 * @param {string} o.value the text layer that shows the choice
 * @param {string} o.chevron the chevron's layer
 * @param {string|null} [o.panel] the panel's layer, where Figma draws one
 * @param {string[]} [o.icons] the icon slots a caller fills
 */
export function pickerResets(
  name,
  { value, chevron, panel = null, icons = [] },
) {
  const P = `Solar${pascal(name)}`;
  return drawnResets(name, {
    [`& .${P}-field`]: { cursor: 'pointer' },
    // The combobox holds the field's parts, in its row, spaced as the field is; as specific as
    // MUI's own rule, which gives it room for an icon it no longer draws.
    [`& .${P}-field .MuiSelect-select.MuiSelect-select.MuiSelect-select`]: {
      display: 'flex',
      alignItems: 'center',
      gap: 'inherit',
      flex: '1 1 0%',
      minWidth: '0',
      height: 'auto',
      minHeight: '0',
      padding: '0',
    },
    // The choice's words take what the icons leave, cut short where they run out.
    [`& .${P}-${value}`]: {
      flex: '1 1 0%',
      minWidth: '0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    [[`& .${P}-${chevron}`, ...icons.map((i) => `& .${P}-${i}`)].join(', ')]: {
      flexShrink: '0',
    },
    [[
      `& .${P}-${chevron} > svg`,
      ...icons.map((i) => `& .${P}-${i} > svg`),
    ].join(', ')]: {
      display: 'block',
      width: '100%',
      height: '100%',
    },
    ...(panel
      ? {
          [`& .${P}-${panel}.MuiPaper-root`]: {
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            backgroundImage: 'none',
          },
        }
      : {}),
    [`& .${P}-helper`]: { whiteSpace: 'normal' },
    ...targetArea(`& .${P}-field`, { under: true }),
  });
}
