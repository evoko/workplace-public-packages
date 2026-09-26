/**
 * Option Row's Playground: its control from `control`, on while the `checked` extra holds, which a
 * click on the row sets, and disabled while `disabled` does; its words the `label` extra, its
 * second line from `supportingText`, a cleared one left out. A radio works only in its group, so
 * a radio row is drawn in a RadioGroup of its own, checked where the group holds it; a click
 * checks it, and nothing unchecks it but the control, as a radio.
 */

import RadioGroup from '@mui/material/RadioGroup';
import { OptionRow, type OptionRowProps } from '../../src/OptionRow.js';
import type { PlaygroundBuilder } from './types.js';

/** The row's value in its group, a radio's. */
const VALUE = 'option';

export default {
  render: (p) => {
    const control = p.choice<NonNullable<OptionRowProps['control']>>('control');
    const checked = p.flag('checked');
    const row = (
      <OptionRow
        control={control}
        value={VALUE}
        checked={control === 'radio' ? undefined : checked}
        disabled={p.flag('disabled')}
        supportingText={p.words('supportingText')}
        // A radio's group hears its click (below), not the row.
        onChange={
          control === 'radio'
            ? undefined
            : (_, on) => {
                p.set('checked', on);
                p.log('onChange', on);
              }
        }
      >
        {p.text('label')}
      </OptionRow>
    );
    return control === 'radio' ? (
      <RadioGroup
        name="playground-option-row"
        value={checked ? VALUE : null}
        onChange={() => {
          p.set('checked', true);
          p.log('onChange', true);
        }}
      >
        {row}
      </RadioGroup>
    ) : (
      row
    );
  },
} satisfies PlaygroundBuilder;
