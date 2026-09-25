/**
 * SOLAR Container, beyond its IR: where MUI draws each layer, and the two shell templates, rendered
 * into the shells by \`solar:codegen\` on every run. One file per component, so adding one edits
 * nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn region (`src/shells/drawn.mjs`): the caller's content in Figma's content slot, padded,
 * and outlined or not.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  if (!spec.slots.content)
    throw new Error('Container: the IR has no content slot');
  if (!spec.api.type) throw new Error('Container: the IR has no type prop');
};

const ABOUT = `A region grouping related content inside a larger surface (a card's body, a dialog's, a
part of a page): the caller's content, padded, with no paint of its own (\`default\`) or on a raised
surface with an edge (\`outlined\`). No control, and no card: for a raised surface of its own use a
Card.`;

export default {
  name: 'Container',
  mui: {
    // The shell draws every layer itself, each with a class of its own; a block, as a region is.
    slots: 'drawn',
    resets: drawnResets('Container', {
      display: 'flex',
      '& .SolarContainer-content': { display: 'flex' },
    }),
  },
  flutter: {},
  shells: {
    slots: { content: { react: 'children', flutter: 'children' } },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'its padding and gap, and the outlined one’s surface, edge and shadow',
        about: `${ABOUT} Bespoke: drawn from Figma's layer tree (\`internal/layers.tsx\`).`,
        element: 'div',
        refType: 'HTMLDivElement',
        react: ['type ReactNode'],
        props: `/** What it groups. */
children?: ReactNode;`,
        own: ['children'],
        content: '{ content: <>{children}</> }',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'its padding and gap, and the outlined one’s surface, edge and shadow, read cell by cell',
        about: `${ABOUT.replace(/`([a-z]+)`/g, '[$1]')} Bespoke: drawn from Figma's layer tree with [SolarLayers].`,
        params: 'this.children = const [],',
        fields: `/// What it groups.
final List<Widget> children;`,
        content: "{'content': children}",
      });
    },
  },
};
