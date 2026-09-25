/**
 * SOLAR Launch Card, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A card of the family (`src/shells/card.mjs`): an app to open, its image (the caller's picture,
 * a favourite on it), its App Icon, name and Tag, its words, and its actions, the caller's Button
 * Group; pressable where it is given something to do.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
} from '../shells/card.mjs';

const P = 'SolarLaunchCard';

const requireLayers = (spec) => {
  for (const slot of [
    'image',
    'favourite',
    'favouriteNoImage',
    'tag',
    'bodyText',
    'name',
    'appIcon',
    'actions',
  ])
    if (!spec.slots[slot])
      throw new Error(`Launch Card: the IR has no ${slot} slot`);
};

const ABOUT = `An app to open, on a launcher: its \`image\` (a picture across its top), its \`appIcon\` and
\`name\`, a \`tag\` (a SOLAR Tag's words), its \`body\`, and the caller's \`actions\` (a SOLAR Button
Group: Open and Learn more, or Request access). Its \`favourite\` (the caller's Icon Button, sm,
round and tertiary) sits on the image, or beside its name where it has none. Given \`onClick\` or
\`href\`, it is pressable: its name is the button or link, and its hit area the whole card, its
actions and favourite reachable above it; it is focused only then.`;

const LAUNCH = {
  look: 'the card’s fill, edge, radius and focus ring, its image’s frame, and its words’ ink',
  about: ABOUT,
  title: 'name',
  props: [
    {
      name: 'name',
      kind: 'text',
      layer: 'name',
      required: true,
      doc: 'The app’s name; its action’s name where it is pressable.',
    },
    {
      name: 'body',
      kind: 'text',
      layer: 'bodyText',
      doc: 'What it does, in a few lines.',
    },
    {
      name: 'appIcon',
      kind: 'slot',
      layer: 'appIcon',
      doc: 'The app’s icon: an App Icon of the assets, as an image.',
    },
    {
      name: 'tag',
      kind: 'node',
      layer: 'tag',
      shown: true,
      dart: 'String',
      doc: 'A SOLAR Tag’s words (“New”).',
    },
    {
      name: 'actions',
      kind: 'slot',
      layer: 'actions',
      doc: 'The caller’s actions: a SOLAR Button Group, horizontal.',
    },
    {
      name: 'favourite',
      kind: 'node',
      doc: 'The caller’s favourite, an Icon Button (sm, round, tertiary): on the image, or beside the name where it has none.',
    },
    {
      name: 'image',
      kind: 'node',
      layer: 'image',
      react: 'string',
      dart: 'ImageProvider',
      doc: 'The picture across its top, by its address.',
    },
  ],
  present: {
    favourite: 'favourite != null && image != null',
    favouriteNoImage: 'favourite != null && image == null',
  },
  presentDart: {
    favourite: 'favourite != null && image != null',
    favouriteNoImage: 'favourite != null && image == null',
  },
  imports: "import { Tag } from './Tag.js';",
  render: `// The picture fills the image, under the favourite.
image: ({ className: c, style, children: drawn }: DrawnLayer) => (
  <span className={c} style={style}>
    <img src={image} alt="" />
    {drawn}
  </span>
),
// The favourite, the caller's Icon Button, on the image or beside the name.
favourite: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    {favourite}
  </span>
),
favouriteNoImage: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    {favourite}
  </span>
),
// A SOLAR Tag, as Figma draws it here: success, its words alone.
tag: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <Tag status="success">{tag}</Tag>
  </span>
),`,
  importsDart: `import '../generated/components/tag.dart';
import 'solar_tag.dart';`,
  composed: `// The favourite, the caller's Icon Button, on the image or beside the name.
'favourite': ?favourite,
'favouriteNoImage': ?favourite,
// A SOLAR Tag, as Figma draws it here: success, its words alone.
'tag': SolarTag(status: SolarTagStatus.success, label: tag),`,
  imagesDart: `{
  if (image != null) 'image': DecorationImage(image: image!, fit: BoxFit.cover),
}`,
  wraps: "'bodyText': TextAlign.start",
  clips: "'root'",
};

export default {
  name: 'Launch Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs). The
    // picture fills the image, cut to the card's corners.
    slots: 'drawn',
    resets: cardResets('Launch Card', {
      wrap: ['bodyText'],
      fixed: ['appIcon', 'tag', 'favouriteNoImage'],
      extra: {
        overflow: 'hidden',
        [`& .${P}-image`]: { position: 'relative' },
        [`& .${P}-image > img`]: {
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
        [`& .${P}-appIcon > img`]: {
          display: 'block',
          width: '100%',
          height: '100%',
        },
        [`& .${P}-actions > *`]: { width: '100%' },
      },
    }),
    states: cardStates('Launch Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { favouriteNoImage: 'favourite', bodyText: 'body' },
    flutter: { favouriteNoImage: 'favourite', bodyText: 'body' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, LAUNCH);
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, LAUNCH);
    },
  },
};
