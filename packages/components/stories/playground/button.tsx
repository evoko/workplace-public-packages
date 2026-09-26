/**
 * Button's Playground: its label as its words (cleared, an icon-only button named "Label"), its
 * icons, and its counter, a SOLAR Counter showing the `counter count` extra, which takes the type
 * the Button's recipe composes from the Button itself.
 */

import { Button, type ButtonProps } from '../../src/Button.js';
import { Counter } from '../../src/Counter.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const props = {
      size: p.choice<NonNullable<ButtonProps['size']>>('size'),
      prio: p.choice<NonNullable<ButtonProps['prio']>>('prio'),
      disabled: p.flag('disabled'),
      loading: p.flag('loading'),
      danger: p.flag('danger'),
    };
    const label = p.words('label');
    const counter = p.child('counter');
    const count = p.whole('counter count');
    return (
      <Button
        {...props}
        iconLeading={p.icon('iconLeading')}
        iconTrailing={p.icon('iconTrailing')}
        counter={counter.shown ? <Counter count={count} /> : undefined}
        aria-label={label ? undefined : 'Label'}
        onClick={() => p.log('onClick')}
      >
        {label}
      </Button>
    );
  },
} satisfies PlaygroundBuilder;
