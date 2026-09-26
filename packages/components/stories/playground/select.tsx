/**
 * Select's Playground: three sample options, the chosen one the `value` extra (`none`: Figma's
 * placeholder shows; samples.ts), which choosing sets. The IR's `open` is the panel's, two-way: it opens and
 * closes the panel, and the panel's own opening (a click, Enter, the arrow keys) and closing
 * (a choice, Escape, a click outside) set it. Its label, helper, size and states from their
 * controls, a cleared label or helper left out, mandatory while `mandatory` holds any text. The
 * chevron is the shell's own, drawn whatever `trailingIcon` picks (the shell takes no icon).
 */

import { DropdownItem } from '../../src/DropdownItem.js';
import { Select, type SelectProps } from '../../src/Select.js';
import { options } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const value = p.choice('value');
    // Read, though the shell draws its own chevron whatever is picked.
    p.icon('trailingIcon');
    return (
      <Select
        size={p.choice<NonNullable<SelectProps['size']>>('size')}
        disabled={p.flag('disabled')}
        error={p.flag('error')}
        label={p.words('label')}
        mandatory={p.words('mandatory') !== undefined}
        helper={p.words('helper')}
        placeholder="Placeholder"
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
        inputProps={p.words('label') ? undefined : { 'aria-label': 'Label' }}
      >
        {options.map((option) => (
          <DropdownItem key={option} value={option}>
            {option}
          </DropdownItem>
        ))}
      </Select>
    );
  },
} satisfies PlaygroundBuilder;
