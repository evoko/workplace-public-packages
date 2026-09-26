/**
 * SplitButton's Playground: the action's label from its control; the chevron opens the shell's own
 * menu of three sample variants, and choosing one closes it. The action, the menu opening and the
 * variant chosen are each logged.
 */

import { SplitButton, type SplitButtonProps } from '../../src/SplitButton.js';
import type { PlaygroundBuilder } from './types.js';

/** The action's sample variants. */
const VARIANTS = ['Option 1', 'Option 2', 'Option 3'];

export default {
  render: (p) => (
    <SplitButton
      prio={p.choice<NonNullable<SplitButtonProps['prio']>>('prio')}
      size={p.choice<NonNullable<SplitButtonProps['size']>>('size')}
      disabled={p.flag('disabled')}
      loading={p.flag('loading')}
      onClick={() => p.log('onClick')}
      onMenuOpen={() => p.log('onMenuOpen')}
      items={VARIANTS.map((label) => ({
        label,
        onSelect: () => p.log('onSelect', label),
      }))}
    >
      {p.text('label')}
    </SplitButton>
  ),
} satisfies PlaygroundBuilder;
