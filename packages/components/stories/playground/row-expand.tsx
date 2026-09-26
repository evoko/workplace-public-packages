/**
 * RowExpand's Playground: its type (a collapsed or expanded parent row's chevron, or a child row's
 * connector), and whether a collapsed or expanded cell draws its chevron (the `chevron` extra).
 * Decorative on its own: a Row draws it as its expand button, so it is drawn here as it is, the
 * expansion the `type` control's.
 */

import { RowExpand, type RowExpandProps } from '../../src/RowExpand.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <RowExpand
      type={p.choice<NonNullable<RowExpandProps['type']>>('type')}
      chevron={p.flag('chevron')}
    />
  ),
} satisfies PlaygroundBuilder;
