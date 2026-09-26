/**
 * Text Input's Playground: its words the `value` extra, which typing sets; its label, helper and
 * icons from their controls, a cleared label or helper left out. Figma's `mandatory` is the star's
 * text layer, so the field is mandatory while that control holds any text. Unlabelled, the input is
 * named "Label".
 */

import { TextInput, type TextInputProps } from '../../src/TextInput.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const label = p.words('label');
    return (
      <TextInput
        size={p.choice<NonNullable<TextInputProps['size']>>('size')}
        disabled={p.flag('disabled')}
        error={p.flag('error')}
        label={label}
        mandatory={p.words('mandatory') !== undefined}
        helper={p.words('helper')}
        leadingIcon={p.icon('leadingIcon')}
        trailingIcon={p.icon('trailingIcon')}
        placeholder="Text"
        value={p.text('value')}
        onChange={(event) => {
          p.set('value', event.target.value);
          p.log('onChange', event.target.value);
        }}
        inputProps={label ? undefined : { 'aria-label': 'Label' }}
      />
    );
  },
} satisfies PlaygroundBuilder;
