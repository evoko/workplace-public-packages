/**
 * What a drawn component shares on the web: one that draws its own layers from its recipe, as
 * Figma nests them, rather than wrapping a stock control (StatusIndicator, Counter, Kbd…), through
 * the runtime helpers `internal/layers.tsx` and, in Flutter, [SolarLayers].
 */

import { pascal } from '../../util/naming.mjs';

/**
 * What a drawn component's elements need beyond the recipe: its root is an inline box of its own
 * size, and a frame in it a flex box, as Figma's auto layout is (the recipe says which way);
 * a placed layer is absolute in it. A text runs on one line, as a Figma text that hugs it does.
 * An icon or a glyph keeps its size beside a layer that fills the row (Banner's message), as in
 * Figma, where only what fills gives way. A glyph's two outlines are filled, never stroked:
 * `stroke` on the glyph only names the stroke outline's colour.
 */
export const drawnResets = (name, more = {}) => {
  const P = `Solar${pascal(name)}`;
  return {
    display: 'inline-flex',
    position: 'relative',
    boxSizing: 'border-box',
    flexShrink: '0',
    [`& .${P}-box`]: { display: 'flex', boxSizing: 'border-box' },
    [`& .${P}-text`]: { whiteSpace: 'nowrap' },
    [`& .${P}-glyph`]: {
      display: 'block',
      overflow: 'visible',
      flexShrink: '0',
    },
    [`& .${P}-drawnIcon`]: { flexShrink: '0' },
    '& .SolarGlyph-fill, & .SolarGlyph-stroke': { stroke: 'none' },
    ...more,
  };
};
