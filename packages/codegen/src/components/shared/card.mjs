/**
 * What SOLAR's cards share on the web: the resets and state selectors of their drawn layers, a card
 * hovered and focused only where it is pressable (its title stretched over it, owner decision
 * 2026-09-25). Their shells are files of their own.
 */

import { pascal } from '../../util/naming.mjs';
import { drawnResets } from './drawn.mjs';
import { targetArea } from './target.mjs';

/**
 * What a card's elements need beyond the recipe: a block, its words wrapping, its title the
 * stretched action where it has one, and its More button with a 44 × 44 target.
 *
 * @param {string} name the component
 * @param {object} o
 * @param {string[]} [o.wrap] the text layers that wrap (a title, a description)
 * @param {string} [o.more] the More glyph's layer
 * @param {string[]} [o.icons] the icon slots' layers, whose icon fills them
 * @param {string[]} [o.fixed] the boxes Figma fixes, which never shrink beside long words
 * @param {object} [o.extra] more resets
 */
export function cardResets(
  name,
  { wrap = [], more, icons = [], fixed = [], extra = {} } = {},
) {
  const P = `Solar${pascal(name)}`;
  const all = (layers, tail = '') =>
    layers.map((l) => `& .${P}-${l}${tail}`).join(', ');
  return drawnResets(name, {
    display: 'flex',
    ...(wrap.length
      ? { [all(wrap)]: { whiteSpace: 'normal', minWidth: '0' } }
      : {}),
    ...(icons.length
      ? {
          [all(icons)]: { flexShrink: '0' },
          [all(icons, ' > svg')]: {
            display: 'block',
            width: '100%',
            height: '100%',
          },
        }
      : {}),
    // The title is the card's action where it has one: a bare button or link, whose hit area (its
    // ::after) is the whole card, from the card's own box (MUI's ButtonBase is positioned, which
    // it no longer is).
    [`& .${P}-press`]: {
      position: 'static',
      display: 'inline',
      padding: '0',
      margin: '0',
      font: 'inherit',
      color: 'inherit',
      textAlign: 'start',
      textDecoration: 'none',
      verticalAlign: 'baseline',
    },
    [`& .${P}-press::after`]: {
      content: '""',
      position: 'absolute',
      inset: '0',
      borderRadius: 'inherit',
    },
    // The card's own controls sit above the stretched action, as later positioned boxes do, so
    // each is its own target.
    [`& .${P}-box :is(a, button, input, select, textarea, [tabindex]):not(.${P}-press)`]:
      { position: 'relative' },
    // A name read and never seen: the loading action's, a colour's (Insight Row's severity bar).
    [`& .${P}-name`]: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      clipPath: 'inset(50%)',
      whiteSpace: 'nowrap',
    },
    // What Figma fixes never gives way to the words beside it (a severity's tile).
    ...(fixed.length ? { [all(fixed)]: { flexShrink: '0' } } : {}),
    ...(more
      ? (() => {
          // The More menu's button draws its icon, with a 44 × 44 target (shared/target.mjs).
          const at = `& .${P}-${more}`;
          const target = targetArea(at);
          return {
            ...target,
            [at]: {
              ...target[at],
              flexShrink: '0',
              padding: '0',
              color: 'inherit',
            },
            [`${at} > svg`]: {
              display: 'block',
              width: '100%',
              height: '100%',
            },
          };
        })()
      : {}),
    ...extra,
  });
}

/**
 * A card's states: hovered and focused only where it is pressable, as Card's description says
 * ("clickable gates interaction-state visibility and the focus ring"): the pointer over it, the
 * keyboard on its title (MUI marks it focus-visible). Selected and disabled by the shell's classes.
 */
export function cardStates(name, { selected = false, loading = false } = {}) {
  const P = `Solar${pascal(name)}`;
  return {
    default: null,
    hover: `&.${P}-pressable:hover`,
    focus: `&:has(.${P}-press.Mui-focusVisible)`,
    ...(selected ? { selected: `&.${P}-selected` } : {}),
    // Loading, where Figma draws it as a state (Device Card's), by the shell's class.
    ...(loading ? { loading: `&.${P}-loading` } : {}),
    disabled: `&.${P}-disabled`,
  };
}
