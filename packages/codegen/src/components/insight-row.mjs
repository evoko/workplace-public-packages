/**
 * SOLAR Insight Row, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A card of the family (`src/shells/card.mjs`): its severity's bar, named by its word, its title
 * and meta on a line each, and the caller's action (a Button); pressable where it is given
 * something to do, and its placeholders while it loads.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
} from '../shells/card.mjs';

const P = 'SolarInsightRow';

const requireLayers = (spec) => {
  for (const slot of ['title', 'meta', 'action'])
    if (!spec.slots[slot])
      throw new Error(`Insight Row: the IR has no ${slot} slot`);
  if (!spec.layers.severityBar)
    throw new Error('Insight Row: the IR has no severityBar layer');
};

const ABOUT = `One insight on a line, in a feed or a panel (stack them in a List): its \`severity\`'s bar,
named by \`severityLabel\` (its severity's word by default) so it is read, not only seen, its
\`title\` and \`meta\` each cut short on one line, and the caller's \`action\` (a SOLAR Button, sm and
secondary as Figma draws it). Given \`onClick\` or \`href\`, it is pressable: its title is the button
or link, and its hit area the whole row, the action reachable above it; it is hovered and focused
only then. \`loading\` draws Figma's placeholders, announced busy. For the same as a card of its
own use an Insight Card.`;

const ROW = {
  look: 'the surface’s edge, shadow and focus ring by state, the severity’s bar, its words, and the placeholders',
  about: ABOUT,
  title: 'title',
  // Figma draws a loading row at info alone.
  statusless: ['loading'],
  status: { axis: 'severity', none: 'info' },
  props: [
    {
      name: 'title',
      kind: 'text',
      layer: 'title',
      required: true,
      doc: 'What the insight is, in a few words; its action’s name where it is pressable.',
    },
    {
      name: 'meta',
      kind: 'text',
      layer: 'meta',
      doc: 'Its details, in a line.',
    },
    {
      name: 'action',
      kind: 'slot',
      layer: 'action',
      doc: 'The caller’s action: a SOLAR Button, sm and secondary as Figma draws it.',
    },
    {
      name: 'severityLabel',
      kind: 'node',
      react: 'string',
      dart: 'String',
      doc: 'The severity’s name, read where the bar is seen; its word by default.',
    },
  ],
  prelude: `// The severity is read as well as seen: its word, where the caller names it no other way.
const named = severityLabel ?? severity.charAt(0).toUpperCase() + severity.slice(1);`,
  render: `// The severity's bar, named by its word, which is read and never seen.
severityBar: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <span className="${P}-name">{named}</span>
  </span>
),`,
  truncates: "'title', 'meta'",
};

export default {
  name: 'Insight Row',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs). Its
    // words run on one line, cut short where they run out of room.
    slots: 'drawn',
    resets: cardResets('Insight Row', {
      fixed: ['severityBar'],
      extra: {
        [`& .${P}-title, & .${P}-meta`]: {
          minWidth: '0',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        [`& .${P}-body`]: { minWidth: '0' },
        [`& .${P}-action`]: { flexShrink: '0' },
      },
    }),
    states: cardStates('Insight Row'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'title',
    slots: {
      title: { react: 'title', flutter: 'title' },
      meta: { react: 'meta', flutter: 'meta' },
      action: { react: 'action', flutter: 'action' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, ROW);
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, {
        ...ROW,
        builders: `// The severity's bar, named by its word.
'severityBar': (bar) => Semantics(
  label: severityLabel ?? '\${severity.name[0].toUpperCase()}\${severity.name.substring(1)}',
  child: bar,
),`,
      });
    },
  },
};
