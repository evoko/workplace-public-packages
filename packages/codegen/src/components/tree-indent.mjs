/**
 * SOLAR Tree Indent (Figma's `.Tree Indent`), beyond its IR: where MUI draws each layer, and the
 * two shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawing (its overlay's `drawing`): each depth is a row of that many 16px units, drawn from
 * Figma's layer tree by the shared helpers (`src/shells/drawn.mjs`).
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireDepth = (spec) => {
  if (!spec.api.depth) throw new Error('Tree Indent: the IR has no depth');
};

export default {
  name: 'Tree Indent',
  address: '.Tree Indent',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Tree Indent'),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireDepth(spec);
      return drawnReact(spec, {
        look: 'each depth’s row of units and their size',
        about: `Bespoke: a spacer, a row of \`depth\` units of indent, drawn from Figma’s layer tree
(\`internal/layers.tsx\`). Tree Item composes it. Decorative: the tree’s own semantics
(\`aria-level\`) say how deep a row is.`,
        attrs: 'aria-hidden',
      });
    },
    flutter: (spec) => {
      requireDepth(spec);
      return drawnFlutter(spec, {
        look: 'each depth’s row of units and their size, read cell by cell',
        about: `Bespoke: a spacer, a row of [depth] units of indent, drawn from Figma's layer tree
with [SolarLayers]. Tree Item composes it. Decorative: the tree's own semantics say how deep a
row is.`,
        wrap: 'ExcludeSemantics(child: mark)',
      });
    },
  },
};
