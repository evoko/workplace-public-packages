/**
 * SOLAR Card, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * The raised surface of the card family, drawn from Figma's layers with the shared helpers: its
 * title and helper, an icon, the content (Figma's description, then the caller's children), a
 * SOLAR Tag in the status's look, and a More menu. Pressable where it is given something to do
 * (owner decision 2026-09-25): its title is the button or link, stretched over the card, so the
 * More menu and the content's own controls stay reachable above it. Loading, it draws Figma's
 * placeholders.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
  moreIconOf,
} from '../shells/card.mjs';

const requireLayers = (spec) => {
  for (const slot of ['icon', 'title', 'helper', 'more', 'content', 'tag'])
    if (!spec.slots[slot]) throw new Error(`Card: the IR has no ${slot} slot`);
  for (const layer of ['titleTitle', 'description', 'skeleton'])
    if (!spec.layers[layer])
      throw new Error(`Card: the IR has no ${layer} layer`);
  for (const prop of ['disabled', 'loading'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Card: the IR has no ${prop} prop`);
};

const ABOUT = `The raised surface of the card family, for a titled piece of content: its \`title\`, an
\`icon\` before it and a \`helper\` after it, the content (the \`description\`, in Figma's words'
look, then the caller's children), a \`tag\` (a SOLAR Tag's words, in the status's look), and a
More menu of \`moreItems\`. Given \`onClick\` or \`href\`, it is pressable: its title is the button
or link, named by its words, and its hit area the whole card, so the More menu and the content's
own controls stay reachable above it; it is hovered and focused only then. \`loading\` draws
Figma's placeholders, announced busy. For a whole-surface action with a call to action use an
Action Card; for a grouping inside a larger surface, a Container.`;

const MORE = (spec) => ({ layer: 'more', icon: moreIconOf(spec, 'more') });

/** What both shells take and draw beyond the IR. */
const CARD = {
  look: 'the surface’s fill, edge, shadow and focus ring by status and state, its words’ and icons’ ink, the Tag it shows, and the placeholders',
  about: ABOUT,
  title: 'titleTitle',
  definesMoreItem: true,
  // Figma draws a loading card, and a disabled one, with no status.
  statusless: ['loading', 'disabled'],
  status: { axis: 'status', none: 'none' },
  props: [
    {
      name: 'title',
      kind: 'text',
      layer: 'titleTitle',
      required: true,
      doc: 'What the card is, in a few words; its action’s name where it is pressable.',
    },
    {
      name: 'icon',
      kind: 'icon',
      layer: 'icon',
      shown: true,
      doc: 'An icon before the title.',
    },
    {
      name: 'helper',
      kind: 'text',
      layer: 'helper',
      shown: true,
      doc: 'A word after the title (a count, a date).',
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
      name: 'tag',
      kind: 'node',
      layer: 'tag',
      dart: 'String',
      doc: 'A SOLAR Tag’s words, drawn in the status’s look.',
    },
  ],
  imports: "import { Tag, type TagProps } from './Tag.js';",
  prelude: 'const t = composed.tag;',
  render: `// The content: Figma's description (or, loading, its placeholder lines), then the caller's
// children.
content: ({ className: c, style, children: drawn }: DrawnLayer) => (
  <div className={c} style={style}>
    {drawn}
    {loading ? null : children}
  </div>
),
// A SOLAR Tag, in the variant the recipe names, in its layer's element; loading, it is the
// Tag's placeholder, its words hidden and keeping their room, on the fill the recipe draws it on.
tag: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style} aria-hidden={loading || undefined}>
    <Tag
      status={t['variant.status'] as TagProps['status']}
      {...(t['variant.invert'] === 'true' ? { invert: true as const } : {})}
    >
      {loading ? <span style={{ visibility: 'hidden' }}>{tag}</span> : tag}
    </Tag>
  </span>
),`,
  importsDart: `import '../generated/components/tag.dart';
import 'solar_tag.dart';`,
  paramsDart: 'this.children = const [],',
  fieldsDart: `/// The caller's content, after the description.
final List<Widget> children;`,
  wraps: "'titleTitle': TextAlign.start, 'description': TextAlign.start",
  composed: `// A SOLAR Tag, in the variant the recipe names, on the fill it draws it on; loading, it is the
// Tag's placeholder, its words drawn in no ink, keeping their room.
'tag': ExcludeSemantics(
  excluding: loading,
  child: SolarTag(
    status: SolarTagStatus.values.byName(
      (SolarCardRecipe.lookup('tag.variant.status', p, states) ?? 'k:neutral')
          .substring(2),
    ),
    invert: SolarCardRecipe.lookup('tag.variant.invert', p, states) == 'k:true',
    label: tag,
    restyle: {
      'root.background': SolarCardRecipe.color(t, 'tag.background', p, states),
      if (loading) 'label.color': Colors.transparent,
    },
  ),
),`,
  // The content: Figma's description (or, loading, its placeholder lines), then the caller's
  // children.
  contentDart: `loading
    ? const {}
    : {
        'content': [
          if (description != null) figma.layer('description'),
          ...children,
        ],
      }`,
};

export default {
  name: 'Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs).
    slots: 'drawn',
    resets: cardResets('Card', {
      // The words wrap, as a card's title and content do; Figma's hug one line.
      wrap: ['titleTitle', 'description'],
      more: 'more',
      icons: ['icon'],
      extra: { '& .SolarCard-content': { display: 'flex' } },
    }),
    states: cardStates('Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'title',
    slots: {
      icon: { react: 'icon', flutter: 'icon' },
      helper: { react: 'helper', flutter: 'helper' },
      more: { react: 'moreItems', flutter: 'moreItems' },
      content: { react: 'children', flutter: 'children' },
      tag: { react: 'tag', flutter: 'tag' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, { ...CARD, more: MORE(spec) });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, { ...CARD, more: MORE(spec) });
    },
  },
};
