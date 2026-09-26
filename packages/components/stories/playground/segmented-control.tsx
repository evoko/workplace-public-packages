/**
 * Segmented Control's Playground: three sample segments of its size, the chosen one the `selected`
 * extra, which choosing a segment sets; its label, helper and size from their controls, a cleared
 * label or helper left out. Figma's `mandatory` is the star's text layer, so the group is mandatory
 * while that control holds any text. The `track` toggle shows the segments, the track's content.
 */

import {
  SegmentedControl,
  type SegmentedControlProps,
} from '../../src/SegmentedControl.js';
import { SegmentedControlItem } from '../../src/SegmentedControlItem.js';
import type { PlaygroundBuilder } from './types.js';

/** The sample segments, the `selected` extra's options (packages/codegen/src/playground/extras.mjs). */
const SEGMENTS = ['Day', 'Week', 'Month'] as const;

export default {
  render: (p) => {
    const size = p.choice<NonNullable<SegmentedControlProps['size']>>('size');
    return (
      <SegmentedControl
        size={size}
        label={p.words('label')}
        mandatory={p.words('mandatory') !== undefined}
        helper={p.words('helper')}
        value={p.choice<(typeof SEGMENTS)[number]>('selected')}
        onChange={(_, value) => {
          p.set('selected', value);
          p.log('onChange', value);
        }}
      >
        {p.flag('track')
          ? SEGMENTS.map((segment) => (
              <SegmentedControlItem key={segment} value={segment} size={size}>
                {segment}
              </SegmentedControlItem>
            ))
          : null}
      </SegmentedControl>
    );
  },
} satisfies PlaygroundBuilder;
