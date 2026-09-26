/**
 * Icon Button's Playground: a toggle icon button, as a toolbar option is: a click switches it on or
 * off, which the `active` control follows. Its icon from its control (the sample, a plus, at
 * first); named "Label", since an icon alone is no name.
 */

import { IconButton, type IconButtonProps } from '../../src/IconButton.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const active = p.flag('active');
    return (
      <IconButton
        size={p.choice<NonNullable<IconButtonProps['size']>>('size')}
        shape={p.choice<NonNullable<IconButtonProps['shape']>>('shape')}
        prio={p.choice<NonNullable<IconButtonProps['prio']>>('prio')}
        disabled={p.flag('disabled')}
        loading={p.flag('loading')}
        active={active}
        icon={p.icon('icon')}
        aria-label="Label"
        onClick={() => {
          p.set('active', !active);
          p.log('onClick');
        }}
      />
    );
  },
} satisfies PlaygroundBuilder;
