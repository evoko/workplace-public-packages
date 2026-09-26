/**
 * Tab Item's Playground: a tab works only in its strip, so it is drawn first of three in a Tabs of
 * its size (a tab takes its strip's), its two sample siblings after it. Its words, icons and state
 * from their controls; its Counter, shown by the `counter` toggle, counts the `counter count` extra.
 * The strip decides which is selected: `selected` on selects this tab, off the sibling selected last
 * (the first at first). Choosing a tab sets `selected`, as choosing this one or a sibling makes it
 * true or false.
 */

import { useState } from 'react';
import { TabItem, type TabItemProps } from '../../src/TabItem.js';
import { Tabs } from '../../src/Tabs.js';
import type { Playground, PlaygroundBuilder } from './types.js';

/** This tab's value (logged as its words), and its sample siblings', which are their words too. */
const ITEM = 'this';
const SIBLINGS = ['Activity', 'Settings'];

function TabItemPlayground({ p }: { p: Playground }) {
  const [sibling, setSibling] = useState(SIBLINGS[0]);
  const selected = p.flag('selected');
  const counter = p.child('counter');
  const count = p.whole('counter count');
  const label = p.text('label');
  return (
    <Tabs
      size={p.choice<NonNullable<TabItemProps['size']>>('size')}
      value={selected ? ITEM : sibling}
      onChange={(_, value) => {
        if (value !== ITEM) setSibling(value as string);
        p.set('selected', value === ITEM);
        p.log('onChange', value === ITEM ? label : value);
      }}
      aria-label="Sections"
    >
      <TabItem
        value={ITEM}
        label={label}
        disabled={p.flag('disabled')}
        leadingIcon={p.icon('leadingIcon')}
        trailingIcon={p.icon('trailingIcon')}
        count={counter.shown ? count : undefined}
      />
      {SIBLINGS.map((s) => (
        <TabItem key={s} value={s} label={s} />
      ))}
    </Tabs>
  );
}

export default {
  render: (p) => <TabItemPlayground p={p} />,
} satisfies PlaygroundBuilder;
