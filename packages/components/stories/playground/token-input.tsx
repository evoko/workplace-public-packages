/**
 * Token Input's Playground: its entries the `tokens` extra, one text, comma-separated (each entry
 * trimmed, empty ones dropped), which adding (Enter) and removing an entry (its close button, or
 * Backspace in the empty draft) set; an entry typed with a comma in it is two entries, as the
 * control reads it, so the control and the field always hold the same. Its draft the `draft`
 * extra, which typing sets. How many entries it draws before a Counter counts the rest, the
 * `maxVisible` extra. Its label, helper, size and states from their controls, a cleared label or
 * helper left out, mandatory while `mandatory` holds any text, as Text Input's. It shows Figma's
 * "Add items…" while empty. Unlabelled, it is named "Label".
 */

import { TokenInput, type TokenInputProps } from '../../src/TokenInput.js';
import type { PlaygroundBuilder } from './types.js';

/** The entries a comma-separated text holds, trimmed, the empty ones dropped. */
const entriesOf = (text: string) =>
  text
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

export default {
  render: (p) => {
    const label = p.words('label');
    return (
      <TokenInput
        size={p.choice<NonNullable<TokenInputProps['size']>>('size')}
        disabled={p.flag('disabled')}
        error={p.flag('error')}
        readonly={p.flag('readonly')}
        label={label}
        mandatory={p.words('mandatory') !== undefined}
        helper={p.words('helper')}
        maxVisible={p.whole('maxVisible')}
        placeholder="Add items…"
        value={entriesOf(p.text('tokens'))}
        onChange={(value) => {
          const entries = entriesOf(value.join(','));
          p.set('tokens', entries.join(', '));
          p.log('onChange', entries);
        }}
        inputValue={p.text('draft')}
        onInputChange={(draft) => {
          p.set('draft', draft);
          p.log('onInputChange', draft);
        }}
        inputProps={label ? undefined : { 'aria-label': 'Label' }}
      />
    );
  },
} satisfies PlaygroundBuilder;
