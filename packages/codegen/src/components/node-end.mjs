/**
 * SOLAR Node End, beyond its IR: where MUI draws each layer, and the two shell templates, rendered
 * into the shells by \`solar:codegen\` on every run. One file per component, so adding one edits
 * nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component: a dot and its halo, two ellipses placed where Figma puts them, drawn from
 * Figma's layer tree by the shared helpers (`src/shells/drawn.mjs`).
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  for (const layer of ['halo', 'dot'])
    if (!spec.layers[layer])
      throw new Error(`Node End: the IR has no ${layer}`);
};

export default {
  name: 'Node End',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Node End'),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'the dot and its halo, their colour, size and place',
        about: `Bespoke: a drawn marker, the end of a Coachmark’s connector, drawn from Figma’s layer
tree (\`internal/layers.tsx\`). Decorative always: the element a tour step is about carries its
own name, and the dot is never the only sign of what the step refers to.`,
        attrs: 'aria-hidden',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the dot and its halo, their colour, size and place, read cell by cell',
        about: `Bespoke: a drawn marker, the end of a Coachmark's connector, drawn from Figma's layer
tree with [SolarLayers]. Decorative always: the element a tour step is about carries its own
name, and the dot is never the only sign of what the step refers to.`,
        wrap: 'ExcludeSemantics(child: mark)',
      });
    },
  },
};
