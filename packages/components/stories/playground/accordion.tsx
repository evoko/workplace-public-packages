/**
 * Accordion's Playground: its words and states from their controls; its content, the `description`
 * words, shown by the `content` toggle (a cleared description left out). Its header expands and
 * collapses it, as in an app: `expanded` is set, and the change logged. A disabled one stays inert.
 */

import { Accordion } from '../../src/Accordion.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const description = p.words('description');
    return (
      <Accordion
        disabled={p.flag('disabled')}
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
