/**
 * PIN Input's Playground: its digits the `value` extra, which typing sets, and its `length` extra (4
 * to 6). The shell takes digits only, as many as the code has, so the builder gives it the digits
 * the control's words hold, up to the length, and writes them back where the words held more (a
 * letter from the panel, or a code longer than a shorter length): the control shows what the cells
 * hold. Every change is logged, and the code once complete. Its label is shown by the `label`
 * toggle, its words the `label text` extra (the IR holds the label as a toggle alone), a cleared one
 * left out; mandatory while `mandatory` holds any text, as Text Input's; its helper, error message
 * (shown in error), size and states from their controls. Unlabelled, it is named "Code".
 */

import { useEffect } from 'react';
import { PINInput, type PINInputProps } from '../../src/PINInput.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function PINInputPlayground({ p }: { p: Playground }) {
  const length = p.whole('length') as NonNullable<PINInputProps['length']>;
  const words = p.text('value');
  const digits = words.replace(/\D/g, '').slice(0, length);
  // The words from the panel, as the cells hold them.
  useEffect(() => {
    if (digits !== words) p.set('value', digits);
  }, [digits, words, p]);
  const text = p.words('label text');
  const label = p.child('label').shown ? text : undefined;
  return (
    <PINInput
      size={p.choice<NonNullable<PINInputProps['size']>>('size')}
      disabled={p.flag('disabled')}
      error={p.flag('error')}
      label={label}
      mandatory={p.words('mandatory') !== undefined}
      helper={p.words('helper')}
      errorMessage={p.words('errorMessage')}
      length={length}
      value={digits}
      onChange={(value) => {
        p.set('value', value);
        p.log('onChange', value);
      }}
      onComplete={(value) => p.log('onComplete', value)}
      inputProps={label ? undefined : { 'aria-label': 'Code' }}
    />
  );
}

export default {
  render: (p) => <PINInputPlayground p={p} />,
} satisfies PlaygroundBuilder;
