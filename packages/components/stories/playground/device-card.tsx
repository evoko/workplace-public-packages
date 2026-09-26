/**
 * Device Card's Playground: its words, type and state from their controls, a cleared one left out;
 * its health a Tag of the `tag` extra's words (cleared, none); its action, shown by the `button`
 * toggle, a SOLAR Button, sm and secondary, its click logged with the slot (`onClick: "button"`). A
 * batch's devices, shown by the `devices` toggle, are a SOLAR Dropdown, md, of sample devices:
 * choosing one goes to it, as an app's does, so it is logged and not kept. Pressable, as an app's
 * card is: its press is logged.
 */

import { Button } from '../../src/Button.js';
import { DeviceCard, type DeviceCardProps } from '../../src/DeviceCard.js';
import { Dropdown } from '../../src/Dropdown.js';
import { DropdownItem } from '../../src/DropdownItem.js';
import { options } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const button = p.child('button');
    return (
      <DeviceCard
        loading={p.flag('loading')}
        type={p.choice<NonNullable<DeviceCardProps['type']>>('type')}
        name={p.text('name')}
        details={p.words('details')}
        count={p.words('count')}
        tag={p.words('tag')}
        action={
          button.shown ? (
            <Button
              size="sm"
              prio="secondary"
              onClick={() => p.log('onClick', 'button')}
            >
              {button.text}
            </Button>
          ) : undefined
        }
        devices={
          p.child('devices').shown ? (
            <Dropdown
              size="md"
              placeholder="Devices"
              value=""
              onChange={(_, chosen) => p.log('onChange', chosen)}
              inputProps={{ 'aria-label': 'Devices' }}
            >
              {options.map((option) => (
                <DropdownItem key={option} value={option}>
                  {option}
                </DropdownItem>
              ))}
            </Dropdown>
          ) : undefined
        }
        onClick={() => p.log('onClick')}
      />
    );
  },
} satisfies PlaygroundBuilder;
