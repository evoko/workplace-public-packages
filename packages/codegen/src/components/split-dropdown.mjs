/**
 * SOLAR Split Dropdown, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn box (`src/shells/drawn.mjs`) of two zones, each the caller's: a plain top and a tinted
 * strip under it, cut to the box's rounded corners.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  for (const slot of ['topContent', 'lowerContent'])
    if (!spec.slots[slot])
      throw new Error(`Split Dropdown: the IR has no ${slot} slot`);
};

const ABOUT = `A box of two zones pairing a primary control with supporting details: the \`top\`
(the control) on the raised surface, and the \`lower\` strip (the details) tinted under it. Nothing
in it opens or toggles: each zone is the caller's.`;

export default {
  name: 'Split Dropdown',
  mui: {
    // The shell draws every layer itself, each with a class of its own; a block cut to its
    // rounded corners, as the tinted zones inside it are.
    slots: 'drawn',
    resets: drawnResets('Split Dropdown', {
      display: 'flex',
      overflow: 'hidden',
      '& .SolarSplitDropdown-box': { display: 'flex' },
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { topContent: 'top', lowerContent: 'lower' },
    flutter: { topContent: 'top', lowerContent: 'lower' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'its edge and radius, and each zone’s fill and padding',
        about: `${ABOUT} Bespoke: drawn from Figma's layer tree (\`internal/layers.tsx\`).`,
        element: 'div',
        refType: 'HTMLDivElement',
        react: ['type ReactNode'],
        props: `/** The top zone's content: the primary control. */
top?: ReactNode;
/** The lower strip's content: the supporting details. */
lower?: ReactNode;`,
        own: ['top', 'lower'],
        content: '{ topContent: <>{top}</>, lowerContent: <>{lower}</> }',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'its edge and radius, and each zone’s fill and padding, read cell by cell',
        about: `${ABOUT.replace(/`([a-z]+)`/g, '[$1]')} Bespoke: drawn from Figma's layer tree with [SolarLayers].`,
        params: `this.top,
this.lower,`,
        fields: `/// The top zone's content: the primary control.
final Widget? top;

/// The lower strip's content: the supporting details.
final Widget? lower;`,
        content: "{'topContent': [?top], 'lowerContent': [?lower]}",
        clips: "const {'root'}",
      });
    },
  },
};
