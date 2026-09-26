/**
 * Radio's Playground: a radio alone is a bug, SOLAR says, so it is drawn as an app draws it, one of
 * a RadioGroup of three, each labelled. The group decides which is checked: the `selected` extra
 * names it, and the IR's `checked` says whether the group holds a choice at all (off: none is
 * checked). Clicking a radio or its words chooses it, which both follow. `disabled` disables every
 * radio, so a disabled radio shows checked and unchecked.
 *
 * Each is a <label> around the radio and its words, the radio in a box of SOLAR's target size, the
 * room Flutter's radio takes (SolarTarget), as the README says to label one: the shell's 44 × 44
 * native input overflows its 18px ring, so radios stacked closer (MUI's FormControlLabel rows are
 * 20 tall) would overlap each other's targets.
 */

import RadioGroup from '@mui/material/RadioGroup';
import { Radio } from '../../src/Radio.js';
import type { PlaygroundBuilder } from './types.js';

/** The sample choices, the `selected` extra's options (packages/codegen/src/playground/extras.mjs). */
const OPTIONS = ['Option 1', 'Option 2', 'Option 3'] as const;
type Option = (typeof OPTIONS)[number];

const row = { display: 'flex', alignItems: 'center' };
const target = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'var(--solar-size-target-min)',
  height: 'var(--solar-size-target-min)',
};

export default {
  render: (p) => {
    const disabled = p.flag('disabled');
    const checked = p.flag('checked');
    const selected = p.choice<Option>('selected');
    return (
      <RadioGroup
        name="playground-radio"
        aria-label="Options"
        value={checked ? selected : null}
        onChange={(_, value) => {
          p.set('selected', value);
          p.set('checked', true);
          p.log('onChange', value);
        }}
      >
        {OPTIONS.map((option) => (
          <label key={option} style={row}>
            <span style={target}>
              <Radio value={option} disabled={disabled} />
            </span>
            {option}
          </label>
        ))}
      </RadioGroup>
    );
  },
} satisfies PlaygroundBuilder;
