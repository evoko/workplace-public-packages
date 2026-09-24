/**
 * SOLAR PaginationEllipsis, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): the gap in a Pagination's pages, static text.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  if (spec.layers.label?.type !== 'TEXT')
    throw new Error('PaginationEllipsis: the IR has no label text');
};

export default {
  name: 'PaginationEllipsis',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('PaginationEllipsis', { display: 'flex' }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'its box and its words’ text style and ink',
        about: `Bespoke: the gap in a Pagination's pages, an ellipsis drawn from Figma's layer tree
(\`internal/layers.tsx\`): static text, never a control, as its description says ("Ellipsis is
static text, never a 'jump' trigger").`,
        text: "{ label: '…' }",
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'its box and its words’ text style and ink, read cell by cell',
        about: `Bespoke: the gap in a SolarPagination's pages, an ellipsis drawn from Figma's layer tree with [SolarLayers]: static text, never a control, as its description says.`,
        text: "{'label': '…'}",
      });
    },
  },
};
