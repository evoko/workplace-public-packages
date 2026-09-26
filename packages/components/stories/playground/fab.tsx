/**
 * FAB's Playground: its label makes it an extended FAB; cleared, it is an icon FAB, named "Label".
 * Its icon from its control (the sample, a plus, at first).
 */

import { FAB, type FABProps } from '../../src/FAB.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const label = p.words('label');
    return (
      <FAB
        size={p.choice<NonNullable<FABProps['size']>>('size')}
        disabled={p.flag('disabled')}
        loading={p.flag('loading')}
        icon={p.icon('icon')}
        aria-label={label ? undefined : 'Label'}
        onClick={() => p.log('onClick')}
      >
        {label}
      </FAB>
    );
  },
} satisfies PlaygroundBuilder;
