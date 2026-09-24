/**
 * SOLAR Trend Badge, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawing (its overlay's `drawing`), as StatusIndicator is: an arrow on a disc, drawn from
 * Figma's layer tree by the shared helpers (`src/shells/drawn.mjs`).
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireAxes = (spec) => {
  for (const axis of ['type', 'size'])
    if (!spec.api[axis]) throw new Error(`Trend Badge: the IR has no ${axis}`);
};

export default {
  name: 'Trend Badge',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Trend Badge'),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireAxes(spec);
      return drawnReact(spec, {
        look: 'each type’s disc and its arrow or dash, their colours, by size',
        about: `Bespoke: a drawn mark, an arrow on a disc, drawn from Figma’s layer tree
(\`internal/layers.tsx\`). Decorative unless given a \`label\`, which it then announces as an
image: say the change in words beside it, or name it (\`label="Up 12%"\`).`,
        props: `/**
 * What the trend means, for a screen reader. Without it the badge is decorative and hidden from
 * assistive technology, so say the change in words beside it.
 */
label?: string;`,
        own: ['label'],
        attrs: `role={label ? 'img' : undefined}
aria-label={label}
aria-hidden={label ? undefined : true}`,
      });
    },
    flutter: (spec) => {
      requireAxes(spec);
      return drawnFlutter(spec, {
        look: 'each type’s disc and its arrow or dash, their colours, by size, read cell by cell',
        about: `Bespoke: a drawn mark, an arrow on a disc, drawn from Figma's layer tree with
[SolarLayers]. Decorative unless given a [label], which it then announces.`,
        params: 'this.label,',
        fields: `/// What the trend means, for a screen reader. Without it the badge is decorative.
final String? label;`,
        wrap: `label == null
        ? ExcludeSemantics(child: mark)
        : Semantics(label: label, image: true, child: mark)`,
      });
    },
  },
};
