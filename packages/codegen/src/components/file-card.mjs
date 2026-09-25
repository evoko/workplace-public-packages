/**
 * SOLAR File Card, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A tile of the card family (`src/shells/card.mjs`): one file of a file browser's grid, its
 * thumbnail (the caller's, or its type's icon), its name and when it changed, and a More menu; or
 * the tile that creates one. Pressable where it is given something to do.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
  moreIconOf,
} from '../shells/card.mjs';

const P = 'SolarFileCard';

const requireLayers = (spec) => {
  for (const slot of ['fileIcon', 'title', 'meta', 'label'])
    if (!spec.slots[slot])
      throw new Error(`File Card: the IR has no ${slot} slot`);
  if (!spec.layers.thumbnail)
    throw new Error('File Card: the IR has no thumbnail layer');
};

const ABOUT = `One file in a file browser's grid: its \`thumbnail\` (a preview, filling it) or its type's
\`fileIcon\`, its \`title\` (its name) and \`meta\` (when it changed), and a More menu of
\`moreItems\`; or, as \`create\`, the tile that adds one, a Plus over its \`title\` (“New design”).
Given \`onClick\` or \`href\`, it is pressable: its name is the button or link, and its hit area the
whole tile, the More menu reachable above it; the tile is named by it, and focused only then.`;

const FILE = (spec) => ({
  look: 'the tile’s edge, shadow and focus ring, the thumbnail’s fill, its words’ ink, and the create tile’s Plus',
  about: ABOUT,
  title: 'title',
  alsoTitle: 'label',
  props: [
    {
      name: 'title',
      kind: 'text',
      layer: 'title',
      required: true,
      doc: 'The file’s name, or what the create tile adds; its action’s name where it is pressable.',
    },
    {
      name: 'meta',
      kind: 'text',
      layer: 'meta',
      doc: 'When it changed (“Edited just now”).',
    },
    {
      name: 'fileIcon',
      kind: 'icon',
      layer: 'fileIcon',
      doc: 'Its type’s icon, where it has no thumbnail.',
    },
    {
      name: 'thumbnail',
      kind: 'node',
      doc: 'A preview of it (an image), filling the thumbnail in place of its icon.',
    },
  ],
  more: { layer: 'iconMore', icon: moreIconOf(spec, 'iconMore') },
  content: '...(thumbnail != null ? { thumbnail } : {}),',
  contentDart: "{'thumbnail': ?(thumbnail == null ? null : [thumbnail!])}",
  clips: "'thumbnail'",
});

export default {
  name: 'File Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs). A
    // preview fills the thumbnail, cut to its corners.
    slots: 'drawn',
    resets: cardResets('File Card', {
      wrap: ['title', 'meta', 'label'],
      more: 'iconMore',
      icons: ['fileIcon'],
      extra: {
        [`& .${P}-thumbnail`]: { overflow: 'hidden' },
        [`& .${P}-thumbnail > img`]: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
      },
    }),
    states: cardStates('File Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'title',
    slots: {
      fileIcon: { react: 'fileIcon', flutter: 'fileIcon' },
      title: { react: 'title', flutter: 'title' },
      meta: { react: 'meta', flutter: 'meta' },
      label: { react: 'title', flutter: 'title' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, FILE(spec));
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, FILE(spec));
    },
  },
};
