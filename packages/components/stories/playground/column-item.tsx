/**
 * Column Item's Playground: a cell is drawn in its Row, in a Table: a header in the header row, a
 * data cell in a row. What it holds decides its type, as the shell derives it, the first of its
 * shown parts in the shell's order (avatar, tag, icon, text input, dropdown, button, toggle), else
 * its words; its words the `name` control (Figma's user's name). Its parts are samples: an sm
 * Avatar named by the words, an "Online" Tag, the icon its control picks, an sm Text Input, an sm
 * Dropdown of the sample options, an sm secondary Button, a Toggle. Their values are the row's data,
 * which the Playground holds none of: a choice, a press and a switch are logged, and kept by none.
 * A header sorts: its press is logged.
 */

import { Avatar } from '../../src/Avatar.js';
import { Button } from '../../src/Button.js';
import { ColumnItem } from '../../src/ColumnItem.js';
import { Dropdown } from '../../src/Dropdown.js';
import { DropdownItem } from '../../src/DropdownItem.js';
import { Row } from '../../src/Row.js';
import { Table } from '../../src/Table.js';
import { Tag } from '../../src/Tag.js';
import { TextInput } from '../../src/TextInput.js';
import { Toggle } from '../../src/Toggle.js';
import { options } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const header = p.flag('header');
    const name = p.text('name');
    const shown = (slot: string) => p.child(slot).shown;
    const avatar = shown('avatar');
    const tag = shown('tag');
    const icon = p.icon('icon');
    const textInput = shown('textInput');
    const dropdown = shown('dropdown');
    const button = shown('button');
    const toggle = shown('toggle');
    const item = (
      <ColumnItem
        header={header}
        avatar={
          avatar ? <Avatar size="sm" type="text" name={name} /> : undefined
        }
        tag={tag ? <Tag status="success">Online</Tag> : undefined}
        icon={icon}
        textInput={
          textInput ? (
            <TextInput size="sm" placeholder="Text" aria-label="Text" />
          ) : undefined
        }
        dropdown={
          dropdown ? (
            <Dropdown
              size="sm"
              placeholder="Label"
              value=""
              onChange={(_, chosen) => p.log('onChange', chosen)}
              inputProps={{ 'aria-label': 'Label' }}
            >
              {options.map((option) => (
                <DropdownItem key={option} value={option}>
                  {option}
                </DropdownItem>
              ))}
            </Dropdown>
          ) : undefined
        }
        button={
          button ? (
            <Button size="sm" prio="secondary" onClick={() => p.log('onClick')}>
              Button
            </Button>
          ) : undefined
        }
        toggle={
          toggle ? (
            <Toggle
              selected={false}
              onChange={(_, on) => p.log('onChange', on)}
              slotProps={{ input: { 'aria-label': 'On' } }}
            />
          ) : undefined
        }
        onSort={header ? () => p.log('onSort') : undefined}
      >
        {name}
      </ColumnItem>
    );
    return header ? (
      <Table header={<Row type="title">{item}</Row>} />
    ) : (
      <Table>
        <Row>{item}</Row>
      </Table>
    );
  },
} satisfies PlaygroundBuilder;
