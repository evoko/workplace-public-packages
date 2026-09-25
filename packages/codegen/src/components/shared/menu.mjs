/**
 * What the menus share (Dropdown Menu, Context Menu): the tallest a menu grows before its
 * rows scroll, and the resets of the list that holds them.
 *
 * ⚠️ Governance gap: `MENU_MAX_HEIGHT` is the one raw menu height in the web recipes, here, as
 * Dropdown Menu's description asks ("caps height at ~300px with internal scroll") and SOLAR
 * publishes no variable for it (owner decision 2026-09-24: cap at 300, flagged). `solar_flutter`'s
 * `solarMenuMaxHeight` is its Flutter twin. The design review asks for a variable.
 */

import { pascal } from '../../util/naming.mjs';

export const MENU_MAX_HEIGHT = '300px';

/**
 * A menu's resets beyond the drawn ones: its list (MUI's MenuList, the content layer) has none of
 * its own padding, focus outline or list style, and scrolls past MENU_MAX_HEIGHT, the surface
 * keeping its edge around it. A row spans the menu.
 */
export const menuResets = (name) => {
  const P = `Solar${pascal(name)}`;
  return {
    maxHeight: MENU_MAX_HEIGHT,
    [`& .${P}-content`]: {
      margin: '0',
      padding: '0',
      listStyle: 'none',
      outline: 'none',
      overflowY: 'auto',
      minHeight: '0',
    },
    [`& .${P}-content > *`]: { width: '100%' },
  };
};
