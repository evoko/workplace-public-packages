/**
 * What SOLAR's fields share (Text Input, Text Area and the rest of F5): a drawn component whose
 * field is MUI's InputBase on the web, its words the InputBase's input, with the label above and
 * the helper below drawn beside it. Hovered and focused as the field is; disabled, in error, filled
 * and the rest by the shell's classes, `Solar<Name>-<prop>`.
 */

import { pascal } from '../../util/naming.mjs';
import { drawnResets } from './drawn.mjs';
import { targetArea } from './target.mjs';

/**
 * The resets of a field's recipe: a drawn component's, and the input as the field's words (MUI's
 * own padding, height and placeholder tint give way to the recipe's, and it takes the room its
 * icons leave), a caller's icons filling their slots, the helpers wrapping, and a 44 × 44 target
 * around the field under its words.
 *
 * @param {string} name the component
 * @param {object} o
 * @param {string} o.input the layer that is the input (Text Input's `fieldLabel`)
 * @param {string|null} [o.field] the layer that is the field, `field` by default, or null where
 *   the root is (SearchField)
 * @param {string[]} [o.icons] the icon slots a caller fills
 * @param {string[]} [o.wraps] the texts that wrap onto more lines, `helper` by default
 * @param {object} [o.more] more resets
 */
export function fieldResets(
  name,
  { input, field = 'field', icons = [], wraps = ['helper'], more = {} },
) {
  const P = `Solar${pascal(name)}`;
  return drawnResets(name, {
    // Through MUI's class, as specific as MUI's disabled rule, whose ink it replaces.
    [`& .${P}-${input}.MuiInputBase-input`]: {
      flex: '1 1 0%',
      minWidth: '0',
      width: 'auto',
      height: 'auto',
      padding: '0',
      boxSizing: 'border-box',
      WebkitTextFillColor: 'currentcolor',
      '&::placeholder': { color: 'inherit', opacity: '1' },
    },
    ...(icons.length
      ? {
          [icons.map((i) => `& .${P}-${i} > svg`).join(', ')]: {
            display: 'block',
            width: '100%',
            height: '100%',
          },
        }
      : {}),
    ...(wraps.length
      ? {
          [wraps.map((w) => `& .${P}-${w}`).join(', ')]: {
            whiteSpace: 'normal',
          },
        }
      : {}),
    ...targetArea(field ? `& .${P}-${field}` : '&', { under: true }),
    ...more,
  });
}

/**
 * A field's state table: hovered and focused as the field is (MUI marks the focused InputBase),
 * the root itself where `field` is null (SearchField), and each of `props`, a state value the
 * shell marks with a class, weakest first.
 */
export function fieldStates(name, props, { field = 'field' } = {}) {
  const P = `Solar${pascal(name)}`;
  return {
    default: null,
    hover: field ? `&:has(.${P}-${field}:hover)` : '&:hover',
    focus: field ? `&:has(.${P}-${field}.Mui-focused)` : '&.Mui-focused',
    ...Object.fromEntries(props.map((p) => [p, `&.${P}-${p}`])),
  };
}
