/**
 * SOLAR Action Card, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A card of the family (`src/shells/card.mjs`): an icon, a title and a More menu, the content,
 * and its calls to action, the caller's Buttons, as its status draws them (two at rest, the
 * primary alone once done or in danger); pressable where it is given something to do.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
  moreIconOf,
} from '../shells/card.mjs';

const requireLayers = (spec) => {
  for (const slot of [
    'icon',
    'title',
    'description',
    'primaryCTA',
    'secondaryCTA',
  ])
    if (!spec.slots[slot])
      throw new Error(`Action Card: the IR has no ${slot} slot`);
  if (!spec.layers.button)
    throw new Error('Action Card: the IR draws no single call to action');
};

const ABOUT = `A card that asks for one thing (set up a room, fix a fault): an \`icon\` and its \`title\`,
a More menu of \`moreItems\`, the content (the \`description\`, in Figma's words' look, then the
caller's children), and its calls to action, the caller's SOLAR Buttons (sm, as Figma draws them):
the \`primaryAction\` and \`secondaryAction\` at rest, the primary alone once \`done\` (secondary) or
in \`danger\` (a danger primary). Given \`onClick\` or \`href\`, it is pressable: its title is the
button or link, and its hit area the whole card, its Buttons and the More menu reachable above it;
it is hovered and focused only then.`;

const ACTION = (spec) => ({
  look: 'the surface’s fill, edge, shadow and focus ring by status and state, its words’ and icons’ ink',
  about: ABOUT,
  title: 'titleTitle',
  props: [
    {
      name: 'title',
      kind: 'text',
      layer: 'titleTitle',
      required: true,
      doc: 'What it asks for, in a few words; its action’s name where it is pressable.',
    },
    {
      name: 'icon',
      kind: 'icon',
      layer: 'icon',
      doc: 'An icon before the title.',
    },
    {
      name: 'description',
      kind: 'text',
      layer: 'description',
      doc: 'The content’s words, in the look Figma draws them.',
    },
    {
      name: 'children',
      kind: 'node',
      only: 'react',
      doc: 'The caller’s content, after the description.',
    },
    {
      name: 'primaryAction',
      kind: 'slot',
      layer: 'primaryCTA',
      also: ['button'],
      doc: 'The call to action: a SOLAR Button, sm; once done or in danger, the only one.',
    },
    {
      name: 'secondaryAction',
      kind: 'slot',
      layer: 'secondaryCTA',
      doc: 'Another at rest, beside it: a SOLAR Button, sm and secondary.',
    },
  ],
  more: { layer: 'iconMore', icon: moreIconOf(spec, 'iconMore') },
  render: `// The content: Figma's description, then the caller's children.
content: ({ className: c, style, children: drawn }: DrawnLayer) => (
  <div className={c} style={style}>
    {drawn}
    {children}
  </div>
),`,
  paramsDart: 'this.children = const [],',
  fieldsDart: `/// The caller's content, after the description.
final List<Widget> children;`,
  wraps: "'titleTitle': TextAlign.start, 'description': TextAlign.start",
  // The content: Figma's description, then the caller's children.
  contentDart: `{
  'content': [
    if (description != null) figma.layer('description'),
    ...children,
  ],
}`,
});

export default {
  name: 'Action Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs).
    slots: 'drawn',
    resets: cardResets('Action Card', {
      wrap: ['titleTitle', 'description'],
      more: 'iconMore',
      icons: ['icon'],
      extra: { '& .SolarActionCard-content': { display: 'flex' } },
    }),
    states: cardStates('Action Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: {
      primaryCTA: 'primaryAction',
      secondaryCTA: 'secondaryAction',
    },
    flutter: {
      primaryCTA: 'primaryAction',
      secondaryCTA: 'secondaryAction',
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, ACTION(spec));
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, ACTION(spec));
    },
  },
};
