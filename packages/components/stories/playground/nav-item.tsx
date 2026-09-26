/**
 * Nav Item's Playground: its words, icon and state from their controls. Choosing it makes it the
 * current page, as an app's sidebar does: a click sets `selected`, and is logged.
 */

import { NavItem } from '../../src/NavItem.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <NavItem
      selected={p.flag('selected')}
      expanded={p.flag('expanded')}
      label={p.text('label')}
      iconOutline={p.icon('iconOutline')}
      onClick={() => {
        p.set('selected', true);
        p.log('onClick');
      }}
    />
  ),
} satisfies PlaygroundBuilder;
