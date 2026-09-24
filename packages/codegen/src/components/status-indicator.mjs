/**
 * SOLAR StatusIndicator, beyond its IR: where MUI draws each layer, and the two shell templates,
 * run once by \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * A drawing (its overlay's `drawing`): every type is its own shape, from other layers. The shells
 * draw Figma's layer tree with the shared helpers (`src/scaffold/drawn.mjs`), a layer as a glyph
 * where its entry has one and as a box where it does not, placed where the recipe says.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../scaffold/drawn.mjs';

const requireAxes = (spec) => {
  for (const axis of ['type', 'size'])
    if (!spec.api[axis])
      throw new Error(`StatusIndicator: the IR has no ${axis}`);
};

export default {
  name: 'StatusIndicator',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('StatusIndicator'),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireAxes(spec);
      return drawnReact(spec, {
        look: 'each type’s disc or triangle, its mark, their colours and where they sit',
        about: `Bespoke: a drawn mark. Each type is its own drawing, so this draws Figma’s layer tree
(\`internal/layers.tsx\`): a layer as a glyph (an SVG of Figma’s outline) where the recipe has one
and as a box where it does not. Decorative unless given a \`label\`, which it then announces as an
image.`,
        props: `/**
 * What the status means, for a screen reader. Without it the mark is decorative and hidden from
 * assistive technology, so say the status in words beside it.
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
        look: 'each type’s disc or triangle, its mark, their colours and where they sit, read cell by cell',
        about: `Bespoke: a drawn mark. Each type is its own drawing, so this draws Figma's layer tree with
[SolarLayers]: a layer as a glyph where the recipe has one and as a box where it does not.
Decorative unless given a [label], which it then announces.`,
        params: 'this.label,',
        fields: `/// What the status means, for a screen reader. Without it the mark is decorative.
final String? label;`,
        wrap: `label == null
        ? ExcludeSemantics(child: mark)
        : Semantics(label: label, image: true, child: mark)`,
      });
    },
  },
};
