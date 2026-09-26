/**
 * BackButton's Playground: its label where it holds words ("Back", or a destination); cleared, the
 * arrow alone, which the shell names "Back".
 */

import { BackButton, type BackButtonProps } from '../../src/BackButton.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <BackButton
      size={p.choice<NonNullable<BackButtonProps['size']>>('size')}
      disabled={p.flag('disabled')}
      loading={p.flag('loading')}
      onClick={() => p.log('onClick')}
    >
      {p.words('label') ?? null}
    </BackButton>
  ),
} satisfies PlaygroundBuilder;
