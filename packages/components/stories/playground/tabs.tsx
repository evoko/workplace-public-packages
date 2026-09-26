/**
 * Tabs' Playground: a strip of three sample tabs (Overview, Activity, Settings) of its size, shown
 * by the `tabs` toggle (off, an empty strip). Which is selected is the `selected` extra, which
 * choosing a tab sets, as the arrow keys and Enter do.
 */

import { TabItem } from '../../src/TabItem.js';
import { Tabs, type TabsProps } from '../../src/Tabs.js';
import { tabs } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const shown = p.flag('tabs');
    const selected = p.choice('selected');
    return (
      <Tabs
        size={p.choice<NonNullable<TabsProps['size']>>('size')}
        value={shown ? selected : false}
        onChange={(_, value) => {
          p.set('selected', value as string);
          p.log('onChange', value);
        }}
        aria-label="Sections"
      >
        {shown
          ? tabs.map((tab) => <TabItem key={tab} value={tab} label={tab} />)
          : null}
      </Tabs>
    );
  },
} satisfies PlaygroundBuilder;
