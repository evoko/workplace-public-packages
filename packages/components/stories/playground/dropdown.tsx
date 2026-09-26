/**
 * Dropdown's Playground: three sample options (samples.ts), the chosen one the `value` extra
 * (`none`: Figma's "Text" shows), which choosing sets. The IR's `open` is the panel's, two-way, as
 * Select's: it opens and closes the panel, and the panel's own opening and closing set it. Its
 * label is shown by the `label` toggle, in the `label text` extra's words; its helper, icons, size
 * and states from their controls, a cleared helper left out, mandatory while `mandatory` holds any
 * text. Unlabelled, it is named "Label".
 */

import { DropdownItem } from '../../src/DropdownItem.js';
import { Dropdown, type DropdownProps } from '../../src/Dropdown.js';
import { options } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const value = p.choice('value');
    const label = p.flag('label') ? p.text('label text') : undefined;
    return (
      <Dropdown
        size={p.choice<NonNullable<DropdownProps['size']>>('size')}
        disabled={p.flag('disabled')}
        error={p.flag('error')}
        label={label || undefined}
        mandatory={p.words('mandatory') !== undefined}
        helper={p.words('helper')}
        leadingIcon={p.icon('leadingIcon')}
        trailingIcon={p.icon('trailingIcon')}
        placeholder="Text"
        value={value === 'none' ? '' : value}
        onChange={(_, chosen) => {
          p.set('value', chosen || 'none');
          p.log('onChange', chosen);
        }}
        open={p.flag('open')}
        onOpen={() => {
          p.set('open', true);
          p.log('onOpen');
        }}
        onClose={() => {
          p.set('open', false);
          p.log('onClose');
        }}
        inputProps={label ? undefined : { 'aria-label': 'Label' }}
      >
        {options.map((option) => (
          <DropdownItem key={option} value={option}>
            {option}
          </DropdownItem>
        ))}
      </Dropdown>
    );
  },
} satisfies PlaygroundBuilder;
