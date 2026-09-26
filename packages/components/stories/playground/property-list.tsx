/**
 * PropertyList's Playground: in a card or not from its control; its items, three sample
 * PropertyRows (a status Tag, a setting's Toggle, an action's Button), shown by the `items` toggle
 * (off, the list is empty). Their values are the entity's, which the Playground holds none of: a
 * switch and a press are logged, and kept by none.
 */

import { Button } from '../../src/Button.js';
import { PropertyList } from '../../src/PropertyList.js';
import { PropertyRow } from '../../src/PropertyRow.js';
import { Tag } from '../../src/Tag.js';
import { Toggle } from '../../src/Toggle.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <PropertyList inCard={p.flag('inCard')}>
      {p.flag('items')
        ? [
            <PropertyRow key="status" tag={<Tag status="success">Online</Tag>}>
              Status
            </PropertyRow>,
            <PropertyRow
              key="alerts"
              description="Email me when it goes offline"
              toggle={
                <Toggle
                  selected={false}
                  onChange={(_, on) => p.log('onChange', on)}
                  slotProps={{ input: { 'aria-label': 'Alerts' } }}
                />
              }
            >
              Alerts
            </PropertyRow>,
            <PropertyRow
              key="firmware"
              description="Version 2.4.1"
              button={
                <Button
                  size="md"
                  prio="secondary"
                  onClick={() => p.log('onClick', 'Update')}
                >
                  Update
                </Button>
              }
            >
              Firmware
            </PropertyRow>,
          ]
        : null}
    </PropertyList>
  ),
} satisfies PlaygroundBuilder;
