/**
 * Inline Input's Playground: its value the IR's `value` control, which a confirmed edit sets; its
 * states from their controls. It holds its own mode and draft, as the shell does: a click or its
 * edit button opens it (the shell gives no callback for that, so nothing is logged), Enter or
 * Confirm commits the draft (logged, and set), Esc or Cancel discards it (logged). Every value is
 * accepted. It is named "Value" (the input, and the edit button's "Edit Value").
 */

import { InlineInput } from '../../src/InlineInput.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <InlineInput
      error={p.flag('error')}
      disabled={p.flag('disabled')}
      value={p.text('value')}
      label="Value"
      onConfirm={(value) => {
        p.set('value', value);
        p.log('onConfirm', value);
      }}
      onCancel={() => p.log('onCancel')}
    />
  ),
} satisfies PlaygroundBuilder;
