import oracle from '../../../../../spec/verify/propertyrow.json';
import { Button } from '../../../src/Button.js';
import { DropdownItem } from '../../../src/DropdownItem.js';
import { IconButton } from '../../../src/IconButton.js';
import {
  PropertyRow,
  type PropertyRowProps,
} from '../../../src/PropertyRow.js';
import { Select } from '../../../src/Select.js';
import { Tag } from '../../../src/Tag.js';
import { Toggle } from '../../../src/Toggle.js';
import { segmentedControlMd } from './controls.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

/**
 * A row given the control its trailing names, as Figma draws each, with a leading icon probe, its
 * words and a description; shared with the PropertyList case.
 */
export const propertyRow = (
  trailing: string,
  props: Pick<PropertyRowProps, 'inCard'> & { 'data-layer'?: string } = {},
) => (
  <PropertyRow
    {...props}
    leading={icon}
    description="Description text"
    button={
      trailing === 'action' ? (
        <Button size="md" prio="secondary">
          Button
        </Button>
      ) : undefined
    }
    toggle={
      trailing === 'toggle' ? (
        <Toggle selected={false} onChange={() => {}} aria-label="On" />
      ) : undefined
    }
    select={
      trailing === 'select' ? (
        <Select size="md" placeholder="Select…" aria-label="Choice">
          <DropdownItem value="one">Option</DropdownItem>
        </Select>
      ) : undefined
    }
    iconButton={
      trailing === 'icon-button' ? (
        <IconButton
          icon={icon}
          aria-label="Action"
          size="md"
          prio="secondary"
        />
      ) : undefined
    }
    segmentedControl={
      trailing === 'segmented-control' ? segmentedControlMd() : undefined
    }
    tag={trailing === 'tag' ? <Tag status="neutral">Label</Tag> : undefined}
  >
    Label
  </PropertyRow>
);

// Each trailing with the control Figma draws in it, in a card and not.
export default {
  oracle,
  render: (v) => {
    const trailing = /trailing=([a-z-]+)/.exec(v.figma)![1]!;
    return propertyRow(trailing, v.props as Pick<PropertyRowProps, 'inCard'>);
  },
} satisfies VisualCase;
