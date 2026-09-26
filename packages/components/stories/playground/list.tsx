/**
 * List's Playground: in a card or not from its control; its items, three sample ListItems with a
 * Divider between each two, shown by the `items` toggle (off, the list is empty). Each row's click
 * is logged with its words; which row is current is the app's, and none is here.
 */

import { List } from '../../src/List.js';
import { ListItem } from '../../src/ListItem.js';
import { rows } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <List inCard={p.flag('inCard')}>
      {p.flag('items')
        ? rows.map((row) => (
            <ListItem key={row} onClick={() => p.log('onClick', row)}>
              {row}
            </ListItem>
          ))
        : null}
    </List>
  ),
} satisfies PlaygroundBuilder;
