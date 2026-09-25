import oracle from '../../../../../spec/verify/device-card.json';
import { Button } from '../../../src/Button.js';
import { DeviceCard, type DeviceCardProps } from '../../../src/DeviceCard.js';
import { Dropdown } from '../../../src/Dropdown.js';
import { DropdownItem } from '../../../src/DropdownItem.js';
import type { VisualCase } from './types.js';

// Figma's words, its "Try again" Button, and a batch's Dropdown, the bare field Figma draws there, pressable so its states are reached as a user reaches them; as wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <DeviceCard
      {...(v.props as Pick<DeviceCardProps, 'type' | 'loading'>)}
      name="Cambridge Qt X"
      details="Sound masking · PL5432109 · Auditorium 100"
      count="3 devices"
      tag="Online"
      action={
        <Button size="sm" prio="secondary">
          Try again
        </Button>
      }
      devices={
        <Dropdown size="md" placeholder="Label">
          <DropdownItem value="one">Option</DropdownItem>
        </Dropdown>
      }
      onClick={() => {}}
      style={{ width: 560 }}
    />
  ),
} satisfies VisualCase;
