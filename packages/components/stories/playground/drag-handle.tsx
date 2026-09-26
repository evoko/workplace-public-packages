/**
 * DragHandle's Playground: its size and disabled from their controls. It does nothing itself (the
 * drag is its list's), so it has no callback to log; hovering, focusing and holding it draw its
 * states.
 */

import { DragHandle, type DragHandleProps } from '../../src/DragHandle.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <DragHandle
      size={p.choice<NonNullable<DragHandleProps['size']>>('size')}
      disabled={p.flag('disabled')}
    />
  ),
} satisfies PlaygroundBuilder;
