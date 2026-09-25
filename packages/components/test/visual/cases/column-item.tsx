import oracle from '../../../../../spec/verify/column-item.json';
import { Avatar } from '../../../src/Avatar.js';
import { Button } from '../../../src/Button.js';
import { ColumnItem, type ColumnItemProps } from '../../../src/ColumnItem.js';
import { Dropdown } from '../../../src/Dropdown.js';
import { DropdownItem } from '../../../src/DropdownItem.js';
import { Tag, type TagProps } from '../../../src/Tag.js';
import { TextInput } from '../../../src/TextInput.js';
import { Toggle } from '../../../src/Toggle.js';
import { icon } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { variant?: Record<string, string | undefined> };

/** The variant Figma draws a composed child in, at a layer. */
const variantOf = (v: OracleVariant, layer: string) =>
  (v.layers?.[layer] as ChildLayer | undefined)?.variant ?? {};

// Each type with what Figma draws in it (the oracle's content): the words, a user's Avatar and
// name, a status Tag, an icon probe, a bare sm Text Input and Dropdown, an sm secondary Button, a
// Toggle off.
export default {
  oracle,
  render: (v) => {
    const props = v.props as Pick<ColumnItemProps, 'header'>;
    const has = (slot: string) => v.content?.includes(slot) ?? false;
    const tag = variantOf(v, 'tag');
    return (
      <ColumnItem
        {...props}
        avatar={
          has('avatar') ? (
            <Avatar size="sm" type="text" name="Daniel Salmonsson" />
          ) : undefined
        }
        tag={
          has('tag') ? (
            <Tag status={tag.status as TagProps['status']}>Label</Tag>
          ) : undefined
        }
        icon={has('icon') ? icon : undefined}
        textInput={
          has('textInput') ? (
            <TextInput size="sm" placeholder="Text" aria-label="Text" />
          ) : undefined
        }
        dropdown={
          has('dropdown') ? (
            <Dropdown size="sm" placeholder="Label" aria-label="Label">
              <DropdownItem value="one">Option</DropdownItem>
            </Dropdown>
          ) : undefined
        }
        button={
          has('button') ? (
            <Button size="sm" prio="secondary">
              Button
            </Button>
          ) : undefined
        }
        toggle={
          has('toggle') ? (
            <Toggle selected={false} onChange={() => {}} aria-label="On" />
          ) : undefined
        }
      >
        {has('avatar') ? 'Daniel Salmonsson' : 'Label'}
      </ColumnItem>
    );
  },
} satisfies VisualCase;
