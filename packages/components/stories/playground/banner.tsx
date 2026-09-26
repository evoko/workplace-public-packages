/**
 * Banner's Playground: its type, message and text action from their controls; its Buttons, SOLAR
 * Buttons at sm (primary, secondary), shown by their toggles with their words; a close button while
 * the `close` icon control shows one (the shell draws SOLAR's close icon, whichever is picked).
 * Every click is logged: a Button's with its slot, the text action's, the close button's. It fills
 * its container, the width box.
 */

import { Banner, type BannerProps } from '../../src/Banner.js';
import { Button, type ButtonProps } from '../../src/Button.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const button = (slot: string, prio: NonNullable<ButtonProps['prio']>) => {
      const { shown, text } = p.child(slot);
      return shown ? (
        <Button
          size="sm"
          prio={prio}
          aria-label={text ? undefined : 'Label'}
          onClick={() => p.log('onClick', slot)}
        >
          {text || undefined}
        </Button>
      ) : undefined;
    };
    return (
      <Banner
        type={p.choice<NonNullable<BannerProps['type']>>('type')}
        description={p.text('description')}
        primaryButton={button('primaryButton', 'primary')}
        secondaryButton={button('secondaryButton', 'secondary')}
        action={p.words('action')}
        onAction={() => p.log('onAction')}
        onClose={p.icon('close') ? () => p.log('onClose') : undefined}
      />
    );
  },
} satisfies PlaygroundBuilder;
