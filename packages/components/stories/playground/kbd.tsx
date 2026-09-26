/** Kbd's Playground: its type, and its key's label from the `label` extra (Figma's ⌘K at first). */

import { Kbd, type KbdProps } from '../../src/Kbd.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Kbd type={p.choice<NonNullable<KbdProps['type']>>('type')}>
      {p.text('label')}
    </Kbd>
  ),
} satisfies PlaygroundBuilder;
