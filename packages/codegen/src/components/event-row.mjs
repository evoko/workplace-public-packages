/**
 * SOLAR Event Row, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A row of the card family (`src/shells/card.mjs`): one event of an activity feed, its leading
 * Avatar, its title and meta line, its time, and a More menu; pressable where it is given
 * something to do.
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
    'leading',
    'title',
    'productTag',
    'metaText',
    'timestamp',
  ])
    if (!spec.slots[slot])
      throw new Error(`Event Row: the IR has no ${slot} slot`);
};

const ABOUT = `One event of an activity feed (stack them in an ordered list, newest first): who or what
did it (\`leading\`, an Avatar md for a person, an icon for a system or device), what happened
(\`title\`), the product it was in (\`product\`) and its context (\`meta\`), when (\`timestamp\`, the
words, with \`dateTime\` the moment, for a \`<time>\`), and a More menu of \`moreItems\`. Given
\`onClick\` or \`href\`, it is pressable: its title is the button or link, and its hit area the whole
row, the More menu reachable above it; it is hovered and focused only then.`;

const ROW = (spec) => ({
  look: 'the row’s fill and focus ring by state, its words’ ink and the More icon’s',
  about: ABOUT,
  title: 'title',
  props: [
    {
      name: 'title',
      kind: 'text',
      layer: 'title',
      required: true,
      doc: 'What happened, in a few words; its action’s name where it is pressable.',
    },
    {
      name: 'leading',
      kind: 'slot',
      layer: 'leading',
      doc: 'Who or what did it: a SOLAR Avatar, md, or an icon.',
    },
    {
      name: 'product',
      kind: 'text',
      layer: 'productTag',
      doc: 'The product it was in.',
    },
    {
      name: 'meta',
      kind: 'text',
      layer: 'metaText',
      doc: 'Its context, in a line.',
    },
    {
      name: 'timestamp',
      kind: 'text',
      layer: 'timestamp',
      doc: 'When, in words (“Just now”).',
    },
    {
      name: 'dateTime',
      kind: 'node',
      react: 'string',
      only: 'react',
      doc: 'When, as a moment (ISO 8601), for the timestamp’s `<time>`.',
    },
  ],
  more: { layer: 'more', icon: moreIconOf(spec, 'more') },
});

export default {
  name: 'Event Row',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs).
    slots: 'drawn',
    resets: cardResets('Event Row', {
      wrap: ['title', 'metaText'],
      more: 'more',
      fixed: ['leading', 'timestamp'],
    }),
    states: cardStates('Event Row'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'title',
    slots: {
      leading: { react: 'leading', flutter: 'leading' },
      title: { react: 'title', flutter: 'title' },
      productTag: { react: 'product', flutter: 'product' },
      metaText: { react: 'meta', flutter: 'meta' },
      timestamp: { react: 'timestamp', flutter: 'timestamp' },
      more: { react: 'moreItems', flutter: 'moreItems' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, {
        ...ROW(spec),
        // The time is a <time>, of the moment the caller gives.
        timeElement: 'timestamp',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, ROW(spec));
    },
  },
};
