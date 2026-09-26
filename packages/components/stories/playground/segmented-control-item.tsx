/**
 * Segmented Control Item's Playground: a segment works only in its control, so it is drawn first of
 * three in a Segmented Control of its size, its two sample siblings after it. Its words are the
 * `label` extra, its icons and size from their controls. The control decides which is chosen:
 * `selected` on chooses this segment, off the sibling chosen last (the first sibling at first).
 * Choosing a segment sets `selected`, as a click on this one or a sibling makes it true or false.
 */

import { useState } from 'react';
import { SegmentedControl } from '../../src/SegmentedControl.js';
import {
  SegmentedControlItem,
  type SegmentedControlItemProps,
} from '../../src/SegmentedControlItem.js';
import type { Playground, PlaygroundBuilder } from './types.js';

/** This segment's value, and its sample siblings', which are their words too. */
const ITEM = 'Day';
const SIBLINGS = ['Week', 'Month'];

function SegmentedControlItemPlayground({ p }: { p: Playground }) {
  const [sibling, setSibling] = useState(SIBLINGS[0]);
  const selected = p.flag('selected');
  const size = p.choice<NonNullable<SegmentedControlItemProps['size']>>('size');
  return (
    <SegmentedControl
      size={size}
      value={selected ? ITEM : sibling}
      onChange={(_, value) => {
        if (value !== ITEM) setSibling(value);
        p.set('selected', value === ITEM);
        p.log('onChange', value);
      }}
    >
      <SegmentedControlItem
        value={ITEM}
        size={size}
        iconLeading={p.icon('iconLeading')}
        iconTrailing={p.icon('iconTrailing')}
      >
        {p.text('label')}
      </SegmentedControlItem>
      {SIBLINGS.map((s) => (
        <SegmentedControlItem key={s} value={s} size={size}>
          {s}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}

export default {
  render: (p) => <SegmentedControlItemPlayground p={p} />,
} satisfies PlaygroundBuilder;
