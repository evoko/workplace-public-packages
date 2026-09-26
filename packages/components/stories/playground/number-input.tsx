/**
 * Number Input's Playground: its number the `value` extra, as words, so that an empty field (the
 * shell's null) is '' and the control holds what the field holds: typing or a step sets it to the
 * number's words, and words from the panel that are no number give an empty field. Its range the
 * `min` and `max` extras, to which its steppers clamp it (typing is not clamped: validating is the
 * app's, on blur). Its label is shown by the `label` toggle, its words the `label text` extra (the
 * IR holds the label as a toggle alone), a cleared one left out; mandatory while `mandatory` holds
 * any text, as Text Input's; its helper, size, stepper and states from their controls. Unlabelled,
 * it is named "Quantity".
 */

import { NumberInput, type NumberInputProps } from '../../src/NumberInput.js';
import type { PlaygroundBuilder } from './types.js';

/** The control's words as the number they say, or null where they say none. */
const numberOf = (words: string) => {
  const n = words.trim() === '' ? null : Number(words);
  return n !== null && Number.isFinite(n) ? n : null;
};

export default {
  render: (p) => {
    const words = p.words('label text');
    const label = p.child('label').shown ? words : undefined;
    return (
      <NumberInput
        size={p.choice<NonNullable<NumberInputProps['size']>>('size')}
        disabled={p.flag('disabled')}
        error={p.flag('error')}
        stepper={p.choice<NonNullable<NumberInputProps['stepper']>>('stepper')}
        label={label}
        mandatory={p.words('mandatory') !== undefined}
        helper={p.words('helper')}
        min={p.whole('min')}
        max={p.whole('max')}
        value={numberOf(p.text('value'))}
        onChange={(value) => {
          p.set('value', value === null ? '' : String(value));
          p.log('onChange', value);
        }}
        inputProps={label ? undefined : { 'aria-label': 'Quantity' }}
      />
    );
  },
} satisfies PlaygroundBuilder;
