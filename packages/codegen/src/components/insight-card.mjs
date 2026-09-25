/**
 * SOLAR Insight Card, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A card of the family (`src/shells/card.mjs`): the StatusIndicator of its severity in a tile, a
 * title and a description, and a More menu; selectable, pressable where it is given something to
 * do, and its placeholders while it loads.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
  moreIconOf,
} from '../shells/card.mjs';
import { insightIndicator } from '../shells/insight.mjs';

const requireLayers = (spec) => {
  for (const slot of ['title', 'description'])
    if (!spec.slots[slot])
      throw new Error(`Insight Card: the IR has no ${slot} slot`);
  for (const prop of ['severity', 'selected', 'loading'])
    if (!spec.api[prop])
      throw new Error(`Insight Card: the IR has no ${prop} prop`);
};

const ABOUT = `One insight in a list of them: the StatusIndicator of its \`severity\` in a tile, named
by \`severityLabel\` (its severity's word by default), its \`title\` and \`description\`, and a More
menu of \`moreItems\`. The \`selected\` one is the current one of its set (the insight shown beside
the list). Given \`onClick\` or \`href\`, it is pressable: its title is the button or link, and its
hit area the whole card, the More menu reachable above it; it is hovered and focused only then.
\`loading\` draws Figma's placeholders, announced busy. For a smaller one with no menu use an
Insight Card Small.`;

const insight = (spec) => ({
  look: 'the surface’s fill, edge, shadow and focus ring by state, the severity’s tile and More ink, its words, the StatusIndicator it shows, and the placeholders',
  about: ABOUT,
  title: 'title',
  // Figma draws a loading card at info alone.
  statusless: ['loading'],
  status: { axis: 'severity', none: 'info' },
  selected: 'selected',
  props: [
    {
      name: 'title',
      kind: 'text',
      layer: 'title',
      required: true,
      doc: 'What the insight is, in a few words; its action’s name where it is pressable.',
    },
    {
      name: 'description',
      kind: 'text',
      layer: 'description',
      doc: 'What it means.',
    },
    ...insightIndicator.props,
  ],
  more: { layer: 'iconMore', icon: moreIconOf(spec, 'iconMore') },
  ...insightIndicator.parts('Insight Card'),
});

export default {
  name: 'Insight Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs).
    slots: 'drawn',
    resets: cardResets('Insight Card', {
      wrap: ['title', 'description'],
      more: 'iconMore',
      fixed: ['icon'],
    }),
    states: cardStates('Insight Card', { selected: true }),
    overlaps: { focus: ['hover', 'selected'], hover: ['selected'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, insight(spec));
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, insight(spec));
    },
  },
};
