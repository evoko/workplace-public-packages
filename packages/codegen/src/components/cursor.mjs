/**
 * SOLAR Cursor, beyond its IR: where MUI draws each layer, and the two shell templates, run once by
 * \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * A drawing (its overlay's `drawing`): 22 pointer glyphs, each its own layers placed by position,
 * drawn from Figma's layer tree by the shared helpers (`src/scaffold/drawn.mjs`).
 */

import { drawnFlutter, drawnReact, drawnResets } from '../scaffold/drawn.mjs';

const requireType = (spec) => {
  if (!spec.api.type) throw new Error('Cursor: the IR has no type');
};

export default {
  name: 'Cursor',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Cursor'),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireType(spec);
      return drawnReact(spec, {
        look: 'each type’s glyph, its colours and outline',
        about: `Bespoke: a pointer glyph for the canvas and authoring surfaces (the Spatial and Flow
editors), where the native cursor cannot say which tool is active, drawn from Figma’s layer tree
(\`internal/layers.tsx\`). Decorative: the tool it shows is said elsewhere, and standard UI keeps the
native cursor.`,
        attrs: 'aria-hidden',
      });
    },
    flutter: (spec) => {
      requireType(spec);
      return drawnFlutter(spec, {
        look: 'each type’s glyph, its colours and outline, read cell by cell',
        about: `Bespoke: a pointer glyph for the canvas and authoring surfaces (the Spatial and Flow
editors), where the native cursor cannot say which tool is active, drawn from Figma's layer tree
with [SolarLayers]. Decorative: the tool it shows is said elsewhere, and standard UI keeps the
native cursor.`,
        wrap: 'ExcludeSemantics(child: mark)',
      });
    },
  },
};
