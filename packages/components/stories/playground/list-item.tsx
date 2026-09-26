/**
 * ListItem's Playground: its words the `label` extra; its second line, icon, trailing icon and
 * states from their controls, a cleared second line left out. The `avatar` toggle gives it a sample
 * SOLAR Avatar (Dana Scully's initials) in place of its icon, which makes it an avatar row. A
 * click chooses it, as a list's row is chosen: it is logged, and sets `selected`. Disabled, it is
 * inert. It is drawn alone, not in a List, since a List gives its rows its own compactness, which
 * would override the `compact` control.
 */

import { Avatar } from '../../src/Avatar.js';
import { ListItem } from '../../src/ListItem.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const label = p.text('label');
    return (
      <ListItem
        selected={p.flag('selected')}
        disabled={p.flag('disabled')}
        compact={p.flag('compact')}
        icon={p.icon('icon')}
        avatar={
          p.child('avatar').shown ? <Avatar name="Dana Scully" /> : undefined
        }
        helper={p.words('helper')}
        trailing={p.icon('trailing')}
        onClick={() => {
          p.set('selected', true);
          p.log('onClick', label);
        }}
      >
        {label}
      </ListItem>
    );
  },
} satisfies PlaygroundBuilder;
