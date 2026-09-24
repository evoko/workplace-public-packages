import oracle from '../../../../../spec/verify/tabs.json';
import { TabItem } from '../../../src/TabItem.js';
import { Tabs, type TabsProps } from '../../../src/Tabs.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = {
  component?: string;
  variant?: Record<string, string | undefined>;
};

/** The tabs Figma draws in the strip, in its order, each with its layer and state. */
const tabs = (v: OracleVariant) =>
  Object.entries(v.layers as Record<string, ChildLayer>).filter(
    ([, l]) => l.component === 'Tab Item',
  );

// Figma's tabs, each keyed by its layer, words alone as Figma's strip draws them (its icons and
// counter hidden: the oracle's hides), the one Figma draws selected the strip's value.
export default {
  oracle,
  render: (v) => {
    const held = tabs(v);
    const chosen =
      held.find(([, l]) => l.variant?.state === 'selected')?.[0] ?? false;
    return (
      <Tabs
        {...(v.props as Pick<TabsProps, 'size'>)}
        value={chosen}
        aria-label="Tabs"
      >
        {held.map(([name]) => (
          <TabItem key={name} value={name} data-layer={name} label="Tab" />
        ))}
      </Tabs>
    );
  },
} satisfies VisualCase;
