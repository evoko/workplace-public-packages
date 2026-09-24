/**
 * SOLAR RowExpand, beyond its IR: where MUI draws each layer, and the two shell templates, run once
 * by \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * A drawing (its overlay's `drawing`): a chevron, or a connector drawn beside a child row, drawn
 * from Figma's layer tree by the shared helpers (`src/scaffold/drawn.mjs`), the chevrons as SOLAR
 * icons.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../scaffold/drawn.mjs';

const requireType = (spec) => {
  if (!spec.api.type) throw new Error('RowExpand: the IR has no type');
};

export default {
  name: 'RowExpand',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('RowExpand', {
      '& .SolarRowExpand-icon': { display: 'block', flexShrink: '0' },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireType(spec);
      return drawnReact(spec, {
        look: 'each type’s chevron or connector, their colours and places',
        about: `Bespoke: an expandable table row’s cell, drawn from Figma’s layer tree
(\`internal/layers.tsx\`): the chevron on the parent row, and the connector beside each child row.
Decorative: the row it belongs to is the control that expands, and says so (\`aria-expanded\`).`,
        attrs: 'aria-hidden',
      });
    },
    flutter: (spec) => {
      requireType(spec);
      return drawnFlutter(spec, {
        look: 'each type’s chevron or connector, their colours and places, read cell by cell',
        about: `Bespoke: an expandable table row's cell, drawn from Figma's layer tree with
[SolarLayers]: the chevron on the parent row, and the connector beside each child row.
Decorative: the row it belongs to is the control that expands, and says so.`,
        wrap: 'ExcludeSemantics(child: mark)',
      });
    },
  },
};
