/**
 * PropertyRow's Playground: a row is drawn in its PropertyList, which gives it its in-card look, so
 * the row's `inCard` control is the list's. Its leading icon, words and description from their
 * controls, a cleared description left out. Its control is shown while `trailing` and the control's
 * own toggle are on, the first of the shown ones in the shell's order deciding its trailing (button,
 * toggle, select, icon button, segmented control, tag), each a sample as Figma draws it: an md
 * secondary Button, a Toggle, an md Select of the sample options, an md secondary Icon Button, an md
 * Segmented Control, a neutral Tag. Their values are the entity's, which the Playground holds none
 * of: a press, a switch and a choice are logged, and kept by none.
 */

import { IconMore } from '@bwp-web/assets';
import { Button } from '../../src/Button.js';
import { DropdownItem } from '../../src/DropdownItem.js';
import { IconButton } from '../../src/IconButton.js';
import { PropertyList } from '../../src/PropertyList.js';
import { PropertyRow } from '../../src/PropertyRow.js';
import { SegmentedControl } from '../../src/SegmentedControl.js';
import { SegmentedControlItem } from '../../src/SegmentedControlItem.js';
import { Select } from '../../src/Select.js';
import { Tag } from '../../src/Tag.js';
import { Toggle } from '../../src/Toggle.js';
import { options } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

const SEGMENTS = ['Day', 'Week', 'Month'];

export default {
  render: (p) => {
    const trailing = p.child('trailing').shown;
    const on = (slot: string) => p.child(slot).shown && trailing;
    const button = on('button');
    const toggle = on('toggle');
    const select = on('select');
    const iconButton = on('iconButton');
    const segmentedControl = on('segmentedControl');
    const tag = on('tag');
    return (
      <PropertyList inCard={p.flag('inCard')}>
        <PropertyRow
          leading={p.icon('leading')}
          description={p.words('description')}
          button={
            button ? (
              <Button
                size="md"
                prio="secondary"
                onClick={() => p.log('onClick')}
              >
                Button
              </Button>
            ) : undefined
          }
          toggle={
            toggle ? (
              <Toggle
                selected={false}
                onChange={(_, value) => p.log('onChange', value)}
                slotProps={{ input: { 'aria-label': 'On' } }}
              />
            ) : undefined
          }
          select={
            select ? (
              <Select
                size="md"
                placeholder="Select…"
                value=""
                onChange={(_, chosen) => p.log('onChange', chosen)}
                inputProps={{ 'aria-label': 'Label' }}
              >
                {options.map((option) => (
                  <DropdownItem key={option} value={option}>
                    {option}
                  </DropdownItem>
                ))}
              </Select>
            ) : undefined
          }
          iconButton={
            iconButton ? (
              <IconButton
                size="md"
                shape="square"
                prio="secondary"
                icon={<IconMore />}
                aria-label="More"
                onClick={() => p.log('onClick')}
              />
            ) : undefined
          }
          segmentedControl={
            segmentedControl ? (
              <SegmentedControl
                size="md"
                value="Day"
                onChange={(_, value) => p.log('onChange', value)}
              >
                {SEGMENTS.map((s) => (
                  <SegmentedControlItem key={s} value={s} size="md">
                    {s}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            ) : undefined
          }
          tag={tag ? <Tag status="neutral">Label</Tag> : undefined}
        >
          {p.text('label')}
        </PropertyRow>
      </PropertyList>
    );
  },
} satisfies PlaygroundBuilder;
