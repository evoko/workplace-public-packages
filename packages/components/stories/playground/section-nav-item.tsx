/**
 * Section Nav Item's Playground: its words, icon and state from their controls. Choosing it makes it
 * the current page, as a section nav rail does: a click sets `selected`, and is logged. A disabled
 * one stays inert.
 */

import { SectionNavItem } from '../../src/SectionNavItem.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <SectionNavItem
      selected={p.flag('selected')}
      disabled={p.flag('disabled')}
      label={p.text('label')}
      icon={p.icon('icon')}
      onClick={() => {
        p.set('selected', true);
        p.log('onClick');
      }}
    />
  ),
} satisfies PlaygroundBuilder;
