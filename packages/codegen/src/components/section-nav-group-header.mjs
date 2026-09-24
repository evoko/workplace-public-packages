/**
 * SOLAR Section Nav Group Header, beyond its IR: where MUI draws each layer, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn heading (`src/shells/drawn.mjs`) over a group of Section Nav Items, announced as one.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  if (spec.layers.label?.type !== 'TEXT')
    throw new Error('Section Nav Group Header: the IR has no label text');
};

export default {
  name: 'Section Nav Group Header',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Section Nav Group Header', { display: 'flex' }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'its words’ text style and ink, and its padding',
        about: `Bespoke: the heading of a group of SectionNavItems in a section nav rail, drawn from Figma's layer
tree (\`internal/layers.tsx\`), not interactive, and announced as a heading (\`level\`, 3 by default)
so a screen reader names the group, as its description asks. Its words are its children.`,
        element: 'div',
        refType: 'HTMLDivElement',
        react: ['type ReactNode'],
        props: `/** The group's name. */
children: ReactNode;
/** Its heading level, for a screen reader. */
level?: 1 | 2 | 3 | 4 | 5 | 6;`,
        own: ['children', 'level = 3'],
        attrs: `role="heading"
aria-level={level}`,
        text: '{ label: children }',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'its words’ text style and ink, and its padding, read cell by cell',
        about: `Bespoke: the heading of a group of SolarSectionNavItems in a section nav rail, drawn from Figma's layer tree with [SolarLayers], not interactive, and announced as a heading ([level], 3 by default) so a screen reader names the group, as its description asks.`,
        params: `required this.label,
this.level = 3,`,
        fields: `/// The group's name.
final String label;

/// Its heading level, for a screen reader.
final int level;`,
        text: "{'label': label}",
        wrap: 'Semantics(header: true, headingLevel: level, child: mark)',
      });
    },
  },
};
