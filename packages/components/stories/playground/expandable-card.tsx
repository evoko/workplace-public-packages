/**
 * Expandable Card's Playground: its words and state from their controls; its content, the
 * `description` words, shown by the `content` toggle (a cleared description left out). Its header
 * expands and collapses it, as in an app: `expanded` is set, and the change logged.
 */

import { ExpandableCard } from '../../src/ExpandableCard.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const description = p.words('description');
    return (
      <ExpandableCard
        expanded={p.flag('expanded')}
        title={p.text('title')}
        description={p.flag('content') ? description : undefined}
        onExpandedChange={(expanded) => {
          p.set('expanded', expanded);
          p.log('onExpandedChange', expanded);
        }}
      />
    );
  },
} satisfies PlaygroundBuilder;
