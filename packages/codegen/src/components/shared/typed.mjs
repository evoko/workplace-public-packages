/**
 * What the typed pickers share on the web (DatePicker, TimePicker): a field (`field.mjs`) whose
 * words are a value typed in the locale's way and whose icon opens a panel (owner decision
 * 2026-09-24: typed and picked). In error while focused is Figma's `error-focused`, a compound
 * state (the overlay's `states.compound`); `TYPED_FLUTTER_STATES` is its Flutter side.
 */

import { pascal } from '../../util/naming.mjs';
import { fieldResets, fieldStates } from './field.mjs';
import { targetArea } from './target.mjs';

/**
 * A typed picker's resets: a field's, its words the input, and its icon a button (none of the
 * browser's own look, its size the recipe's) with a 44 × 44 target.
 */
export function typedResets(name, icon) {
  const P = `Solar${pascal(name)}`;
  const button = `& .${P}-${icon}`;
  return fieldResets(name, {
    input: 'value',
    // The target's own rule on the button, merged: one rule per selector.
    more: {
      ...targetArea(button),
      [button]: {
        ...targetArea(button)[button],
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
        flexShrink: '0',
        // Its size is the recipe's, not the icon's own 16px, which a flex item takes as its least.
        minWidth: '0',
        '& > svg': { display: 'block', width: '100%', height: '100%' },
        '&:disabled': { cursor: 'default' },
      },
    },
  });
}

/**
 * A typed picker's state table: a field's, hovered and focused as the field is, filled and in
 * error by the shell's classes; in error while focused, both at once, as Figma's `error-focused`
 * draws it; disabled beats all.
 */
export function typedStates(name) {
  const P = `Solar${pascal(name)}`;
  return {
    ...fieldStates(name, ['filled', 'error']),
    'error-focused': `&.${P}-error:has(.${P}-field.Mui-focused)`,
    disabled: `&.${P}-disabled`,
  };
}

/** The Flutter side of `error-focused`: in error while the field has the focus. */
export const TYPED_FLUTTER_STATES = {
  'error-focused': 'p.error && s.contains(WidgetState.focused)',
};
